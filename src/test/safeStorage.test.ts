import { describe, it, expect, beforeEach, vi } from 'vitest';
import { safeGetItem, safeGetJSON, safeGetNumber, safeSetItem } from '../utils/safeStorage';

describe('safeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('safeGetItem', () => {
    it('returns the stored string value', () => {
      localStorage.setItem('test-key', 'hello');
      expect(safeGetItem('test-key')).toBe('hello');
    });

    it('returns null when key does not exist', () => {
      expect(safeGetItem('nonexistent')).toBeNull();
    });

    it('returns null when localStorage throws (e.g. disabled)', () => {
      // Temporarily make getItem throw
      const original = localStorage.getItem;
      localStorage.getItem = () => { throw new Error('Access denied'); };
      expect(safeGetItem('any-key')).toBeNull();
      localStorage.getItem = original;
    });
  });

  describe('safeGetJSON', () => {
    it('parses valid JSON', () => {
      localStorage.setItem('data', JSON.stringify({ a: 1 }));
      expect(safeGetJSON('data', null)).toEqual({ a: 1 });
    });

    it('returns fallback for corrupted JSON', () => {
      localStorage.setItem('broken', '{not valid json');
      expect(safeGetJSON('broken', { default: true })).toEqual({ default: true });
    });

    it('returns fallback when key is missing', () => {
      expect(safeGetJSON('missing', ['default'])).toEqual(['default']);
    });

    it('returns fallback when localStorage throws', () => {
      const original = localStorage.getItem;
      localStorage.getItem = () => { throw new Error('No access'); };
      expect(safeGetJSON('x', 42)).toBe(42);
      localStorage.getItem = original;
    });

    it('returns fallback when parsed value is null', () => {
      localStorage.setItem('null-val', 'null');
      expect(safeGetJSON('null-val', 'fb')).toBe('fb');
    });
  });

  describe('safeGetNumber', () => {
    it('returns the stored number', () => {
      localStorage.setItem('num', '320');
      expect(safeGetNumber('num', 0)).toBe(320);
    });

    it('returns fallback for NaN values', () => {
      localStorage.setItem('bad', 'not-a-number');
      expect(safeGetNumber('bad', 100)).toBe(100);
    });

    it('returns fallback when key is missing', () => {
      expect(safeGetNumber('absent', 50)).toBe(50);
    });

    it('returns fallback when localStorage throws', () => {
      const original = localStorage.getItem;
      localStorage.getItem = () => { throw new Error('Quota'); };
      expect(safeGetNumber('z', 99)).toBe(99);
      localStorage.getItem = original;
    });
  });

  describe('safeSetItem', () => {
    it('stores a value successfully', () => {
      safeSetItem('write-test', 'value123');
      expect(localStorage.getItem('write-test')).toBe('value123');
    });

    it('does not throw when localStorage.setItem fails', () => {
      const original = localStorage.setItem;
      localStorage.setItem = () => { throw new Error('Quota exceeded'); };
      expect(() => safeSetItem('x', 'y')).not.toThrow();
      localStorage.setItem = original;
    });
  });
});