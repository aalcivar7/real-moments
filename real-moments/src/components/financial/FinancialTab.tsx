import { useState } from 'react'
import { Menu, GripVertical } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, LabelList,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import { formatCurrency, getMonthShortByIndex } from '../../utils/formatting'

const COLORS = ['#D8C3B6', '#A9B6AE', '#BFA6A0', '#6F8378', '#90b0d2', '#c8b4a8', '#e8d5cc', '#8fa89e']

const CURRENT_YEAR = new Date().getFullYear()

type ChartItem = { id: string; title: string }

const DEFAULT_ORDER: ChartItem[] = [
  { id: 'montajesPorMes', title: 'Montajes por mes' },
  { id: 'gananciaPorMes', title: 'Ganancia neta por mes' },
  { id: 'ingresoVsCostos', title: 'Ingreso vs Costos vs Ganancia' },
  { id: 'margenSubcategoria', title: 'Margen de ganancia por subcategoría' },
  { id: 'gananciaPorPaquete', title: 'Ganancia neta por paquete' },
  { id: 'ingresosPorPaquete', title: 'Ingresos por paquete' },
  { id: 'montajesTipoEvento', title: 'Montajes por tipo de evento' },
  { id: 'addOnsVendidos', title: 'Add-ons más vendidos' },
  { id: 'impactoAddOns', title: 'Impacto de Add-ons en ingresos' },
  { id: 'montajesPorSector', title: 'Montajes por sector' },
  { id: 'costosPorRubro', title: 'Costo total de montajes por rubro' },
  { id: 'statusPago', title: 'Status de pagos' },
]

