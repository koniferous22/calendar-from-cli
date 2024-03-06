export const calculatePaginationArgs = (page: number, pageSize: number) =>
  ({
    take: pageSize,
    skip: (page - 1) * pageSize,
  }) as const
