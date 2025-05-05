# ---------------------------------------------------------------------------------  #
#                                 レコメンデーションを生成する                         　 #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import os
import asyncio
import traceback
from mangum import Mangum
from glide import (
    ClosingError, ConnectionError,
    GlideClusterClient, GlideClusterClientConfiguration,
    Logger, LogLevel, NodeAddress, RequestError, TimeoutError,
)
from common.database.query_runner import execute_query_from_file
from recommend_system.strategies.base import BaseRecommender
from recommend_system.strategies.heuristic import HeuristicRecommender
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

# ----------------------------------
# レコメンドシステムの選択
# ----------------------------------
def get_strategy(name: str="heuristic") -> BaseRecommender:
    if name == "heuristic":
        return HeuristicRecommender()
    else:
        raise ValueError(f"Unknown strategy: {name}")
    
# ----------------------------------
# レコメンデーションの生成
# ----------------------------------
async def generate_recommendations():
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
            strategy = get_strategy("heuristic")
            recommendations = strategy.recommend(user_id)
            
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

if __name__ == "__main__":
    # 非同期関数を実行
    asyncio.run(generate_recommendations())
