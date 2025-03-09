# ライブラリのインポート
import os
import io
from PIL import Image
import torch
import psycopg2
import streamlit as st
from image_search import search_images, get_multiple_image_data, load_initial_images
import asyncio
import nest_asyncio

# asyncioの不整合を回避するための設定
os.environ["STREAMLIT_WATCH_FILEWATCHER_TYPE"] = "none"

try:
    asyncio.get_running_loop()
except RuntimeError:
    nest_asyncio.apply()

# PyTorchの不具合を治すための設定
torch.classes.__path__ = [os.path.join(torch.__path__[0], torch.classes.__file__)] 

# 1ページあたりの画像数
IMAGES_PER_PAGE = 16

# PostgreSQLデータベースへの接続
def get_connection():
    return psycopg2.connect(
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT')
    )

# streamlitのセッションステートの初期化
if "current_page" not in st.session_state:
    st.session_state["current_page"] = 1
if "total_pages" not in st.session_state:
    st.session_state["total_pages"] = 1
if "search_executed" not in st.session_state:
    st.session_state["search_executed"] = False # 検索実行フラグ
if "images" not in st.session_state:
    st.session_state["images"] = []
if "image_info" not in st.session_state:
    st.session_state["image_info"] = []
if "searched_image_count" not in st.session_state:
    st.session_state["searched_image_count"] = 0

