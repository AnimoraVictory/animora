# ---------------------------------------------------------------------------------  # 
#     投稿の画像とテキストをそれぞれマルチモーダル埋め込みベクトルに変換し、データベースに保存       #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
from psycopg2.extras import RealDictCursor
from database.connection import get_connection

def execute_query_from_file(file_path: str, params: dict={}):
    """
    SQLファイルを読み込み、クエリを実行する関数

    Args:
        file_path (str): SQLファイルのパス
        params (tuple): クエリに渡すパラメータ
    """
    with open(file_path, "r") as f:
        query = f.read()
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, params)
    result = cur.fetchall()
    cur.close()
    conn.close()
    return result