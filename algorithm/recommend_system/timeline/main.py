# ---------------------------------------------------------------------------------  #
#                      レコメンドタイムラインを生成するオンライン推論API                  　 #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import os
import json
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import traceback
from mangum import Mangum
import uvicorn
from glide import (
    GlideClient, GlideClientConfiguration,
    Logger, LogLevel, NodeAddress, 
)
from recommender.recommender import HeuristicRecommender
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
        NodeAddress(os.getenv("VALKEY_HOST"), int(os.getenv("VALKEY_PORT")))
    ]
    config = GlideClientConfiguration(addresses=addresses, use_tls=True)
    client = None

    try:
        client = await GlideClient.create(config)
        cached = await client.get(request.user_id)
        if cached:
            print(f"Cache hit for user {request.user_id}.")
            post_ids = json.loads(cached)
            posts = [Post(id=pid) for pid in post_ids]
            return TimelineResponse(posts=posts)
        else:
            print(f"Cache miss for user {request.user_id}. Generating recommendations...")

            # レコメンデーションの生成
            recommender = HeuristicRecommender()
            recommendations = recommender.recommend(request.user_id)

            await client.set(request.user_id, recommendations)
            print(f"Recommendations for user {request.user_id} cached successfully.")
            return TimelineResponse(posts=recommendations)
    except Exception as e:
        traceback.print_exc()  
        raise HTTPException(status_code=500, detail=str(e))
    

handler = Mangum(app)