export const FinancialTab = () => {
  const { state } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [chartOrder, setChartOrder] = useState<ChartItem[]>(DEFAULT_ORDER)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const montajes = state.montajes

  const thisYearMontajes = montajes.filter(m => new Date(m.fecha + 'T12:00:00').getFullYear() === CURRENT_YEAR)
  const totalGanancia = thisYearMontajes.reduce((s, m) => s + m.gananciaNeta, 0)
  const uniqueClients = new Set(thisYearMontajes.map(m => m.cliente)).size

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const ms = montajes.filter(m => {
      const d = new Date(m.fecha + 'T12:00:00')
      return d.getFullYear() === CURRENT_YEAR && d.getMonth() === i
    })
    return {
      mes: getMonthShortByIndex(i),
      montajes: ms.length,
      ingreso: ms.reduce((s, m) => s + m.ingresoTotal, 0),
      costos: ms.reduce((s, m) => s + m.costosMontaje, 0),
      ganancia: ms.reduce((s, m) => s + m.gananciaNeta, 0),
    }
  })

  const subMargin: Record<string, { ingreso: number; ganancia: number }> = {}
  montajes.forEach(m => {
    const k = m.subcategoria || 'Sin subcategoría'
    if (!subMargin[k]) subMargin[k] = { ingreso: 0, ganancia: 0 }
    subMargin[k].ingreso += m.ingresoTotal
    subMargin[k].ganancia += m.gananciaNeta
  })
  const margenSubData = Object.entries(subMargin)
    .map(([name, v]) => ({ name, margen: v.ingreso > 0 ? Math.round((v.ganancia / v.ingreso) * 100) : 0 }))
    .sort((a, b) => b.margen - a.margen)

  const pkgGanancia: Record<string, { total: number; count: number }> = {}
  montajes.forEach(m => {
    const k = m.paquete || 'Sin paquete'
    if (!pkgGanancia[k]) pkgGanancia[k] = { total: 0, count: 0 }
    pkgGanancia[k].total += m.gananciaNeta
    pkgGanancia[k].count += 1
  })
  const pkgGananciaData = Object.entries(pkgGanancia)
    .map(([name, v]) => ({ name, ganancia: Math.round(v.total / v.count) }))
    .sort((a, b) => b.ganancia - a.ganancia)

  const pkgIngreso: Record<string, number> = {}
  montajes.forEach(m => { const k = m.paquete || 'Sin paquete'; pkgIngreso[k] = (pkgIngreso[k] ?? 0) + m.ingresoTotal })
  const pkgIngresoData = Object.entries(pkgIngreso).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const tipoEventoFreq: Record<string, number> = {}
  montajes.forEach(m => { if (m.tipoEvento) tipoEventoFreq[m.tipoEvento] = (tipoEventoFreq[m.tipoEvento] ?? 0) + 1 })
  const tipoEventoData = Object.entries(tipoEventoFreq).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const addOnsFreq: Record<string, number> = {}
  montajes.forEach(m => {
    if (m.addOns) m.addOns.split(',').forEach(a => { const t = a.trim(); if (t) addOnsFreq[t] = (addOnsFreq[t] ?? 0) + 1 })
  })
  const addOnsData = Object.entries(addOnsFreq).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8)

  const addOnsImpact: Record<string, { conAddOns: number; sinAddOns: number; countCon: number; countSin: number }> = {}
  montajes.forEach(m => {
    const k = m.subcategoria || 'Sin subcategoría'
    if (!addOnsImpact[k]) addOnsImpact[k] = { conAddOns: 0, sinAddOns: 0, countCon: 0, countSin: 0 }
    const ingreso = m.precioPaquete + m.precioTotalAddOns
    if (m.precioTotalAddOns > 0) { addOnsImpact[k].conAddOns += ingreso; addOnsImpact[k].countCon++ }
    else { addOnsImpact[k].sinAddOns += ingreso; addOnsImpact[k].countSin++ }
  })
  const addOnsImpactData = Object.entries(addOnsImpact).map(([name, v]) => ({
    name,
    conAddOns: v.countCon > 0 ? Math.round(v.conAddOns / v.countCon) : 0,
    sinAddOns: v.countSin > 0 ? Math.round(v.sinAddOns / v.countSin) : 0,
  }))

  const sectorFreq: Record<string, number> = {}
  montajes.forEach(m => { if (m.sector) sectorFreq[m.sector] = (sectorFreq[m.sector] ?? 0) + 1 })
  const sectorData = Object.entries(sectorFreq).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const rubrosFreq: Record<string, number> = {}
  montajes.forEach(m => {
    if (m.rubrosCostos) m.rubrosCostos.split(',').forEach(r => { const t = r.trim(); if (t) rubrosFreq[t] = (rubrosFreq[t] ?? 0) + m.costosMontaje / Math.max(1, m.rubrosCostos.split(',').length) })
  })
  const rubrosData = Object.entries(rubrosFreq).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value)

  const statusFreq: Record<string, number> = {}
  montajes.forEach(m => { if (m.statusPago) statusFreq[m.statusPago] = (statusFreq[m.statusPago] ?? 0) + 1 })
  const statusData = Object.entries(statusFreq).map(([name, value]) => ({ name, value }))

  const handleDrop = (toIdx: number) => {
    if (dragIdx === null || dragIdx === toIdx) { setDragIdx(null); setDragOver(null); return }
    const newOrder = [...chartOrder]
    const [moved] = newOrder.splice(dragIdx, 1)
    newOrder.splice(toIdx, 0, moved)
    setChartOrder(newOrder)
    setDragIdx(null)
    setDragOver(null)
  }

  const renderChart = (id: string) => {
    const chartProps = { margin: { top: 4, right: 4, bottom: 4, left: -10 } }
    const tickStyle = { fontSize: 10 }
    const tooltipStyle = { fontSize: 10, borderRadius: 8, border: '1px solid #e5e7eb' }

    switch (id) {
      case 'montajesPorMes':
        return (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
              <XAxis dataKey="mes" tick={tickStyle} />
              <YAxis tick={tickStyle} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="montajes" fill="#A9B6AE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'gananciaPorMes':
        return (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={monthlyData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
              <XAxis dataKey="mes" tick={tickStyle} />
              <YAxis tick={tickStyle} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="ganancia" stroke="#6F8378" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )
      case 'ingresoVsCostos':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
              <XAxis dataKey="mes" tick={tickStyle} />
              <YAxis tick={tickStyle} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="ingreso" name="Ingreso total" fill="#6F8378" radius={[3, 3, 0, 0]} />
              <Bar dataKey="costos" name="Costos" fill="#90b0d2" radius={[3, 3, 0, 0]} />
              <Bar dataKey="ganancia" name="Ganancia neta" fill="#A9B6AE" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'margenSubcategoria':
        return (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={margenSubData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
              <XAxis dataKey="name" tick={tickStyle} />
              <YAxis tick={tickStyle} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="margen" fill="#BFA6A0" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="margen" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 9 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )
      case 'gananciaPorPaquete':
        return (
          <ResponsiveContainer width="100%" height={Math.max(120, pkgGananciaData.length * 28)}>
            <BarChart data={pkgGananciaData} layout="vertical" {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
              <XAxis type="number" tick={tickStyle} tickFormatter={v => `$${v}`} />
              <YAxis type="category" dataKey="name" tick={tickStyle} width={70} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="ganancia" fill="#A9B6AE" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'ingresosPorPaquete':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pkgIngresoData} cx="50%" cy="50%" outerRadius={65} dataKey="value" nameKey="name">
                {pkgIngresoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} formatter={(v: number) => formatCurrency(v)} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        )
      case 'montajesTipoEvento':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={tipoEventoData} cx="50%" cy="50%" outerRadius={65} dataKey="value" nameKey="name">
                {tipoEventoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        )
      case 'addOnsVendidos':
        return addOnsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={addOnsData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
              <XAxis dataKey="name" tick={tickStyle} />
              <YAxis tick={tickStyle} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" name="Frecuencia" fill="#D8C3B6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState />
      case 'impactoAddOns':
        return (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={addOnsImpactData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
              <XAxis dataKey="name" tick={tickStyle} />
              <YAxis tick={tickStyle} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="conAddOns" name="Con Add-ons" fill="#6F8378" radius={[3, 3, 0, 0]} />
              <Bar dataKey="sinAddOns" name="Sin Add-ons" fill="#A9B6AE" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'montajesPorSector':
        return (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={sectorData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
              <XAxis dataKey="name" tick={tickStyle} />
              <YAxis tick={tickStyle} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" name="Montajes" fill="#BFA6A0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'costosPorRubro':
        return rubrosData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={rubrosData} cx="50%" cy="50%" outerRadius={65} dataKey="value" nameKey="name">
                {rubrosData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} formatter={(v: number) => formatCurrency(v)} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : <EmptyState />
      case 'statusPago':
        return (
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={60} dataKey="value" nameKey="name">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <div className="pb-20 px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-gellatio text-2xl text-neutral-800 dark:text-neutral-100">Finanzas de Real Moments</h1>
        <button onClick={() => setMenuOpen(true)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
          <Menu size={20} className="text-neutral-500" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <SnapCard label="Ganancia neta" value={formatCurrency(totalGanancia)} sub={`${CURRENT_YEAR}`} />
        <SnapCard label="Montajes" value={String(thisYearMontajes.length)} sub={`${CURRENT_YEAR}`} />
        <SnapCard label="Clientes únicos" value={String(uniqueClients)} sub={`${CURRENT_YEAR}`} />
      </div>

      <div className="space-y-3">
        {chartOrder.map((chart, i) => (
          <div
            key={chart.id}
            draggable={menuOpen}
            onDragStart={() => setDragIdx(i)}
            onDragOver={e => { e.preventDefault(); setDragOver(i) }}
            onDrop={() => handleDrop(i)}
            onDragEnd={() => { setDragIdx(null); setDragOver(null) }}
            className={`bg-white dark:bg-neutral-800 rounded-2xl border p-4 transition-all ${
              dragOver === i ? 'border-sage shadow-md' : 'border-gray-100 dark:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {menuOpen && <GripVertical size={14} className="text-neutral-300 cursor-grab" />}
              <p className="font-title text-sm text-neutral-600 dark:text-neutral-300">{chart.title}</p>
            </div>
            {renderChart(chart.id)}
          </div>
        ))}
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div className="bg-white dark:bg-neutral-900 h-full w-72 shadow-2xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-title text-base text-neutral-700 dark:text-neutral-200 mb-4">Reordenar gráficos</h3>
            <p className="text-xs text-neutral-400 mb-4">Arrastra los gráficos en el dashboard para reordenarlos. Cierra este panel cuando termines.</p>
            <div className="space-y-2">
              {chartOrder.map((c, i) => (
                <div key={c.id} className="flex items-center gap-2 p-2 rounded-xl bg-off-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700">
                  <GripVertical size={14} className="text-neutral-400" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-300">{i + 1}. {c.title}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setMenuOpen(false)} className="mt-6 w-full py-2 bg-forest text-white rounded-xl text-sm hover:bg-sage transition-colors">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}

const SnapCard = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 p-3 text-center">
    <p className="text-sm font-semibold text-forest dark:text-sage leading-tight">{value}</p>
    <p className="text-[9px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">{label}</p>
    <p className="text-[8px] text-neutral-300 dark:text-neutral-600">{sub}</p>
  </div>
)

const EmptyState = () => (
  <div className="h-24 flex items-center justify-center">
    <p className="text-xs text-neutral-300">Sin datos suficientes</p>
  </div>
)
