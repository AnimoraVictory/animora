# ---------------------------------------------------------------------------------  #
#                             Heuristic レコメンドシステムの実装                       　 #
# ---------------------------------------------------------------------------------  #
from datetime import datetime, timezone
import math
import pandas as pd
from database.query_runner import execute_query_from_file

class HeuristicRecommender:
    """
    Heuristic レコメンドシステムの実装
    score = a * popularity_score + (1 - a) * recency_score
        popularity_score: いいね数 + コメント数
        recency_score: 投稿からの経過時間
    """
    def __init__(self):
        pass

    def recommend(self, user_id: str) -> list[str]:
        """
        ユーザーに対してルールベースでレコメンドを行う関数

        Args:
            user_id (str): ユーザーID(ブロック関係の取得においてのみ用いる)
        """
        rows = execute_query_from_file(
            "database/queries/heuristic_query.sql",
            params={"current_user_id": user_id}
        )
        candidates = []
        for row in rows:
            post_id = row["post_id"]
            created_at = row["created_at"]
            popularity_score = row["popularity_score"]
            score = self.compute_recommend_score(
                created_at=created_at,
                decay_hours=6.0,
                popularity_score=popularity_score,
                alpha=0.6
            )
            candidates.append({
                "post_id": post_id,
                "recommend_score": score
            })
        
        recommendation = pd.DataFrame(candidates)
        recommendation = recommendation.sort_values(by="recommend_score", ascending=False).reset_index(drop=True)
        recommendation = recommendation["post_id"].tolist()
        return recommendation

    def compute_recommend_score(
            self, created_at: datetime, decay_hours: float=6.0,
            popularity_score: int=0, alpha: float=0.6
        ) -> float:
        """
        投稿からの経過時間に基づいてスコアを計算する関数
        """
        now = datetime.now(timezone.utc)
        hours_passed = (now - created_at).total_seconds() / 3600
        recency_score = math.exp(-hours_passed / decay_hours)
        return alpha * popularity_score + (1 - alpha) * recency_score
    
