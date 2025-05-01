# ---------------------------------------------------------------------------------  #
#                                       GMFモデル                                     #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import torch
from engine import Engine
from utils import use_cuda
from torch import nn


class GMF(torch.nn.Module):
    def __init__(self, config):
        super(GMF, self).__init__()
        self.num_users = config["num_users"]  # ユーザー数
        self.num_items = config["num_items"]  # アイテム数
        self.latent_dim = config[
            "latent_dim"
        ]  # 埋め込みベクトルの次元数(ユーザーとアイテムの特徴数)

        # Embedding Layer
        self.embedding_user = torch.nn.Embedding(
            num_embeddings=self.num_users, embedding_dim=self.latent_dim
        )
        self.embedding_item = torch.nn.Embedding(
            num_embeddings=self.num_items, embedding_dim=self.latent_dim
        )

        # 線形変換層
        self.affine_output = torch.nn.Linear(
            in_features=self.latent_dim, out_features=1
        )
        # 出力はアイテムのスコア

        # 活性化関数
        self.logistic = torch.nn.Sigmoid()

        # モデルの重みの初期化
        if config["weight_init_gaussian"]:
            for sm in self.modules():
                if isinstance(sm, (nn.Embedding, nn.Linear)):
                    print(sm)
                    torch.nn.init.normal_(sm.weight.data, 0.0, 0.01)
                    # ガウス分布(平均0, 分散0.01)で重みを初期化

    def forward(self, user_idices, item_indices):
        """
        Args:
            user_idices(torch.Tensor): ユーザーIDのミニバッチ
            item_indices(torch.Tensor): アイテムIDのミニバッチ
        """
        user_embedding = self.embedding_user(
            user_idices
        )  # user_indicesに対応する埋め込みベクトルを取得
        item_embedding = self.embedding_item(
            item_indices
        )  # item_indicesに対応する埋め込みベクトルを取得
        element_product = torch.mul(user_embedding, item_embedding)
        # torch.mul(): 要素ごとの積(Element-wise product)を計算
        logits = self.affine_output(element_product)
        rating = self.logistic(logits)
        return rating

    def init_weight(self):
        pass


class GMFEngine(Engine):
    """
    継承をすることで、GMFEngineにはGMF固有の処理のみを記述すれば良くなる
    """

    def __init__(self, config):
        self.model = GMF(config)
        if config["use_cuda"] is True:
            use_cuda(True, config["device_id"])
            self.model.cuda()
        super(GMFEngine, self).__init__(config)
