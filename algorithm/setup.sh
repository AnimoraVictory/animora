#!/bin/bash

echo "### パッケージリストの更新 ###"
sudo apt-get update

echo "### pyenv に必要なパッケージのインストール ###"
sudo apt-get install -y make build-essential libssl-dev zlib1g-dev \
    libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
    libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \
    libffi-dev liblzma-dev

echo "### 既存の poetry を削除 ###"
if command -v poetry &>/dev/null; then
    echo "Poetry を削除します..."
    curl -sSL https://install.python-poetry.org | python3 - --uninstall
    rm -rf ~/.poetry
    rm -rf ~/.local/share/pypoetry
fi
echo "### 古い Poetry 仮想環境の削除 ###"
find ~/.cache/pypoetry/virtualenvs/ -type d -name "100-knock*py3.12" -exec rm -rf {} +

echo "### pyenv のインストール ###"
if [ ! -d "$HOME/.pyenv" ]; then
    git clone https://github.com/pyenv/pyenv.git ~/.pyenv
else
    echo "pyenv は既にインストールされています"
fi

export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init --path)"

echo "### Python 3.12.2 をインストール ###"
pyenv install -s 3.12.2  # 既にインストールされていたらスキップ

echo "### Python 3.12.2 のパスを通す ###"
pyenv local 3.12.2
eval "$(pyenv init -)"

echo "### Poetry の指定バージョン (1.8.4) をインストール ###"
curl -sSL https://install.python-poetry.org | python3 - --version 1.8.4

export PATH="$HOME/.local/bin:$PATH"

echo "### 仮想環境をプロジェクト配下に設定 ###"
poetry config virtualenvs.in-project true --local

echo "### poetry の Python を設定 ###"
poetry env use $(pyenv which python)

echo "### poetry のパッケージをインストール ###"
poetry install

echo "### psycopg2 の依存関係をインストール ###"
sudo apt-get update
sudo apt-get install -y python3-psycopg2

# echo "### 仮想環境をアクティベイト ###"
# source .venv/bin/activate

echo "### 環境構築完了 ###"