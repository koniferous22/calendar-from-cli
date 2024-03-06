export const transparencyScopeOptions = [
  {
    value: 'Public',
    name: 'Public (transparent to everybody)',
  },
  {
    value: 'Protected',
    name: 'Protected (transparent to trusted viewers)',
  },
  {
    value: 'Private',
    name: 'Private (visible to you only)',
  },
] as const
