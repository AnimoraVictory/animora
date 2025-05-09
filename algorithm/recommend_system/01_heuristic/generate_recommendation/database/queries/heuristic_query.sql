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
GROUP BY P.id, P.created_at
ORDER BY P.created_at DESC;