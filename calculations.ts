export const FISCAL_MONTHS = [
  'July', 'August', 'September', 'October', 'November', 'December',
  'January', 'February', 'March', 'April', 'May', 'June'
] as const

export type FiscalMonth = typeof FISCAL_MONTHS[number]

export const DEPARTMENTS = [
  'Electrical', 'Mechanical', 'SP', 'Admin', 'RM-YARD', 'MML', 'QCM', 'CCM', 'SMS'
] as const

export type Department = typeof DEPARTMENTS[number]

export const FAULT_TYPES = [
  'Not Closed',
  'Emergency Number N/F',
  'Receiver Name N/F',
  'Issuer Name N/F',
  'Supervisor name N/F',
  'Fire Watcher Sign Missing',
  'Location In charge Name N/F',
  'Plant/Department head sign N/F',
  'Receiving Dept. Name N/F',
  'Job Location N/F',
  'Issuing Dept. Name N/F',
  'Location In charge Sign N/F',
  'Other'
] as const

export type FaultType = typeof FAULT_TYPES[number]

export interface DeptRow {
  department: string
  permitsIssued: number
  permitsReceived: number
  permitsClosed: number
  permitsWithFaults: number
  // calculated
  permitsNotClosed: number
  totalFaults: number
  ptwClosurePct: number | null
  faultPct: number | null
}

/**
 * All calculated fields derived from raw inputs.
 * This is the single source of truth for the formulas.
 */
export function calculateRow(
  issued: number,
  received: number,
  closed: number,
  withFaults: number
): {
  permitsNotClosed: number
  totalFaults: number
  ptwClosurePct: number | null
  faultPct: number | null
} {
  const permitsNotClosed = received - closed
  const totalFaults = permitsNotClosed + withFaults
  const ptwClosurePct = received > 0 ? closed / received : null
  const faultPct = issued > 0 ? totalFaults / issued : null

  return { permitsNotClosed, totalFaults, ptwClosurePct, faultPct }
}

/**
 * Compute the Total row from an array of dept rows.
 * Closure% and Fault% are computed from summed totals, NOT averaged.
 */
export function calculateTotals(rows: DeptRow[]): DeptRow {
  const issued = rows.reduce((s, r) => s + r.permitsIssued, 0)
  const received = rows.reduce((s, r) => s + r.permitsReceived, 0)
  const closed = rows.reduce((s, r) => s + r.permitsClosed, 0)
  const withFaults = rows.reduce((s, r) => s + r.permitsWithFaults, 0)
  const calc = calculateRow(issued, received, closed, withFaults)

  return {
    department: 'Total',
    permitsIssued: issued,
    permitsReceived: received,
    permitsClosed: closed,
    permitsWithFaults: withFaults,
    ...calc,
  }
}

export function fmtPct(val: number | null): string {
  if (val === null) return '-'
  return (val * 100).toFixed(1) + '%'
}
