-- ----------------------------------
-- Heuristicレコメンドシステム用に投稿を取得するクエリ
-- ----------------------------------
SELECT
    P."id" AS post_id,
    P.created_at AS created_at,
    COUNT(DISTINCT L.id) + COUNT(DISTINCT C.id) AS popularity_score
FROM posts P
LEFT JOIN users U ON P.user_posts = U.id
LEFT JOIN likes L ON L.post_likes = P.id
LEFT JOIN comments C ON C.post_comments = P.id
WHERE 
    P.deleted_at IS NULL
    AND NOT EXISTS (
        SELECT 1 FROM block_relations B
        WHERE 
            (B.user_blocked_by = %(current_user_id)s AND B.user_blocking = P.user_posts)
            OR (B.user_blocked_by = P.user_posts AND B.user_blocking = %(current_user_id)s)
    )
GROUP BY P.id, P.created_at
ORDER BY P.created_at DESC;