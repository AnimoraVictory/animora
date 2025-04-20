# ---------------------------------------------------------------------------------  #
#                        レコメンドタイムラインを生成するソースコード                     　 #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import torch
import json
from common.utils.database import get_connection
from recommend_system.utils.config import new_user_threshold, existing_user_threshold

# ----------------------------------
# PostgreSQLからユーザーIDに対応するindexを取得する関数
# ----------------------------------
def get_user_id(user_id):
    """
    ユーザーIDに対応するindexを取得する
    """
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT "index" FROM users WHERE id = %s
        """,
        (user_id,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row[0] if row else None


# ----------------------------------
# PostgreSQLから候補投稿を取得する関数
# ----------------------------------
def get_candidate_posts(query, num_item):
    """
    学習の際に存在しなかった新規ユーザー -> 閾値より高い投稿を時系列順に並べて返す
    学習済みのユーザー -> モデルを使ってスコアを計算し、閾値より高い投稿を時系列順に並べて返す
    """
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(query, (num_item, ))
    rows = cur.fetchall()

    # カラム名のリスト
    columns = [desc[0] for desc in cur.description]
    candidates = []
    for row in rows:
        candidate = dict(zip(columns, row))
        candidate["image_feature"] = (
            json.loads(candidate["image_feature"])
            if isinstance(candidate["image_feature"], str)
            else candidate["image_feature"]
        )
        candidate["text_feature"] = (
            json.loads(candidate["text_feature"])
            if isinstance(candidate["text_feature"], str)
            else candidate["text_feature"]
        )
        candidates.append(candidate)
    cur.close()
    conn.close()
    return candidates


# ----------------------------------
# PostgreSQLから候補投稿を取得する関数
# ----------------------------------
def get_uuid_from_post_id(post_id):
    """
    indexからuuidを取得する
    """
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id FROM posts WHERE "index" = %s
        """,
        (post_id,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row[0] if row else None


# ----------------------------------
# uuidからpostのidxに変換するための関数
# ----------------------------------
def get_post_index_from_uuid(uuid):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        'SELECT "index" FROM posts WHERE id = %s',
        (uuid,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row[0] if row else None


# ----------------------------------
# 候補投稿からレコメンドタイムラインを生成する関数
# ----------------------------------
def get_recommended_timeline(user_id, candidates, model, device, is_existing_user):
    """
    学習の際に存在しなかった新規ユーザー -> 閾値より高い投稿を時系列順に並べて表示
    学習済みのユーザー -> モデルを使ってスコアを計算し、閾値より高い投稿を時系列順に並べて表示
    """
    recommended = []
    user_tensor = torch.tensor([user_id], dtype=torch.long).to(device)

    for candidate in candidates:
        item_tensor = torch.tensor([candidate["post_id"]], dtype=torch.long).to(device)
        image_features = torch.tensor(
            [candidate["image_feature"]], dtype=torch.float
        ).to(device)
        text_features = torch.tensor([candidate["text_feature"]], dtype=torch.float).to(
            device
        )

        # 学習済みユーザー
        if is_existing_user:
            with torch.no_grad():
                score = model(user_tensor, item_tensor, image_features, text_features)
            score = score.item()
            score_threshold = existing_user_threshold

        # 新規ユーザー
        else:
            score = candidate.get("score", 0)
            score_threshold = new_user_threshold

        if score > score_threshold:
            candidate["score"] = score
            recommended.append(candidate)

    if is_existing_user:
        # スコア → post_id 降順
        sorted_recommend = sorted(
            recommended, key=lambda x: (x["score"], x["post_id"]), reverse=True
        )
    else:
        # created_at → post_id 降順
        sorted_recommend = sorted(
            recommended, key=lambda x: (x["created_at"], x["post_id"]), reverse=True
        )

    return sorted_recommend
