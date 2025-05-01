import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";
import path = require("path");
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { getRequiredEnvVars } from "./utils";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../../.env") });

export interface AnimoraStackProps extends cdk.StackProps {
  ecrRepositoryName?: string;
}

export class AnimoraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: AnimoraStackProps) {
    super(scope, id, props);

    const env = getRequiredEnvVars([
      "NAME",
      "DATABASE_URL",
      "JWT_SECRET",
      "AWS_COGNITO_CLIENT_ID",
      "AWS_COGNITO_POOL_ID",
      "AWS_COGNITO_CLIENT_SECRET",
      "AWS_S3_BUCKET_NAME",
    ]);

    // ECRリポジトリを参照（別のスタックから）
    let algorithmRepo: ecr.IRepository;
    if (props?.ecrRepositoryName) {
      // 明示的に指定された場合はその名前で参照
      algorithmRepo = ecr.Repository.fromRepositoryName(
        this,
        "ImportedAlgorithmRepo",
        props.ecrRepositoryName
      );
    } else {
      // スタックのエクスポート値から参照
      const repoName = cdk.Fn.importValue(`AlgorithmRepoName-${env.NAME}`);
      algorithmRepo = ecr.Repository.fromRepositoryName(
        this,
        "ImportedAlgorithmRepo",
        repoName.toString()
      );
    }

    const algorithmFnRole = new Role(this, "AlgorithmFunctionRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    algorithmFnRole.addToPolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
        resources: [
          `arn:aws:s3:::${env.AWS_S3_BUCKET_NAME}`,
          `arn:aws:s3:::${env.AWS_S3_BUCKET_NAME}/*`,
        ],
      })
    );

    const algorithmLambda = new lambda.DockerImageFunction(
      this,
      "AlgorithmFunction",
      {
        code: lambda.DockerImageCode.fromEcr(algorithmRepo, {
          tagOrDigest: "latest",
        }),
        role: algorithmFnRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 512,
        environment: {
          ...env,
          TARGET_APP: "recommend_system.main:app",
        },
      }
    );

    const algorithmApi = new apigw.LambdaRestApi(this, "AlgorithmAPI", {
      handler: algorithmLambda,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
      },
    });

    const apiFnRole = new Role(this, "ApiFunctionRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    const sesPolicy = new cdk.aws_iam.PolicyStatement({
      actions: ["ses:SendEmail"],
      resources: ["*"],
    });

    apiFnRole.addToPolicy(sesPolicy);

    apiFnRole.addToPolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
        ],
        resources: [
          `arn:aws:s3:::${env.AWS_S3_BUCKET_NAME}`,
          `arn:aws:s3:::${env.AWS_S3_BUCKET_NAME}/*`,
        ],
      })
    );

    const apiFn = new lambda.Function(this, "AnimaliaBackend", {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: "bootstrap",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../backend-go/bin/api")
      ),
      environment: {
        ...env,
        ALGORITHM_API_URL: algorithmApi.url,
      },
      role: apiFnRole,
    });

    const api = new apigw.LambdaRestApi(this, "AnimaliaAPI", {
      handler: apiFn,
      binaryMediaTypes: ["multipart/form-data", "image/*"],
      defaultMethodOptions: {
        apiKeyRequired: false,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token",
          "Access-Control-Allow-Origin",
          "Access-Control-Allow-Headers",
        ],
      },
    });

    // API Gatewayのステージ設定を調整
    const stage = api.deploymentStage.node.defaultChild as apigw.CfnStage;
    stage.addPropertyOverride("TracingEnabled", true);

    const dailyTaskFn = new lambda.Function(this, "DailyTaskCreator", {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: "bootstrap",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../backend-go/bin/dailytask")
      ),
      environment: {
        ...env,
      },
      // IAMロールを明示的に設定
      role: new Role(this, "DailyTaskCreatorRole", {
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        description: "Role for DailyTaskCreator Lambda function",
        managedPolicies: [
          // CloudWatchLogsへのアクセス権限
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }),
    });

    const dailyTaskPushNotificationFn = new lambda.Function(
      this,
      "DailyTaskPushNotification",
      {
        runtime: lambda.Runtime.PROVIDED_AL2023,
        handler: "bootstrap",
        timeout: cdk.Duration.seconds(10),
        environment: {},
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            "../../backend-go/bin/dailytask-push-notification"
          )
        ),
        role: new Role(this, "DailyTaskPushNotificationRole", {
          assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
          description: "Role for DailyTaskPushNotification Lambda function",
          managedPolicies: [
            ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaBasicExecutionRole"
            ),
          ],
        }),
      }
    );

    // 毎日同じ時間に通知を送るための EventBridge ルール
    new events.Rule(this, "DailyTaskPushNotificationRule", {
      schedule: events.Schedule.cron({ minute: "0", hour: "3", day: "*" }),
      targets: [new targets.LambdaFunction(dailyTaskPushNotificationFn)],
    });

    new events.Rule(this, "DailyTaskRule", {
      schedule: events.Schedule.cron({ minute: "0", hour: "15", day: "*" }),
      targets: [new targets.LambdaFunction(dailyTaskFn)],
    });
  }
}
