import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'
import { DEPARTMENTS, FAULT_TYPES } from '@/lib/calculations'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['data_entry', 'admin'].includes((session.user as { role?: string }).role ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { year, month, deptData, faultData } = body

  if (!year || !month || !deptData || !faultData) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  for (const dept of DEPARTMENTS) {
    const row = deptData[dept]
    if (!row) continue
    await prisma.monthlyPermitLog.upsert({
      where: { year_month_department: { year, month, department: dept } },
      update: {
        permitsIssued: Math.max(0, parseInt(row.issued) || 0),
        permitsReceived: Math.max(0, parseInt(row.received) || 0),
        permitsClosed: Math.max(0, parseInt(row.closed) || 0),
        permitsWithFaults: Math.max(0, parseInt(row.withFaults) || 0),
      },
      create: {
        year, month, department: dept,
        permitsIssued: Math.max(0, parseInt(row.issued) || 0),
        permitsReceived: Math.max(0, parseInt(row.received) || 0),
        permitsClosed: Math.max(0, parseInt(row.closed) || 0),
        permitsWithFaults: Math.max(0, parseInt(row.withFaults) || 0),
      },
    })
  }

  for (const ft of FAULT_TYPES) {
    const count = Math.max(0, parseInt(faultData[ft]) || 0)
    await prisma.faultTypeLog.upsert({
      where: { year_month_faultType: { year, month, faultType: ft } },
      update: { count },
      create: { year, month, faultType: ft, count },
    })
  }

  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() })
}
