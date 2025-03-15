# ライブラリのインポート
import os
import json
import time
import torch
from PIL import Image
from transformers import AutoModel, AutoImageProcessor 
import asyncio
import asyncpg 
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

#  Japanese Stable CLIPモデルのロード
device = "cuda" if torch.cuda.is_available() else "cpu"
model_path = "stabilityai/japanese-stable-clip-vit-l-16"
model = AutoModel.from_pretrained(model_path, trust_remote_code=True).eval().to(device)
processor = AutoImageProcessor.from_pretrained(model_path)

# 画像Embeddingを生成する関数
def compute_image_embedding(image):
    image = processor(images=image, return_tensors="pt").to(device)
    with torch.no_grad():
        image_features = model.get_image_features(**image)
    image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
    return image_features.cpu().detach().numpy()[0].tolist()

# 非同期処理でベクトル登録
async def process_images():
    # PostgreSQLに非同期接続
    conn = await asyncpg.connect(
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT')
    )

    # モデルの存在確認
    result = await conn.fetchrow(
        "SELECT model_id FROM EMBEDDING_MODELS WHERE model_name = $1",
        "Japanese Stable CLIP"
    )
        # fetchrow: 最初の1行目のみ取得

    if result is None:
        # モデルが存在しない場合は新規挿入
        model_id = await conn.fetchval(
            """
            INSERT INTO EMBEDDING_MODELS (model_name, model_version, is_current, vector_dimension)
            VALUES ($1, $2, $3, $4)
            RETURNING model_id
            """, 
            "Japanese Stable CLIP", "japanese-stable-clip-vit-l-16", 'Y', 768
        )
            # fetchval: 最初の1行目の1列目のみ取得
        print("EMBEDDING_MODELSに新しいモデルを登録しました")
    else:
        model_id = result['model_id']
        print("EMBEDDING_MODELSにモデルが登録済みです")

    # 処理開始時間を記録
    start_time = time.time()

    # 処理件数の初期化
    total_images = 0
    registered_count = 0
    skipped_count = 0

    # imagesディレクトリ内の画像を処理
    images_dir = "../images"
    for filename in os.listdir(images_dir):
        if filename.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
            total_images += 1
            image_path = os.path.join(images_dir, filename)
            filename_lower = filename.lower()

            # 既存チェック(大文字小文字を区別しない)
            images_exists = await conn.fetchrow(
                "SELECT image_id FROM IMAGES WHERE LOWER(file_name) = $1",
                filename_lower
            )

            if images_exists:
                print(f"{filename}はすでにデータベースに存在するためスキップします")
                skipped_count += 1
                continue

            # 画像を開いてEmbeddingを生成
            with Image.open(image_path) as img:
                embedding = compute_image_embedding(img)

            # 画像データをバイナリとして読み込む
            with open(image_path, "rb") as img_file:
                image_data = img_file.read()

            try:
                async with conn.transaction():
                    image_id = await conn.fetchval(
                        """
                        INSERT INTO IMAGES (image_data, file_name, file_type)
                        VALUES ($1, $2, $3)
                        RETURNING image_id
                        """,
                        image_data, filename_lower, os.path.splitext(filename_lower)[1]
                    )
                    # transaction: トランザクションを使う
                    # splittext: ファイル名と拡張子を分割
                    embedding_json = json.dumps(embedding)
                        # json.dumps: PythonオブジェクトをJSON形式に変換
                        # ex) [0.1, 0.2, 0.3] -> "[0.1, 0.2, 0.3]"
                        # 理由: データベースには文字列として保存するため
                    await conn.execute(
                        """
                        INSERT INTO IMAGE_EMBEDDINGS (image_id, model_id, embedding)
                        VALUES($1, $2, $3)
                        """,
                        image_id, model_id, embedding_json
                    )
                registered_count += 1
                print(f"{filename}を登録しました")
            except Exception as e:
                print(f"{filename}の登録に失敗しました: {e}")

    # データベース接続を閉じる
    await conn.close()

    # 処理時間の計算
    end_time = time.time()
    elapsed_time = end_time - start_time

    # 結果の表示
    print("画像の処理とデータベースへの登録が完了しました")
    print(f"フォルダ内の画像数: {total_images}")
    print(f"登録した画像数: {registered_count}")
    print(f"スキップした画像数: {skipped_count}")
    print(f"トータル処理時間: {elapsed_time:.2f}秒")

# メイン関数の実行
if __name__ == "__main__":
    asyncio.run(process_images())

