const mockPrisma = {
  property: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const searchService = require('../searchService');

const whereOf = async (filters) => {
  mockPrisma.property.findMany.mockClear();
  mockPrisma.property.count.mockClear();
  await searchService.searchProperties(filters);
  return mockPrisma.property.findMany.mock.calls[0][0].where;
};

const words = (where) => where.AND[0].OR.map((c) => c.ownershipQuota.contains.toLowerCase());

describe('SearchService.searchProperties - ownership quota filter', () => {
  test.each(['FOREIGN', 'foreign', 'Foreign Quota'])('propertyQuota=%s filters Foreign only', async (v) => {
    const where = await whereOf({ propertyQuota: v });
    expect(new Set(words(where))).toEqual(new Set(['foreign']));
    expect(where.ownershipQuota).toBeUndefined(); // old exact match is gone
  });

  test.each(['THAI', 'thai', 'Thai Quota'])('propertyQuota=%s filters Thai only', async (v) => {
    const where = await whereOf({ propertyQuota: v });
    expect(new Set(words(where))).toEqual(new Set(['thai']));
  });

  test('the `quota` name works the same as `propertyQuota`', async () => {
    expect(await whereOf({ quota: 'thai' })).toEqual(await whereOf({ propertyQuota: 'thai' }));
  });

  test.each([undefined, '', 'Company Name'])('no quota condition for %p', async (v) => {
    const where = await whereOf({ propertyQuota: v });
    expect(where.AND).toBeUndefined();
    expect(where.ownershipQuota).toBeUndefined();
  });

  test('quota + text search + type keep working together', async () => {
    const where = await whereOf({ quota: 'foreign', search: 'sea', type: 'sale' });
    expect(where.OR).toHaveLength(6); // text search untouched
    expect(where.AND).toHaveLength(1); // quota
    expect(where.listings).toEqual({ some: { listingType: 'SALE' } });
    expect(where.isPublished).toBe(true);
    expect(where.deletedAt).toBeNull();
  });

  test('array value does not throw (used to crash with toUpperCase)', async () => {
    await expect(whereOf({ propertyQuota: ['a', 'b'] })).resolves.toBeDefined();
  });
});
