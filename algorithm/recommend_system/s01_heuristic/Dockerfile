ARG FUNCTION_DIR="/function"

FROM public.ecr.aws/lambda/python:3.12
ARG FUNCTION_DIR

# --- ビルド環境のセットアップ ---
WORKDIR ${FUNCTION_DIR}

# 依存関係をインストール - ビルド時のみ必要なもの
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
COPY . .

RUN pip install --no-cache-dir awslambdaric

# ポート設定
EXPOSE 8000

ENTRYPOINT [ "python", "-m", "awslambdaric" ]

# Lambda エントリポイント
CMD ["main.lambda_handler"]
