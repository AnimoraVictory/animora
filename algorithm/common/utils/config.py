# ---------------------------------------------------------------------------------  # 
#                                   設定ファイル                                       #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"
model_path = "stabilityai/japanese-stable-clip-vit-l-16"