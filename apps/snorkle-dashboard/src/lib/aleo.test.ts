import { fetchPrograms, fetchMappingEntries, getMappingLength, parseAleoValue } from './aleo';

describe('Aleo Integration', () => {
  describe('fetchPrograms', () => {
    it('should return a list of programs', async () => {
      const programs = await fetchPrograms();
      expect(programs).toBeDefined();
      expect(Array.isArray(programs)).toBe(true);
      expect(programs.length).toBeGreaterThan(0);
    });
  });

  describe('fetchMappingEntries', () => {
    it('should return paginated mapping entries', async () => {
      const entries = await fetchMappingEntries('proto_snorkle_oracle_000', 'data', 10, 1);
      expect(entries).toBeDefined();
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getMappingLength', () => {
    it('should return the total number of entries in a mapping', async () => {
      const length = await getMappingLength('proto_snorkle_oracle_000', 'data');
      expect(length).toBeDefined();
      expect(typeof length).toBe('number');
      expect(length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('parseAleoValue', () => {
    it('should parse u128 values correctly', () => {
      const value = parseAleoValue('123456789', 'u128');
      expect(value).toBe(BigInt('123456789'));
    });

    it('should parse field values correctly', () => {
      const value = parseAleoValue('field123', 'field');
      expect(value).toBe('field123');
    });

    it('should parse boolean values correctly', () => {
      expect(parseAleoValue('true', 'boolean')).toBe(true);
      expect(parseAleoValue('false', 'boolean')).toBe(false);
    });

    it('should handle invalid values gracefully', () => {
      const value = parseAleoValue('invalid', 'u128');
      expect(value).toBe('invalid');
    });
  });
}); 