-- ----------------------------------
-- NeuCF レコメンドシステム用に投稿を取得するクエリ
-- ----------------------------------
SELECT
    P."index" AS post_id,
    P."id" AS post_uuid,
    P.created_at AS created_at,
    P.image_feature AS image_feature,
    P.text_feature AS text_feature,
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
ORDER BY P.created_at DESC;