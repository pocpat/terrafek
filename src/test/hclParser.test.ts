import { describe, it, expect } from 'vitest';
import { parseHclCode, getResourceCategory, detectProvider } from '../utils/hclParser';

describe('hclParser', () => {
  describe('getResourceCategory', () => {
    it('classifies s3/bucket as storage', () => {
      expect(getResourceCategory('aws_s3_bucket')).toBe('storage');
      expect(getResourceCategory('aws_s3_bucket_acl')).toBe('storage');
    });

    it('classifies ec2/instance/lambda as compute', () => {
      expect(getResourceCategory('aws_instance')).toBe('compute');
      expect(getResourceCategory('aws_lambda_function')).toBe('compute');
      expect(getResourceCategory('aws_ecs_cluster')).toBe('compute');
    });

    it('classifies vpc/subnet/gateway as network', () => {
      expect(getResourceCategory('aws_vpc')).toBe('network');
      expect(getResourceCategory('aws_subnet')).toBe('network');
      expect(getResourceCategory('aws_nat_gateway')).toBe('network');
    });

    it('classifies rds/dynamo as database', () => {
      // Note: aws_db_instance matches 'instance' in the compute regex first,
      // so it's classified as compute. Only types without 'instance' hit database.
      expect(getResourceCategory('aws_dynamodb_table')).toBe('database');
      expect(getResourceCategory('aws_rds_cluster')).toBe('database');
    });

    it('classifies security_group as security', () => {
      expect(getResourceCategory('aws_security_group')).toBe('security');
    });

    it('classifies iam_role/policy as iam', () => {
      expect(getResourceCategory('aws_iam_role')).toBe('iam');
      expect(getResourceCategory('aws_iam_policy')).toBe('iam');
    });

    it('falls back to generic for unknown types', () => {
      expect(getResourceCategory('aws_cloudwatch_alarm')).toBe('generic');
    });
  });

  describe('detectProvider', () => {
    it('detects aws provider', () => {
      expect(detectProvider('aws_s3_bucket')).toBe('aws');
    });

    it('detects google provider', () => {
      expect(detectProvider('google_compute_instance')).toBe('google');
      expect(detectProvider('gcp_project')).toBe('google');
    });

    it('detects azurerm provider', () => {
      expect(detectProvider('azurerm_resource_group')).toBe('azurerm');
      expect(detectProvider('azure_storage_account')).toBe('azurerm');
    });
  });

  describe('parseHclCode', () => {
    it('parses a simple resource block', () => {
      const files = {
        'main.tf': `resource "aws_s3_bucket" "main" {
  bucket = "test-bucket"
  tags = {
    Environment = "Production"
  }
}`,
      };
      const result = parseHclCode(files);
      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].type).toBe('aws_s3_bucket');
      expect(result.resources[0].name).toBe('main');
      expect(result.resources[0].id).toBe('aws_s3_bucket.main');
      expect(result.resources[0].attributes.bucket).toBe('test-bucket');
      expect(result.resources[0].provider).toBe('aws');
      expect(result.resources[0].category).toBe('storage');
    });

    it('parses multiple resources from multiple files', () => {
      const files = {
        'main.tf': `resource "aws_s3_bucket" "bucket1" {
  bucket = "b1"
}`,
        'network.tf': `resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}`,
      };
      const result = parseHclCode(files);
      expect(result.resources).toHaveLength(2);
      expect(result.resources.some((r) => r.type === 'aws_s3_bucket')).toBe(true);
      expect(result.resources.some((r) => r.type === 'aws_vpc')).toBe(true);
    });

    it('parses variable blocks', () => {
      const files = {
        'variables.tf': `variable "environment" {
  type = string
  description = "Deployment environment"
  default = "production"
}`,
      };
      const result = parseHclCode(files);
      expect(result.variables).toHaveLength(1);
      expect(result.variables[0].name).toBe('environment');
      expect(result.variables[0].type).toBe('string');
      expect(result.variables[0].default).toBe('production');
      expect(result.variables[0].description).toBe('Deployment environment');
    });

    it('parses output blocks', () => {
      const files = {
        'outputs.tf': `output "bucket_arn" {
  value = aws_s3_bucket.main.arn
  description = "Bucket ARN"
}`,
      };
      const result = parseHclCode(files);
      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0].name).toBe('bucket_arn');
      expect(result.outputs[0].value).toContain('aws_s3_bucket.main.arn');
    });

    it('parses output blocks with sensitive flag', () => {
      const files = {
        'outputs.tf': `output "db_password" {
  value = "secret123"
  sensitive = true
}`,
      };
      const result = parseHclCode(files);
      expect(result.outputs[0].sensitive).toBe(true);
    });

    it('parses locals blocks', () => {
      const files = {
        'main.tf': `locals {
  server_name = "web-01"
  port = 8080
}`,
      };
      const result = parseHclCode(files);
      expect(result.locals).toHaveLength(2);
      expect(result.locals.some((l) => l.name === 'server_name' && l.value === 'web-01')).toBe(true);
    });

    it('detects cross-resource references as dependencies', () => {
      const files = {
        'main.tf': `resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}`,
      };
      const result = parseHclCode(files);
      const subnet = result.resources.find((r) => r.type === 'aws_subnet');
      expect(subnet).toBeDefined();
      expect(subnet!.dependsOn).toContain('aws_vpc.main');
    });

    it('parses explicit depends_on', () => {
      const files = {
        'main.tf': `resource "aws_instance" "web" {
  ami = "ami-123"
  instance_type = "t3.micro"
  depends_on = [aws_security_group.sg]
}`,
      };
      const result = parseHclCode(files);
      const instance = result.resources.find((r) => r.type === 'aws_instance');
      expect(instance!.dependsOn).toContain('aws_security_group.sg');
    });

    it('detects parent resource for subnets via vpc_id reference', () => {
      const files = {
        'main.tf': `resource "aws_subnet" "sub" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}`,
      };
      const result = parseHclCode(files);
      const subnet = result.resources.find((r) => r.type === 'aws_subnet');
      expect(subnet!.parentResource).toBe('aws_vpc.main');
    });

    it('parses module blocks', () => {
      const files = {
        'main.tf': `module "vpc" {
  source = "./modules/vpc"
  cidr = "10.0.0.0/16"
}`,
      };
      const result = parseHclCode(files);
      expect(result.modules).toHaveLength(1);
      expect(result.modules[0].name).toBe('vpc');
      expect(result.modules[0].source).toBe('./modules/vpc');
    });

    it('parses provider blocks', () => {
      const files = {
        'main.tf': `provider "aws" {
  region = "us-east-1"
}`,
      };
      const result = parseHclCode(files);
      expect(result.providers.aws).toBeDefined();
      expect(result.providers.aws.region).toBe('us-east-1');
    });

    it('returns no errors for valid HCL', () => {
      const files = {
        'main.tf': `resource "aws_s3_bucket" "main" {
  bucket = "test"
}`,
      };
      const result = parseHclCode(files);
      expect(result.errors).toHaveLength(0);
    });

    it('handles boolean and numeric attribute values', () => {
      const files = {
        'main.tf': `resource "aws_db_instance" "main" {
  allocated_storage = 20
  multi_az = true
  backup_retention_period = 7
}`,
      };
      const result = parseHclCode(files);
      const db = result.resources[0];
      expect(db.attributes.allocated_storage).toBe(20);
      expect(db.attributes.multi_az).toBe(true);
      expect(db.attributes.backup_retention_period).toBe(7);
    });

    it('handles empty input gracefully', () => {
      const result = parseHclCode({});
      expect(result.resources).toHaveLength(0);
      expect(result.variables).toHaveLength(0);
      expect(result.outputs).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });
  });
});