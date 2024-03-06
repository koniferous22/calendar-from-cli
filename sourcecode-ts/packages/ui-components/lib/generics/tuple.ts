export type GenericTuple<T, N extends number, R extends unknown[] = []> = R['length'] extends N
  ? R
  : GenericTuple<T, N, [T, ...R]>
