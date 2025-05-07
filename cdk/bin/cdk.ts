#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AnimoraStack } from "../lib/stack";
import { RecommendStack } from "../lib/recommend-stack";
import * as dotenv from "dotenv";
import path = require("path");
import { NetworkStack } from "../lib/network-stack";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const app = new cdk.App();

// ネットワークスタックを作成
const network = new NetworkStack(app, `NetworkStack-${process.env.NAME}`, {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
  },
});

// レコメンドシステムスタックを作成
const recommendStack = new RecommendStack(
  app,
  `AnimoraRecommend-${process.env.NAME}`,
  {
    env: {
      account: process.env.AWS_ACCOUNT_ID,
      region: process.env.AWS_REGION,
    },
    vpc: network.vpc,
  }
);
// メインのアプリケーションスタックを作成
new AnimoraStack(app, `AnimoraStack-${process.env.NAME}`, {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
  },
  vpc: network.vpc,
  valkeyEndpoint: recommendStack.valkeyEndpoint,
  valkeyPort: recommendStack.valkeyPort,
});
