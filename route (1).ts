import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateRow } from '@/lib/calculations'
import { DEPARTMENTS, FAULT_TYPES, FISCAL_MONTHS } from '@/lib/calculations'

// GET /api/ptw?year=2025&month=July
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') ?? '2025')
  const month = searchParams.get('month') ?? 'July'

  // Fetch all months for the full-year trend panel
  const allLogs = await prisma.monthlyPermitLog.findMany({ where: { year } })
  const faultLogs = await prisma.faultTypeLog.findMany({ where: { year, month } })

  // Build department rows for the selected month
  const monthLogs = allLogs.filter(l => l.month === month)
  const deptRows = DEPARTMENTS.map(dept => {
    const log = monthLogs.find(l => l.department === dept)
    const issued = log?.permitsIssued ?? 0
    const received = log?.permitsReceived ?? 0
    const closed = log?.permitsClosed ?? 0
    const withFaults = log?.permitsWithFaults ?? 0
    const calc = calculateRow(issued, received, closed, withFaults)
    return { department: dept, permitsIssued: issued, permitsReceived: received, permitsClosed: closed, permitsWithFaults: withFaults, ...calc }
  })

  // Build full-year trend for the combo chart
  const yearTrend = FISCAL_MONTHS.map(m => {
    const monthRows = allLogs.filter(l => l.month === m)
    const totIssued = monthRows.reduce((s, l) => s + l.permitsIssued, 0)
    const totReceived = monthRows.reduce((s, l) => s + l.permitsReceived, 0)
    const totClosed = monthRows.reduce((s, l) => s + l.permitsClosed, 0)
    const totWithFaults = monthRows.reduce((s, l) => s + l.permitsWithFaults, 0)
    const calc = calculateRow(totIssued, totReceived, totClosed, totWithFaults)
    return {
      month: m,
      ptwClosurePct: calc.ptwClosurePct !== null ? +(calc.ptwClosurePct * 100).toFixed(2) : null,
      faultPct: calc.faultPct !== null ? +(calc.faultPct * 100).toFixed(2) : null,
    }
  })

  // Fault type pareto for selected month
  const faultPareto = FAULT_TYPES.map(ft => {
    const log = faultLogs.find(l => l.faultType === ft)
    return { faultType: ft, count: log?.count ?? 0 }
  }).sort((a, b) => b.count - a.count)

  // Add cumulative %
  const totalFaultCount = faultPareto.reduce((s, f) => s + f.count, 0)
  let cumulative = 0
  const faultParetoWithCumulative = faultPareto.map(f => {
    cumulative += f.count
    return { ...f, cumulativePct: totalFaultCount > 0 ? +(cumulative / totalFaultCount * 100).toFixed(1) : null }
  })

  // YTD dept fault pareto
  const ytdDeptFault = DEPARTMENTS.map(dept => {
    const deptLogs = allLogs.filter(l => l.department === dept)
    const totIssued = deptLogs.reduce((s, l) => s + l.permitsIssued, 0)
    const totReceived = deptLogs.reduce((s, l) => s + l.permitsReceived, 0)
    const totClosed = deptLogs.reduce((s, l) => s + l.permitsClosed, 0)
    const totWithFaults = deptLogs.reduce((s, l) => s + l.permitsWithFaults, 0)
    const calc = calculateRow(totIssued, totReceived, totClosed, totWithFaults)
    return { department: dept, faultPct: calc.faultPct !== null ? +(calc.faultPct * 100).toFixed(2) : 0 }
  }).sort((a, b) => b.faultPct - a.faultPct)

  let ytdCumulative = 0
  const ytdTotal = ytdDeptFault.reduce((s, d) => s + d.faultPct, 0)
  const ytdDeptFaultWithCumulative = ytdDeptFault.map(d => {
    ytdCumulative += d.faultPct
    return { ...d, cumulativePct: ytdTotal > 0 ? +(ytdCumulative / ytdTotal * 100).toFixed(1) : null }
  })

  return NextResponse.json({ deptRows, yearTrend, faultPareto: faultParetoWithCumulative, ytdDeptFault: ytdDeptFaultWithCumulative })
}
