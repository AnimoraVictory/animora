# ---------------------------------------------------------------------------------  # 
#                                  データベース関連処理                                  #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import os
import psycopg2
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

# PostgreSQLデータベースへの接続
def get_connection():
    return psycopg2.connect(os.getenv('DATABASE_URL'))
    