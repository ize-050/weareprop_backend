const mockPrisma = {
  property: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: {},
}));

const propertyRepository = require('../propertyRepository');

const whereOf = async (options) => {
  mockPrisma.property.findMany.mockClear();
  mockPrisma.property.count.mockClear();
  await propertyRepository.findAll(options);
  const where = mockPrisma.property.findMany.mock.calls[0][0].where;
  expect(mockPrisma.property.count.mock.calls[0][0].where).toEqual(where); // same where for total
  return where;
};

const words = (where) => where.AND[0].OR.map((c) => c.ownershipQuota.contains.toLowerCase());

describe('PropertyRepository.findAll - ownership quota filter', () => {
  beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  test.each(['FOREIGN', 'foreign', 'Foreign Quota'])('propertyQuota=%s filters Foreign only', async (v) => {
    const where = await whereOf({ propertyQuota: v });
    expect(new Set(words(where))).toEqual(new Set(['foreign']));
  });

  test.each(['THAI', 'thai', 'Thai Quota'])('propertyQuota=%s filters Thai only', async (v) => {
    const where = await whereOf({ propertyQuota: v });
    expect(new Set(words(where))).toEqual(new Set(['thai']));
  });

  test('the `quota` name works the same as `propertyQuota`', async () => {
    const a = await whereOf({ quota: 'foreign' });
    const b = await whereOf({ propertyQuota: 'foreign' });
    expect(a).toEqual(b);
  });

  test.each([undefined, '', 'Company Name', 'random'])('no quota condition for %p', async (v) => {
    const where = await whereOf({ propertyQuota: v });
    expect(where.AND).toBeUndefined();
    expect(where).toEqual({ deletedAt: null, isPublished: true });
  });

  test('quota + text search + other filters all stay active', async () => {
    const where = await whereOf({ quota: 'thai', search: 'sea', propertyType: 'Condo', zoneId: '3', listingType: 'SALE' });
    expect(where.OR).toHaveLength(4); // text search untouched
    expect(where.AND).toHaveLength(1); // quota
    expect(where.propertyType).toEqual({ name: 'Condo' });
    expect(where.zoneId).toBe(3);
    expect(where.listings).toEqual({ some: { listingType: 'SALE' } });
    expect(where.isPublished).toBe(true);
    expect(where.deletedAt).toBeNull();
  });

  test('array value does not throw', async () => {
    await expect(whereOf({ propertyQuota: ['foreign', 'thai'] })).resolves.toBeDefined();
  });
});
