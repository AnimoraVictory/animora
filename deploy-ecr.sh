#!/bin/bash
set -e

# 環境変数を.envから読み込む
source .env

# 必要な環境変数をチェック
if [ -z "$NAME" ]; then
  echo "ERROR: NAME環境変数が設定されていません"
  exit 1
fi

if [ -z "$AWS_REGION" ]; then
  echo "ERROR: AWS_REGION環境変数が設定されていません"
  exit 1
fi

# AWS CLIでアカウントIDを取得
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --profile animalia)

if [ $? -ne 0 ]; then
  echo "ERROR: AWSアカウントIDの取得に失敗しました。AWS認証情報を確認してください。"
  exit 1
fi

echo "AWSアカウントID: $AWS_ACCOUNT_ID"
echo "AWSリージョン: $AWS_REGION"
echo "イメージ名: animalia-algorithm-$NAME"

# ECRリポジトリのURI
ECR_REPO_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/animalia-algorithm-$NAME

# ECRにログイン
echo "ECRにログインしています..."
aws ecr get-login-password --region $AWS_REGION --profile animalia | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# algorithmディレクトリに移動
cd algorithm

# Dockerイメージをビルド
echo "Dockerイメージをビルドしています..."
docker build -t animalia-algorithm-$NAME .

# ECRリポジトリURLにタグ付け
echo "イメージにタグを付けています..."
docker tag animalia-algorithm-$NAME:latest $ECR_REPO_URI:latest

# ECRにプッシュ
echo "ECRにイメージをプッシュしています..."
docker push $ECR_REPO_URI:latest

echo "完了! イメージが正常にプッシュされました: $ECR_REPO_URI:latest" 