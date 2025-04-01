# ---------------------------------------------------------------------------------  # 
#                            train/testデータセットを作成する                            #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import torch
import random
import pandas as pd
from copy import deepcopy
from torch.utils.data import DataLoader, Dataset

random.seed(0)

# ----------------------------------
# 1. マルチモーダルなDatasetクラス
# ----------------------------------
class MultiModalDataset(Dataset):
    """
    ユーザー、アイテム、評価、画像特徴、テキスト特徴のデータセットを作成するクラス
    
    Args:
        user_tensor: 各ユーザーのIDをtorch.Tensor型で格納
        item_tensor: 各アイテムのIDをtorch.Tensor型で格納
        target_tensor: ユーザーとアイテムの組み合わせに対する評価(バイナリ or 連続値)をtorch.Tensor型で格納
        image_tensor: 画像特徴量をtorch.Tensor型で格納
        text_tensor: テキスト特徴量をtorch.Tensor型で格納
    """
    def __init__(self, user_tensor, item_tensor, target_tensor, image_tensor, text_tensor):
        self.user_tensor = user_tensor
        self.item_tensor = item_tensor
        self.target_tensor = target_tensor
        self.image_tensor = image_tensor
        self.text_tensor = text_tensor

    def __getitem__(self, index):
        """
        指定したインデックスの(ユーザーID, アイテムID, 評価, 画像特徴, テキスト特徴)を取得
        """
        return (self.user_tensor[index],
                self.item_tensor[index],
                self.target_tensor[index],
                self.image_tensor[index],
                self.text_tensor[index])
    
    def __len__(self):
        """
        データセットのサイズ(行数)を取得
        """
        return self.user_tensor.size(0)
    
