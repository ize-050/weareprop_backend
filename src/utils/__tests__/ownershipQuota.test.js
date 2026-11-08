const { normalizeQuotaFilter, buildOwnershipQuotaCondition } = require('../ownershipQuota');

describe('normalizeQuotaFilter', () => {
  const thai = ['thai', 'THAI', 'Thai', 'tHaI', 'Thai Quota', 'THAI QUOTA', '  thai quota  '];
  const foreign = ['foreign', 'FOREIGN', 'Foreign', 'fOrEiGn', 'Foreign Quota', 'FOREIGN QUOTA', '  foreign  '];

  test.each(thai)('"%s" -> THAI', (v) => {
    expect(normalizeQuotaFilter(v)).toBe('THAI');
  });

  test.each(foreign)('"%s" -> FOREIGN', (v) => {
    expect(normalizeQuotaFilter(v)).toBe('FOREIGN');
  });

  test('every upper/lower casing of each word gives the same key', () => {
    const casings = (word) => {
      let out = [''];
      for (const ch of word) out = out.flatMap((p) => [p + ch.toLowerCase(), p + ch.toUpperCase()]);
      return out;
    };
    casings('thai').forEach((v) => expect(normalizeQuotaFilter(v)).toBe('THAI'));
    casings('foreign').forEach((v) => expect(normalizeQuotaFilter(v)).toBe('FOREIGN'));
  });

  test('array uses the first element', () => {
    expect(normalizeQuotaFilter(['foreign', 'thai'])).toBe('FOREIGN');
    expect(normalizeQuotaFilter(['thai'])).toBe('THAI');
    expect(normalizeQuotaFilter([])).toBeNull();
  });

  test.each(['', '   ', 'Company Name', 'all', 'random', 'thai foreign'])('"%s" -> null', (v) => {
    expect(normalizeQuotaFilter(v)).toBeNull();
  });

  test('non-string values give null and never throw', () => {
    [null, undefined, 123, true, {}, () => {}, Symbol('x'), [null], [{}]].forEach((v) => {
      expect(() => normalizeQuotaFilter(v)).not.toThrow();
      expect(normalizeQuotaFilter(v)).toBeNull();
    });
  });
});

describe('buildOwnershipQuotaCondition', () => {
  const matches = (cond, stored) =>
    stored != null && cond.OR.some((c) => stored.includes(c.ownershipQuota.contains));

  test('returns null when there is no quota filter', () => {
    ['', undefined, null, 'Company Name', 123, {}].forEach((v) => {
      expect(buildOwnershipQuotaCondition(v)).toBeNull();
    });
  });

  test('Thai filter matches only Thai stored text', () => {
    const cond = buildOwnershipQuotaCondition('thai');
    expect(matches(cond, 'Thai Quota')).toBe(true);
    expect(matches(cond, 'thai quota')).toBe(true);
    expect(matches(cond, 'Foreign Quota')).toBe(false);
    expect(matches(cond, 'Company Name')).toBe(false);
    expect(matches(cond, null)).toBe(false);
  });

  test('Foreign filter matches only Foreign stored text (customer bug)', () => {
    const cond = buildOwnershipQuotaCondition('FOREIGN');
    expect(matches(cond, 'Foreign Quota')).toBe(true);
    expect(matches(cond, 'FOREIGN QUOTA')).toBe(true);
    expect(matches(cond, 'Thai Quota')).toBe(false);
    expect(matches(cond, 'Company Name')).toBe(false);
    expect(matches(cond, null)).toBe(false);
  });
});
