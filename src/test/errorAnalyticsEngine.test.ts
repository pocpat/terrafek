import { describe, it, expect } from 'vitest';
import {
  classifyErrorToDomain,
  calculateDomainAnalyses,
  calculateCourseProgress,
} from '../utils/errorAnalyticsEngine';
import { LoggedErrorEvent } from '../types/terraform';

function makeError(domain: LoggedErrorEvent['domain'], resolved = false): LoggedErrorEvent {
  return {
    id: `err-${domain}-${Math.random()}`,
    timestamp: '12:00',
    source: 'validation',
    message: 'test error',
    domain,
    suggestedTopic: 'test topic',
    resolved,
  };
}

describe('errorAnalyticsEngine', () => {
  describe('classifyErrorToDomain', () => {
    it('classifies syntax errors to syntax_anatomy', () => {
      expect(classifyErrorToDomain('Syntax error: unclosed brace').domain).toBe('syntax_anatomy');
      expect(classifyErrorToDomain('Argument definition missing').domain).toBe('syntax_anatomy');
      expect(classifyErrorToDomain('Parse error in block').domain).toBe('syntax_anatomy');
    });

    it('classifies variable errors to variables_types', () => {
      // Note: 'variable not declared' contains 'syntax' indirectly? No — it
      // contains 'variable' which matches variables_types. But 'Interpolation
      // syntax error' contains 'syntax' which matches syntax_anatomy FIRST.
      expect(classifyErrorToDomain('variable not declared').domain).toBe('variables_types');
      expect(classifyErrorToDomain('var.environment type mismatch').domain).toBe('variables_types');
      // 'interpolation' alone (without 'syntax') hits variables_types
      expect(classifyErrorToDomain('interpolation reference error').domain).toBe('variables_types');
    });

    it('classifies dependency errors to resource_dependencies', () => {
      expect(classifyErrorToDomain('Reference to undeclared resource').domain).toBe('resource_dependencies');
      expect(classifyErrorToDomain('depends_on cycle detected').domain).toBe('resource_dependencies');
      expect(classifyErrorToDomain('Missing attribute reference').domain).toBe('resource_dependencies');
    });

    it('classifies state errors to state_lifecycle', () => {
      expect(classifyErrorToDomain('state file locked').domain).toBe('state_lifecycle');
      expect(classifyErrorToDomain('drift detected in plan').domain).toBe('state_lifecycle');
      expect(classifyErrorToDomain('destroy failed').domain).toBe('state_lifecycle');
    });

    it('classifies module errors to modules_architecture', () => {
      expect(classifyErrorToDomain('module source not found').domain).toBe('modules_architecture');
      expect(classifyErrorToDomain('child module output missing').domain).toBe('modules_architecture');
    });

    it('falls back to syntax_anatomy for unrecognized errors', () => {
      expect(classifyErrorToDomain('something totally unknown').domain).toBe('syntax_anatomy');
    });

    it('returns a suggested topic with each classification', () => {
      const result = classifyErrorToDomain('variable type mismatch');
      expect(result.suggestedTopic).toBeTruthy();
      expect(typeof result.suggestedTopic).toBe('string');
    });
  });

  describe('calculateDomainAnalyses', () => {
    it('returns 5 domain analyses', () => {
      const analyses = calculateDomainAnalyses([], []);
      expect(analyses).toHaveLength(5);
    });

    it('marks unassessed domains when no errors and no completed labs', () => {
      const analyses = calculateDomainAnalyses([], []);
      analyses.forEach((a) => {
        expect(a.status).toBe('Not Assessed');
        expect(a.masteryScore).toBe(0);
      });
    });

    it('marks domain as Mastered when no errors but relevant labs completed', () => {
      const analyses = calculateDomainAnalyses([], ['lab-1-first-resource']);
      const syntaxDomain = analyses.find((a) => a.domain === 'syntax_anatomy');
      expect(syntaxDomain!.status).toBe('Mastered');
      expect(syntaxDomain!.masteryScore).toBe(100);
    });

    it('marks domain as Critical Gap with 3+ unresolved errors', () => {
      const errors = [
        makeError('variables_types'),
        makeError('variables_types'),
        makeError('variables_types'),
      ];
      const analyses = calculateDomainAnalyses(errors, []);
      const varDomain = analyses.find((a) => a.domain === 'variables_types');
      expect(varDomain!.status).toBe('Critical Gap');
      expect(varDomain!.masteryScore).toBeLessThanOrEqual(65);
    });

    it('marks domain as Proficient when all errors resolved but no labs', () => {
      const errors = [makeError('syntax_anatomy', true)];
      const analyses = calculateDomainAnalyses(errors, []);
      const syntaxDomain = analyses.find((a) => a.domain === 'syntax_anatomy');
      expect(syntaxDomain!.status).toBe('Proficient');
      expect(syntaxDomain!.masteryScore).toBe(80);
    });

    it('marks domain as Mastered when all errors resolved and labs completed', () => {
      const errors = [makeError('syntax_anatomy', true)];
      const analyses = calculateDomainAnalyses(errors, ['lab-1-first-resource']);
      const syntaxDomain = analyses.find((a) => a.domain === 'syntax_anatomy');
      expect(syntaxDomain!.status).toBe('Mastered');
      expect(syntaxDomain!.masteryScore).toBe(95);
    });
  });

  describe('calculateCourseProgress', () => {
    it('calculates 0% completion with no progress', () => {
      const summary = calculateCourseProgress([], 0, 100, []);
      expect(summary.completionPercentage).toBe(0);
      expect(summary.completedLessons).toBe(0);
    });

    it('counts completed labs and walkthroughs', () => {
      const summary = calculateCourseProgress(['lab-1-first-resource', 'lab-2-core-workflow'], 2, 350, []);
      expect(summary.completedLessons).toBeGreaterThan(0);
      expect(summary.completionPercentage).toBeGreaterThan(0);
    });

    it('recommends a drill when there are unresolved errors', () => {
      const errors = [makeError('syntax_anatomy')];
      const summary = calculateCourseProgress([], 0, 100, errors);
      expect(summary.nextRecommendedLesson.type).toBe('drill');
      expect(summary.nextRecommendedLesson.title).toContain('Skill Gap Drill');
    });

    it('recommends next uncompleted lab when no unresolved errors', () => {
      const summary = calculateCourseProgress(['lab-1-first-resource'], 0, 200, []);
      expect(summary.nextRecommendedLesson.type).toBe('lab');
    });

    it('recommends a walkthrough when all labs are completed', () => {
      // All 10 labs completed — need all lab IDs to trigger walkthrough recommendation
      const allLabIds = [
        'lab-1-first-resource', 'lab-2-core-workflow', 'lab-3-variables-locals',
        'lab-4-networking-dependencies', 'lab-5-outputs-sensitive', 'lab-6-state-and-drift',
        'lab-7-count-and-for-each', 'lab-8-modular-architecture', 'lab-9-remote-state-locking',
        'lab-10-production-hero',
      ];
      const summary = calculateCourseProgress(allLabIds, 0, 2000, []);
      expect(summary.nextRecommendedLesson.type).toBe('walkthrough');
    });
  });
});