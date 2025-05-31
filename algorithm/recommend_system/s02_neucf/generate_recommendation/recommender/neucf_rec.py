# ---------------------------------------------------------------------------------  #
#                             NeuCF レコメンドシステムの実装                       　 #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import torch
import pandas as pd
from database.query_runner import execute_query_from_file
from neucf.components.mmneumf import MultiModalNeuMF
from utils.settings import DEVICE

class NeuCFRecommender:
    """
    NeuCF レコメンドシステムの実装
    """
    def __init__(self):
        pass

    def recommend(self, user_id: str, model: MultiModalNeuMF) -> list[str]:
        """
        学習済みモデルを用いてユーザーに対してルールベースでレコメンド推論を行う関数

        Args:
            user_id (str): ユーザーID(ブロック関係の取得においてのみ用いる)
        """
        rows = execute_query_from_file(
            "database/queries/neucf_query.sql",
            params={"current_user_id": user_id}
        )
        candidates = []
        user_tensor = torch.tensor([user_id], dtype=torch.long).to(DEVICE)
        for row in rows:
            post_tensor = torch.tensor([row["post_id"]], dtype=torch.long).to(DEVICE)
            image_features = torch.tensor([row["image_feature"]], dtype=torch.float).to(DEVICE)
            text_features = torch.tensor([row["text_feature"]], dtype=torch.float).to(DEVICE)

            with torch.no_grad():
                score = model(user_tensor, post_tensor, image_features, text_features)
            score = score.item()   
            candidates.append({
                "post_id": row["post_id"],
                "recommend_score": score
            })
        
        recommendation = pd.DataFrame(candidates)
        recommendation = recommendation.sort_values(by="recommend_score", ascending=False).reset_index(drop=True)
        recommendation = recommendation["post_id"].tolist()
        return recommendation
    
