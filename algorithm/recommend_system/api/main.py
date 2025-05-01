# ---------------------------------------------------------------------------------  #
#                      レコメンドタイムラインを生成するオンライン推論API                  　 #
# ---------------------------------------------------------------------------------  #
# ライブラリのインポート
from typing import List, Optional
from fastapi import FastAPI, HTTPException
import traceback
from pydantic import BaseModel
from contextlib import asynccontextmanager
import torch
import uvicorn
from recommend_system.components.mmneumf import MultiModalNeuMF
from recommend_system.src.download_model import download_latest_model
from recommend_system.api.recommend_timeline import (
    get_post_index_from_uuid,
    get_user_id,
    get_candidate_posts,
    get_uuid_from_post_id,
    get_recommended_timeline,
)
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
    user_id: str


class FastAPIUser(BaseModel):
    id: str
    name: str
    email: str
    bio: str
    icon_image_key: Optional[str]


class FastAPIComment(BaseModel):
    id: str
    content: str
    created_at: str
    user: FastAPIUser


class FastAPILike(BaseModel):
    id: str
    created_at: str
    user: FastAPIUser


class FastAPIDailyTask(BaseModel):
    id: str
    created_at: str
    type: str


class Post(BaseModel):
    id: str
    caption: str
    image_key: str
    created_at: str
    score: float
    user: FastAPIUser
    comments: List[FastAPIComment]
    likes: List[FastAPILike]
    daily_task: Optional[FastAPIDailyTask] = None


class TimelineResponse(BaseModel):
    posts: list[Post]


# ----------------------------------
# モデルとそのconfigをロードする関数
# ----------------------------------
def load_model():
    state_dict = torch.load(MODEL_PATH, map_location=torch.device(device))
    config = state_dict["config"]
    model = MultiModalNeuMF(
        config, config["image_feature_dim"], config["text_feature_dim"]
    ).to(device)
    model.load_state_dict(state_dict["model_state_dict"])
    model.eval()
    return config, model


# ----------------------------------
# モデルの初期ロード
# ----------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global config, model
    download_latest_model()  # .modelは.gitignoreに追加されてしまっているため、毎回ダウンロードする
    config, model = load_model()
    print("モデル初期ロード完了")
    yield  # アプリのライフサイクルの本体がここ


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
        user_index = get_user_id(request.user_id)
        is_existing_user = user_index < config["num_users"]
        if is_existing_user:
            print("学習済みユーザー")
            query = existing_user_query
        else:
            print("新規ユーザー")
            query = new_user_query

        # モデル訓練時のconfigから、候補投稿のアイテム数を取得し、時系列順で取得する
        num_item = config["num_items"]

        # PostgreSQLから候補投稿画像を取得
        params = {
            "current_user_id": request.user_id,
            "num_item": num_item,
        }
        candidates = get_candidate_posts(query, params)
        print(f"取得した候補数: {len(candidates)}")
        recommended = get_recommended_timeline(
            user_index, candidates, model, device, is_existing_user
        )
        # recommended: candidate(辞書)のリスト

        posts = [
            Post(
                id=rc["post_uuid"],
                caption=rc["caption"],
                image_key=rc["image_key"],
                created_at=rc["created_at"].isoformat(),
                score=rc["score"],
                user=FastAPIUser(
                    id=rc["user_id"],
                    name=rc["name"],
                    email=rc["email"],
                    bio=rc["bio"],
                    icon_image_key=rc.get("icon_image_key"),
                ),
                comments=rc.get("comments", []) if rc.get("comments", []) is not None else [],  # コメント埋め込み済み前提
                likes=rc.get("likes", []) if rc.get("likes", []) is not None else [],  # いいね埋め込み済み前提
                daily_task=rc.get("daily_task"),
            )
            for rc in recommended
        ]
        return TimelineResponse(posts=posts)
    except Exception as e:
        traceback.print_exc()  # ← 追加！ターミナルにスタックトレースを表示
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

# ---------------------- 起動(開発用) ---------------------- #
# poetry run uvicorn recommend_system.api.main:app --reload
# -------------------------------------------------------- #
