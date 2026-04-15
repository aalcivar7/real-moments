import { useState } from 'react'
import { ChevronDown, ChevronUp, Filter, X, FileText, FileSpreadsheet } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { AddButton } from '../common/AddButton'
import { MontajeForm } from './MontajeForm'
import { formatLongDate, formatCurrency } from '../../utils/formatting'
import type { Montaje, SortConfig, FilterConfig } from '../../types'
import { exportToPDF, exportToExcel } from '../../utils/export'

const PAGE_SIZE = 10

type Column = { key: keyof Montaje; label: string; type?: 'text' | 'currency' | 'number' }

const COLUMNS: Column[] = [
  { key: 'idMontaje', label: 'ID Montaje' },
  { key: 'n', label: 'N', type: 'number' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'hora', label: 'Hora' },
  { key: 'sector', label: 'Sector' },
  { key: 'ubicacion', label: 'Ubicación' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'subcategoria', label: 'Subcategoría' },
  { key: 'paquete', label: 'Paquete' },
  { key: 'itemsIncluidos', label: 'Ítems incluidos' },
  { key: 'addOns', label: 'Add-ons' },
  { key: 'precioTotalAddOns', label: 'Precio Add-ons', type: 'currency' },
  { key: 'tipoEvento', label: 'Tipo de evento' },
  { key: 'concepto', label: 'Concepto' },
  { key: 'cantidadPersonas', label: 'Cant. personas', type: 'number' },
  { key: 'precioPaquete', label: 'Precio paquete', type: 'currency' },
  { key: 'precioMontajeDesmontaje', label: 'Precio mont./desmont.', type: 'currency' },
  { key: 'informacionPagos', label: 'Info. pagos' },
  { key: 'statusPago', label: 'Status pago' },
  { key: 'reviewCliente', label: 'Review cliente' },
  { key: 'ingresoTotal', label: 'Ingreso total', type: 'currency' },
  { key: 'rubrosCostos', label: 'Rubros costos' },
  { key: 'costosMontaje', label: 'Costos montaje', type: 'currency' },
  { key: 'gananciaNeta', label: 'Ganancia neta', type: 'currency' },
  { key: 'notas', label: 'Notas' },
]

