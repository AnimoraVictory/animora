-- ----------------------------------
-- User UUID から　User Index を取得するクエリ
-- ----------------------------------

SELECT "index" FROM users WHERE id = %(user_uuid)s