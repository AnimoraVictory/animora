# ---------------------------------------------------------------------------------  # 
#                タスクに対する投稿画像とタスク文の類似度からスコアを算出する                  #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import json
import torch
import torch.nn.functional as F
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from common.utils.database import get_connection
from common.utils.config import device
import traceback

# ----------------------------------
# APIリクエストとレスポンスのデータモデル
# ----------------------------------
class TaskRequest(BaseModel):
    task_type: str
    image_key: str

class ScoreResponse(BaseModel):
    score: float

# ----------------------------------
# FastAPIアプリの構築
# ----------------------------------
app = FastAPI()

# ----------------------------------
# /task/score エンドポイント
# ----------------------------------
@app.post("/task/score", response_model=ScoreResponse)
async def calculate_score(request: TaskRequest):
    """
    タスクに対する投稿画像とタスク文の類似度からスコアを算出するエンドポイント
    """
    try:
        conn = get_connection()
        cur = conn.cursor()

        # データベースからタスク文の特徴量を取得
        cur.execute(
            """
            SELECT text_feature
            FROM tasks
            WHERE type = %s
            """
            , (request.task_type, )
        )
        text_feature_json = cur.fetchone()
        text_feature = json.loads(text_feature_json[0]) if isinstance(text_feature_json[0], str) else text_feature_json[0]
        if text_feature is None:
            raise HTTPException(status_code=404, detail="Task feature is not found")
        
        # データベースから投稿画像の特徴量を取得
        cur.execute(
            """
            SELECT image_feature
            FROM posts
            WHERE image_key = %s
            """
            , (request.image_key, )
        )
        image_feature_json = cur.fetchone()
        image_feature = json.loads(image_feature_json[0]) if isinstance(image_feature_json[0], str) else image_feature_json[0]
        if image_feature is None:
            raise HTTPException(status_code=404, detail="Image feature is not found")
        cur.close()
        conn.close()

        # スコアの算出
        image_feature_tensor = torch.tensor(image_feature, dtype=torch.float).to(device)
        text_feature_tensor = torch.tensor(text_feature, dtype=torch.float).to(device)
        score = F.cosine_similarity(image_feature_tensor, text_feature_tensor).item()
        score = max(0, min(100, score * 100))  # スコアを0から100の範囲に制限
        return ScoreResponse(score=score)
    
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

# ---------------------- 起動(開発用) ---------------------- #
# poetry run uvicorn task_scoring_system.api.main:app --reload
# -------------------------------------------------------- #