export const MontajesTab = () => {
  const { state } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Montaje | null>(null)
  const [shown, setShown] = useState(PAGE_SIZE)
  const [sort, setSort] = useState<SortConfig | null>(null)
  const [filters, setFilters] = useState<FilterConfig>({})
  const [filterOpen, setFilterOpen] = useState<string | null>(null)
  const [filterInput, setFilterInput] = useState('')

  const sorted = [...state.montajes]
    .sort((a, b) => {
      if (!sort) return b.fecha.localeCompare(a.fecha)
      const va = a[sort.key as keyof Montaje] ?? ''
      const vb = b[sort.key as keyof Montaje] ?? ''
      const cmp = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'es')
      return sort.direction === 'asc' ? cmp : -cmp
    })
    .filter(m =>
      Object.entries(filters).every(([k, v]) =>
        String(m[k as keyof Montaje] ?? '').toLowerCase().includes(v.toLowerCase())
      )
    )

  const displayed = sorted.slice(0, shown)

  const applyFilter = (key: string) => {
    setFilters(f => ({ ...f, [key]: filterInput }))
    setFilterOpen(null)
    setFilterInput('')
  }

  const clearFilter = (key: string) => setFilters(f => { const n = { ...f }; delete n[key]; return n })

  const handleSort = (key: string, dir: 'asc' | 'desc') => {
    setSort({ key, direction: dir })
    setFilterOpen(null)
  }

  const recentFour = [...state.montajes].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 4)

  return (
    <div className="pb-20 px-4 pt-5">
      <h1 className="font-title text-2xl text-neutral-800 dark:text-neutral-100 mb-4">Montajes</h1>

      <div className="flex items-center justify-between mb-3">
        <p className="font-title text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Overview</p>
        <AddButton onClick={() => setShowForm(true)} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {recentFour.map(m => (
          <button
            key={m.id}
            onClick={() => setEditing(m)}
            className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 p-3 text-left hover:border-sage transition-colors active:scale-98"
          >
            <p className="text-[10px] font-semibold text-neutral-400 mb-0.5">{m.idMontaje}</p>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 truncate">{m.cliente}</p>
            <p className="text-[10px] text-neutral-400 mt-0.5 truncate">{formatLongDate(m.fecha)}</p>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {m.tipoEvento && <Tag>{m.tipoEvento}</Tag>}
              {m.sector && <Tag color="sage">{m.sector}</Tag>}
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="font-title text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Base de datos de montajes</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-off-white dark:bg-neutral-900">
              {COLUMNS.map(col => (
                <th key={col.key} className="px-3 py-2.5 text-left font-semibold text-neutral-500 dark:text-neutral-400 whitespace-nowrap relative">
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    <button onClick={() => { setFilterOpen(filterOpen === col.key ? null : col.key); setFilterInput(filters[col.key] ?? '') }} className="text-neutral-300 hover:text-forest transition-colors">
                      <Filter size={10} />
                    </button>
                    {filters[col.key] && (
                      <button onClick={() => clearFilter(col.key)} className="text-red-400"><X size={10} /></button>
                    )}
                    {sort?.key === col.key && (
                      <span className="text-forest">{sort.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />}</span>
                    )}
                  </div>
                  {filterOpen === col.key && (
                    <FilterDropdown
                      type={col.type ?? 'text'}
                      value={filterInput}
                      onChange={setFilterInput}
                      onApply={() => applyFilter(col.key)}
                      onSortAsc={() => handleSort(col.key, 'asc')}
                      onSortDesc={() => handleSort(col.key, 'desc')}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map(m => (
              <tr
                key={m.id}
                className="border-t border-gray-50 dark:border-neutral-700 hover:bg-pale-pink/10 dark:hover:bg-neutral-700/30 transition-colors cursor-pointer"
                onClick={() => setEditing(m)}
              >
                {COLUMNS.map(col => (
                  <td key={col.key} className="px-3 py-2 whitespace-nowrap">
                    <CellValue col={col} m={m} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {shown < sorted.length && (
        <button onClick={() => setShown(s => s + PAGE_SIZE)} className="mt-2 text-xs text-forest dark:text-sage underline underline-offset-2">
          Mostrar más ({sorted.length - shown} restantes)
        </button>
      )}

      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-neutral-800">
        <button
          onClick={() => exportToPDF(sorted, 'Base de datos de montajes')}
          className="flex items-center gap-2 text-xs text-neutral-500 hover:text-forest transition-colors py-2 px-3 rounded-xl border border-gray-200 dark:border-neutral-700 hover:border-forest"
        >
          <FileText size={14} /> Exportar PDF
        </button>
        <button
          onClick={() => exportToExcel(sorted, 'Base de datos de montajes')}
          className="flex items-center gap-2 text-xs text-neutral-500 hover:text-forest transition-colors py-2 px-3 rounded-xl border border-gray-200 dark:border-neutral-700 hover:border-forest"
        >
          <FileSpreadsheet size={14} /> Exportar Excel
        </button>
      </div>

      {(showForm || editing) && (
        <MontajeForm
          initial={editing ?? undefined}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

const CellValue = ({ col, m }: { col: Column; m: Montaje }) => {
  if (col.key === 'fecha') return <span>{formatLongDate(m.fecha)}</span>
  if (col.type === 'currency') {
    const v = m[col.key] as number
    const color = col.key === 'costosMontaje' ? 'text-blue-bell' : 'text-forest dark:text-sage'
    return <span className={`font-semibold ${color}`}>{formatCurrency(v)}</span>
  }
  if (col.key === 'statusPago') {
    const colors: Record<string, string> = { 'Completo': 'bg-sage/20 text-forest', 'Pendiente': 'bg-pale-pink/30 text-mauve', 'Canje': 'bg-blue-bell/20 text-blue-500' }
    const c = colors[m.statusPago] ?? 'bg-gray-100 text-neutral-500'
    return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${c}`}>{m.statusPago}</span>
  }
  const val = m[col.key]
  return <span className="text-neutral-600 dark:text-neutral-300">{val !== undefined && val !== null && val !== '' ? String(val) : '—'}</span>
}

const Tag = ({ children, color = 'pink' }: { children: React.ReactNode; color?: 'pink' | 'sage' }) => (
  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${color === 'sage' ? 'bg-sage/20 text-forest' : 'bg-pale-pink/40 text-mauve'}`}>
    {children}
  </span>
)

const FilterDropdown = ({
  type, value, onChange, onApply, onSortAsc, onSortDesc,
}: { type: string; value: string; onChange: (v: string) => void; onApply: () => void; onSortAsc: () => void; onSortDesc: () => void }) => (
  <div className="absolute top-full left-0 z-30 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-xl shadow-lg p-3 min-w-[160px]" onClick={e => e.stopPropagation()}>
    <p className="text-[10px] font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Filtrar</p>
    <input
      className="w-full border border-gray-200 dark:border-neutral-600 rounded-lg px-2 py-1 text-xs mb-2 bg-white dark:bg-neutral-900 focus:outline-none focus:border-sage"
      placeholder="Buscar..."
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onApply()}
    />
    <button onClick={onApply} className="w-full text-xs bg-sage text-white rounded-lg px-2 py-1.5 mb-2 hover:bg-forest transition-colors">Aplicar filtro</button>
    <div className="border-t border-gray-100 dark:border-neutral-700 pt-2 space-y-1">
      {type === 'currency' || type === 'number' ? (
        <>
          <button onClick={onSortAsc} className="flex items-center gap-1 text-xs w-full hover:text-forest text-left py-0.5"><ChevronUp size={12} /> Menor a mayor</button>
          <button onClick={onSortDesc} className="flex items-center gap-1 text-xs w-full hover:text-forest text-left py-0.5"><ChevronDown size={12} /> Mayor a menor</button>
        </>
      ) : (
        <>
          <button onClick={onSortAsc} className="flex items-center gap-1 text-xs w-full hover:text-forest text-left py-0.5"><ChevronUp size={12} /> A → Z</button>
          <button onClick={onSortDesc} className="flex items-center gap-1 text-xs w-full hover:text-forest text-left py-0.5"><ChevronDown size={12} /> Z → A</button>
        </>
      )}
    </div>
  </div>
)
