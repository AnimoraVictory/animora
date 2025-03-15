# ---------------------------------------------------------------------------------  # 
#       評価指標のHit Ratio @ KとNormalized Discounted Cumulative Gain @ K を計算       #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import math
import pandas as pd

class MetronAtK(object):
    def __init__(self, top_k):
        self._top_k = top_k
        self._subjects = None # 評価用データセット

    # top_kのゲッターとセッターを定義
    # 外部からMetronAtK = 10のようにtop_kを変更できる
    @property
    def top_k(self):
        return self._top_k
    
    @top_k.setter
    def top_k(self, top_k):
        self._top_k = top_k

    # _subjectsのゲッターとセッターを定義
    @property
    def subjects(self):
        return self._subjects
    
    @subjects.setter
    def subjects(self, subjects):
        """
        Args:
            subjects(list): [test_users, test_items, test_scores, neg_users, neg_items, neg_scores]
                test_users: テストデータのユーザーID
                test_items: テストデータの正解アイテム(ユーザーが実際に選んだアイテム)
                test_scores: 正解アイテムのスコア(モデルの予測スコア)
                neg_users: ネガティブサンプルのユーザーID
                neg_items: ネガティブサンプルのアイテムID
                neg_scores: ネガティブサンプルのスコア(モデルの予測スコア)    
        """
        assert isinstance(subjects, list)
        test_users, test_items, test_scores = subjects[0], subjects[1], subjects[2]
        neg_users, neg_items, neg_scores = subjects[3], subjects[4], subjects[5]

        print(f"Length of test_users: {len(test_users)}")
        print(f"Length of test_items: {len(test_items)}")
        print(f"Length of test_preds: {len(test_scores)}")

        # 正解データ(Golden Set)
        test = pd.DataFrame({"user": test_users, 
                             "test_item": test_items, 
                             "test_score": test_scores})

        # 各候補アイテムを含むデータフレーム
        full = pd.DataFrame({"user": neg_users + test_users,
                             "item": neg_items + test_items,
                             "score": neg_scores + test_scores})
        
        # 各ユーザーごとに「正解アイテム」と「負例アイテム」を結合して評価用データフレームを作成
        full = pd.merge(full, test, on=["user"], how="left")

        # スコア順にランキングをつける
        full["rank"] = full.groupby("user")["score"].rank(method="first", ascending=False)
        full.sort_values(["user", "rank"], inplace=True)
        self._subjects = full

    def cal_hit_ratio(self):
        """
        Hit Ratio @ Kを計算
        """
        # ユーザーごとに正解アイテムが上位K位にランクインしているかどうかを判定
        full, top_k = self._subjects, self._top_k
        top_k = full[full["rank"] <= top_k]
        test_in_top_k = top_k[top_k["test_item"] == top_k["item"]]
        return len(test_in_top_k) * 1.0 / len(full["user"].unique())
            # 正解アイテムがK個のリストに含まれていたユーザ数 / 全ユーザ数
        
    def cal_ndcg(self):
        """
        """
        full, top_k = self._subjects, self._top_k
        top_k = full[full["rank"] <= top_k]
        test_in_top_k = top_k[top_k["test_item"] == top_k["item"]].copy()
        test_in_top_k.loc[:, "ndcg"] = test_in_top_k["rank"].apply(lambda x: math.log(2) / math.log(1+x))
            # NDCG = math.log(2) / math.log(1 + rank): 正解アイテムの順位が高いほどスコアが大きくなる
        return test_in_top_k["ndcg"].sum() * 1.0 / len(full["user"].unique())