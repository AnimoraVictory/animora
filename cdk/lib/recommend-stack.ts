import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';

export class RecommendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. VPC 作成 (最大2AZ)
    const vpc = new ec2.Vpc(this, 'AppVPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
    });

    // 2. ElastiCache 用サブネットグループ
    const privateSubnetIds = vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }).subnetIds;
    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      cacheSubnetGroupName: 'redis-subnet-group',
      description: 'Subnet group for ElastiCache Redis',
      subnetIds: privateSubnetIds,
    });

    // 3. セキュリティグループ
    const lambdaSg = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc,
      description: 'Security group for Lambda functions',
      allowAllOutbound: true,
    });

    const redisSg = new ec2.SecurityGroup(this, 'RedisSG', {
      vpc,
      description: 'Security group for ElastiCache Redis',
      allowAllOutbound: false,
    });

    // Lambda から Redis へのアクセス許可
    redisSg.addIngressRule(lambdaSg, ec2.Port.tcp(6379), 'Allow Lambda to connect to Redis');

    // 4. ElastiCache Redis クラスター
    const redisCluster = new elasticache.CfnReplicationGroup(this, 'RedisCluster', {
      replicationGroupDescription: 'Serverless Redis cluster',
      engine: 'redis',
      engineVersion: '6.x',
      cacheNodeType: 'cache.t3.micro',
      numNodeGroups: 1,
      replicasPerNodeGroup: 1,
      automaticFailoverEnabled: true,
      cacheSubnetGroupName: redisSubnetGroup.cacheSubnetGroupName!,
      securityGroupIds: [redisSg.securityGroupId],
      transitEncryptionEnabled: true,
      atRestEncryptionEnabled: true,
    });

    // 5. Lambda 関数
    const fn = new lambda.Function(this, 'AppFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'handler.main',
      code: lambda.Code.fromAsset('lambda'),
      vpc,
      securityGroups: [lambdaSg],
      environment: {
        REDIS_HOST: redisCluster.attrPrimaryEndPointAddress,
        REDIS_PORT: redisCluster.attrPrimaryEndPointPort,
      },
    });
  }
}
