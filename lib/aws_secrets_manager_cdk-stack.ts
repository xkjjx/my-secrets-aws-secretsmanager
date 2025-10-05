import { Stack, StackProps, SecretValue } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse } from 'dotenv';

const EXPECTED_ENV_KEYS: ReadonlySet<string> = new Set(['GOOGLE_API_KEY']);

export class AwsSecretsManagerCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const envVars = readEnvFile();
    const missing: string[] = [];
    for (const key of EXPECTED_ENV_KEYS) {
      if (!(key in envVars)) missing.push(key);
    }
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    for (const key of EXPECTED_ENV_KEYS) {
      const value = envVars[key];
      if (value === undefined) continue;
      new Secret(this, toSafeConstructId(key), {
        secretName: `keys/${toKebabFromEnvKey(key)}`,
        secretStringValue: SecretValue.unsafePlainText(String(value)),
      });
    }
  }
}

function readEnvFile(): Record<string, string> {
  const envPath = join(__dirname, '..', '.env');
  if (!existsSync(envPath)) return {};
  try {
    const content = readFileSync(envPath, 'utf8');
    return parse(content);
  } catch {
    return {};
  }
}

function toKebabFromEnvKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function toSafeConstructId(key: string): string {
  const alphanumeric = key.replace(/[^A-Za-z0-9]+/g, ' ').trim();
  if (alphanumeric.length === 0) return 'EnvSecret';
  const pascal = alphanumeric
    .split(/\s+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
  return `EnvSecret${pascal}`;
}
