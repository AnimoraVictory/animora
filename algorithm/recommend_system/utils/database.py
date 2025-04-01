# ---------------------------------------------------------------------------------  # 
#                                  データベース関連処理                                  #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import os
import psycopg2
from sqlalchemy import create_engine
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

# PostgreSQLデータベースへの接続
def get_connection():
    return psycopg2.connect(os.getenv('DATABASE_URL'))

# SQLAlchemyを用いた接続
def get_sqlalchemy_connection():
    return create_engine(os.getenv('DATABASE_URL'))
    