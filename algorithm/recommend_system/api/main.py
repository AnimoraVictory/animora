# ---------------------------------------------------------------------------------  # 
#                      レコメンドタイムラインを生成するオンライン推論API                  　 #
# ---------------------------------------------------------------------------------  #
# ライブラリのインポート
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
import torch
import uvicorn
from recommend_system.components.mmneumf import MultiModalNeuMF
from recommend_system.src.download_model import download_latest_model 
from recommend_system.api.recommend_timeline import get_candidate_posts, get_recommended_timeline

# モデル・デバイスのグローバル変数
device = "cuda" if torch.cuda.is_available() else "cpu"
model = None
MODEL_PATH = "recommend_system/models/latest.model"

# ----------------------------------
# APIリクエストとレスポンスのデータモデル
# ----------------------------------
class TimelineRequest(BaseModel):
    user_id: int
    score_threshold: float = 0.5 # 予測スコアの閾値

class Post(BaseModel):
    id: int
    timestamp: str
    image_feature: list
    text_feature: list
    score: float

class TimelineResponse(BaseModel):
    posts: list[Post]

# ----------------------------------
# モデルの初期ロード
# ----------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    model = MultiModalNeuMF().to(device)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device(device)))
    model.eval()
    print("モデル初期ロード完了")
    yield # アプリのライフサイクルの本体がここ

# ----------------------------------
# FastAPIアプリの構築
# ----------------------------------
app = FastAPI(lifespan=lifespan)

# ----------------------------------
# /reload エンドポイント
# ----------------------------------
@app.post("/reload")
def reload_model():
    try:
        download_latest_model()
        global model
        model = MultiModalNeuMF().to(device)
        model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device(device)))
        model.eval()
        return {"message": "モデルをリロードしました"}
    except Exception as e:
        return {"message": str(e)}

# ----------------------------------
# /timeline エンドポイント
# ----------------------------------
@app.post("/timeline", response_model=TimelineResponse)
def recommend_timeline(request: TimelineRequest):
    try:
        # PostgreSQLから候補投稿画像を取得
        candidates = get_candidate_posts()
        recommended = get_recommended_timeline(request.user_id, candidates, model, device, request.score_threshold)
        posts = [Post(
            id=rc["post_id"],
            timestamp=rc["timestamp"],
            image_feature=rc["image_feature"],
            text_feature=rc["text_feature"],
            score=rc["score"]
        ) for rc in recommended]
        return TimelineResponse(posts=posts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)