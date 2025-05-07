import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";
import path = require("path");
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { getRequiredEnvVars } from "./utils";
import * as dotenv from "dotenv";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecrAssets from "aws-cdk-lib/aws-ecr-assets";

dotenv.config({ path: path.join(__dirname, "../../.env") });

export interface AnimoraStackProps extends cdk.StackProps {
  readonly vpc: ec2.IVpc;
  readonly valkeyEndpoint: string;
  readonly valkeyPort: string;
}

export class AnimoraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AnimoraStackProps) {
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

    const lambdaEnv = {
      ...env,
      VALKEY_HOST: props.valkeyEndpoint,
      VALKEY_PORT: props.valkeyPort,
    };

    // TimelineLambdaSG を作成
    const timelineSg = new ec2.SecurityGroup(this, "TimelineLambdaSG", {
      vpc: props.vpc,
      description: "Security group for Timeline Lambda",
      allowAllOutbound: true, // Lambda→外への送信は許可
    });
    timelineSg.addEgressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(Number(props.valkeyPort)),
      "Allow outbound to Valkey"
    );

    // Valkey の SG をインポート
    const valkeySgId = cdk.Fn.importValue(
      `AnimoraRecommend-${env.NAME}:ValkeySG`
    );
    const valkeySg = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "ImportedValkeySG",
      valkeySgId
    );

    // ValkeySG に対して、TimelineLambdaSG からの TCP/6379 Ingress を許可
    valkeySg.addIngressRule(
      timelineSg,
      ec2.Port.tcp(Number(props.valkeyPort)),
      "Allow Timeline Lambda to connect to Valkey"
    );

    // Lambda関数の作成
    const timelineLambda = new lambda.DockerImageFunction(
      this,
      "TimelineLambda",
      {
        code: lambda.DockerImageCode.fromImageAsset(
          path.join(
            __dirname,
            "../../algorithm/recommend_system/01_heuristic/timeline/"
          ),
          { platform: ecrAssets.Platform.LINUX_AMD64 }
        ),
        timeout: cdk.Duration.seconds(30),
        memorySize: 512,
        vpc: props.vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        securityGroups: [timelineSg],
        environment: lambdaEnv,
      }
    );

    // API Gateway REST API を作成
    const restApi = new apigw.RestApi(this, "TimelineApi", {
      description: "REST API for /timeline",
    });

    // Lambda統合
    const integration = new apigw.LambdaIntegration(timelineLambda);

    // /timeline POSTエンドポイントを Lambda に接続
    const timelineResource = restApi.root.addResource("timeline");
    timelineResource.addMethod("POST", integration);

    // / ルートも追加（ヘルスチェック用）
    restApi.root.addMethod("GET", integration);

    new cdk.CfnOutput(this, "TimelineApiEndpoint", {
      value: restApi.url!,
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
        ALGORITHM_API_URL: restApi.url,
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
