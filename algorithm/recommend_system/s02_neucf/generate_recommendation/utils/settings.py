# ---------------------------------------------------------------------------------  # 
#                                   設定ファイル                                       #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import os
import torch
from dotenv import find_dotenv, load_dotenv

# ----------------------------------
# 基本設定
# ----------------------------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# ----------------------------------
# 機密情報の取得
# ----------------------------------
_ = load_dotenv(find_dotenv())

# --------- Load Trained Model --------- #
S3_BUCKET = os.getenv("AWS_S3_BUCKET_NAME")
S3_KEY = "models/latest.model"