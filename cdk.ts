#!/usr/bin/env node
//@ts-nocheck
import * as cdk from 'aws-cdk-lib';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cloudFrontOriginAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      'OriginAccessIdentity'
    )

    const awsBucket = new s3.Bucket(this, 'BucketFromCDK', {
      bucketName: 'bucket-from-cdk',
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const distribution = new cloudfront.CloudFrontWebDistribution(
      this, 'Distribution', {
        originConfigs: [
          S3OriginSource: {
            s3BucketSource: awsBucket,
            originAccessIdentity: cloudFrontOriginAccessIdentity
          }
        ]
      }
    )

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./website')],
      destinationBucket: awsBucket,
      distribution,
      distributionPaths: ['/*']
    })
  }
}