export const OPERATIONAL_TIMEZONE = 'Europe/Rome'

export interface OperationalRecurringPattern {
  type: 'daily' | 'weekly' | 'monthly'
  interval: number
  endDate?: string
}

interface WallClock {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: OPERATIONAL_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

const partsInRome = (date: Date): WallClock => {
  const values = Object.fromEntries(
    formatter.formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, Number(part.value)])
  )
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  }
}

const wallClockToUtc = (wall: WallClock): Date => {
  const desired = Date.UTC(
    wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second
  )
  let candidate = desired
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const actual = partsInRome(new Date(candidate))
    const rendered = Date.UTC(
      actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second
    )
    const correction = desired - rendered
    if (correction === 0) return new Date(candidate)
    candidate += correction
  }
  throw new Error('nonexistent Europe/Rome local time')
}

export const parseOperationalDate = (value: string): Date => {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnly) {
    return wallClockToUtc({
      year: Number(dateOnly[1]),
      month: Number(dateOnly[2]),
      day: Number(dateOnly[3]),
      hour: 0,
      minute: 0,
      second: 0,
    })
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) throw new Error('invalid recurrence date')
  return parsed
}

export const parseOperationalRangeEnd = (value: string): Date => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return parseOperationalDate(value)
  const start = partsInRome(parseOperationalDate(value))
  const next = nextWallClock(start, { type: 'daily', interval: 1 }, start.day)
  return new Date(wallClockToUtc(next).getTime() - 1)
}

const addMonthsClamped = (wall: WallClock, interval: number, anchorDay: number): WallClock => {
  const target = new Date(Date.UTC(wall.year, wall.month - 1 + interval, 1))
  const year = target.getUTCFullYear()
  const month = target.getUTCMonth() + 1
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return { ...wall, year, month, day: Math.min(anchorDay, lastDay) }
}

const nextWallClock = (
  wall: WallClock,
  pattern: OperationalRecurringPattern,
  anchorDay: number
): WallClock => {
  if (pattern.type === 'monthly') return addMonthsClamped(wall, pattern.interval, anchorDay)
  const days = pattern.type === 'weekly' ? pattern.interval * 7 : pattern.interval
  const date = new Date(Date.UTC(
    wall.year, wall.month - 1, wall.day + days, wall.hour, wall.minute, wall.second
  ))
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: wall.hour,
    minute: wall.minute,
    second: wall.second,
  }
}

export const calculateOperationalOccurrences = (
  startDate: string,
  pattern: OperationalRecurringPattern,
  rangeStart?: string | null,
  rangeEnd?: string | null,
  maxOccurrences = 100
): string[] => {
  if (!Number.isInteger(pattern.interval) || pattern.interval < 1) {
    throw new Error('recurrence interval must be a positive integer')
  }

  const first = parseOperationalDate(startDate)
  const lower = rangeStart ? parseOperationalDate(rangeStart) : first
  const upper = rangeEnd
    ? parseOperationalRangeEnd(rangeEnd)
    : new Date(first.getTime() + 90 * 24 * 60 * 60 * 1000)
  const end = pattern.endDate ? parseOperationalRangeEnd(pattern.endDate) : null
  if (upper < lower) throw new Error('invalid recurrence range')

  const occurrences: string[] = []
  let wall = partsInRome(first)
  const anchorDay = wall.day
  for (let count = 0; count < maxOccurrences; count += 1) {
    const occurrence = wallClockToUtc(wall)
    if (occurrence > upper || (end && occurrence > end)) break
    if (occurrence >= lower) occurrences.push(occurrence.toISOString())
    wall = nextWallClock(wall, pattern, anchorDay)
  }
  return occurrences
}
