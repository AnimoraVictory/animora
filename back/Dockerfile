# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /usr/src/app

# 依存関係をコピー
COPY package*.json ./
RUN npm install --include=dev

COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src

# デフォルトコマンド
CMD ["npm", "run", "dev"]
