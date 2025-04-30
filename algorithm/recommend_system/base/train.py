# ---------------------------------------------------------------------------------  #
#                                     学習プロセス                                     #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import pandas as pd
import numpy as np
from gmf import GMFEngine
from mlp import MLPEngine
from neumf import NeuMFEngine
from data import SampleGenerator

# configの設定
gmf_config = {
    "alias": "gmf_factor8neg4-implict",
    "num_epoch": 200,
    "batch_size": 1024,
    # 'optimizer': 'sgd',
    # 'sgd_lr': 1e-3,
    # 'sgd_momentum': 0.9,
    # 'optimizer': 'rmsprop',
    # 'rmsprop_lr': 1e-3,
    # 'rmsprop_alpha': 0.99,
    # 'rmsprop_momentum': 0,
    "optimizer": "adam",
    "adam_lr": 1e-3,
    "num_users": 6040,
    "num_items": 3706,
    "latent_dim": 8,
    "num_negative": 4,
    "l2_regularization": 0,  # 0.01
    "weight_init_gaussian": True,
    "use_cuda": False,
    "use_bachify_eval": False,
    "device_id": 0,
    "model_dir": "checkpoints/{}_Epoch{}_HR{:.4f}_NDCG{:.4f}.model",
}

mlp_config = {
    "alias": "mlp_factor8neg4_bz256_166432168_pretrain_reg_0.0000001",
    "num_epoch": 200,
    "batch_size": 256,  # 1024,
    "optimizer": "adam",
    "adam_lr": 1e-3,
    "num_users": 6040,
    "num_items": 3706,
    "latent_dim": 8,
    "num_negative": 4,
    "layers": [
        16,
        64,
        32,
        16,
        8,
    ],  # layers[0] is the concat of latent user vector & latent item vector
    "l2_regularization": 0.0000001,  # MLP model is sensitive to hyper params
    "weight_init_gaussian": True,
    "use_cuda": False,
    "use_bachify_eval": False,
    "device_id": 0,
    "pretrain": False,
    "pretrain_mf": "checkpoints/{}".format(
        "gmf_factor8neg4_Epoch100_HR0.6391_NDCG0.2852.model"
    ),
    "model_dir": "checkpoints/{}_Epoch{}_HR{:.4f}_NDCG{:.4f}.model",
}

neumf_config = {
    "alias": "neumf_factor8neg4",
    "num_epoch": 200,
    "batch_size": 1024,
    "optimizer": "adam",
    "adam_lr": 1e-3,
    "num_users": 6040,
    "num_items": 3706,
    "latent_dim_mf": 8,
    "latent_dim_mlp": 8,
    "num_negative": 4,
    "layers": [
        16,
        64,
        32,
        16,
        8,
    ],  # layers[0] is the concat of latent user vector & latent item vector
    "l2_regularization": 0.0000001,
    "weight_init_gaussian": True,
    "use_cuda": True,
    "use_bachify_eval": True,
    "device_id": 0,
    "pretrain": False,
    "pretrain_mf": "checkpoints/{}".format(
        "gmf_factor8neg4_Epoch100_HR0.6391_NDCG0.2852.model"
    ),
    "pretrain_mlp": "checkpoints/{}".format(
        "mlp_factor8neg4_Epoch100_HR0.5606_NDCG0.2463.model"
    ),
    "model_dir": "checkpoints/{}_Epoch{}_HR{:.4f}_NDCG{:.4f}.model",
}

# データの読み込み(データセット: MovieLens 1M)
ml1m_dir = "data/ml-1m/ratings.dat"
ml1m_rating = pd.read_csv(
    ml1m_dir,
    sep="::",
    header=None,
    names=["uid", "mid", "rating", "timestamp"],
    engine="python",
)

# ユーザーID・アイテムIDの再インデックス化
# MovieLensデータのuid(userId)とmid(movieId)は、連続した番号になっていない場合があるため、0から始まる連続したインデックスに変換
user_id = ml1m_rating[["uid"]].drop_duplicates().reindex()  # 順番通りに並べる
user_id["userId"] = np.arange(len(user_id))  # インデックスを割り振る
ml1m_rating = pd.merge(ml1m_rating, user_id, on=["uid"], how="left")
item_id = ml1m_rating[["mid"]].drop_duplicates()
item_id["itemId"] = np.arange(len(item_id))
ml1m_rating = pd.merge(ml1m_rating, item_id, on=["mid"], how="left")
ml1m_rating = ml1m_rating[["userId", "itemId", "rating", "timestamp"]]
print(f"Range of userId is [{ml1m_rating.userId.min()}, {ml1m_rating.userId.max()}]")
print(f"Range of itemId is [{ml1m_rating.itemId.min()}, {ml1m_rating.itemId.max()}]")

# 学習データと評価データの準備
sample_generator = SampleGenerator(ratings=ml1m_rating)
evaluate_data = sample_generator.evaluate_data

# NeuMFモデルを選択し、エンジンを作成
# Specify the exact model
# config = gmf_config
# engine = GMFEngine(config)
# config = mlp_config
# engine = MLPEngine(config)
config = neumf_config
engine = NeuMFEngine(config)

# エポックごとに学習と評価を実行
for epoch in range(config["num_epoch"]):
    print(f"Epoch {epoch} starts !")
    print("-" * 80)
    train_loader = sample_generator.instance_a_train_loader(
        config["num_negative"], config["batch_size"]
    )
    engine.train_an_epoch(train_loader, epoch_id=epoch)
    hit_ratio, ndcg = engine.evaluate(evaluate_data, epoch_id=epoch)
    engine.save(config["alias"], epoch, hit_ratio, ndcg)  # 各エポック後にモデルを保存
