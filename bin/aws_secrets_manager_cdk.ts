#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { AwsSecretsManagerCdkStack } from '../lib/aws_secrets_manager_cdk-stack';

const app = new App();
new AwsSecretsManagerCdkStack(app, 'AwsSecretsManagerCdkStack');