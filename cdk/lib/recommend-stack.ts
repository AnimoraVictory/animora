import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import { getRequiredEnvVars } from './utils';
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../../.env") });

export interface RecommendStackProps extends cdk.StackProps {
  readonly vpc: ec2.IVpc;
}

export class RecommendStack extends cdk.Stack {
  public valkeyEndpoint: string;
  public valkeyPort: string = "6379";

  constructor(scope: Construct, id: string, props: RecommendStackProps) {
      super(scope, id, props);
      
      // 0. 環境変数の取得
      const env = getRequiredEnvVars([
          "NAME",
          "DATABASE_URL",
          "JWT_SECRET",
          "AWS_COGNITO_CLIENT_ID",
          "AWS_COGNITO_POOL_ID",
          "AWS_COGNITO_CLIENT_SECRET",
          "AWS_S3_BUCKET_NAME",
      ])

      // NetworkStackから渡されたVPCを使用
      const vpc = props.vpc;

      // Valkey クラスターにアクセス可能な Security Group
      const valkeySg = new ec2.SecurityGroup(this, "ValkeySecurityGroup", {
        vpc: props.vpc,
        description: "Security group for Valkey access from Lambda",
        allowAllOutbound: true,
      })

      // LambdaからValkeyへのインバウンドルールを追加
      valkeySg.addIngressRule(
        valkeySg, // 自身と同じSGからのアクセスを許可
        ec2.Port.tcp(6379),
        "Allow Valkey access from within the same SG"
    );

      // Valkey クラスターのSubnet Group(VPCのプライベートサブネットを使用)
      const subnetGroup = new elasticache.CfnSubnetGroup(this, `ValkeySubnetGroup-${env.NAME}`, {
          cacheSubnetGroupName: `valkey-subnet-group-${env.NAME}`,
          description: "Subnet group for Valkey",
          subnetIds: vpc.privateSubnets.map(subnet => subnet.subnetId),
      });

      // Valkeyクラスター(ElastiCache)の作成
      const valkeyCluster = new elasticache.CfnReplicationGroup(this, `ReplicationGroup-${env.NAME}`, {
        replicationGroupDescription: "Valkey replication group for recommendation system",
        replicationGroupId: `valkey-${env.NAME}-rg`, 
        engine: "valkey",
        engineVersion: "7.2",
        cacheNodeType: "cache.t3.micro",
        cacheSubnetGroupName: subnetGroup.cacheSubnetGroupName!,
        numNodeGroups: 1,
        replicasPerNodeGroup: 1,
        securityGroupIds: [valkeySg.securityGroupId],
        atRestEncryptionEnabled: true,
        transitEncryptionEnabled: true,
        clusterMode: "disabled",
      })

      // 依存関係の明示
      valkeyCluster.addDependency(subnetGroup);
    
      // Valkeyクラスターの公開エンドポイント
      this.valkeyEndpoint = valkeyCluster.attrPrimaryEndPointAddress;
      
      // Lambda 関数
      const genrecommendationLambda = new lambda.DockerImageFunction(this, "GenRecommendationFunction", {
          code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, "../../algorithm/recommend_system/01_heuristic/generate_recommendation/")),
          memorySize: 512,
          timeout: cdk.Duration.minutes(5),
          environment: {
            ...env,
            VALKEY_HOST: valkeyCluster.attrPrimaryEndPointAddress,
            VALKEY_PORT: "6379",
          },
          vpc,
          vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
          securityGroups: [valkeySg],
      });

      // EventBridge ルールで1時間に1回 Lambda を実行
      const rule = new events.Rule(this, "HourlyRule", {
          schedule: events.Schedule.rate(cdk.Duration.hours(1)),
      });
      
      // Lambda 関数をターゲットとして追加
      rule.addTarget(new targets.LambdaFunction(genrecommendationLambda));

  }
}
