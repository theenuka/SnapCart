import React from 'react'

// Simple SVG area/line chart for monthly trend
// data: [{ label, value }], labels assumed chronological
export const TrendChart = ({ data = [], height = 220 }) => {
  const width = 540
  const padding = { left: 36, right: 16, top: 16, bottom: 28 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const maxV = Math.max(1, ...data.map(d => d.value || 0))
  const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW

  const points = data.map((d, i) => {
    const x = padding.left + i * stepX
    const y = padding.top + innerH - ((d.value || 0) / maxV) * innerH
    return { x, y }
  })

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${path} L ${padding.left + (data.length - 1) * stepX} ${padding.top + innerH} L ${padding.left} ${padding.top + innerH} Z`

  return (
    <svg width={width} height={height} className="w-full">
      {/* Grid */}
      <g>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={padding.left} x2={width - padding.right} y1={padding.top + innerH * (1 - t)} y2={padding.top + innerH * (1 - t)} stroke="#e5e7eb" strokeWidth={1} />
        ))}
      </g>

      {/* Area fill */}
      <path d={area} fill="#3b82f6" opacity={0.12} />
      {/* Line */}
      <path d={path} stroke="#3b82f6" strokeWidth={2} fill="none" />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#1d4ed8" />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text key={i} x={padding.left + i * stepX} y={height - 8} textAnchor="middle" className="fill-gray-500" style={{ fontSize: 10 }}>
          {d.label}
        </text>
      ))}
    </svg>
  )
}

export default TrendChart
