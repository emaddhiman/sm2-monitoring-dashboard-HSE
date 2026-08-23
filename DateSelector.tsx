'use client'
import { FISCAL_MONTHS } from '@/lib/calculations'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const YEARS = Array.from({ length: 16 }, (_, i) => 2020 + i) // 2020 to 2035

interface Props {
  selectedYear: number
  selectedMonth: string
  onYearChange: (year: number) => void
  onMonthChange: (month: string) => void
}

export default function DateSelector({ selectedYear, selectedMonth, onYearChange, onMonthChange }: Props) {
  // Convert month name to 2-digit index (01..12) for input[type="month"]
  const monthIdx = MONTH_NAMES.indexOf(selectedMonth) + 1
  const monthStr = monthIdx > 0 ? String(monthIdx).padStart(2, '0') : '07'
  const calendarValue = `${selectedYear}-${monthStr}`

  const handleCalendarChange = (val: string) => {
    if (!val) return
    const [y, m] = val.split('-')
    const yearNum = parseInt(y, 10)
    const monthNum = parseInt(m, 10) - 1
    if (!isNaN(yearNum)) onYearChange(yearNum)
    if (monthNum >= 0 && monthNum < 12) onMonthChange(MONTH_NAMES[monthNum])
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      {/* Direct Calendar Picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568' }}>📅 Date Picker:</label>
        <input
          type="month"
          value={calendarValue}
          onChange={e => handleCalendarChange(e.target.value)}
          style={{
            padding: '4px 8px',
            border: '1px solid #d0d7de',
            borderRadius: 4,
            fontSize: 13,
            fontFamily: 'inherit',
            background: '#fff',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* Separate Year Selection */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568' }}>Year:</label>
        <select
          value={selectedYear}
          onChange={e => onYearChange(parseInt(e.target.value, 10))}
          style={{
            padding: '5px 10px',
            border: '1px solid #d0d7de',
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          {YEARS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Separate Month Selection */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568' }}>Month:</label>
        <select
          value={selectedMonth}
          onChange={e => onMonthChange(e.target.value)}
          style={{
            padding: '5px 10px',
            border: '1px solid #d0d7de',
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          {FISCAL_MONTHS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
