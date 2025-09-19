import React from 'react'

// Simple SVG pie chart component
// data: [{ label, value, color }]
export const PieChart = ({ data = [], size = 220, stroke = 24, legend = true }) => {
  const total = data.reduce((s, d) => s + (d.value || 0), 0)
  const radius = (size / 2) - stroke / 2
  const center = size / 2

  let cumulative = 0
  const arcs = data.map((d, idx) => {
    const val = d.value || 0
    const fraction = total > 0 ? val / total : 0
    const startAngle = cumulative * 2 * Math.PI
    const endAngle = (cumulative + fraction) * 2 * Math.PI
    cumulative += fraction

    const x1 = center + radius * Math.sin(startAngle)
    const y1 = center - radius * Math.cos(startAngle)
    const x2 = center + radius * Math.sin(endAngle)
    const y2 = center - radius * Math.cos(endAngle)
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`
    ].join(' ')

    return { pathData, color: d.color || defaultColors[idx % defaultColors.length], label: d.label, value: val }
  })

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Base circle */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        {/* Arcs */}
        <g>
          {arcs.map((a, i) => (
            <path key={i} d={a.pathData} stroke={a.color} strokeWidth={stroke} fill="none" />
          ))}
        </g>
        {/* Center total */}
        <text x={center} y={center - 6} textAnchor="middle" className="fill-gray-900" style={{ fontWeight: 700, fontSize: 20 }}>
          {total ? `Rs ${total.toFixed(0)}` : 'No Data'}
        </text>
        <text x={center} y={center + 16} textAnchor="middle" className="fill-gray-500" style={{ fontSize: 12 }}>
          Total Spent
        </text>
      </svg>

      {legend && (
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.map((d, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color || defaultColors[i % defaultColors.length] }} />
                <span className="text-sm text-gray-700">{d.label}</span>
              </div>
              <div className="text-sm font-medium text-gray-900">Rs {Number(d.value || 0).toFixed(0)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const defaultColors = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#14b8a6', // teal-500
  '#f43f5e', // rose-500
  '#22c55e', // green-500
]

export default PieChart
