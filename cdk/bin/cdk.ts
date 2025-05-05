#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AnimoraStack } from "../lib/stack";
import { InfraStack } from "../lib/ecr-stack";
import { RecommendStack } from "../lib/recommend-stack";
import * as dotenv from "dotenv";
import path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const app = new cdk.App();

// ECRリポジトリスタックを作成
const ecrStack = new InfraStack(app, `AnimoraInfra-${process.env.NAME}`, {
  env: { region: process.env.AWS_REGION },
});

// メインのアプリケーションスタックを作成
new AnimoraStack(app, `AnimoraStack-${process.env.NAME}`, {
  env: { region: process.env.AWS_REGION },
  ecrRepositoryName: ecrStack.algorithmRepo.repositoryName,
});

// レコメンドシステムスタックを作成
new RecommendStack(app, `AnimoraRecommend-${process.env.NAME}`, {
  env: { region: process.env.AWS_REGION },
});