import { resolve } from 'path';
import {
  lowerFirstCase,
  normalizeToKebabOrSnakeCase,
  relativePath,
  resovePath,
  toHump,
  upFirstCase,
} from './formatting';

describe('formatting', () => {
  describe('normalizeToKebabOrSnakeCase', () => {
    it('aaBbCc to aa-bb-cc', () => {
      expect(normalizeToKebabOrSnakeCase('aaBbCc')).toBe('aa-bb-cc');
    });
    it('aa_BbCc to aa_bb-cc', () => {
      expect(normalizeToKebabOrSnakeCase('aa_BbCc')).toBe('aa_bb-cc');
    });
    it('aa BbCc to aa-bb-cc', () => {
      expect(normalizeToKebabOrSnakeCase('aa BbCc')).toBe('aa-bb-cc');
    });
  });
  describe('toHump', () => {
    it('aa-bb_cc to aaBbCc', () => {
      expect(toHump('aa-bb_cc')).toBe('aaBbCc');
    });
    it('Aa-bb_cc to aa_bb-cc', () => {
      expect(toHump('Aa-bb_cc')).toBe('AaBbCc');
    });
    it('AaBbCc to AaBbCc', () => {
      expect(toHump('AaBbCc')).toBe('AaBbCc');
    });
  });
  describe('lowerFirstCase', () => {
    it('AaBbCc to aaBbCc', () => {
      expect(lowerFirstCase('AaBbCc')).toBe('aaBbCc');
    });
  });
  describe('upFirstCase', () => {
    it('aaBbCc to AaBbCc', () => {
      expect(upFirstCase('aaBbCc')).toBe('AaBbCc');
    });
  });
  describe('resovePath', () => {
    it('aa/cc to /aa/cc.entity.ts', () => {
      expect(resovePath('aa/cc', ['.entity', '.ts'])).toBe(
        resolve('aa/cc.entity.ts').replace(/\\/g, '/'),
      );
    });
  });
  describe('relativePath', () => {
    it('/aa  /aa/bb/cc.entity.ts to ./bb/cc', () => {
      expect(
        relativePath('/aa', '/aa/bb/cc.entity.ts', ['.entity', '.ts']),
      ).toBe('./bb/cc');
    });
    it('aa/bb/cc.entity.ts to ./aa/bb/cc', () => {
      expect(relativePath('', 'aa/bb/cc.entity.ts', ['.entity', '.ts'])).toBe(
        './aa/bb/cc',
      );
    });
    it('aa/a.ts aa/bb/cc.entity.ts to ./bb/cc', () => {
      expect(
        relativePath('aa/a.ts', 'aa/bb/cc.entity.ts', ['.entity', '.ts']),
      ).toBe('./bb/cc');
    });
    it('aa to ./aa', () => {
      expect(relativePath('', 'aa', ['.entity', '.ts'])).toBe('./aa');
    });
  });
});