# ----------------------------------
# 2. サンプル生成クラス
# ----------------------------------
class SampleGenerator(object):
    def __init__(self, ratings):
        """
        Args:
            ratings(pd.DataFrame): ["user_id", "post_id", "rating", "timestamp", "image_feature", "text_feature"]
        """
        # 入力チェック
        for col in ["user_id", "post_id", "rating", "image_feature", "text_feature"]:
            assert col in ratings.columns, f"{col}が存在しません"

        self.ratings = ratings.copy()

        # explicit feedback -> _normalizeを使用
        # self.preprocess_ratings = self._normalize(ratings)

        # implicit feedback -> _binarizeを使用し、評価データを0または1に変換
        self.preprocess_ratings = self._binarize(ratings)

        # 全ユーザーIDと全アイテムIDを取得
        self.user_pool = set(self.ratings["user_id"].unique())
        self.item_pool = set(self.ratings["post_id"].unique())

        # 各アイテムの画像・テキスト特徴を取得する辞書(ここでは最初の出現レコードの特徴を採用)
        self.item_features = {}
        for item_id in self.item_pool:
            row = self.ratings[self.ratings["post_id"] == item_id].iloc[0]
            self.item_features[item_id] = {
                "image_feature": row["image_feature"],
                "text_feature": row["text_feature"]
            }

        # ユーザーが未評価のアイテムを負例サンプルとして取得
        self.negatives = self._sample_negative(ratings)

        # 学習データとテストデータに分割(Leave-One-Out: 各ユーザーの最新をテストデータとする)
        filtered = self.preprocess_ratings.groupby("user_id").filter(lambda x: len(x) >= 2)
            # 2回以上評価したユーザーのみを抽出(Leave-One-Outのため)
        print(f"2回以上インタラクションのあったユーザー数: {len(filtered)}")
        self.train_ratings, self.test_ratings = self._split_loo(filtered)

    def _normalize(self, ratings):
        """
        Explicit Feedbackの評価値を[0, 1]に正規化
        """
        ratings = deepcopy(ratings)
        max_rating = ratings.rating.max()
        ratings["rating"] = ratings.rating * 1.0 / max_rating
        return ratings
    
    def _binarize(self, ratings):
        """
        Implicit Feedbackの評価値を0または1に変換
        ユーザーがアイテムに対して評価をつけたかどうか、のみを学習データに使用
        """
        ratings = deepcopy(ratings)
        ratings.loc[ratings["rating"] > 0, "rating"] = 1.0
        return ratings
    
    def _split_loo(self, ratings):
        """
        Leave-One-Outを使用して、学習データとテストデータに分割
            Leave-One-Out: 各ユーザーに対する最新の評価データをテストデータとして使用
        """
        ratings["rank_latest"] = ratings.groupby(["user_id"])["timestamp"].rank(method="first", ascending=False)
        test = ratings[ratings["rank_latest"] == 1]
        train = ratings[ratings["rank_latest"] > 1]
        train = train[["user_id", "post_id", "rating", "image_feature", "text_feature"]] # 画像・テキスト特徴を追加
        test = test[["user_id", "post_id", "rating", "image_feature", "text_feature"]]
        assert train["user_id"].nunique() == test["user_id"].nunique()
        return train, test
    
    def _sample_negative(self, ratings):
        """
        ユーザーが評価していないアイテムを負例サンプルとして取得
        """
        interact_status = ratings.groupby("user_id")["post_id"].apply(set).reset_index().rename(columns={"post_id": "interacted_items"})

        # 各ユーザーごとに、未インタラクションのアイテム集合を作成(negative_items)
        interact_status["negative_items"] = interact_status["interacted_items"].apply(lambda x: self.item_pool - x)

        # ランダムに99個(or postの数のうち少ない方)の負例サンプルを抽出
        interact_status["negative_samples"] = interact_status["negative_items"].apply(lambda x: random.sample(list(x), min(len(x), 99)))
        return interact_status[["user_id", "negative_items", "negative_samples"]]
    
    def instance_a_train_loader(self, num_negatives, batch_size):
        """
        学習データをバッチ単位で取得

        Args:
            num_negatives(int): 負例サンプルの数
            batch_size(int): バッチサイズ
        """
        users, items, ratings_list = [], [], []
        image_features_list, text_features_list = [], []
        train_ratings = pd.merge(self.train_ratings, self.negatives[["user_id", "negative_items"]], on="user_id")
        train_ratings["negatives"] = train_ratings["negative_items"].apply(lambda x: random.sample(list(x), min(len(x), num_negatives)))
        
        # 正例と負例の両方をリストに追加
        for row in train_ratings.itertuples():

            # 正例
            users.append(int(row.user_id))
            items.append(int(row.post_id))
            ratings_list.append(float(row.rating))
            image_features_list.append(row.image_feature)
            text_features_list.append(row.text_feature)

            # 負例
            for i in range(len(row.negatives)):
                neg_item = int(row.negatives[i])
                users.append(int(row.user_id))
                items.append(neg_item)
                ratings_list.append(0.0)

                # ネガティブサンプルの場合、事前に構築した辞書から特徴を取得
                    # 負例サンプルはratings DataFrameにレコードが存在しないため、辞書を使用
                    # usersとitemsはランダムな組み合わせで良いが、特徴量はitemsとの対応が必要
                neg_features = self.item_features[neg_item]
                image_features_list.append(neg_features["image_feature"])
                text_features_list.append(neg_features["text_feature"])

        dataset = MultiModalDataset(
            user_tensor=torch.LongTensor(users),
            item_tensor=torch.LongTensor(items),
            target_tensor=torch.FloatTensor(ratings_list),
            image_tensor=torch.tensor(image_features_list, dtype=torch.float),
            text_tensor=torch.tensor(text_features_list, dtype=torch.float)
        )
            # ratings_listは通常1次元のリストであるため、torch.FloatTensorで変換できる
            # 一方、image_features_list や text_features_list は各サンプルがベクトル（ネストしたリスト）に
            # なっているため、torch.tensor(..., dtype=torch.float) を使うことで、
            # 複数次元のデータを正しくTensorに変換できる
        return DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    @property
    def evaluate_data(self):
        """
        テストデータを取得
        """
        test_ratings = pd.merge(self.test_ratings, self.negatives[["user_id", "negative_samples"]], on="user_id")
        test_users, test_items = [], []
        test_image_features, test_text_features = [], []
        negative_users, negative_items = [], []
        negative_image_features, negative_text_features = [], []
        for row in test_ratings.itertuples():
            
            # 正例
            test_users.append(int(row.user_id))
            test_items.append(int(row.post_id))
            test_image_features.append(row.image_feature)
            test_text_features.append(row.text_feature)

            # 負例
            for i in range(len(row.negative_samples)):
                negative_users.append(int(row.user_id))
                neg_item = int(row.negative_samples[i])
                negative_items.append(neg_item)
                neg_features = self.item_features[neg_item]
                negative_image_features.append(neg_features["image_feature"])
                negative_text_features.append(neg_features["text_feature"])
        
        return [torch.LongTensor(test_users), torch.LongTensor(test_items), 
                torch.tensor(test_image_features, dtype=torch.float), 
                torch.tensor(test_text_features, dtype=torch.float),
                torch.LongTensor(negative_users), torch.LongTensor(negative_items),
                torch.tensor(negative_image_features, dtype=torch.float),
                torch.tensor(negative_text_features, dtype=torch.float)]