import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { getRequiredEnvVars } from "./utils";

export class InfraStack extends cdk.Stack {
  public readonly algorithmRepo: ecr.Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = getRequiredEnvVars(["NAME"]);

    this.algorithmRepo = new ecr.Repository(this, `AlgorithmRepo-${env.NAME}`, {
      repositoryName: `animalia-algorithm-${env.NAME}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    new cdk.CfnOutput(this, "AlgorithmRepoArn", {
      value: this.algorithmRepo.repositoryArn,
      exportName: `AlgorithmRepoArn-${env.NAME}`,
    });

    new cdk.CfnOutput(this, "AlgorithmRepoName", {
      value: this.algorithmRepo.repositoryName,
      exportName: `AlgorithmRepoName-${env.NAME}`,
    });
  }
}
