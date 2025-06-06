# ---------------------------------------------------------------------------------  # 
#                    　　　  データベースへモデルをアップロードする                          #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import os
import re
import boto3
import shutil
from dotenv import load_dotenv, find_dotenv
from settings import TARGET_DIR, LATEST_MODEL_PATH, S3_BUCKET, S3_KEY

_ = load_dotenv(find_dotenv())


def get_latest_model_file():
    """
    最新のモデルファイルを探す関数
    """
    pattern = r"train_(\d{8}_\d{6})_HR[\d\.]+_NDCG[\d\.]+\.model"
    latest_ts = ""
    latest_file = None

    for fname in os.listdir(TARGET_DIR):
        match = re.match(pattern, fname)
        if match:
            timestamp = match.group(1)
            if timestamp > latest_ts:
                latest_ts = timestamp
                latest_file = fname

    return os.path.join(TARGET_DIR, latest_file) if latest_file else None

def upload_latest_model():
    """
    最新のモデルファイルを'latest.model'としてアップロードする関数
    """
    model_path = get_latest_model_file()
    if model_path is None:
        print("最新モデルが見つかりません")
        return
    
    print(f"最新モデル: {model_path}")

    # コピーしてlatest.modelにリネーム
    shutil.copy(model_path, LATEST_MODEL_PATH)

    # S3にアップロード
    s3 = boto3.client("s3")
    s3.upload_file(LATEST_MODEL_PATH, S3_BUCKET, S3_KEY)
    print("latest.modelをアップロードしました")