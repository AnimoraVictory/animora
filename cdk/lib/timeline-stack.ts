import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { getRequiredEnvVars } from './utils';
import * as dotenv from "dotenv";
import { time } from 'console';

dotenv.config({ path: path.join(__dirname, "../../.env") });

export interface TimelineStackProps extends cdk.StackProps {
    readonly vpc: ec2.IVpc;
    readonly valkeyEndpoint: string;
    readonly valkeyPort: string;
}
  
export class TimelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: TimelineStackProps) {
        super(scope, id, props);

        const { vpc, valkeyEndpoint, valkeyPort } = props;
        
        // 環境変数の取得
        const env = getRequiredEnvVars([
            "NAME",
            "DATABASE_URL",
            "JWT_SECRET",
            "AWS_COGNITO_CLIENT_ID",
            "AWS_COGNITO_POOL_ID",
            "AWS_COGNITO_CLIENT_SECRET",
            "AWS_S3_BUCKET_NAME",
        ])
        
        const lambdaEnv = {
            ...env,
            VALKEY_HOST: valkeyEndpoint,
            VALKEY_PORT: valkeyPort,
        };

        // セキュリティグループ(Valkeyへアクセス許可)
        const sg = new ec2.SecurityGroup(this, "TimelineLambdaSG", {
            vpc,
            description: "Security group for Timeline Lambda",
            allowAllOutbound: true,
        });
        sg.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(6379));

        // Lambda関数の作成
        const timelineLambda = new lambda.DockerImageFunction(this, "TimelineLambda", {
            code: lambda.DockerImageCode.fromImageAsset(
                path.join(__dirname, "../../algorithm/recommend_system/01_heuristic/timeline/")
            ),
            timeout: cdk.Duration.seconds(30),
            memorySize: 512,
            vpc,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
            securityGroups: [sg],
            environment: lambdaEnv,
        });

        // API Gateway REST API を作成
        const restApi = new apigateway.RestApi(this, "TimelineApi", {
            description: "REST API for /timeline",
        });

        // Lambda統合
        const integration = new apigateway.LambdaIntegration(timelineLambda);

        // /timeline POSTエンドポイントを Lambda に接続
        const timelineResource = restApi.root.addResource("timeline");
        timelineResource.addMethod("POST", integration);
    
        // / ルートも追加（ヘルスチェック用）
        restApi.root.addMethod("GET", integration);
    
        new cdk.CfnOutput(this, "TimelineApiEndpoint", {
            value: restApi.url!,
        });
    }
}