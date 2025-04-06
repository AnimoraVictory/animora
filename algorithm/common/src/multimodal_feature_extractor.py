# ---------------------------------------------------------------------------------  # 
#     投稿の画像とテキストをそれぞれマルチモーダル埋め込みベクトルに変換し、データベースに保存       #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import os
import json
import requests
from io import BytesIO
from PIL import Image
from psycopg2.extras import DictCursor
from dotenv import load_dotenv, find_dotenv
from common.utils.database import get_connection
from common.utils.preprocess import compute_text_embeddings, compute_image_embeddings
from common.utils.s3 import get_presigned_url

_ = load_dotenv(find_dotenv())

def update_post_features():
    """
    データベースの投稿情報に画像とテキストのマルチモーダル埋め込みベクトルを追加する関数
    """
    conn = get_connection()
    cur = conn.cursor(cursor_factory=DictCursor)
            
    # 特徴抽出がまだ行われていない投稿を取得
    cur.execute(
        """
        SELECT 
            id AS post_id, 
            image_key AS image_key, 
            caption AS text_content
        FROM posts
        WHERE text_feature IS NULL OR image_feature IS NULL
        """
    )
    posts = cur.fetchall()
    print(f"Found {len(posts)} posts to process")

    for post in posts:
        post_id, image_key, text_content = post["post_id"], post["image_key"], post["text_content"]
        print(f"Processing post {post_id}")

        try:
            # テキスト特徴の計算
            text_features = compute_text_embeddings(text_content) # shape: (1, feature_dim)

            # S3から署名付きURL取得 -> 画像のダウンロード
            image_url = get_presigned_url(
                bucket_name=os.getenv("AWS_S3_BUCKET_NAME"),
                object_key=image_key,
                expiration=3600
            )
            response = requests.get(image_url)
            image = Image.open(BytesIO(response.content)).convert("RGB")

            # 画像特徴の計算
            image_features = compute_image_embeddings(image) # shape: (1, feature_dim)

            # Tensorをリストへ変換
            text_features_list = text_features.squeeze(0).tolist()
            image_features_list = image_features.squeeze(0).tolist()

            # データベースに特徴量を保存(特徴ベクトルはJSON文字列として保存)
            update_query = """
                UPDATE posts
                SET text_feature = %s, image_feature = %s
                WHERE id = %s
            """
            cur.execute(update_query, 
                    (json.dumps(text_features_list), json.dumps(image_features_list), post_id)
            )
            conn.commit()
            print(f"Post id {post_id} updated successfully")

        except Exception as e:
            print(f"Error processing post id {post_id}: {e}")
            conn.rollback()
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    update_post_features()

