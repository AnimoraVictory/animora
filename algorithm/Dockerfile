FROM python:3.12-slim

# --- 環境変数 ---
ENV POETRY_VERSION=1.8.4 \
    POETRY_VIRTUALENVS_CREATE=false \
    PYTHONUNBUFFERED=1 \
    PATH="/root/.local/bin:$PATH"

# --- システム依存のパッケージ ---
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential libssl-dev libpq-dev python3-dev \
    libffi-dev libbz2-dev liblzma-dev libreadline-dev libsqlite3-dev \
    xz-utils tk-dev zlib1g-dev wget git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# --- Poetryのインストール ---
RUN curl -sSL https://install.python-poetry.org | python3 - --version $POETRY_VERSION

# --- 作業ディレクトリ作成 --- 
WORKDIR /app

# --- Poetryファイルを先にコピーしてインストール ---
COPY pyproject.toml poetry.lock* /app/
RUN poetry install --no-root

# --- アプリケーション本体をコピー ---
COPY . /app

# --- ポート開放 ---
EXPOSE 8000

# --- FastAPI アプリ起動 ---
CMD ["sh", "-c", "uvicorn $TARGET_APP --host 0.0.0.0 --port 8000"]
