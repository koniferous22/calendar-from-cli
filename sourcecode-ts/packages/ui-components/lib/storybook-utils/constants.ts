const now = new Date()
export const commonTimestamps = {
  now,
  today: now,
  yesterday: new Date(now.getTime() - 24 * 60 * 60 * 1000),
  tomorrow: new Date(now.getTime() + 24 * 60 * 60 * 1000),
}

export const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
