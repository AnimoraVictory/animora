# ---------------------------------------------------------------------------------  #
#                      レコメンドタイムラインを生成するオンライン推論API                  　 #
# ---------------------------------------------------------------------------------  #
# ライブラリのインポート
from typing import Optional
from fastapi import FastAPI, HTTPException
import traceback
from pydantic import BaseModel
from contextlib import asynccontextmanager
import torch
import uvicorn
from recommend_system.components.mmneumf import MultiModalNeuMF
from recommend_system.src.download_model import download_latest_model
from recommend_system.api.recommend_timeline import (
    get_candidate_posts,
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
    user_id: int
    cursor: Optional[int] = None  # どれだけスキップするか
    limit: int = 10  # 取得する投稿数


class Post(BaseModel):
    id: int
    caption: str
    image_key: str
    created_at: str
    score: float
    users: dict[str, str]


class TimelineResponse(BaseModel):
    posts: list[Post]
    next_cursor: Optional[int]


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
        recommended = get_recommended_timeline(
            request.user_id, candidates, model, device, is_existing_user
        )

        # カーソルによるフィルタリング（post_idがcursorより後ろ）
        if request.cursor is not None:
            cursor_index = next(
                (
                    i
                    for i, r in enumerate(recommended)
                    if r["post_id"] == request.cursor
                ),
                -1,
            )
            recommended = recommended[cursor_index + 1 :]

        posts_data = recommended[: request.limit]

        posts = [
            Post(
                id=rc["post_id"],
                caption=rc["caption"],
                image_key=rc["image_key"],
                created_at=str(rc["created_at"]),
                score=rc["score"],
                users=(
                    {
                        "id": rc["user_id"],
                        "name": rc["name"],
                        "email": rc["email"],
                        "bio": rc["bio"],
                        "icon_image_key": rc["icon_image_key"],
                    }
                    if is_existing_user
                    else {}
                ),
            )
            for rc in posts_data
        ]
        next_cursor = posts_data[-1]["post_id"] if len(posts_data) == request.limit else None
        return TimelineResponse(posts=posts, next_cursor=next_cursor)
    except Exception as e:
        traceback.print_exc()  # ← 追加！ターミナルにスタックトレースを表示
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

# ---------------------- 起動(開発用) ---------------------- #
# poetry run uvicorn recommend_system.api.main:app --reload
# -------------------------------------------------------- #
