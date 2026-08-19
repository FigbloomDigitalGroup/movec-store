export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function buildPagination(query: PaginationQuery, defaultLimit = DEFAULT_PAGE_SIZE): PaginationParams {
  const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
  const requestedLimit = parseInt(query.limit ?? String(defaultLimit), 10) || defaultLimit;
  const limit = Math.min(Math.max(1, requestedLimit), MAX_PAGE_SIZE);
  return { page, limit, skip: (page - 1) * limit };
}

export function paginated<T>(data: T[], total: number, page: number, limit: number) {
  return { data, meta: { page, limit, total } };
}
