'use client'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList
} from 'recharts'

interface TrendPoint {
  month: string
  ptwClosurePct: number | null
  faultPct: number | null
}

interface Props { data: TrendPoint[] }

const CustomLabel = (props: { x?: number; y?: number; value?: number | string }) => {
  const { x = 0, y = 0, value } = props
  if (value === null || value === undefined) return null
  return (
    <text x={x} y={y - 4} fill="#333" fontSize={9} fontWeight={600} textAnchor="middle">
      {value}%
    </text>
  )
}

export default function ClosureVsFaultChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
        <YAxis
          yAxisId="left"
          tickFormatter={v => `${v}%`}
          domain={[0, 110]}
          tick={{ fontSize: 10 }}
          label={{ value: 'Closure %', angle: -90, position: 'insideLeft', fontSize: 10, offset: 10 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={v => `${v}%`}
          domain={[0, 50]}
          tick={{ fontSize: 10 }}
          label={{ value: 'Fault %', angle: 90, position: 'insideRight', fontSize: 10, offset: 10 }}
        />
        <Tooltip formatter={(v: any) => `${v}%`} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar yAxisId="left" dataKey="ptwClosurePct" name="PTW Closure %" fill="#FFC000" maxBarSize={28}>
          <LabelList dataKey="ptwClosurePct" content={<CustomLabel />} />
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="faultPct"
          name="Fault %"
          stroke="#F4C99C"
          strokeWidth={2}
          dot={{ r: 3, fill: '#F4C99C' }}
        >
          <LabelList dataKey="faultPct" content={<CustomLabel />} />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  )
}
