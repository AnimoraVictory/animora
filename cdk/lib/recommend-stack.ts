import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export class RecommendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

      // 1. 既存のVPCを取得
      const vpc = ec2.Vpc.fromLookup(this, "VPC", {
          isDefault: true,
      });

      // 2. Redis クラスターにアクセス可能な Security Group
      const redisSg = ec2.SecurityGroup.fromSecurityGroupId(
          this,
          "RedisSecurityGroup",
          "sg-0b1cc41d5be1854b9"
      );

      // 3. ECRリポジトリの取得
      const genrecommendationRepo = ecr.Repository.fromRepositoryName(
          this,
          "GenRecommendationRepo",
          "heuristic/generate_recommendation"
      );
      
      // 4. Lambda 関数
      const genrecommendationLambda = new lambda.DockerImageFunction(this, "GenRecommendationFunction", {
          code: lambda.DockerImageCode.fromEcr(genrecommendationRepo, {
              tagOrDigest: "latest",
          }),
          memorySize: 512,
          timeout: cdk.Duration.minutes(5),
          environment: {
              VALKEY_HOST: "recommendation-jztf3r.serverless.apse2.cache.amazonaws.com",
              VALKEY_PORT: "6379",
          },
          vpc,
          vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
          allowPublicSubnet: true,
          securityGroups: [redisSg],
      });

      // 5. EventBridge ルールで1時間に1回 Lambda を実行
      const rule = new events.Rule(this, "HourlyRule", {
          schedule: events.Schedule.rate(cdk.Duration.hours(1)),
      });
      
      // Lambda 関数をターゲットとして追加
      rule.addTarget(new targets.LambdaFunction(genrecommendationLambda));

  }
}
