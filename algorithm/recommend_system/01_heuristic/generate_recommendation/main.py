# ---------------------------------------------------------------------------------  #
#                                 レコメンデーションを生成する                         　 #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import os
import asyncio
import traceback
from glide import (
    ClosingError, ConnectionError,
    GlideClusterClient, GlideClusterClientConfiguration,
    Logger, LogLevel, NodeAddress, RequestError, TimeoutError,
)
from database.query_runner import execute_query_from_file
from recommender.heuristic import HeuristicRecommender
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
    config = GlideClusterClientConfiguration(addresses=addresses, use_tls=True)
    client = None

    try:
        # ユーザーIDの取得
        rows = execute_query_from_file(
            "common/database/queries/get_all_users.sql"
        )
        client = await GlideClusterClient.create(config)
        for user in rows:
            user_id = user["id"]

            # レコメンデーションの生成
            recommender = HeuristicRecommender()
            recommendations = recommender.recommend(user_id)
            
            # レコメンデーションのキャッシュ
            result = await client.set(user_id, recommendations)
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
