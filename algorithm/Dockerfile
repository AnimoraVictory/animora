ARG FUNCTION_DIR="/function"

FROM --platform=linux/amd64 python:3.12-slim AS builder
ARG FUNCTION_DIR

# --- ビルド環境のセットアップ ---
WORKDIR ${FUNCTION_DIR}

# パッケージをインストールするために必要な依存関係
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# 依存関係をインストール - ビルド時のみ必要なもの
COPY requirements.txt .

# Torch関連のパッケージを最小限にするためのインストール
# CPU版のPyTorchをインストール（CUDA機能は必要なさそうだが、コードが使用している場合に備えて互換性のためにインストール）
RUN pip install --no-cache-dir \
    torch==2.7.0 --index-url https://download.pytorch.org/whl/cpu \
    # その他の依存関係は通常通りインストール
    && grep -v "torch==" requirements.txt | grep -v "nvidia-" | pip install --no-cache-dir -r /dev/stdin

# --- 実行用の軽量イメージ ---
FROM --platform=linux/amd64 python:3.12-slim
ARG FUNCTION_DIR

# 作業ディレクトリを設定
WORKDIR ${FUNCTION_DIR}

COPY --from=builder /usr/local/lib/python3.12/site-packages/ /usr/local/lib/python3.12/site-packages/
COPY . .

RUN pip install \
    --target ${FUNCTION_DIR} \
    awslambdaric

# ポート設定
EXPOSE 8000

ENTRYPOINT [ "python", "-m", "awslambdaric" ]

CMD ["recommend_system.main.handler"]