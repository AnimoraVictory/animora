import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";
import path = require("path");
import { getRequiredEnvVars } from "../utils/env";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

dotenv.config({ path: path.join(__dirname, "../../.env.stg") });

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const {
      DATABASE_URL,
      JWT_SECRET,
      AWS_COGNITO_CLIENT_ID,
      AWS_COGNITO_POOL_ID,
      // AWS_REGION,
      AWS_COGNITO_CLIENT_SECRET,
      // AWS_ACCESS_KEY_ID,
      // AWS_SECRET_ACCESS_KEY,
      AWS_S3_BUCKET_NAME,
    } = getRequiredEnvVars([
      "DATABASE_URL",
      "JWT_SECRET",
      "AWS_COGNITO_CLIENT_ID",
      "AWS_COGNITO_POOL_ID",
      // "AWS_REGION",
      "AWS_COGNITO_CLIENT_SECRET",
      // "AWS_ACCESS_KEY_ID",
      // "AWS_SECRET_ACCESS_KEY",
      "AWS_S3_BUCKET_NAME",
    ]);

    const apiFn = new lambda.Function(this, "AnimaliaBackend", {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: "bootstrap",
      code: lambda.Code.fromAsset(path.join(__dirname, "../../bin/api")),
      environment: {
        DATABASE_URL,
        JWT_SECRET,
        AWS_COGNITO_CLIENT_ID,
        AWS_COGNITO_POOL_ID,
        // AWS_REGION,
        AWS_COGNITO_CLIENT_SECRET,
        // AWS_ACCESS_KEY_ID,
        // AWS_SECRET_ACCESS_KEY,
        AWS_S3_BUCKET_NAME,
      },
    });

    new apigw.LambdaRestApi(this, "AnimaliaAPI", {
      handler: apiFn,
    });

    const dailyTaskFn = new lambda.Function(this, "DailyTaskCreator", {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: "bootstrap",
      code: lambda.Code.fromAsset(path.join(__dirname, "../../bin/dailytask")),
      environment: {
        DATABASE_URL,
      },
    });

    new events.Rule(this, "DailyTaskRule", {
      schedule: events.Schedule.cron({ minute: "0", hour: "15", day: "*" }),
      targets: [new targets.LambdaFunction(dailyTaskFn)],
    });
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AwsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
