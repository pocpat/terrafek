import { describe, it, expect } from 'vitest';
import {
  createEmptyState,
  formatHclString,
  runTerraformValidate,
  runTerraformPlan,
  applyTerraform,
  destroyTerraform,
  evaluateConsoleExpression,
} from '../utils/terraformEngine';

describe('terraformEngine', () => {
  describe('createEmptyState', () => {
    it('creates a valid empty state file', () => {
      const state = createEmptyState();
      expect(state.version).toBe(4);
      expect(state.serial).toBe(1);
      expect(state.resources).toEqual([]);
      expect(state.outputs).toEqual({});
      expect(state.lineage).toContain('b4d9c72e');
    });

    it('generates unique lineages', () => {
      const s1 = createEmptyState();
      const s2 = createEmptyState();
      expect(s1.lineage).not.toBe(s2.lineage);
    });
  });

  describe('formatHclString', () => {
    it('indents nested blocks correctly', () => {
      const input = `resource "aws_s3_bucket" "main" {
bucket = "test"
tags = {
Environment = "prod"
}
}`;
      const formatted = formatHclString(input);
      const lines = formatted.split('\n');
      // Line 1: no indent
      expect(lines[0]).toBe('resource "aws_s3_bucket" "main" {');
      // Line 2: 1 level indent
      expect(lines[1]).toBe('  bucket = "test"');
      // Line 3: 1 level indent for tags block opening
      expect(lines[2]).toBe('  tags = {');
      // Line 4: 2 levels indent for tag value
      expect(lines[3]).toBe('    Environment = "prod"');
    });

    it('handles empty lines', () => {
      const input = `resource "x" "y" {\n\nfield = "val"\n}`;
      const formatted = formatHclString(input);
      expect(formatted).toContain('resource "x" "y" {');
      // Empty line should remain empty (not indented)
      expect(formatted.split('\n')[1]).toBe('');
    });

    it('dedents closing braces', () => {
      const input = `resource "x" "y" {\nfield = "val"\n}`;
      const formatted = formatHclString(input);
      // The closing brace should be at column 0 (dedented from the field)
      const lines = formatted.split('\n');
      expect(lines[0]).toBe('resource "x" "y" {');
      expect(lines[1]).toBe('  field = "val"');
      expect(lines[2]).toBe('}');
    });
  });

  describe('runTerraformValidate', () => {
    it('passes for a valid S3 bucket config', () => {
      const files = {
        'main.tf': `provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "main" {
  bucket = "test-bucket"
}`,
      };
      const result = runTerraformValidate(files);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects missing cidr_block for aws_vpc', () => {
      const files = {
        'main.tf': `resource "aws_vpc" "main" {
  name = "test"
}`,
      };
      const result = runTerraformValidate(files);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('cidr_block'))).toBe(true);
    });

    it('detects missing ami/instance_type for aws_instance', () => {
      const files = {
        'main.tf': `resource "aws_instance" "web" {
  tags = { Name = "web" }
}`,
      };
      const result = runTerraformValidate(files);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('ami'))).toBe(true);
    });

    it('detects duplicate resource declarations', () => {
      const files = {
        'main.tf': `resource "aws_s3_bucket" "dup" {
  bucket = "a"
}
resource "aws_s3_bucket" "dup" {
  bucket = "b"
}`,
      };
      const result = runTerraformValidate(files);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
    });

    it('passes when s3 bucket has bucket_prefix instead of bucket', () => {
      const files = {
        'main.tf': `resource "aws_s3_bucket" "main" {
  bucket_prefix = "my-prefix-"
}`,
      };
      const result = runTerraformValidate(files);
      // Should be valid (no warning about missing bucket)
      expect(result.valid).toBe(true);
    });
  });

  describe('runTerraformPlan', () => {
    it('shows create action for new resources', () => {
      const files = {
        'main.tf': `resource "aws_s3_bucket" "main" {
  bucket = "test-bucket"
}`,
      };
      const state = createEmptyState();
      const plan = runTerraformPlan(files, state);
      expect(plan.addCount).toBe(1);
      expect(plan.destroyCount).toBe(0);
      expect(plan.outputLog).toContain('will be created');
      expect(plan.outputLog).toContain('Plan: 1 to add');
    });

    it('shows destroy action when resource removed from code', () => {
      const files = { 'main.tf': '' };
      const state = {
        ...createEmptyState(),
        resources: [
          {
            mode: 'managed' as const,
            type: 'aws_s3_bucket',
            name: 'old',
            provider: 'provider["registry.terraform.io/hashicorp/aws"]',
            instances: [
              { schema_version: 1, attributes: { id: 's3-123', bucket: 'old-bucket' }, dependencies: [] },
            ],
          },
        ],
      };
      const plan = runTerraformPlan(files, state);
      expect(plan.destroyCount).toBe(1);
      expect(plan.outputLog).toContain('will be destroyed');
    });

    it('shows no changes when code matches state', () => {
      const files = {
        'main.tf': `resource "aws_s3_bucket" "main" {
  bucket = "test-bucket"
}`,
      };
      const state = {
        ...createEmptyState(),
        resources: [
          {
            mode: 'managed' as const,
            type: 'aws_s3_bucket',
            name: 'main',
            provider: 'provider["registry.terraform.io/hashicorp/aws"]',
            instances: [
              { schema_version: 1, attributes: { id: 's3-123', bucket: 'test-bucket' }, dependencies: [] },
            ],
          },
        ],
      };
      const plan = runTerraformPlan(files, state);
      expect(plan.addCount).toBe(0);
      expect(plan.changeCount).toBe(0);
      expect(plan.destroyCount).toBe(0);
      expect(plan.outputLog).toContain('No changes');
    });
  });

  describe('applyTerraform', () => {
    it('creates resources and updates state', () => {
      const files = {
        'main.tf': `resource "aws_s3_bucket" "main" {
  bucket = "test-bucket"
}`,
      };
      const state = createEmptyState();
      const result = applyTerraform(files, state);
      expect(result.newState.resources).toHaveLength(1);
      expect(result.newState.resources[0].type).toBe('aws_s3_bucket');
      expect(result.newState.resources[0].instances[0].attributes.id).toBeTruthy();
      expect(result.newState.resources[0].instances[0].attributes.arn).toContain('arn:aws:');
      expect(result.logs.some((l) => l.includes('Apply complete'))).toBe(true);
    });

    it('generates public_ip for aws_instance', () => {
      const files = {
        'main.tf': `resource "aws_instance" "web" {
  ami = "ami-12345"
  instance_type = "t3.micro"
}`,
      };
      const result = applyTerraform(files, createEmptyState());
      const attrs = result.newState.resources[0].instances[0].attributes;
      expect(attrs.public_ip).toMatch(/^54\.210\.\d+\.\d+$/);
      expect(attrs.instance_state).toBe('running');
    });

    it('increments state serial on apply', () => {
      const files = {
        'main.tf': `resource "aws_s3_bucket" "main" {
  bucket = "test"
}`,
      };
      const initial = createEmptyState();
      const result = applyTerraform(files, initial);
      expect(result.newState.serial).toBe(initial.serial + 1);
    });

    it('creates resources with dependencies in sorted order', () => {
      const files = {
        'main.tf': `resource "aws_subnet" "sub" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}`,
      };
      const result = applyTerraform(files, createEmptyState());
      // VPC should be created before subnet (dependency sort)
      const types = result.newState.resources.map((r) => r.type);
      const vpcIdx = types.indexOf('aws_vpc');
      const subnetIdx = types.indexOf('aws_subnet');
      expect(vpcIdx).toBeLessThan(subnetIdx);
    });
  });

  describe('destroyTerraform', () => {
    it('destroys all resources and returns empty state', () => {
      const state = {
        ...createEmptyState(),
        resources: [
          {
            mode: 'managed' as const,
            type: 'aws_s3_bucket',
            name: 'main',
            provider: 'provider["registry.terraform.io/hashicorp/aws"]',
            instances: [{ schema_version: 1, attributes: { id: 's3-123' }, dependencies: [] }],
          },
        ],
      };
      const result = destroyTerraform(state);
      expect(result.newState.resources).toHaveLength(0);
      expect(result.logs.some((l) => l.includes('Destroy complete'))).toBe(true);
      expect(result.logs.some((l) => l.includes('1 destroyed'))).toBe(true);
    });

    it('handles empty state gracefully', () => {
      const result = destroyTerraform(createEmptyState());
      expect(result.newState.resources).toHaveLength(0);
      expect(result.logs.some((l) => l.includes('0 destroyed'))).toBe(true);
    });
  });

  describe('evaluateConsoleExpression', () => {
    it('evaluates var references', () => {
      const files = {
        'main.tf': `variable "environment" {
  type = string
  default = "production"
}`,
      };
      const result = evaluateConsoleExpression('var.environment', files, createEmptyState());
      expect(result).toBe('"production"');
    });

    it('returns error for undeclared variable', () => {
      const result = evaluateConsoleExpression('var.nonexistent', {}, createEmptyState());
      expect(result).toContain('Error');
      expect(result).toContain('undeclared');
    });

    it('evaluates upper() function', () => {
      const result = evaluateConsoleExpression('upper("hello")', {}, createEmptyState());
      expect(result).toBe('"HELLO"');
    });

    it('evaluates lower() function', () => {
      const result = evaluateConsoleExpression('lower("WORLD")', {}, createEmptyState());
      expect(result).toBe('"world"');
    });

    it('evaluates local references', () => {
      const files = {
        'main.tf': `locals {
  server_name = "web-01"
}`,
      };
      const result = evaluateConsoleExpression('local.server_name', files, createEmptyState());
      expect(result).toBe('"web-01"');
    });
  });
});