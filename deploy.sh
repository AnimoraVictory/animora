#!/bin/bash

# .envファイルから環境変数を読み込む
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo ".envファイルが見つかりません"
  exit 1
fi

# create ecr repository
cd cdk
cdk deploy "AnimoraInfra-${NAME}" --profile animalia --require-approval never

# push docker image
cd ..
./deploy-ecr.sh

# deploy lambda functions
cd cdk
cdk deploy "AnimoraStack-${NAME}" --profile animalia --hotswap-fallback --require-approval never