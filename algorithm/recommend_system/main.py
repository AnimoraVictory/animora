# ---------------------------------------------------------------------------------  #
#                      レコメンドタイムラインを生成するオンライン推論API                  　 #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import os
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import traceback
from mangum import Mangum
import redis
import uvicorn
from glide import (
    ClosingError, ConnectionError,
    GlideClusterClient, GlideClusterClientConfiguration,
    Logger, LogLevel, NodeAddress, RequestError, TimeoutError,
)
from recommend_system.strategies.base import BaseRecommender
from recommend_system.strategies.heuristic import HeuristicRecommender
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

# ----------------------------------
# APIリクエストとレスポンスのデータモデル
# ----------------------------------
class TimelineRequest(BaseModel):
    user_id: str

class Post(BaseModel):
    id: str

class TimelineResponse(BaseModel):
    posts: list[Post]

# ----------------------------------
# レコメンドシステムの選択
# ----------------------------------
def get_strategy(name: str="heuristic") -> BaseRecommender:
    if name == "heuristic":
        return HeuristicRecommender()
    else:
        raise ValueError(f"Unknown strategy: {name}")

# ----------------------------------
# FastAPIアプリの構築
# ----------------------------------
app = FastAPI()


# ----------------------------------
# / エンドポイント
# ----------------------------------
@app.get("/")
def root():
    return {"message": "Service is up and running"}


# ----------------------------------
# /timeline エンドポイント
# ----------------------------------
@app.post("/timeline", response_model=TimelineResponse)
async def recommend_timeline(request: TimelineRequest):
    # ログ設定
    Logger.set_logger_config(LogLevel.INFO)

    # Glideクラスタークライアントの設定
    addresses = [
        NodeAddress(os.getenv("VALKEY_HOST"), os.getenv("VALKEY_PORT"))
    ]
    config = GlideClusterClientConfiguration(addresses=addresses, use_tls=True)
    client = None

    try:
        client = await GlideClusterClient.create(config)
        cached = await client.get(request.user_id)
        if cached:
            print(f"Cache hit for user {request.user_id}.")
            return TimelineResponse(posts=cached)
        else:
            print(f"Cache miss for user {request.user_id}. Generating recommendations...")
            # レコメンデーションの生成
            strategy = get_strategy("heuristic")
            recommendations = strategy.recommend(request.user_id)
            await client.set(request.user_id, recommendations)
            print(f"Recommendations for user {request.user_id} cached successfully.")
            return TimelineResponse(posts=recommendations)
    except Exception as e:
        traceback.print_exc()  
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

# ---------------------- 起動(開発用) ---------------------- #
# poetry run uvicorn recommend_system.main:app --reload
# -------------------------------------------------------- #