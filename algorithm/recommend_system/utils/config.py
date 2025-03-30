# ---------------------------------------------------------------------------------  # 
#                                   設定ファイル                                       #
# ---------------------------------------------------------------------------------  #

# ----------------------------------
# シミュレーション用の設定(config)
# ----------------------------------
sim_config = {
    "alias": "sim",
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
    "model_dir": "recommend_system/models/checkpoints/sim_HR{:.4f}_NDCG{:.4f}.model",
    "image_emb_dim": 16,
    "text_emb_dim": 16,
    "image_feature_dim": 1024,
    "text_feature_dim": 768
}

# ----------------------------------
# プロダクション用の設定(config)
# ----------------------------------
prod_config = {
    "alias": "prod",
    "num_epoch": 50,
    "batch_size": 512,
    "optimizer": "adam",
    "adam_lr": 1e-3,
    "num_users": "", # データから実際のユーザー数・アイテム数を取得
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
    "model_dir": "recommend_system/models/checkpoints/prod_{}_HR{:.4f}_NDCG{:.4f}.model",
    "pretrain_model_dir": "recommend_system/models/latest.model",
    "image_emb_dim": 16,
    "text_emb_dim": 16,
    "image_feature_dim": 1024,
    "text_feature_dim": 768
}