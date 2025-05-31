# ---------------------------------------------------------------------------------  #
#                                 レコメンデーションを生成する                         　 #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import os
import json
import asyncio
import traceback
from glide import (
    ClosingError, ConnectionError,
    GlideClient, GlideClientConfiguration,
    Logger, LogLevel, NodeAddress, RequestError, TimeoutError,
)
from database.query_runner import execute_query_from_file
from recommender.heuristic_rec import HeuristicRecommender
from recommender.neucf_rec import NeuCFRecommender
from utils.model import load_model, is_existing_user
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())
    
# ----------------------------------
# レコメンデーションの生成
# ----------------------------------
async def handler():
    """
    全ユーザーに対するレコメンデーションを生成し、キャッシュする関数
    """
    # ログ設定
    Logger.set_logger_config(LogLevel.INFO)

    # Glideクラスタークライアントの設定
    addresses = [
        NodeAddress(os.getenv("VALKEY_HOST"), int(os.getenv("VALKEY_PORT")))
    ]
    config = GlideClientConfiguration(addresses=addresses, use_tls=True)
    client = None

    try:
        # ユーザーIDの取得
        rows = execute_query_from_file(
            "database/queries/get_all_users.sql"
        )
        client = await GlideClient.create(config)
        config, model = load_model()
        for user in rows:
            user_id = user["user_id"]

            # ユーザーが学習済みのユーザーかどうかを判定し、レコメンドを生成
            if is_existing_user(user_id, config):
                recommender = NeuCFRecommender()
                recommendations = recommender.recommend(user_id, model)
            else:
                recommender = HeuristicRecommender()
                recommendations = recommender.recommend(user_id)
            
            # レコメンデーションのキャッシュ
            result = await client.set(user_id, json.dumps(recommendations))
            if result:
                print(f"Recommendations for user {user_id} cached successfully.")
            else:
                print(f"Failed to cache recommendations for user {user_id}.")
    
    except (TimeoutError, RequestError, ConnectionError, ClosingError) as e:
        traceback.print_exc()
        print(f"An error occurred: {e}")
    
    finally:
        if client:
            try: 
                await client.close()
                print("Client connection closed.")
            except ClosingError as e:
                print(f"Error closing client: {e}")

def lambda_handler(event=None, context=None):
    """
    AWS Lambdaのエントリーポイント
    """
    return asyncio.run(handler())
