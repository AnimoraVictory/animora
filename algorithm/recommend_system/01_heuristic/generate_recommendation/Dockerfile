FROM public.ecr.aws/lambda/python:3.12

# Lambdaで見るディレクトリ（全コードをここに入れる）
WORKDIR /app
COPY . .

# 必要なライブラリをインストール
RUN pip install --target /app/python -r requirements.txt

# Lambda runtime config
ENV PYTHONPATH="/app/python"

# Lambda用エントリポイント
CMD ["main.lambda_handler"]
