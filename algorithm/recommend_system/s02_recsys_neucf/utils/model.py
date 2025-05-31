# ---------------------------------------------------------------------------------  #
#                               S3 からモデルをロードする関数                         　 #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import boto3 
import torch
from io import BytesIO
from utils.settings import S3_BUCKET, S3_KEY, DEVICE
from neucf.components.mmneucf import MultiModalNeuCF
from database.query_runner import execute_query_from_file

# ----------------------------------
# S3 からモデルをロードする関数
# ----------------------------------
def load_model(bucket: str=S3_BUCKET, key: str=S3_KEY) -> torch.nn.Module:
    """
    Load model from S3
    """
    s3 = boto3.client("s3")
    obj = s3.get_object(Bucket=bucket, Key=key)
    buffer = BytesIO(obj["Body"].read())

    state_dict = torch.load(buffer, map_location=torch.device(DEVICE))
    config = state_dict["config"]
    model = MultiModalNeuCF(
        config, config["image_feature_dim"], config["text_feature_dim"]
    ).to(DEVICE)
    model.load_state_dict(state_dict["model_state_dict"])
    model.eval()
    return config, model

# ----------------------------------
# ユーザーが既存のユーザーかどうかを判定する関数
# ----------------------------------
def is_existing_user(user_uuid: str, config: dict) -> bool:
    """
    Check if user is existing user

    Args:
        user_uuid (str): User UUID
        config (dict): Model config

    Returns:
        bool: True if user is existing user, False otherwise
    """
    params = {"user_uuid": user_uuid}
    user_index = execute_query_from_file(
        "database/queries/get_user_index.sql",
        params=params
    )
    return user_index[0]["index"] < config["num_users"]