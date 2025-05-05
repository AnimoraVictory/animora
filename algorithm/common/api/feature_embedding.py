# ---------------------------------------------------------------------------------  # 
#     投稿の画像とテキストをそれぞれマルチモーダル埋め込みベクトルに変換し、データベースに保存      #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import os
from fastapi import FastAPI, HTTPException
import traceback
import uvicorn
from pydantic import BaseModel
from huggingface_hub import login
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

# ----------------------------------
# Hugging Face Hubのログイン
# ----------------------------------
hf_token = os.getenv("HUGGINGFACE_TOKEN")
if hf_token:
    login(token=hf_token)
    print("✅ Logged in to Hugging Face Hub.")
else:
    print("❌ Hugging Face Hub token not found. Please set HUGGINGFACE_TOKEN")

# ※ログインが完了したあとにインポート
from common.batch.multimodal_feature_extractor import update_post_features

# ----------------------------------
# APIリクエストのデータモデル
# ----------------------------------
class FeatureEmbeddingRequest(BaseModel):
    post_id: str


# ----------------------------------
# FastAPIアプリの構築
# ----------------------------------
app = FastAPI()


# ----------------------------------
# /embed エンドポイント
# ----------------------------------
@app.post("/embed")
def embed_vector(request: FeatureEmbeddingRequest):
    """
    post_idを与えると埋め込みベクトルの計算を行うエンドポイント
    """
    try:
        # 埋め込みベクトルの計算
        update_post_features(request.post_id)
        print("Embedding vector calculation completed successfully.")

    except Exception as e:
        traceback.print_exc()
        print("Embedding vector calculation failed", str(e))
        raise HTTPException(status_code=500, detail="Embedding vector calculation failed")
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

# ---------------------- 起動(開発用) ---------------------- #
# poetry run uvicorn common.api.feature_embedding:app --reload
# -------------------------------------------------------- #