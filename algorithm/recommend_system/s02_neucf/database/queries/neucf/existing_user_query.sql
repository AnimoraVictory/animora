-- ----------------------------------
-- 学習済みユーザーに対する投稿を取得するクエリ
-- ----------------------------------
SELECT 
    P."index" AS post_id,
    P."id" AS post_uuid,
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
        WHERE D.post_daily_task = P.id
        LIMIT 1
    ) AS daily_task

FROM posts P
LEFT JOIN users U ON P.user_posts = U.id
WHERE 
    P.image_feature IS NOT NULL 
    AND P.text_feature IS NOT NULL 
    AND P.deleted_at IS NULL
    AND NOT EXISTS (
        SELECT 1 FROM block_relations B
        WHERE 
            (B.user_blocked_by = %(current_user_id)s AND B.user_blocking = P.user_posts)
            OR (B.user_blocked_by = P.user_posts AND B.user_blocking = %(current_user_id)s)
    )
ORDER BY P.created_at DESC
LIMIT %(num_item)s;