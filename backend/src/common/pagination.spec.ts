import {
  buildPagination,
  paginated,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from './pagination';

describe('buildPagination', () => {
  it('defaults to page 1 and the default limit when the query is empty', () => {
    expect(buildPagination({})).toEqual({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
      skip: 0,
    });
  });

  it('parses valid page and limit strings', () => {
    expect(buildPagination({ page: '3', limit: '10' })).toEqual({
      page: 3,
      limit: 10,
      skip: 20,
    });
  });

  it('clamps page numbers below 1 up to 1', () => {
    expect(buildPagination({ page: '0' }).page).toBe(1);
    expect(buildPagination({ page: '-5' }).page).toBe(1);
  });

  it('falls back to page 1 for a non-numeric page', () => {
    expect(buildPagination({ page: 'abc' }).page).toBe(1);
  });

  it('clamps a negative limit up to 1', () => {
    expect(buildPagination({ limit: '-20' }).limit).toBe(1);
  });

  it('falls back to the default limit for an explicit 0 (falsy, not clamped)', () => {
    expect(buildPagination({ limit: '0' }).limit).toBe(DEFAULT_PAGE_SIZE);
  });

  it('caps limit at MAX_PAGE_SIZE regardless of what the caller requests', () => {
    expect(buildPagination({ limit: '9999' }).limit).toBe(MAX_PAGE_SIZE);
  });

  it('falls back to the default limit for a non-numeric limit', () => {
    expect(buildPagination({ limit: 'abc' }).limit).toBe(DEFAULT_PAGE_SIZE);
  });

  it('honors a custom defaultLimit when the query omits limit', () => {
    expect(buildPagination({}, 50).limit).toBe(50);
  });

  it('still applies MAX_PAGE_SIZE even when a custom defaultLimit exceeds it', () => {
    expect(buildPagination({}, 500).limit).toBe(MAX_PAGE_SIZE);
  });

  it('computes skip from page and limit', () => {
    expect(buildPagination({ page: '5', limit: '20' }).skip).toBe(80);
  });
});

describe('paginated', () => {
  it('wraps data with page/limit/total metadata', () => {
    const result = paginated(['a', 'b'], 42, 2, 20);
    expect(result).toEqual({
      data: ['a', 'b'],
      meta: { page: 2, limit: 20, total: 42 },
    });
  });

  it('handles an empty data set', () => {
    const result = paginated([], 0, 1, 20);
    expect(result).toEqual({
      data: [],
      meta: { page: 1, limit: 20, total: 0 },
    });
  });
});
