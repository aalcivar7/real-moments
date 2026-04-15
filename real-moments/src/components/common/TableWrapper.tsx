import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'
import type { SortConfig, FilterConfig } from '../../types'

type Column = {
  key: string
  label: string
  type?: 'text' | 'currency' | 'number'
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode
}

type TableWrapperProps = {
  columns: Column[]
  data: Record<string, unknown>[]
  pageSize?: number
}

export const TableWrapper = ({ columns, data, pageSize = 10 }: TableWrapperProps) => {
  const [shown, setShown] = useState(pageSize)
  const [sort, setSort] = useState<SortConfig | null>(null)
  const [filters, setFilters] = useState<FilterConfig>({})
  const [filterOpen, setFilterOpen] = useState<string | null>(null)
  const [filterInput, setFilterInput] = useState('')

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSort({ key, direction })
    setFilterOpen(null)
  }

  const applyFilter = (key: string) => {
    setFilters(f => ({ ...f, [key]: filterInput }))
    setFilterOpen(null)
    setFilterInput('')
  }

  const clearFilter = (key: string) => setFilters(f => { const n = { ...f }; delete n[key]; return n })

  const filtered = data.filter(row =>
    Object.entries(filters).every(([k, v]) =>
      String(row[k] ?? '').toLowerCase().includes(v.toLowerCase())
    )
  )

  const sorted = sort
    ? [...filtered].sort((a, b) => {
        const va = a[sort.key] ?? ''
        const vb = b[sort.key] ?? ''
        const cmp = typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), 'es')
        return sort.direction === 'asc' ? cmp : -cmp
      })
    : filtered

  const displayed = sorted.slice(0, shown)
  const hasMore = shown < sorted.length

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-700">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-off-white dark:bg-neutral-800">
              {columns.map(col => (
                <th key={col.key} className="px-3 py-2 text-left font-semibold text-neutral-600 dark:text-neutral-300 whitespace-nowrap relative">
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    <button onClick={() => setFilterOpen(filterOpen === col.key ? null : col.key)} className="text-neutral-400 hover:text-forest transition-colors">
                      <Filter size={11} />
                    </button>
                    {filters[col.key] && (
                      <button onClick={() => clearFilter(col.key)} className="text-red-400 hover:text-red-600">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  {filterOpen === col.key && (
                    <div className="absolute top-full left-0 z-30 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-lg p-3 min-w-[160px]">
                      <p className="text-[10px] font-semibold text-neutral-500 mb-2">Filtrar y ordenar</p>
                      <input
                        className="w-full border border-gray-200 dark:border-neutral-600 rounded px-2 py-1 text-xs mb-2 bg-white dark:bg-neutral-900"
                        placeholder="Filtrar..."
                        value={filterInput}
                        onChange={e => setFilterInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilter(col.key)}
                      />
                      <button onClick={() => applyFilter(col.key)} className="w-full text-xs bg-sage text-white rounded px-2 py-1 mb-2 hover:bg-forest transition-colors">Aplicar filtro</button>
                      <div className="border-t border-gray-100 dark:border-neutral-700 pt-2 space-y-1">
                        {col.type === 'currency' || col.type === 'number' ? (
                          <>
                            <button onClick={() => handleSort(col.key, 'asc')} className="flex items-center gap-1 text-xs w-full hover:text-forest text-left">
                              <ChevronUp size={12} /> Menor a mayor
                            </button>
                            <button onClick={() => handleSort(col.key, 'desc')} className="flex items-center gap-1 text-xs w-full hover:text-forest text-left">
                              <ChevronDown size={12} /> Mayor a menor
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleSort(col.key, 'asc')} className="flex items-center gap-1 text-xs w-full hover:text-forest text-left">
                              <ChevronUp size={12} /> A → Z
                            </button>
                            <button onClick={() => handleSort(col.key, 'desc')} className="flex items-center gap-1 text-xs w-full hover:text-forest text-left">
                              <ChevronDown size={12} /> Z → A
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((row, i) => (
              <tr key={i} className="border-t border-gray-100 dark:border-neutral-700 hover:bg-pale-pink/10 dark:hover:bg-neutral-800/50 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <button
          onClick={() => setShown(s => s + pageSize)}
          className="mt-2 text-xs text-forest dark:text-sage underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          Mostrar más
        </button>
      )}
    </div>
  )
}
