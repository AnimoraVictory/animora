# ---------------------------------------------------------------------------------  # 
#                          　　     S3からデータを取得する            　                 #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import boto3
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

def get_presigned_url(bucket_name, object_key, expiration=3600):
    """
    S3オブジェクトの署名付きURLを取得する関数
    """
    s3 = boto3.client("s3")
    response = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket_name, "Key": object_key},
        ExpiresIn=expiration
    )
    return response