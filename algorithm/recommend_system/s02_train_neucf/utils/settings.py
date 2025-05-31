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

# --------- Trained Model --------- #
TARGET_DIR = "models/checkpoints/"
LATEST_MODEL_PATH = "models/latest.model"
S3_BUCKET = os.getenv("AWS_S3_BUCKET_NAME")
S3_KEY = "models/latest.model"


# ----------------------------------
# モデル学習用の設定(config)
# ----------------------------------
train_config = {
    "alias": "train",
    "num_epoch": 50,
    "batch_size": 512,
    "optimizer": "adam",
    "adam_lr": 1e-3,
    "num_users": "",  # データから実際のユーザー数・アイテム数を取得
    "num_items": "",
    "latent_dim_mf": 8,
    "latent_dim_mlp": 8,
    "num_negative": 4,
    "layers": [16, 64, 32, 16, 8],
    "l2_regularization": 0.0000001,
    "weight_init_gaussian": True,
    "use_cuda": True,
    "use_bachify_eval": False,
    "device_id": 0,
    "pretrain": True,
    "model_dir": "/tmp/checkpoints/train_{}_HR{:.4f}_NDCG{:.4f}.model",
    "pretrain_model_dir": "/tmp/latest.model",
    "image_emb_dim": 16,
    "text_emb_dim": 16,
    "image_feature_dim": 768,
    "text_feature_dim": 768,
}