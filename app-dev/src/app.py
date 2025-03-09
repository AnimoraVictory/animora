# ライブラリのインポート
import json
from typing import Optional
from psycopg2.extras import DictCursor
from fastapi import  FastAPI, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv, find_dotenv
from image_search import get_connection, compute_image_embeddings, compute_text_embeddings

_ = load_dotenv(find_dotenv())

# FastAPIインスタンス作成
app = FastAPI(title="Image Search API")

# 最新画像取得API
@app.get("/images/latest")
def get_latest_images(page: int=1, per_page: int=10):
    """
    最新の画像を取得するAPI
    初期画面の表示に利用

    Args:
        page(int): ページ番号
        per_page(int): 1ページあたりの画像数

    Returns:
        JSONResponse: 画像情報のJSONレスポンス
    """
    offset = (page - 1) * per_page
    query = """
        SELECT image_id, file_name
        FROM images
        ORDER BY upload_date DESC
        LIMIT %s OFFSET %s
    """
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(query, (per_page, offset))
            rows = cur.fetchall()
    
    return JSONResponse([{
        "image_id": row["image_id"],
        "file_name": row["file_name"]
    } for row in rows])
    
# 画像検索API
@app.get("/images/{image_id}")
def get_image(image_id: int):
    """
    画像を取得するAPI

    Args:
        image_id(int): 画像ID
    """
    query = """
        SELECT image_data
        FROM images
        WHERE image_id = %s
    """
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(query, (image_id,))
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return JSONResponse(content={"image_id": image_id, "image_data": row["image_data"]})

# 画像検索
class SearchRequest(BaseModel):
    query: str
    search_method: str # "テキスト検索" or "画像検索"
    image: Optional[UploadFile] = None

# 画像検索があるため、検索をPOSTで行う
# GETはクエリパラメータ(GET /images/search?query=猫&method=text)を使ってデータを取得
# POSTはリクエストボディを使ってデータを取得
    # 画像データや長い検索クエリを送る場合はPOSTを使う
@app.post("/search")
async def search_images(request: SearchRequest):
    """
    画像検索を行うAPI

    Args:
        request(SearchRequest): 検索リクエスト

    Returns:
        JSONResponse: 検索結果のJSONレスポンス
    """
    if request.search_method == "テキスト検索":
        query_embedding = json.dumps(compute_text_embeddings(request.query))
    elif request.search_method == "画像検索":
        if not request.image:
            raise HTTPException(status_code=400, detail="Image file is required for image search")
        query_embedding = json.dumps(compute_image_embeddings(request.image))
    else:
        raise HTTPException(status_code=400, detail="Invalid search method")
    
    query_str = """
        SELECT i.image_id, i.file_name,
        cie.embedding <#> %s as vector_distance,
        'vector' as method
        FROM current_image_embeddings cie
        JOIN images i ON cie.image_id = i.image_id
        WHERE (cie.embedding <#> %s) < -0.1 -- ここでフィルタリング
        ORDER BY vector_distance
    """

    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(query_str, (query_embedding, query_embedding))
            rows = cur.fetchall()

    return JSONResponse(
        [{"image_id": row["image_id"], "file_name": row["file_name"], "score": row["vector_distance"], "method": row["method"]} for row in rows]
    )

# APIの起動
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
