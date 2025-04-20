# ---------------------------------------------------------------------------------  #
#                      レコメンドタイムラインを生成するオンライン推論API                  　 #
# ---------------------------------------------------------------------------------  #
# ライブラリのインポート
import os
from fastapi import FastAPI, HTTPException
import traceback
import subprocess
import uvicorn
from contextlib import asynccontextmanager
from huggingface_hub import login
from common.src.multimodal_feature_extractor import update_post_features
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

# ----------------------------------
# Hugging Face Hubのログイン
# ----------------------------------
@asynccontextmanager
async def login_huggingface(app: FastAPI):
    hf_token = os.getenv("HUGGINGFACE_TOKEN")
    if hf_token:
        login(token=hf_token)
        print("Logged in to Hugging Face Hub.")
    else:
        print("Hugging Face Hub token not found. Please set the HUGGINGFACE_TOKEN environment variable.")
    yield # アプリのライフサイクルの本体がここ


# ----------------------------------
# FastAPIアプリの構築
# ----------------------------------
app = FastAPI(lifespan=login_huggingface)

# ----------------------------------
# / エンドポイント
# ----------------------------------
@app.get("/")
def embed_vector_and_retrain_model():
    """
    埋め込みベクトルの計算を行い、モデルを再学習するエンドポイント
    """
    try:
        # 埋め込みベクトルの計算
        update_post_features()

        # train_prod.pyを実行
        subprocess.run(["python", "recommend_system/src/train_prod.py"], check=True)
        print("Model retraining completed successfully.")
    except Exception as e:
        traceback.print_exc()
        print("Model retraining failed", str(e))
        raise HTTPException(status_code=500, detail="Model retraining failed")
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

# ---------------------- 起動(開発用) ---------------------- #
# poetry run uvicorn recommend_system.api.embedding_to_train:app --reload
# -------------------------------------------------------- #