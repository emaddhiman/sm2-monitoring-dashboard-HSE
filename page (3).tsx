'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DEPARTMENTS, FAULT_TYPES, calculateRow, fmtPct } from '@/lib/calculations'
import DateSelector from '@/components/DateSelector'

interface DeptEntry { issued: string; received: string; closed: string; withFaults: string }

function emptyDeptRow(): DeptEntry { return { issued: '0', received: '0', closed: '0', withFaults: '0' } }

export default function EntryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [selectedYear, setSelectedYear] = useState<number>(2025)
  const [selectedMonth, setSelectedMonth] = useState<string>('July')
  const [deptData, setDeptData] = useState<Record<string, DeptEntry>>(
    Object.fromEntries(DEPARTMENTS.map(d => [d, emptyDeptRow()]))
  )
  const [faultData, setFaultData] = useState<Record<string, string>>(
    Object.fromEntries(FAULT_TYPES.map(ft => [ft, '0']))
  )
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [loadError, setLoadError] = useState('')

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  // Load existing data when month or year changes
  const loadData = useCallback(() => {
    setLoadError('')
    fetch(`/api/ptw?year=${selectedYear}&month=${selectedMonth}`)
      .then(r => r.json())
      .then(d => {
        if (d.deptRows) {
          const newDept: Record<string, DeptEntry> = {}
          for (const row of d.deptRows) {
            newDept[row.department] = {
              issued: String(row.permitsIssued),
              received: String(row.permitsReceived),
              closed: String(row.permitsClosed),
              withFaults: String(row.permitsWithFaults),
            }
          }
          setDeptData(prev => {
            const merged = { ...Object.fromEntries(DEPARTMENTS.map(d => [d, emptyDeptRow()])) }
            for (const dept of DEPARTMENTS) {
              if (newDept[dept]) merged[dept] = newDept[dept]
            }
            return merged
          })
        }
        if (d.faultPareto) {
          const newFaults: Record<string, string> = {}
          for (const f of d.faultPareto) {
            newFaults[f.faultType] = String(f.count)
          }
          setFaultData(prev => {
            const merged = { ...Object.fromEntries(FAULT_TYPES.map(ft => [ft, '0'])) }
            for (const ft of FAULT_TYPES) {
              if (newFaults[ft] !== undefined) merged[ft] = newFaults[ft]
            }
            return merged
          })
        }
      })
      .catch(() => setLoadError('Could not load existing data for this selection.'))
  }, [selectedYear, selectedMonth])

  useEffect(() => { if (status === 'authenticated') loadData() }, [selectedYear, selectedMonth, status, loadData])

  const updateDept = (dept: string, field: keyof DeptEntry, value: string) => {
    setDeptData(prev => ({ ...prev, [dept]: { ...prev[dept], [field]: value } }))
    setSavedAt(null)
  }

  const updateFault = (ft: string, value: string) => {
    setFaultData(prev => ({ ...prev, [ft]: value }))
    setSavedAt(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setSavedAt(null)
    const res = await fetch('/api/ptw/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: selectedYear, month: selectedMonth, deptData, faultData }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.ok) {
      setSavedAt(new Date(data.savedAt).toLocaleTimeString())
    }
  }

  if (status === 'loading') return <div style={{ padding: 20 }}>Loading…</div>
  if (status === 'unauthenticated') return null

  return (
    <div className="entry-page">
      <div className="entry-page__header">
        <div>
          <h1 className="entry-page__title">PTW Data Entry</h1>
          <p style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
            Logged in as <strong>{session?.user?.name}</strong> — Entry for <strong>{selectedMonth} {selectedYear}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <DateSelector
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />
          <button id="save-btn" className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save'}
          </button>
        </div>
      </div>

      {loadError && <div className="error-banner" style={{ marginBottom: 12 }}>{loadError}</div>}
      {savedAt && <div className="success-banner" style={{ marginBottom: 12 }}>✅ Saved for {selectedMonth} {selectedYear} at {savedAt}</div>}

      {/* Department Entry Table */}
      <div className="entry-section card" style={{ padding: 16, marginBottom: 20 }}>
        <div className="entry-section__title">Department-wise Permit Data ({selectedMonth} {selectedYear})</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="entry-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Issued</th>
                <th>Received</th>
                <th>Closed</th>
                <th>With Faults</th>
                <th>Not Closed</th>
                <th>PTW Closure %</th>
                <th>Fault %</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENTS.map(dept => {
                const row = deptData[dept]
                const issued = parseInt(row.issued) || 0
                const received = parseInt(row.received) || 0
                const closed = parseInt(row.closed) || 0
                const withFaults = parseInt(row.withFaults) || 0
                const calc = calculateRow(issued, received, closed, withFaults)
                const closedWarn = closed > received && received > 0

                return (
                  <tr key={dept}>
                    <td>{dept}</td>
                    <td>
                      <input
                        type="number" min={0} id={`issued-${dept}`}
                        value={row.issued}
                        onChange={e => updateDept(dept, 'issued', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number" min={0} id={`received-${dept}`}
                        value={row.received}
                        onChange={e => updateDept(dept, 'received', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number" min={0} id={`closed-${dept}`}
                        value={row.closed}
                        className={closedWarn ? 'warning' : ''}
                        title={closedWarn ? 'Closed exceeds Received — please verify' : undefined}
                        onChange={e => updateDept(dept, 'closed', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number" min={0} id={`faults-${dept}`}
                        value={row.withFaults}
                        onChange={e => updateDept(dept, 'withFaults', e.target.value)}
                      />
                    </td>
                    <td className="readonly-cell">{calc.permitsNotClosed}</td>
                    <td className="readonly-cell">{fmtPct(calc.ptwClosurePct)}</td>
                    <td className="readonly-cell">{fmtPct(calc.faultPct)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
          ⚠️ Fields highlighted in orange indicate data anomalies — save is still allowed to reflect real edge cases.
        </p>
      </div>

      {/* Fault Type Entry Table */}
      <div className="entry-section card" style={{ padding: 16 }}>
        <div className="entry-section__title">Fault Type Counts ({selectedMonth} {selectedYear})</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="entry-table">
            <thead>
              <tr>
                <th>Fault Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {FAULT_TYPES.map(ft => (
                <tr key={ft}>
                  <td style={{ textAlign: 'left', minWidth: 240 }}>{ft}</td>
                  <td>
                    <input
                      type="number" min={0} id={`fault-${ft.replace(/[^a-z0-9]/gi, '-')}`}
                      value={faultData[ft]}
                      onChange={e => updateFault(ft, e.target.value)}
                      style={{ width: 80 }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
        <a href="/" className="btn btn--secondary">View Dashboard</a>
        <button id="save-btn-bottom" className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : '💾 Save All'}
        </button>
      </div>
    </div>
  )
}
