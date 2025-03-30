# ---------------------------------------------------------------------------------  # 
#                      レコメンドタイムラインを生成するオンライン推論API                  　 #
# ---------------------------------------------------------------------------------  #
# ライブラリのインポート
from fastapi import FastAPI, HTTPException
import traceback
from pydantic import BaseModel
from contextlib import asynccontextmanager
import torch
import uvicorn
from recommend_system.components.mmneumf import MultiModalNeuMF
from recommend_system.src.download_model import download_latest_model 
from recommend_system.api.recommend_timeline import get_candidate_posts, get_recommended_timeline
from recommend_system.utils.config import new_user_query, existing_user_query

# モデル・デバイスのグローバル変数
device = "cuda" if torch.cuda.is_available() else "cpu"
config = None
model = None
MODEL_PATH = "recommend_system/models/latest.model"

# ----------------------------------
# APIリクエストとレスポンスのデータモデル
# ----------------------------------
class TimelineRequest(BaseModel):
    user_id: int

class Post(BaseModel):
    id: int
    timestamp: str
    score: float

class TimelineResponse(BaseModel):
    posts: list[Post]

# ----------------------------------
# モデルとそのconfigをロードする関数
# ----------------------------------
def load_model():
    state_dict = torch.load(MODEL_PATH, map_location=torch.device(device))
    config = state_dict["config"]
    model = MultiModalNeuMF(config, config["image_feature_dim"], config["text_feature_dim"]).to(device)
    model.load_state_dict(state_dict["model_state_dict"])
    model.eval()
    return config, model

# ----------------------------------
# モデルの初期ロード
# ----------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global config, model
    config, model = load_model()
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
        global config, model
        config, model = load_model()
        return {"message": "モデルをリロードしました"}
    except Exception as e:
        return {"message": str(e)}

# ----------------------------------
# /timeline エンドポイント
# ----------------------------------
@app.post("/timeline", response_model=TimelineResponse)
def recommend_timeline(request: TimelineRequest):
    try:
        is_existing_user = request.user_id < config["num_users"]
        if is_existing_user:
            print("学習済みユーザー")
            query = existing_user_query
        else:
            print("新規ユーザー")
            query = new_user_query

        # PostgreSQLから候補投稿画像を取得
        candidates = get_candidate_posts(query)
        print(f"取得した候補数: {len(candidates)}")
        recommended = get_recommended_timeline(request.user_id, candidates, model, device, is_existing_user)
        posts = [Post(
            id=rc["post_id"],
            timestamp=str(rc["timestamp"]),
            score=rc["score"]
        ) for rc in recommended]
        return TimelineResponse(posts=posts)
    except Exception as e:
        traceback.print_exc()  # ← 追加！ターミナルにスタックトレースを表示
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

# ---------------------- 起動(開発用) ---------------------- #
# poetry run uvicorn recommend_system.api.main:app --reload
# -------------------------------------------------------- #