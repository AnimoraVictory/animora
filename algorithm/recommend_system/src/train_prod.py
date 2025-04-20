# ---------------------------------------------------------------------------------  # 
#                               学習プロセス(実投稿データ)                               #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import traceback
import pandas as pd
import json
import subprocess
import requests
from recommend_system.components.mmneumf import MultiModalNeuMFEngine
from recommend_system.components.data import SampleGenerator
from common.utils.database import get_sqlalchemy_connection
from recommend_system.utils.config import prod_config, rating_query

if __name__ == "__main__":
    # ----------------------------------
    # 1. PostgreSQLから実データを取得
    # ----------------------------------
    # PostgreSQLデータベースへの接続
    engine = get_sqlalchemy_connection()

    # ratingsデータフレームを作成
    prod_df = pd.read_sql(rating_query, engine)

    # ----------------------------------
    # 2. 特徴量のパース(JSON -> List)
    # ----------------------------------
    def parse_feature(x):
        if isinstance(x, str):
            return json.loads(x)
        return x

    prod_df["image_feature"] = prod_df["image_feature"].map(parse_feature)
    prod_df["text_feature"] = prod_df["text_feature"].map(parse_feature)

    print(f"Production data loaded: {prod_df.shape[0]} records")

    # ----------------------------------
    # 3. プロダクション用の設定(config)
    # ----------------------------------
    # データから実際のユーザー数・アイテム数を取得
    print(f"ユーザー数: {prod_df["user_id"].max()}")
    print(f"アイテム数: {prod_df["post_id"].max()}")
    prod_config["num_users"] = int(prod_df["user_id"].max() + 1)
    prod_config["num_items"] = int(prod_df["post_id"].max() + 1)

    # ----------------------------------
    # 4. サンプル生成器の作成と評価データの準備
    # ----------------------------------
    sample_generator = SampleGenerator(ratings=prod_df)
    evaluate_data = sample_generator.evaluate_data

    # ----------------------------------
    # 5. Multi-Modal NeuMFモデルの作成と学習
    # ----------------------------------
    engine = MultiModalNeuMFEngine(config=prod_config)

    # エポックごとに学習と評価を実行
    for epoch in range(prod_config["num_epoch"]):
        print(f"Epoch {epoch}/{prod_config['num_epoch']}")
        print("-" * 80)
        train_loader = sample_generator.instance_a_train_loader(prod_config["num_negative"], prod_config["batch_size"])
        engine.train_an_epoch(train_loader, epoch_id=epoch)
        hit_ratio, ndcg = engine.evaluate(evaluate_data, epoch_id=epoch)
        engine.save_prod(hit_ratio, ndcg)

    # ----------------------------------
    # 6. 最新モデルのアップロードとモデルのリロード
    # ----------------------------------
    # upload_model.pyを実行
    subprocess.run(["python", "recommend_system/src/upload_model.py"], check=True)

    # 推論APIの /reload を叩く
    try:
        response = requests.post("https://animalia-lnzk.onrender.com/reload")
        if response.status_code == 200:
            print("Model reloaded successfully", response.json())
        else:
            print("Failed to reload model", response.json())
    except Exception as e:
        traceback.print_exc()
        print("Failed to reload model", str(e))

