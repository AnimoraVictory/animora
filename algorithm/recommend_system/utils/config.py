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
    "image_feature_dim": 768,
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
    "image_feature_dim": 768,
    "text_feature_dim": 768
}
# ----------------------------------
# 学習済みユーザーに対する投稿を取得するクエリと閾値
# ----------------------------------
existing_user_query = """
                      SELECT 
                        P."index" AS post_id,
                        P.created_at AS created_at,
                        P.image_feature AS image_feature,
                        P.text_feature AS text_feature,
                        P.caption AS caption,
                        P.image_key AS image_key,

                        U.id AS user_id,
                        U.email AS email,
                        U.name AS name,
                        U.bio AS bio,
                        U.icon_image_key AS icon_image_key,

                        -- comments
                        (
                            SELECT json_agg(json_build_object(
                                'id', C.id,
                                'content', C.content,
                                'created_at', C.created_at,
                                'user', json_build_object(
                                    'id', CU.id,
                                    'name', CU.name,
                                    'email', CU.email,
                                    'bio', CU.bio,
                                    'icon_image_key', CU.icon_image_key
                                )
                            )) FROM comments C
                            JOIN users CU ON C.user_comments = CU.id
                            WHERE C.post_comments = P.id
                        ) AS comments,

                        -- likes
                        (
                            SELECT json_agg(json_build_object(
                                'id', L.id,
                                'created_at', L.created_at,
                                'user', json_build_object(
                                    'id', LU.id,
                                    'name', LU.name,
                                    'email', LU.email,
                                    'bio', LU.bio,
                                    'icon_image_key', LU.icon_image_key
                                )
                            )) FROM likes L
                            JOIN users LU ON L.user_likes = LU.id
                            WHERE L.post_likes = P.id
                        ) AS likes,

                        -- daily_task
                        (
                            SELECT json_build_object(
                                'id', D.id,
                                'created_at', D.created_at,
                                'type', D.type
                            )
                            FROM daily_tasks D
                            WHERE D.post_id = P.id
                            LIMIT 1
                        ) AS daily_task

                    FROM posts P
                    LEFT JOIN users U ON P.user_posts = U.id
                    WHERE P.image_feature IS NOT NULL AND P.text_feature IS NOT NULL
                    ORDER BY P.created_at DESC
                    LIMIT %s

                    """
existing_user_threshold = 0.45

# ----------------------------------
# 新規ユーザーに対する投稿を取得するクエリと閾値
# ----------------------------------
new_user_query = """
                 SELECT
                     P."index" AS post_id,
                     P.created_at AS created_at,
                     P.image_feature AS image_feature,
                     P.text_feature AS text_feature,
                     COUNT(DISTINCT L.id) + COUNT(DISTINCT C.id) AS score,
                     P.caption AS caption,
                     P.image_key AS image_key,
                     U.id AS user_id,
                     U.email AS email,
                     U.name AS name,
                     U.bio AS bio,
                     U.icon_image_key AS icon_image_key,
                      -- comments
                        (
                            SELECT json_agg(json_build_object(
                                'id', C.id,
                                'content', C.content,
                                'created_at', C.created_at,
                                'user', json_build_object(
                                    'id', CU.id,
                                    'name', CU.name,
                                    'email', CU.email,
                                    'bio', CU.bio,
                                    'icon_image_key', CU.icon_image_key
                                )
                            )) FROM comments C
                            JOIN users CU ON C.user_comments = CU.id
                            WHERE C.post_comments = P.id
                        ) AS comments,

                        -- likes
                        (
                            SELECT json_agg(json_build_object(
                                'id', L.id,
                                'created_at', L.created_at,
                                'user', json_build_object(
                                    'id', LU.id,
                                    'name', LU.name,
                                    'email', LU.email,
                                    'bio', LU.bio,
                                    'icon_image_key', LU.icon_image_key
                                )
                            )) FROM likes L
                            JOIN users LU ON L.user_likes = LU.id
                            WHERE L.post_likes = P.id
                        ) AS likes,

                        -- daily_task
                        (
                            SELECT json_build_object(
                                'id', D.id,
                                'created_at', D.created_at,
                                'type', D.type
                            )
                            FROM daily_tasks D
                            WHERE D.post_id = P.id
                            LIMIT 1
                        ) AS daily_task
                 FROM posts P
                 LEFT JOIN users U ON P.user_posts = U.id
                 LEFT JOIN likes L ON L.post_likes = P.id
                 LEFT JOIN comments C ON C.post_comments = P.id
                 WHERE P.image_feature IS NOT NULL AND P.text_feature IS NOT NULL
                 GROUP BY P.id, P.created_at, P.image_feature, P.text_feature
                 ORDER BY P.created_at DESC
                 LIMIT %s;
                 """
new_user_threshold = 2

# ----------------------------------
# ratingsデータフレームを作成するクエリ
# ----------------------------------
rating_query =  """
                -- 投稿自体のインタラクション(投稿者による投稿)
                SELECT
                    U.index AS user_id, P.index AS post_id, 1 AS rating, P.created_at AS created_at, 
                    P.image_feature AS image_feature, P.text_feature AS text_feature
                FROM posts P
                JOIN users U ON P.user_posts = U.id
                WHERE P.text_feature IS NOT NULL AND P.image_feature IS NOT NULL

                UNION -- 縦結合＋重複削除

                -- 「いいね」のインタラクション
                SELECT
                    U.index AS user_id, P.index AS post_id, 1 AS rating, L.created_at AS created_at,
                    P.image_feature AS image_feature, P.text_feature AS text_feature
                FROM likes L
                JOIN posts P ON L.post_likes = P.id
                JOIN users U ON L.user_likes = U.id
                WHERE P.text_feature IS NOT NULL AND P.image_feature IS NOT NULL

                UNION

                -- コメントのインタラクション
                SELECT
                    U.index AS user_id, P.index AS post_id, 1 AS rating, C.created_at AS created_at,
                    P.image_feature AS image_feature, P.text_feature AS text_feature
                FROM comments C
                JOIN posts P ON C.post_comments = P.id
                JOIN users U ON C.user_comments = U.id
                WHERE P.text_feature IS NOT NULL AND P.image_feature IS NOT NULL;
                """
