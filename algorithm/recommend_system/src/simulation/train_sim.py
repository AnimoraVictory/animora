# ---------------------------------------------------------------------------------  # 
#                       学習プロセス(擬似シミュレーションデータ)                            #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import pandas as pd
import random
from recommend_system.models.mmneumf import MultiModalNeuMFEngine
from recommend_system.utils.data import SampleGenerator

# ----------------------------------
# 1. 擬似シミュレーションデータの生成関数
# ----------------------------------
def generate_sim_data(num_users, num_items, num_records):
    """
    擬似的なユーザー、アイテム間のインタラクションデータを生成する関数
    各レコードは以下の情報から構成される:
        - userId: ユーザーID(0 ~ num_users-1)
        - itemId: アイテムID(0 ~ num_items-1)
        - rating: インタラクションの有無(ここでは常に1.0)
        - timestamp: ランダムなUnixタイムスタンプ
        - image_feature: 1024次元のランダムな浮動小数点リスト
        - text_feature: 768次元のランダムな浮動小数点リスト
    """
    data = []
    for _ in range(num_records):
        userId = random.randint(0, num_users-1)
        itemId = random.randint(0, num_items-1)
        rating = 1.0 # implicit feedbackなので、インタラクションがあったとみなす
        timestamp = random.randint(1600000000, 1700000000)
        image_feature = [random.random() for _ in range(1024)]
        text_feature = [random.random() for _ in range(768)]
        data.append((userId, itemId, rating, timestamp, image_feature, text_feature))
    df = pd.DataFrame(data, columns=["userId", "itemId", "rating", "timestamp", "image_feature", "text_feature"])
    return df

# ----------------------------------
# 2. シミュレーション用の設定(config)
# ----------------------------------
sim_config = {
    "alias": "multimodal_neumf_sim",
    "num_epoch": 50,
    "batch_size": 512,
    "optimizer": "adam",
    "adam_lr": 1e-3,
    "num_users": 100, # 擬似データ用のユーザー数
    "num_items": 200, # 擬似データ用のアイテム数
    "latent_dim_mf": 8,
    "latent_dim_mlp": 8,
    "num_negative": 4,
    "layers": [16, 64, 32, 16, 8],
    "l2_regularization": 0.0000001,
    "weight_init_gaussian": True,
    "use_cuda": True,
    "use_bachify_eval": False,
    "device_id": 0,
    "pretrain": False,
    "model_dir": "recommend_system/checkpoints/{}_Epoch{}_HR{:.4f}_NDCG{:.4f}.model",
    "image_emb_dim": 16,
    "text_emb_dim": 16,
    "image_feature_dim": 1024,
    "text_feature_dim": 768
}

# ----------------------------------
# 3. 擬似シミュレーションデータの生成と前処理
# ----------------------------------
num_users = sim_config["num_users"]
num_items = sim_config["num_items"]
num_records = 1000 # 生成するレコード数

simulation_df = generate_sim_data(num_users, num_items, num_records)
print(f"Simulation data generated: {simulation_df.shape[0]} records.")

# ----------------------------------
# 4. サンプル生成器の作成と評価データの準備
# ----------------------------------
sample_generator = SampleGenerator(ratings=simulation_df)
evaluate_data = sample_generator.evaluate_data

# ----------------------------------
# 5. Multi-Modal NeuMFモデルの作成と学習
# ----------------------------------
engine = MultiModalNeuMFEngine(config=sim_config)

# エポックごとに学習と評価を実行
for epoch in range(sim_config["num_epoch"]):
    print(f"Epoch {epoch}/{sim_config['num_epoch']}")
    print("-" * 80)
    train_loader = sample_generator.instance_a_train_loader(sim_config["num_negative"], sim_config["batch_size"])
    engine.train_an_epoch(train_loader, epoch_id=epoch)
    hit_ratio, ndcg = engine.evaluate(evaluate_data, epoch_id=epoch)
    engine.save(sim_config["alias"], epoch, hit_ratio, ndcg)

