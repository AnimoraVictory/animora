FROM --platform=linux/amd64 ubuntu:24.04

# タイムゾーン設定を回避
ENV DEBIAN_FRONTEND=noninteractive \
  TZ=Asia/Tokyo

# 基本パッケージのインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
  git \
  curl \
  wget \
  build-essential \
  ca-certificates \
  software-properties-common \
  libssl-dev \
  libffi-dev \
  zlib1g-dev \
  libbz2-dev \
  libreadline-dev \
  libsqlite3-dev \
  llvm \
  libncurses5-dev \
  xz-utils \
  tk-dev \
  libxml2-dev \
  libxmlsec1-dev \
  liblzma-dev \
  python3-pip \
  python3-dev \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# 作業ディレクトリの設定
WORKDIR /app

# コマンドの実行
CMD ["bash"] 