import * as cdk from "aws-cdk-lib";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

export interface NetworkStackProps extends cdk.StackProps { }

export class NetworkStack extends cdk.Stack {
    public readonly vpc: ec2.IVpc;
    public readonly natInstance: ec2.Instance;

    constructor(scope: Construct, id: string, props?: NetworkStackProps) {
        super(scope, id, props);

        // VPC作成
        this.vpc = new ec2.Vpc(this, 'CustomVpc', {
            ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
            maxAzs: 1,
            natGateways: 0, // 絶対に NAT Gateway は作らない
            subnetConfiguration: [
              {
                name: 'Public',
                subnetType: ec2.SubnetType.PUBLIC,
                cidrMask: 24,
              },
              {
                name: 'Private',
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                cidrMask: 24,
              },
            ],
          });

        // NAT用セキュリティグループ
        const natSg = new ec2.SecurityGroup(this, "NatSg", {
            vpc: this.vpc,
            description: "NAT Security Group",
            allowAllOutbound: true,
        });
        // 全世界(IPv4)からのTCP 22番ポート(SSH)のアクセスを許可
        natSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), "SSH");
        // Privateサブネット -> NATインスタンスの戻り通信を許可
        natSg.addIngressRule(ec2.Peer.ipv4("10.0.0.0/16"), ec2.Port.allTraffic(), "Return from private subnets")

        // NAT専用AMI
        const natAmi = ec2.MachineImage.lookup({
            name: "amzn-ami-vpc-nat-*",
            owners: ["amazon"],
        });
          
        // NATインスタンス作成(最初のPublic Subnetに配置)
        const keyPair = new ec2.KeyPair(this, "KeyPair", {
            type: ec2.KeyPairType.RSA,
            format: ec2.KeyPairFormat.PEM,
        });
        const publicSubnet = this.vpc.publicSubnets[0];
        this.natInstance = new ec2.Instance(this, "NatInstance", {
            vpc: this.vpc,
            vpcSubnets: { subnets: [publicSubnet] },
            instanceType: new ec2.InstanceType("t3.micro"),
            machineImage: natAmi,
            securityGroup: natSg,
            keyPair: keyPair,
        })

        // Source / Destination checkを無効化(NATとして必須)
        const cfnNat = this.natInstance.node.defaultChild as ec2.CfnInstance;
        cfnNat.addPropertyOverride("SourceDestCheck", false);
        
        // NATインスタンスのElastic IPアドレスを取得
        const eip = new ec2.CfnEIP(this, "NatEip", { domain: "vpc" });
        new ec2.CfnEIPAssociation(this, "NatEipAssociation", {
            allocationId: eip.attrAllocationId,
            instanceId: this.natInstance.instanceId,
        });

        // AvailabilityZoneはCDK App全体から取得する
        const azs = cdk.Stack.of(this).availabilityZones;

        // プライベートサブネット全体のルートをNATインスタンスに向ける
        this.vpc.privateSubnets.forEach((subnet, i) => {
            new ec2.CfnRoute(this, `PrivateSubnetRoute${i}`, {
                routeTableId: subnet.routeTable.routeTableId!,
                destinationCidrBlock: "0.0.0.0/0",
                instanceId: this.natInstance.instanceId,
            });
        });
    }
}
