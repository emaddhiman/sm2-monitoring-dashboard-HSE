'use client'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList
} from 'recharts'

interface FaultPoint {
  faultType: string
  count: number
  cumulativePct: number | null
}

interface Props { data: FaultPoint[]; month: string }

const CountLabel = (props: { x?: number; y?: number; value?: number | string }) => {
  const { x = 0, y = 0, value } = props
  if (!value && value !== 0) return null
  return (
    <text x={x} y={y - 3} fill="#333" fontSize={9} fontWeight={600} textAnchor="middle">
      {value}
    </text>
  )
}

const PctLabel = (props: { x?: number; y?: number; value?: number | string }) => {
  const { x = 0, y = 0, value } = props
  if (value === null || value === undefined) return null
  return (
    <text x={x} y={y - 3} fill="#8B5E00" fontSize={8} fontWeight={600} textAnchor="middle">
      {value}%
    </text>
  )
}

function shortLabel(label: string) {
  if (label.length <= 12) return label
  return label.substring(0, 12) + '…'
}

export default function MonthFaultParetoChart({ data, month }: Props) {
  const chartData = data.map(d => ({ ...d, shortFaultType: shortLabel(d.faultType) }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={chartData} margin={{ top: 20, right: 40, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="shortFaultType" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" interval={0} />
        <YAxis
          yAxisId="left"
          allowDecimals={false}
          tick={{ fontSize: 10 }}
          label={{ value: 'Count', angle: -90, position: 'insideLeft', fontSize: 10 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={v => `${v}%`}
          tick={{ fontSize: 10 }}
          label={{ value: 'Cumulative %', angle: 90, position: 'insideRight', fontSize: 10 }}
        />
        <Tooltip formatter={(v: any, name: any) => name === 'Cumulative %' ? `${v}%` : v} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar yAxisId="left" dataKey="count" name="Count" fill="#FFC000" maxBarSize={28}>
          <LabelList dataKey="count" content={<CountLabel />} />
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cumulativePct"
          name="Cumulative %"
          stroke="#F4C99C"
          strokeWidth={2}
          dot={{ r: 3, fill: '#F4C99C' }}
        >
          <LabelList dataKey="cumulativePct" content={<PctLabel />} />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  )
}
