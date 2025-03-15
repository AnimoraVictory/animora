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

# (ユーザー, アイテム, 評価)のタプルをデータセットとして扱うためのクラス
class UserItemRatingDataset(Dataset):
    """
    ユーザー、アイテム、評価のデータセットを作成するクラス
    
    Args:
        user_tensor: 各ユーザーのIDをtorch.Tensor型で格納
        item_tensor: 各アイテムのIDをtorch.Tensor型で格納
        target_tensor: ユーザーとアイテムの組み合わせに対する評価(バイナリ or 連続値)をtorch.Tensor型で格納
    """
    def __init__(self, user_tensor, item_tensor, target_tensor):
        self.user_tensor = user_tensor
        self.item_tensor = item_tensor
        self.target_tensor = target_tensor

    def __getitem__(self, index):
        """
        指定したインデックスの(ユーザーID, アイテムID, 評価)を取得
        """
        return self.user_tensor[index], self.item_tensor[index], self.target_tensor[index]
    
    def __len__(self):
        """
        データセットのサイズ(行数)を取得
        """
        return self.user_tensor.size(0)
    
# Neural Colaborative Filtering(NCF)の学習データを作成するクラス
class SampleGenerator(object):
    def __init__(self, ratings):
        """
        Args:
            ratings(pd.DataFrame): ["userId", "itemId", "rating", "timestamp"]のカラムを持つデータフレーム
        """
        assert "userId" in ratings.columns
        assert "itemId" in ratings.columns
        assert "rating" in ratings.columns

        self.ratings = ratings 
        
        # explicit feedback -> _normalizeを使用
        # self.preprocess_ratings = self._normalize(ratings)

        # implicit feedback -> _binarizeを使用し、評価データを0または1に変換
        self.preprocess_ratings = self._binarize(ratings)
            # 関数名の前に_をつけることで、クラスの内部のみで使用されるプライベートメソッド、内部メソッドであることを示す

        # 全ユーザーIDと全アイテムIDを取得
        self.user_pool = set(self.ratings["userId"].unique())
        self.item_pool = set(self.ratings["itemId"].unique())

        # ユーザーが未評価のアイテムを負例サンプルとして取得
        self.negatives = self._sample_negative(ratings)

        # 学習データとテストデータに分割(Leave-One-Outを使用)
        self.train_ratings, self.test_ratings = self._split_loo(self.preprocess_ratings)

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
        ratings["rank_latest"] = ratings.groupby(["userId"])["timestamp"].rank(method="first", ascending=False)
        test = ratings[ratings["rank_latest"] == 1]
        train = ratings[ratings["rank_latest"] > 1]
        assert train["userId"].nunique() == test["userId"].nunique()
        return train[["userId", "itemId", "rating"]], test[["userId", "itemId", "rating"]]
    
    def _sample_negative(self, ratings):
        """
        ユーザーが評価していないアイテムを負例サンプルとして取得
        """
        interact_status = ratings.groupby("userId")["itemId"].apply(set).reset_index().rename(columns={"itemId": "interacted_items"})

        # 各ユーザーごとに、未インタラクションのアイテム集合を作成(negative_items)
        interact_status["negative_items"] = interact_status["interacted_items"].apply(lambda x: self.item_pool - x)

        # ランダムに99個の負例サンプルを抽出
        interact_status["negative_samples"] = interact_status["negative_items"].apply(lambda x: random.sample(list(x), 99))
        return interact_status[["userId", "negative_items", "negative_samples"]]
    
    def instance_a_train_loader(self, num_negatives, batch_size):
        """
        学習データをバッチ単位で取得

        Args:
            num_negatives(int): 負例サンプルの数
            batch_size(int): バッチサイズ
        """
        users, items, ratings = [], [], []
        train_ratings = pd.merge(self.train_ratings, self.negatives[["userId", "negative_items"]], on="userId")
        train_ratings["negatives"] = train_ratings["negative_items"].apply(lambda x: random.sample(list(x), num_negatives))
        for row in train_ratings.itertuples():
            users.append(int(row.userId))
            items.append(int(row.itemId))
            ratings.append(float(row.rating))
            for i in range(num_negatives):
                users.append(int(row.userId))
                items.append(int(row.negatives[i]))
                ratings.append(float(0)) # 負例サンプルの評価値は0
        dataset = UserItemRatingDataset(user_tensor=torch.LongTensor(users),
                                        item_tensor=torch.LongTensor(items),
                                        target_tensor=torch.FloatTensor(ratings))
            # torch.LongTensor: 整数値のテンソル
            # torch.FloatTensor: 浮動小数点数のテンソル
        return DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    @property
    def evaluate_data(self):
        """
        テストデータを取得
        """
        test_ratings = pd.merge(self.test_ratings, self.negatives[["userId", "negative_samples"]], on="userId")
        test_users, test_items, negative_users, negative_items = [], [], [], []
        for row in test_ratings.itertuples():
            test_users.append(int(row.userId))
            test_items.append(int(row.itemId))
            for i in range(len(row.negative_samples)):
                negative_users.append(int(row.userId))
                negative_items.append(int(row.negative_samples[i]))
        return [torch.LongTensor(test_users), torch.LongTensor(test_items), torch.LongTensor(negative_users),
                torch.LongTensor(negative_items)]
    

    



    
