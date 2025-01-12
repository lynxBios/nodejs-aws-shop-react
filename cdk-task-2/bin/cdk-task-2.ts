#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-task-2-stack";

const app = new cdk.App();

new CdkStack(app, "CdkStack", {
  env: {
    account: '730043614514',
    region: 'eu-central-1'
  }
});