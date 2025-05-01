# ---------------------------------------------------------------------------------  #
#                   　　　  データベースからモデルをダウンロードする                         #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import os

import boto3
from dotenv import find_dotenv, load_dotenv

_ = load_dotenv(find_dotenv())

LATEST_MODEL_PATH = "/tmp/latest.model"
S3_BUCKET = os.getenv("AWS_S3_BUCKET_NAME")
S3_KEY = "models/latest.model"


# モデルのダウンロード
def download_latest_model():
    os.makedirs(
        os.path.dirname(LATEST_MODEL_PATH), exist_ok=True
    )  # .gitignoreに追加されているため、毎回ダウンロードする
    s3 = boto3.client("s3")
    s3.download_file(S3_BUCKET, S3_KEY, LATEST_MODEL_PATH)
    print("モデルのダウンロードが完了しました")


if __name__ == "__main__":
    download_latest_model()
