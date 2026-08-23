'use client'
import { useState, useEffect } from 'react'
import DepartmentTable from '@/components/panels/DepartmentTable'
import ClosureVsFaultChart from '@/components/panels/ClosureVsFaultChart'
import MonthFaultParetoChart from '@/components/panels/MonthFaultParetoChart'
import YearToDateDeptParetoChart from '@/components/panels/YearToDateDeptParetoChart'
import DateSelector from '@/components/DateSelector'

interface Props {
  initialMonth: string
  initialYear: number
}

export default function DashboardClient({ initialMonth, initialYear }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth)
  const [selectedYear, setSelectedYear] = useState(initialYear)
  const [data, setData] = useState<{
    deptRows: unknown[]
    yearTrend: unknown[]
    faultPareto: unknown[]
    ytdDeptFault: unknown[]
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/ptw?year=${selectedYear}&month=${selectedMonth}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedMonth, selectedYear])

  return (
    <div className="register-wrapper">
      <div className="register-card">
        {/* Title Banner */}
        <div className="register-title-banner">
          <div className="register-title-banner__title">
            Permit to Work Register
          </div>
          <div className="register-title-banner__controls">
            <span className="register-title-banner__year-label" style={{ fontWeight: 700, color: '#4472C4' }}>
              FY {selectedYear}/{String(selectedYear + 1).slice(2)}
            </span>
            <DateSelector
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
            />
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>Loading…</div>
        )}

        {data && !loading && (
          <div className="register-grid">
            {/* Top Left — Department Table */}
            <div className="register-panel">
              <div className="register-panel__header">
                Department-wise PTW Register — {selectedMonth} {selectedYear}
              </div>
              <div className="register-panel__body">
                <DepartmentTable rows={data.deptRows as Parameters<typeof DepartmentTable>[0]['rows']} />
              </div>
            </div>

            {/* Top Right — Closure vs Fault Trend */}
            <div className="register-panel">
              <div className="register-panel__header">
                PTW Closure Vs Fault Pareto (FY {selectedYear}/{String(selectedYear + 1).slice(2)})
              </div>
              <div className="register-panel__body">
                <ClosureVsFaultChart data={data.yearTrend as Parameters<typeof ClosureVsFaultChart>[0]['data']} />
              </div>
            </div>

            {/* Bottom Left — Monthly Fault Pareto */}
            <div className="register-panel">
              <div className="register-panel__header">
                Fault Pareto — {selectedMonth} {selectedYear}
              </div>
              <div className="register-panel__body">
                <MonthFaultParetoChart
                  data={data.faultPareto as Parameters<typeof MonthFaultParetoChart>[0]['data']}
                  month={selectedMonth}
                />
              </div>
            </div>

            {/* Bottom Right — YTD Dept Pareto */}
            <div className="register-panel">
              <div className="register-panel__header">
                Department Wise Fault Pareto — YTD ({selectedYear})
              </div>
              <div className="register-panel__body">
                <YearToDateDeptParetoChart
                  data={data.ytdDeptFault as Parameters<typeof YearToDateDeptParetoChart>[0]['data']}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
