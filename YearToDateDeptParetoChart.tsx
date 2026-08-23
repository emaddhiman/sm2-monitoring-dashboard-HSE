'use client'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList
} from 'recharts'

interface DeptPoint {
  department: string
  faultPct: number
  cumulativePct: number | null
}

interface Props { data: DeptPoint[] }

const FaultLabel = (props: { x?: number; y?: number; value?: number | string }) => {
  const { x = 0, y = 0, value } = props
  if (value === null || value === undefined) return null
  return (
    <text x={x} y={y - 3} fill="#333" fontSize={9} fontWeight={600} textAnchor="middle">
      {value}%
    </text>
  )
}

const CumLabel = (props: { x?: number; y?: number; value?: number | string }) => {
  const { x = 0, y = 0, value } = props
  if (value === null || value === undefined) return null
  return (
    <text x={x} y={y - 3} fill="#8B5E00" fontSize={8} fontWeight={600} textAnchor="middle">
      {value}%
    </text>
  )
}

export default function YearToDateDeptParetoChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="department" tick={{ fontSize: 10 }} />
        <YAxis
          yAxisId="left"
          tickFormatter={v => `${v}%`}
          tick={{ fontSize: 10 }}
          label={{ value: 'Fault %', angle: -90, position: 'insideLeft', fontSize: 10 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={v => `${v}%`}
          tick={{ fontSize: 10 }}
          label={{ value: 'Cumulative %', angle: 90, position: 'insideRight', fontSize: 10 }}
        />
        <Tooltip formatter={(v: any) => `${v}%`} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar yAxisId="left" dataKey="faultPct" name="Fault %" fill="#FFC000" maxBarSize={32}>
          <LabelList dataKey="faultPct" content={<FaultLabel />} />
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
          <LabelList dataKey="cumulativePct" content={<CumLabel />} />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  )
}
