# ---------------------------------------------------------------------------------  # 
#        投稿の画像とテキストをそれぞれマルチモーダル埋め込みベクトルに変換するための前処理         #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
from typing import List, Union
import ftfy, html, re
import torch
from transformers import AutoModel, AutoTokenizer, AutoImageProcessor, BatchFeature
from dotenv import load_dotenv, find_dotenv
from common.utils.config import device, model_path

_ = load_dotenv(find_dotenv())

#  Japanese Stable CLIPモデルのロード
model = AutoModel.from_pretrained(model_path, trust_remote_code=True).eval().to(device)
tokenizer = AutoTokenizer.from_pretrained(model_path, use_fast=False)
processor = AutoImageProcessor.from_pretrained(model_path, use_fast=False)

# テキストをクリーンアップする関数
def basic_clean(text):
    text = ftfy.fix_text(text)
        # ftfy(Fix Text For You): テキストの文字化けや間違ったエンコーディングを修正するライブラリ
    text = html.unescape(html.unescape(text))
        # html.unescape: HTMLエンティティ(ex: &amp;, &lt;, &gt;, &#39; など)を変換する
        # 二重エンコードの場合に対応するため、2回実行している
    return text.strip()
        # strip: 文字列の先頭と末尾の空白文字を削除する

# テキスト内の余分な空白文字を削除する関数
def whitespace_clean(text):
    text = re.sub(r"\s+", " ", text)
        # re.sub: 正規表現にマッチする部分を置換する
        # r"\s+": 1つ以上の空白文字にマッチする正規表現
        # " ": 置換後の文字列(1つの空白文字に置換)
    text = text.strip()
    return text

# テキストをトークン化する関数
def tokenize(texts: Union[str, List[str]], max_seq_len: int=77):
    """
    テキストをトークン化する関数
    
    Args:
        texts(Union[str, List[str]]): トークン化するテキスト
        max_seq_len(int): 最大シーケンス長

    Returns:
        BatchFeature: トークン化されたテキスト
    """
    # 入力をリスト形式で統一
    if isinstance(texts, str):
        texts = [texts]
    texts = [whitespace_clean(basic_clean(text)) for text in texts]

    # テキストをトークン化
    inputs = tokenizer(
        texts,
        max_length=max_seq_len-1, # 最大長(BOSトークを追加するため1つ短く)
        padding="max_length", # すべてのシーケンスを同じ長さにパディング
        truncation=True, # 長すぎるテキストはmax_seq_len-1に切り捨て
        add_special_tokens=False # BOSなどの特殊トークンをこの段階では追加しない
    )
        # tokenizerの出力 
            # inputs["input_ids"]  # 例: [[23, 45, 678, 90, 4, 5, ...]]
                # 各単語を対応するトークンIDに変換したもの
            # inputs["attention_mask"]  # 例: [[1, 1, 1, 1, 1, 0, 0, ...]]
                # 1(注意を払う), 0(無視:パディング)のマスク
        # トークンIDは, モデルのボキャブラリー内の単語に対応する(訓練済み)

    inputs_ids = [[tokenizer.bos_token_id] + ids for ids in inputs["input_ids"]]
        # BOS(Begging of Sentence)トークンを追加
            # BOSトークン: モデルが文の開始を示すために使用する特殊トークン
    attention_mask = [[1] + am for am in inputs["attention_mask"]]
        # [1]: BOSトークンに対応するマスクを追加
        #  パディング部分(0)と実際のトークン(1)を区別するためのマスク
    position_ids = [list(range(0, len(inputs_ids[0])))] * len(texts)

    return BatchFeature(
        {
            "input_ids": torch.tensor(inputs_ids, dtype=torch.long),
            "attention_mask": torch.tensor(attention_mask, dtype=torch.long),
            "position_ids": torch.tensor(position_ids, dtype=torch.long)
        }
    )
        # BatchFeature: Hugging FaceのTokenizerがバッチデータを扱うためのクラス
        
# テキストの埋め込みベクトルを計算する関数
def compute_text_embeddings(text):
    """
    テキストの埋め込みベクトルを計算する関数

    Args:
        text(str): 埋め込みを計算するテキスト

    Returns:
        torch.Tensor: 正規化されたテキストの埋め込みベクトル
    """
    # 入力textが単一の文字列の場合、単一要素のリストに変換し、複数の文字列を要素に持つリストの場合はそのまま、後続のステップへ渡す
    # -> 複数のテキストを一度に処理できるようになる(今回の作例では不要だが、事前に複数のテキストベクトルを生成しておく必要のある分類タスクなどで有用)
    if isinstance(text, str):
        text = [text]
        
    # テキストをモデルが理解できる形式(トークン)に変換
    text = tokenize(texts=text)
    
    # トークン化されたテキストからテキスト特徴量(ベクトル)を抽出
    text_features = model.get_text_features(**text.to(device))
    
    # 抽出された特徴量ベクトルをL2ノルムで正規化
    text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)
    
    # 不要になったテキストデータの削除
    del text
    return text_features.cpu().detach()

# 画像の埋め込みベクトルを計算する関数
def compute_image_embeddings(image):
    """
    画像の埋め込みベクトルを計算する関数

    Args:
        image(PIL.Image.Image): 埋め込みを計算する画像

    Returns:
        torch.Tensor: 正規化された画像の埋め込みベクトル
    """
		# 入力画像をモデルが受け入れ可能な形式に前処理する
    image = processor(images=image, return_tensors="pt").to(device)
	    # return_tensors="pt": PyTorchのテンソルを返すようにしている
	    
    # 学習時にだけ必要な勾配計算を無効にし、メモリ使用量を減らし、計算を高速化
    with torch.no_grad():
        image_features = model.get_image_features(**image) # 画像の特徴ベクトルを抽出
        
    # 画像の特徴ベクトルをL2正規化する(これにより、ベクトルの長さが1になる)
    image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
	    # 2つのベクトルの比較をする際に、コサイン類似度の計算を容易にする(計算が内積だけになる)
	    # 異なる画像間の比較を公平にする
    return image_features.cpu().detach()