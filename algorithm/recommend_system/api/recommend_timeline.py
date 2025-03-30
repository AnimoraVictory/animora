# ---------------------------------------------------------------------------------  # 
#                        レコメンドタイムラインを生成するソースコード                     　 #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import torch
import json
from recommend_system.utils.database import get_connection

# ----------------------------------
# PostgreSQLから候補投稿を取得する関数
# ----------------------------------
def get_candidate_posts():
    conn = get_connection()
    cur = conn.cursor()

    # 特徴量が抽出済みの投稿を対象とする
    query = """
            SELECT 
                id AS post_id,
                created_at AS timestamp,
                image_feature AS image_feature, -- JSON文字列
                text_feature AS text_feature -- JSON文字列
            FROM posts
            WHERE image_feature IS NOT NULL AND text_feature IS NOT NULL;
            """
    cur.execute(query)
    rows = cur.fetchall()

    # カラム名のリスト
    columns = [desc[0] for desc in cur.description]
    candidates = []
    for row in rows:
        candidate = dict(zip(columns, row))
        candidate["image_feature"] = json.loads(candidate["image_feature"]) if isinstance(candidate["image_feature"], str) else candidate["image_feature"]
        candidate["text_feature"] = json.loads(candidate["text_feature"]) if isinstance(candidate["text_feature"], str) else candidate["text_feature"]
        candidates.append(candidate)
    cur.close()
    conn.close()
    return candidates

# ----------------------------------
# 候補投稿からレコメンドタイムラインを生成する関数
# ----------------------------------
def get_recommended_timeline(user_id, candidates, model, device, score_threshold=0.5):
    recommended = []
    user_tensor = torch.tensor([user_id], dtype=torch.long).to(device)

    for candidate in candidates:
        item_tensor = torch.tensor([candidate["post_id"]], dtype=torch.long).to(device)
        image_features = torch.tensor([candidate["image_feature"]], dtype=torch.float).unsqueeze(0).to(device)
        text_features = torch.tensor([candidate["text_feature"]], dtype=torch.float).unsqueeze(0).to(device)

        with torch.no_grad():
            score = model(user_tensor, item_tensor, image_features, text_features)
        score = score.item()

        if score > score_threshold:
            candidate["score"] = score
            recommended.append(candidate)
    
    # タイムスタンプで降順ソート
    sorted_recommend = sorted(recommended, key=lambda x: x["score"], reverse=True)
    return sorted_recommend


