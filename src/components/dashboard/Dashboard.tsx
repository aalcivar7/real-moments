import { useState } from 'react'
import { Menu, CalendarDays, TrendingUp, TrendingDown, Package, Clock, Heart, MapPin, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useApp } from '../../context/AppContext'
import { MenuDrawer } from '../layout/MenuDrawer'
import { UpcomingModal } from './UpcomingModal'
import { CalendarModal } from './CalendarModal'
import { PackagesModal } from './PackagesModal'
import { formatCurrency, getMonthShortByIndex } from '../../utils/formatting'

type ModalType = 'upcoming' | 'calendar' | 'packages' | 'menu' | null

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth()

export const Dashboard = () => {
  const { state } = useApp()
  const [modal, setModal] = useState<ModalType>(null)

  const thisMonthMontajes = state.montajes.filter(m => {
    const d = new Date(m.fecha + 'T12:00:00')
    return d.getFullYear() === CURRENT_YEAR && d.getMonth() === CURRENT_MONTH
  })

  const ingresosMes = thisMonthMontajes.reduce((s, m) => s + m.ingresoTotal, 0)
  const gastosMes = thisMonthMontajes.reduce((s, m) => s + m.costosMontaje, 0)

  const montajesPorMes = Array.from({ length: 12 }, (_, i) => {
    const count = state.montajes.filter(m => {
      const d = new Date(m.fecha + 'T12:00:00')
      return d.getFullYear() === CURRENT_YEAR && d.getMonth() === i
    }).length
    return { mes: getMonthShortByIndex(i), montajes: count }
  })

  const pkgFrequency: Record<string, number> = {}
  state.montajes.forEach(m => { if (m.paquete) pkgFrequency[m.paquete] = (pkgFrequency[m.paquete] ?? 0) + 1 })
  const pkgData = Object.entries(pkgFrequency).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6)

  const locationFreq: Record<string, number> = {}
  state.montajes.forEach(m => { if (m.sector) locationFreq[m.sector] = (locationFreq[m.sector] ?? 0) + 1 })
  const topLocation = Object.entries(locationFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const COLORS = ['#D8C3B6', '#A9B6AE', '#BFA6A0', '#6F8378', '#90b0d2', '#c8b4a8']

  const RADIAL_ITEMS = [
    { label: 'Upcoming\nmontajes', icon: Clock, clickable: true, type: 'upcoming' as const },
    { label: 'Calendario', icon: CalendarDays, clickable: true, type: 'calendar' as const },
    { label: 'Ingresos\nmensuales', icon: TrendingUp, clickable: false, value: ingresosMes },
    { label: 'Gastos\nmensuales', icon: TrendingDown, clickable: false, value: gastosMes },
    { label: 'Paquetes', icon: Package, clickable: true, type: 'packages' as const },
  ]

  const RADIUS = 112
  const CENTER = 140

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <h1 className="font-title text-2xl text-forest dark:text-sage">Real Moments</h1>
        <button onClick={() => setModal('menu')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
          <Menu size={20} className="text-neutral-500" />
        </button>
      </div>

      <div className="relative mx-auto" style={{ width: CENTER * 2, height: CENTER * 2 }}>
        <div
          className="absolute rounded-full bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 shadow-sm flex items-center justify-center"
          style={{ width: 80, height: 80, left: CENTER - 40, top: CENTER - 40 }}
        >
          <Heart size={32} strokeWidth={1.2} className="text-pale-pink" />
        </div>

        {RADIAL_ITEMS.map((item, i) => {
          const angle = ((-90 + i * 72) * Math.PI) / 180
          const x = CENTER + RADIUS * Math.cos(angle) - 52
          const y = CENTER + RADIUS * Math.sin(angle) - 46
          const Icon = item.icon

          return (
            <button
              key={i}
              disabled={!item.clickable}
              onClick={() => item.clickable && item.type && setModal(item.type)}
              className={`absolute w-[104px] h-[92px] rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all ${
                item.clickable
                  ? 'bg-white dark:bg-neutral-800 border-gray-100 dark:border-neutral-700 hover:border-sage hover:shadow-sm cursor-pointer active:scale-95'
                  : 'bg-off-white dark:bg-neutral-900 border-transparent cursor-default'
              }`}
              style={{ left: x, top: y }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.clickable ? 'bg-pale-pink/30' : 'bg-sage/20'}`}>
                <Icon size={16} strokeWidth={1.5} className={item.clickable ? 'text-forest' : 'text-sage'} />
              </div>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 text-center leading-tight whitespace-pre-line font-body">
                {item.label}
              </span>
              {!item.clickable && item.value !== undefined && (
                <span className="text-xs font-semibold text-forest dark:text-sage">{formatCurrency(item.value)}</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="px-5 space-y-4 mt-2">
        <p className="font-title text-sm text-neutral-400 uppercase tracking-wider">Dashboard</p>

        <StatRow
          items={[
            { label: 'Montajes este mes', value: String(thisMonthMontajes.length) },
            { label: 'Ganancia neta mes', value: formatCurrency(ingresosMes - gastosMes), color: 'text-forest' },
            { label: 'Total clientes', value: String(new Set(state.montajes.map(m => m.cliente)).size) },
          ]}
        />

        <ChartCard title="Montajes por mes">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={montajesPorMes} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="montajes" fill="#A9B6AE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="grid grid-cols-2 gap-3">
          <ChartCard title="Paquetes populares" compact>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={pkgData} cx="50%" cy="50%" outerRadius={50} dataKey="value" label={({ name }) => name} labelLine={false}>
                  {pkgData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="space-y-2">
            <StatCard label="Top sector" value={topLocation} icon={MapPin} />
            <StatCard label="Total montajes" value={String(state.montajes.length)} icon={Heart} />
            <StatCard
              label="Promedio/montaje"
              value={state.montajes.length ? formatCurrency(state.montajes.reduce((s, m) => s + m.ingresoTotal, 0) / state.montajes.length) : '$0'}
              icon={Star}
            />
          </div>
        </div>
      </div>

      {modal === 'menu' && <MenuDrawer onClose={() => setModal(null)} />}
      {modal === 'upcoming' && <UpcomingModal onClose={() => setModal(null)} />}
      {modal === 'calendar' && <CalendarModal onClose={() => setModal(null)} />}
      {modal === 'packages' && <PackagesModal onClose={() => setModal(null)} />}
    </div>
  )
}

const ChartCard = ({ title, children, compact = false }: { title: string; children: React.ReactNode; compact?: boolean }) => (
  <div className={`bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 ${compact ? 'p-3' : 'p-4'}`}>
    <p className="font-title text-xs text-neutral-500 dark:text-neutral-400 mb-2">{title}</p>
    {children}
  </div>
)

const StatRow = ({ items }: { items: { label: string; value: string; color?: string }[] }) => (
  <div className="grid grid-cols-3 gap-2">
    {items.map((item, i) => (
      <div key={i} className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 p-3 text-center">
        <p className={`text-sm font-semibold ${item.color ?? 'text-neutral-700 dark:text-neutral-200'}`}>{item.value}</p>
        <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">{item.label}</p>
      </div>
    ))}
  </div>
)

const StatCard = ({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) => (
  <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 p-3 flex items-center gap-2">
    <div className="w-7 h-7 rounded-full bg-off-white dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
      <Icon size={13} strokeWidth={1.5} className="text-forest dark:text-sage" />
    </div>
    <div>
      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 leading-tight">{value}</p>
      <p className="text-[9px] text-neutral-400">{label}</p>
    </div>
  </div>
)
