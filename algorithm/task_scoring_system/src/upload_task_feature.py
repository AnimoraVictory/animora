# ---------------------------------------------------------------------------------  # 
#                  タスク文の特徴量を計算してデータベースにアップロードする                    #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import json
import traceback
from psycopg2.extras import DictCursor
from common.utils.database import get_connection
from common.utils.preprocess import compute_text_embeddings

def upload_task_features():
    """
    タスク文の埋め込み特徴量を計算し、データベースにアップロードする関数
    """
    conn = get_connection()
    cur = conn.cursor(cursor_factory=DictCursor)

    # 特徴抽出がまだ行われていないタスクを取得
    cur.execute(
        """
        SELECT type, text_feature
        FROM task_types
        WHERE text_feature IS NULL;
        """
    )
    tasks = cur.fetchall()
    print(f"Found {len(tasks)} tasks to process")

    for task in tasks:
        task_type = task["type"]
        print(f"Processing task {task_type}")

        try:
            # タスク文の特徴量を計算
            task_feature = compute_text_embeddings(task_type)  # shape: (1, feature_dim)

            # Tensorをリストへ変換
            task_feature_list = task_feature.squeeze(0).tolist()

            # データベースに特徴量を保存(特徴ベクトルはJSON文字列として保存)
            update_query = """
                UPDATE task_types
                SET text_feature = %s
                WHERE type = %s;
            """
            cur.execute(update_query, 
                        (json.dumps(task_feature_list), task_type)
            )
            conn.commit()
            print(f"Task {task_type} features updated successfully")

        except Exception as e:
            traceback.print_exc()
            print(f"Error processing task {task_type}: {e}")
            conn.rollback()
    cur.close()
    conn.close()

if __name__ == "__main__":
    upload_task_features()


    



