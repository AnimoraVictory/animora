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

# ----------------------------------
# 新規ユーザーに対する投稿を取得するクエリと閾値
# ----------------------------------
existing_user_query = """
                      SELECT 
                          index AS post_id,
                          created_at AS timestamp,
                          image_feature AS image_feature, -- JSON文字列
                          text_feature AS text_feature -- JSON文字列
                      FROM posts
                      WHERE image_feature IS NOT NULL AND text_feature IS NOT NULL;
                      """
existing_user_threshold = 0.5

new_user_query = """
                 SELECT
                     P.id AS post_id,
                     P.created_at AS timestamp,
                     image_feature AS image_feature,
                     text_feature AS text_feature,
                     COUNT(DISTINCT L.id) + COUNT(DISTINCT C.id) AS score
                 FROM posts P
                 LEFT JOIN likes L ON L.post_likes = P.id
                 LEFT JOIN comments C ON C.post_comments = P.id
                 WHERE P.image_feature IS NOT NULL AND P.text_feature IS NOT NULL
                 GROUP BY P.id, P.created_at, P.image_feature, P.text_feature;
                 """
new_user_threshold = 10