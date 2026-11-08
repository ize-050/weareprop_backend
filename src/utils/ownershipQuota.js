/**
 * Ownership quota filter helper.
 *
 * The property form saves `ownershipQuota` as free text:
 *   "Thai Quota" | "Foreign Quota" | "Company Name"
 * The websites send short values in the URL (quota=thai, quota=foreign,
 * propertyQuota=THAI ...). This file is the ONLY place that maps one to the other.
 */

const QUOTA_WORDS = {
  THAI: ['thai', 'Thai', 'THAI'],
  FOREIGN: ['foreign', 'Foreign', 'FOREIGN'],
};

/**
 * Turn any filter value into 'THAI', 'FOREIGN' or null (= no quota filter).
 * Never throws.
 * @param {*} value - e.g. 'thai', 'FOREIGN', 'Foreign Quota', ['thai'], undefined
 * @returns {'THAI'|'FOREIGN'|null}
 */
function normalizeQuotaFilter(value) {
  try {
    if (Array.isArray(value)) value = value[0];
    if (typeof value !== 'string') return null;

    const text = value.trim().toLowerCase();
    if (!text) return null;

    const hasThai = text.includes('thai');
    const hasForeign = text.includes('foreign');

    if (hasThai && !hasForeign) return 'THAI';
    if (hasForeign && !hasThai) return 'FOREIGN';
    return null; // empty, "Company Name", unknown or ambiguous
  } catch (error) {
    return null;
  }
}

/**
 * Build a Prisma `where` fragment for the ownershipQuota column.
 * Several casings are listed so it works with any MySQL collation
 * (Prisma + MySQL does not support `mode: 'insensitive'`).
 * @param {*} value - quota filter value from the request
 * @returns {{OR: Array}|null} fragment to put inside `where.AND`, or null
 */
function buildOwnershipQuotaCondition(value) {
  const key = normalizeQuotaFilter(value);
  if (!key) return null;
  return {
    OR: QUOTA_WORDS[key].map((word) => ({ ownershipQuota: { contains: word } })),
  };
}

module.exports = { normalizeQuotaFilter, buildOwnershipQuotaCondition };
