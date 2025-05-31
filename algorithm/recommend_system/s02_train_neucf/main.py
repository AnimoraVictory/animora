# ---------------------------------------------------------------------------------  # 
#                               学習プロセス(実投稿データ)                               #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import pandas as pd
import json
from neucf.mmneucf import MultiModalNeuCFEngine
from neucf.data import SampleGenerator
from database.connection import get_sqlalchemy_connection
from database.query_runner import execute_query_from_file
from utils.settings import train_config
from utils.model import upload_latest_model

def parse_feature(x):
    if isinstance(x, str):
        return json.loads(x)
    return x

def retrain_model():
    # ----------------------------------
    # 1. PostgreSQLから実データを取得
    # ----------------------------------
    # PostgreSQLデータベースへの接続
    engine = get_sqlalchemy_connection()

    # ratingsデータフレームを作成
    train_df = pd.read_sql(execute_query_from_file(
        "database/queries/rating_query.sql",
        params={}
    ), engine)

    # ----------------------------------
    # 2. 特徴量のパース(JSON -> List)
    # ----------------------------------
    train_df["image_feature"] = train_df["image_feature"].map(parse_feature)
    train_df["text_feature"] = train_df["text_feature"].map(parse_feature)

    print(f"Production data loaded: {train_df.shape[0]} records")

    # ----------------------------------
    # 3. プロダクション用の設定(config)
    # ----------------------------------
    # データから実際のユーザー数・アイテム数を取得
    train_config["num_users"] = int(train_df["user_id"].max() + 1)
    train_config["num_items"] = int(train_df["post_id"].max() + 1)

    # ----------------------------------
    # 4. サンプル生成器の作成と評価データの準備
    # ----------------------------------
    sample_generator = SampleGenerator(ratings=train_df)
    evaluate_data = sample_generator.evaluate_data

    # ----------------------------------
    # 5. Multi-Modal NeuMFモデルの作成と学習
    # ----------------------------------
    engine = MultiModalNeuCFEngine(config=train_config)

    # エポックごとに学習と評価を実行
    for epoch in range(train_config["num_epoch"]):
        print(f"Epoch {epoch}/{train_config['num_epoch']}")
        print("-" * 80)
        train_loader = sample_generator.instance_a_train_loader(train_config["num_negative"], train_config["batch_size"])
        engine.train_an_epoch(train_loader, epoch_id=epoch)
        hit_ratio, ndcg = engine.evaluate(evaluate_data, epoch_id=epoch)
        engine.save_model(hit_ratio, ndcg)

    # ----------------------------------
    # 6. 最新モデルのアップロード
    # ----------------------------------
    # 最新モデルをアップロード
    upload_latest_model()

