#!/bin/bash

# .envファイルから環境変数を読み込む
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo ".envファイルが見つかりません"
  exit 1
fi

# destroy lambda functions
cd cdk
cdk destroy "AnimoraStack-${NAME}" --profile animalia