// aws
import * as cdk from "aws-cdk-lib";
import { CloudFrontWebDistribution, OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { AccountRootPrincipal, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "Bucket", {
      versioned: true,
      bucketName: "bucket-from-cdk",
      websiteIndexDocument: "index.html",      
      autoDeleteObjects: true,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const oai = new OriginAccessIdentity(this, "OriginAccessIdentity", {
      comment: "Cloudfront OAI"
    });

    bucket.grantRead(oai);

    bucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        principals: [new AccountRootPrincipal()]
      })
    );

    const distribution = new CloudFrontWebDistribution(this, "CloudFrontWebDistribution", {
        originConfigs: [
          { 
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: oai
            },
            behaviors: [
              {
                isDefaultBehavior: true
              }
            ]            
          }
        ]
      });

    new BucketDeployment(this, "BucketDeployment", {
      sources: [Source.asset("../dist")],
      destinationBucket: bucket,
      distribution: distribution,
      distributionPaths: ["/*"]
    });
  }
}