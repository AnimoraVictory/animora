# ライブラリのインポート
from azure.storage.blob import BlobServiceClient
import os
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

# Azure Blob Storageの接続情報
CONNECTION_STRING = os.getenv('CONNECTION_STRING')
CONTAINER_NAME = os.getenv('CONTAINER_NAME')
SAVE_DIR = os.getenv('SAVE_DIR')

# 保存ディレクトリの作成
os.makedirs(SAVE_DIR, exist_ok=True)

# BlobServiceClientの作成
blob_service_client = BlobServiceClient.from_connection_string(CONNECTION_STRING)

# コンテナ内の画像リストを種痘
container_client = blob_service_client.get_container_client(CONTAINER_NAME)

# 画像のダウンロード
for blob in container_client.list_blobs():
    BLOB_NAME = blob.name
    SAVE_PATH = os.path.join(SAVE_DIR, BLOB_NAME)

    blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=BLOB_NAME)

    with open(SAVE_PATH, 'wb') as f:
        f.write(blob_client.download_blob().readall())
        
    print(f'{BLOB_NAME}を{SAVE_PATH}にダウンロードしました。')