def get_total_image_count():
    """
    画像の総数を取得する関数
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM images")
            count = cur.fetchone()[0]
    return count

def get_total_pages():
    """
    総ページ数を取得する関数
    """
    total_images = get_total_image_count()
    return (total_images + IMAGES_PER_PAGE - 1) // IMAGES_PER_PAGE

def update_index(direction):
    """
    ページネーションのインデックスを更新
    """
    if direction == "next":
        if st.session_state["current_page"] < st.session_state["total_pages"]:
            st.session_state["current_page"] += 1
    elif direction == "previous":
        if st.session_state["current_page"] > 1:
            st.session_state["current_page"] -= 1

# 検索実行
def image_search(search_button, text_query, image_query, search_method):
    """
    画像検索を行う関数
    
    Args:
        search_button(bool): 検索ボタンが押されたかどうか
        text_query(str): テキスト検索のクエリ
        image_query(file): 画像検索のクエリ
        search_method(str): 検索方法
        page(int): ページ番号
    """
    if search_button:
        st.session_state["search_executed"] = True # 検索実行フラグを立てる

        if text_query or image_query:
            results = search_images(text_query if text_query else image_query, search_method)
            print("検索結果")
            print(results)

            if not results:
                st.warning("検索結果が見つかりませんでした")
            else:
                # 画像データ取得
                image_ids = [result["image_id"] for result in results]
                image_data_dict = get_multiple_image_data(image_ids)
                
                # 検索結果画像枚数の初期化
                image_count = 0

                # 結果を分類
                vector_results = []
                text_results = []
                image_info = []

                for result in results:
                    image_id = result["image_id"]
                    file_name = result["file_name"]
                    score = result["score"]
                    method = result["method"]
                    image_data = image_data_dict.get(image_id)

                    if image_data:
                        img = Image.open(io.BytesIO(image_data))
                            # Pillowは遅延読み込みを行う
                                # 画像全体をすぐにメモリにロードせず、必要になったときにデータを読み込む
                        img.load()
                            # img.load()を呼び出すことで、画像全体をメモリに読み込む
                    else:
                        continue
                    info = {
                        "image_id": image_id,
                        "file_name": file_name,
                        "vector_distance": score if score is not None else "N/A",
                        "method": method
                    }

                    caption = f"{method} - スコア: {round(float(score), 3) if isinstance(score, (int, float)) else score}"
                    if method == "vector":
                        vector_results.append((img, caption))
                    else:
                        text_results.append((img, caption))

                    image_info.append(info)
                    image_count += 1
                        # 検索結果画像枚数をカウント
            
            # セッションに画像情報を保存
            print(vector_results + text_results)
            st.session_state["images"] = vector_results + text_results
            st.session_state["image_info"] = image_info
            st.session_state["searched_image_count"] = image_count

# 検索結果において総ページ数を取得する関数
def get_total_pages_searched():
    """
    検索結果において総ページ数を取得する関数
    """
    return (st.session_state["searched_image_count"] + IMAGES_PER_PAGE - 1) // IMAGES_PER_PAGE

# ページ変更ボタン
def pagination():
    """
    ページネーションボタンの表示
    """
    if st.session_state["total_pages"] == 1:
        st.markdown(
            f"""
            <div style='text-align: center;'>
                {st.session_state["current_page"]} / {st.session_state["total_pages"]}
            </div>
            """,
            unsafe_allow_html=True
        )
    elif st.session_state["current_page"] == st.session_state["total_pages"]:
        col1, col2, col3 = st.columns([1, 6, 1])
        col1.button("← 前へ", on_click=update_index, args=("previous",))
        col2.markdown(
        f"""
        <div style='text-align: center;'>
            {st.session_state["current_page"]} / {st.session_state["total_pages"]}
        </div>
        """,
        unsafe_allow_html=True
    )
    elif st.session_state["current_page"] == 1:
        col1, col2, col3 = st.columns([1, 6, 1])
        col3.button("次へ →", on_click=update_index, args=("next",))
        col2.markdown(
            f"""
            <div style='text-align: center;'>
                {st.session_state["current_page"]} / {st.session_state["total_pages"]}
            </div>
            """,
            unsafe_allow_html=True
        )
    else:
        col1, col2, col3 = st.columns([1, 6, 1])
        col1.button("← 前へ", on_click=update_index, args=("previous",))
        col3.button("次へ →", on_click=update_index, args=("next",))
        col2.markdown(
            f"""
            <div style='text-align: center;'>
                {st.session_state["current_page"]} / {st.session_state["total_pages"]}
            </div>
            """,
            unsafe_allow_html=True
        )

# 初期表示
def initial_display():
    """
    アプリ起動時の初期表示
    """
    images, image_info = load_initial_images(page=st.session_state["current_page"])
    cols = st.columns(4)
    for idx, img in enumerate(images):
        with cols[idx % 4]:
            st.image(img, use_container_width=True)

# 画像表示
def display_images(page=1):
    st.write("## 検索結果")
    limit = IMAGES_PER_PAGE
    offset = (page - 1) * IMAGES_PER_PAGE
    cols = st.columns(4)
    for idx, img in enumerate(st.session_state["images"][offset:offset + limit]):
        with cols[idx % 4]:
            st.image(img[0], caption=img[1], use_container_width=True)

# 検索条件
st.title("マルチモーダル画像検索")
search_method = st.radio("検索方法", ["テキスト検索", "画像検索"])
if search_method == "テキスト検索":
    text_query = st.text_input("検索テキストを入力してください")
    image_query = False
    blank1, col1, blank2, col2, blank3 = st.columns([1, 1, 1, 1, 1])
    with col1:
        clear_button = st.button("クリア", use_container_width=True)
    with col2:
        search_button = st.button("検索", use_container_width=True)
elif search_method == "画像検索":
    image_query = st.file_uploader("検索画像をアップロードしてください", type=["png", "jpg", "jpeg"])
    text_query = False
    blank1, col1, blank2, col2, blank3 = st.columns([1, 1, 1, 1, 1])
    with col1:
        clear_button = st.button("クリア", use_container_width=True)
    with col2:
        search_button = st.button("検索", use_container_width=True)

# 検索クリアボタンの処理
if clear_button:
    st.session_state["search_executed"] = False # 検索結果をリセット
    st.session_state["current_page"] = 1 # ページをリセット
    st.session_state["total_pages"] = get_total_pages() # 総ページ数をリセット

# 検索結果または初期表示
if search_button: # 検索ボタンが押された場合
    st.session_state["current_page"] = 1 # まずは1ページ目から表示されるようにする
    image_search(True, text_query, image_query, search_method)
    display_images(page=st.session_state["current_page"])
    st.session_state["total_pages"] = get_total_pages_searched()
    pagination()
elif st.session_state["search_executed"]: # 検索実行フラグが立っている場合(検索結果を表示しつつ、画面遷移する場合を想定)
    image_search(True, text_query, image_query, search_method)
    display_images(page=st.session_state["current_page"])
    st.session_state["total_pages"] = get_total_pages_searched()
    pagination()
else: # 初期表示
    initial_display()
    st.session_state["total_pages"] = get_total_pages()
    pagination()

