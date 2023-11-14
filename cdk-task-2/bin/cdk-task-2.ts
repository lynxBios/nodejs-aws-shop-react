#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { CdkTask2Stack } from '../lib/cdk-task-2-stack';

const app = new cdk.App();
const stack = new CdkTask2Stack(app, 'CdkTask2Stack', {
    env: { account: '730043614514', region: 'eu-central-1' },  
});

const awsBucket = new s3.Bucket(stack, 'BucketFromCDK', {
    bucketName: 'bucket-from-cdk',
    websiteIndexDocument: 'index.html',
    publicReadAccess: false,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    removalPolicy: cdk.RemovalPolicy.DESTROY
});

const originAccessIdentity = new cloudfront.OriginAccessIdentity(stack, 'BucketFromCDK', {
  comment: awsBucket.bucketName
});

const cloudFront = new cloudfront.Distribution(stack, 'Distribution', {
    defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(awsBucket, {
          originAccessIdentity         
          }
        ),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    },
    defaultRootObject: 'index.html',
});

awsBucket.grantRead(originAccessIdentity)

new s3deploy.BucketDeployment(stack, 'BucketFromCDKDeployment', {
  sources: [s3deploy.Source.asset('./dist')],
  destinationBucket: awsBucket,
  distribution: cloudFront,
  distributionPaths: ['/*']
});
new cdk.CfnOutput(stack, 'Domain URL', {
  value: cloudFront.distributionDomainName,
});
new cdk.CfnOutput(stack, 'S3 URL', {
value: awsBucket.bucketDomainName,
});