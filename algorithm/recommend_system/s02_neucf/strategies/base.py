# ---------------------------------------------------------------------------------  #
#                          レコメンドシステムの共通インターフェース                       　 #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート


class BaseRecommender:
    """
    レコメンドシステムの共通インターフェース
    """

    def __init__(self):
        pass

    def recommend(self, user_id):
        """
        レコメンドを行う関数

        Args:
            user_id (str): ユーザーID
        """
        raise NotImplementedError("recommend() must be implemented in subclasses.")