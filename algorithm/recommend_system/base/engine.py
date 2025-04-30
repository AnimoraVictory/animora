# ---------------------------------------------------------------------------------  #
#                         NCFモデルを訓練・評価するためのベースクラス                       #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import torch
from tensorboardX import SummaryWriter
from utils import save_checkpoint, use_optimizer
from metrics import MetronAtK


class Engine(object):
    """
    NCFモデルを訓練・評価するためのベースクラス
    Engineを継承することで、具体的なモデルをトレーニングできる
    """

    def __init__(self, config):
        self.config = config  # モデルの設定情報
        self._metron = MetronAtK(top_k=10)  # HR@K, NDCG@Kを計算するための評価モジュール
        self._writer = SummaryWriter(
            log_dir="runs/{}".format(config["alias"])
        )  # TensorBoardのログディレクトリ
        self._writer.add_text("config", str(config), 0)
        self.opt = use_optimizer(self.model, config)
        # Explicit feedback
        # self.crit = torch.nn.MSELoss()
        # Implicit feedback
        self.crit = torch.nn.BCELoss()  # 損失関数(バイナリクロスエントロピー)
        # 損失関数: モデルの学習時に最適化する
        # 評価指標: 最終的なモデルの性能を評価する

    def train_single_batch(self, users, items, ratings):
        """
        Args:
            users(torch.Tensor): ユーザーIDのミニバッチ
            items(torch.Tensor): アイテムIDのミニバッチ
            ratings(torch.Tensor): 評価値のミニバッチ
        """
        assert hasattr(self, "model"), "Please specify the exact model !"
        if self.config["use_cuda"] is True:
            users, items, ratings = users.cuda(), items.cuda(), ratings.cuda()
        self.opt.zero_grad()  # 勾配を初期化
        ratings_pred = self.model(users, items)  # 予測
        loss = self.crit(ratings_pred.view(-1), ratings)  # 損失を計算
        loss.backward()  # 誤差逆伝播
        self.opt.step()  # パラメータ更新
        return loss.item()  # 損失を返す

    def train_an_epoch(self, train_loader, epoch_id):
        """
        1エポック分のデータをバッチごとに学習

        Args:
            train_loader(torch.utils.data.DataLoader): DataLoaderオブジェクト
            epoch_id(int): エポック数
        """
        assert hasattr(self, "model"), "Please specify the exact model !"
        self.model.train()  # モデルを学習モードに設定
        total_loss = 0
        for batch_id, batch in enumerate(train_loader):
            user, item, rating = batch[0], batch[1], batch[2]
            rating = rating.float()  # バイナリクロスエントロピーのためにfloat型に変換
            loss = self.train_single_batch(user, item, rating)
            print(f"[Training Epoch {epoch_id}] Batch {batch_id}, Loss {loss}")
            total_loss += loss
        self._writer.add_scalar("model/loss", total_loss, epoch_id)

    def evaluate(self, evaluate_data, epoch_id):
        assert hasattr(self, "model"), "Please specify the exact model !"
        self.model.eval()  # モデルを評価モードに設定
        with torch.no_grad():  # 勾配計算を無効化(評価時には不要)
            test_users, test_items = evaluate_data[0], evaluate_data[1]
            negative_users, negative_items = evaluate_data[2], evaluate_data[3]
            if self.config["use_cuda"] is True:
                test_users = test_users.cuda()
                test_items = test_items.cuda()
                negative_users = negative_users.cuda()
                negative_items = negative_items.cuda()

        # 通常モード: 全データを一括でモデルに入力してスコア計算
        if self.config["use_bachify_eval"] == False:
            test_scores = self.model(test_users, test_items)
            negative_scores = self.model(negative_users, negative_items)

        # バッチモード: バッチごとにモデルに入力してスコア計算
        else:
            test_scores = []
            negative_scores = []
            bs = self.config["batch_size"]
            for start_idx in range(0, len(test_users), bs):
                end_idx = min(start_idx + bs, len(test_users))
                batch_test_users = test_users[start_idx:end_idx]
                batch_test_items = test_items[start_idx:end_idx]
                test_scores.append(self.model(batch_test_users, batch_test_items))

            for start_idx in range(0, len(negative_users), bs):
                end_idx = min(start_idx + bs, len(negative_users))
                batch_negative_users = negative_users[start_idx:end_idx]
                batch_negative_items = negative_items[start_idx:end_idx]
                negative_scores.append(
                    self.model(batch_negative_users, batch_negative_items)
                )

            test_scores = torch.concatenate(test_scores, dim=0)
            negative_scores = torch.concatenate(negative_scores, dim=0)

        # ここはこのようにインデントするはず(ソースコードとは変更)
        if self.config["use_cuda"] is True:
            test_users = test_users.cpu()
            test_items = test_items.cpu()
            test_scores = test_scores.cpu()
            negative_users = negative_users.cpu()
            negative_items = negative_items.cpu()
            negative_scores = negative_scores.cpu()
            # .cpu(): テンソルをCPUに移動 -> MetronAtKにおいてPandasを使うため、GPU Tensorでは処理できない
        self._metron.subjects = [
            test_users.data.view(-1).tolist(),
            test_items.data.view(-1).tolist(),
            test_scores.data.view(-1).tolist(),
            negative_users.data.view(-1).tolist(),
            negative_items.data.view(-1).tolist(),
            negative_scores.data.view(-1).tolist(),
        ]
        hit_ratio, ndcg = self._metron.cal_hit_ratio(), self._metron.cal_ndcg()
        self._writer.add_scalar("performance/HR", hit_ratio, epoch_id)
        self._writer.add_scalar("performance/NDCG", ndcg, epoch_id)
        print(
            f"[Evaluation Epoch {epoch_id}] HR@10 {hit_ratio:.4f}, NDCG@10 {ndcg:.4f}"
        )
        return hit_ratio, ndcg

    def save(self, alias, epoch_id, hit_ratio, ndcg):
        assert hasattr(self, "model"), "Please specify the exact model !"
        model_dir = self.config["model_dir"].format(alias, epoch_id, hit_ratio, ndcg)
        save_checkpoint(self.model, model_dir)
