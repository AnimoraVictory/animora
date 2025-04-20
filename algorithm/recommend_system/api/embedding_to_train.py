# ---------------------------------------------------------------------------------  #
#                      レコメンドタイムラインを生成するオンライン推論API                  　 #
# ---------------------------------------------------------------------------------  #
# ライブラリのインポート
from fastapi import FastAPI, HTTPException
import traceback
import subprocess
import uvicorn
from common.src.multimodal_feature_extractor import update_post_features

# ----------------------------------
# FastAPIアプリの構築
# ----------------------------------
app = FastAPI()

# ----------------------------------
# /(ルート)エンドポイント
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