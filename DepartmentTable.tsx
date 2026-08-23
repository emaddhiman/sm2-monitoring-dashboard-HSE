import { calculateTotals, fmtPct } from '@/lib/calculations'

interface DeptRow {
  department: string
  permitsIssued: number
  permitsReceived: number
  permitsClosed: number
  permitsWithFaults: number
  permitsNotClosed: number
  totalFaults: number
  ptwClosurePct: number | null
  faultPct: number | null
}

interface Props { rows: DeptRow[] }

export default function DepartmentTable({ rows }: Props) {
  const total = calculateTotals(rows)

  const renderRow = (row: DeptRow, index: number, isTotal = false) => (
    <tr key={row.department} className={isTotal ? 'total-row' : ''}>
      {!isTotal && <td>{index + 1}</td>}
      {isTotal && <td colSpan={1} style={{ textAlign: 'left', fontWeight: 700 }}>&nbsp;</td>}
      <td className="dept-name">{row.department}</td>
      <td className="cell-count">{row.permitsIssued}</td>
      <td className="cell-count">{row.permitsReceived}</td>
      <td className="cell-count">{row.permitsClosed}</td>
      <td className="cell-count">{row.permitsNotClosed}</td>
      <td className="cell-pct">{fmtPct(row.ptwClosurePct)}</td>
      <td className="cell-count">{row.permitsWithFaults}</td>
      <td className="cell-count">{row.totalFaults}</td>
      <td className="cell-pct">{fmtPct(row.faultPct)}</td>
    </tr>
  )

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="ptw-table">
        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Department</th>
            <th>Issued</th>
            <th>Received</th>
            <th>Closed</th>
            <th>Not Closed</th>
            <th>PTW Closure %</th>
            <th>With Faults</th>
            <th>Total Faults</th>
            <th>Fault %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => renderRow(row, i))}
          {renderRow(total, -1, true)}
        </tbody>
      </table>
    </div>
  )
}
