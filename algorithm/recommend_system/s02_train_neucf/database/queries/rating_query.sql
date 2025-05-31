-- ----------------------------------
-- ratingsデータフレームを作成するクエリ
-- ----------------------------------
 
 -- 投稿自体のインタラクション(投稿者による投稿)
SELECT
    U.index AS user_id, P.index AS post_id, 1 AS rating, P.created_at AS created_at, 
    P.image_feature AS image_feature, P.text_feature AS text_feature
FROM posts P
JOIN users U ON P.user_posts = U.id
WHERE P.text_feature IS NOT NULL AND P.image_feature IS NOT NULL AND P.deleted_at IS NULL

UNION -- 縦結合＋重複削除

-- 「いいね」のインタラクション
SELECT
    U.index AS user_id, P.index AS post_id, 1 AS rating, L.created_at AS created_at,
    P.image_feature AS image_feature, P.text_feature AS text_feature
FROM likes L
JOIN posts P ON L.post_likes = P.id
JOIN users U ON L.user_likes = U.id
WHERE P.text_feature IS NOT NULL AND P.image_feature IS NOT NULL AND P.deleted_at IS NULL

UNION

-- コメントのインタラクション
SELECT
    U.index AS user_id, P.index AS post_id, 1 AS rating, C.created_at AS created_at,
    P.image_feature AS image_feature, P.text_feature AS text_feature
FROM comments C
JOIN posts P ON C.post_comments = P.id
JOIN users U ON C.user_comments = U.id
WHERE P.text_feature IS NOT NULL AND P.image_feature IS NOT NULL AND P.deleted_at IS NULL;