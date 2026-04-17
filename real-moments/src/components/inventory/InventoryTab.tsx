import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, History, Filter, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { AddButton } from '../common/AddButton'
import { formatCurrency, formatShortDate } from '../../utils/formatting'
import type { Package, InventoryItem, InventoryMovement, Supplier, SortConfig, FilterConfig } from '../../types'

const inp = 'w-full border border-gray-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-sage transition-colors'

const TH_STYLE = 'px-3 py-2.5 text-left font-bold text-white whitespace-nowrap relative'
const THEAD_BG = { backgroundColor: '#BFA6A0' }
const TD_ROW = 'bg-white dark:bg-neutral-800 border-t border-gray-100 dark:border-neutral-700 hover:bg-pale-pink/10 transition-colors cursor-pointer'

export const InventoryTab = () => {
  return (
    <div className="pb-20 px-4 pt-5 space-y-8">
      <h1 className="font-gellatio text-2xl text-neutral-800 dark:text-neutral-100">Inventario</h1>
      <PackagesSection />
      <ItemsSection />
      <SuppliersSection />
    </div>
  )
}

// ─── Packages ─────────────────────────────────────────────────────────────────

type PkgColumn = { key: keyof Package; label: string; type?: 'text' | 'currency' }
const PKG_COLUMNS: PkgColumn[] = [
  { key: 'categoria', label: 'Categoría' },
  { key: 'subcategoria', label: 'Subcategoría' },
  { key: 'paquete', label: 'Paquete' },
  { key: 'precio', label: 'Precio', type: 'text' },
  { key: 'itemsIncluidos', label: 'Ítems incluidos' },
]

const PackagesSection = () => {
  const { state, dispatch } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Package | null>(null)
  const [shown, setShown] = useState(10)
  const [sort, setSort] = useState<SortConfig | null>(null)
  const [filters, setFilters] = useState<FilterConfig>({})
  const [filterOpen, setFilterOpen] = useState<string | null>(null)
  const [filterInput, setFilterInput] = useState('')
  const [form, setForm] = useState<Omit<Package, 'id'>>({ categoria: '', subcategoria: '', paquete: '', precio: '', itemsIncluidos: '' })

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }))

  const sorted = [...state.packages]
    .sort((a, b) => {
      if (!sort) return 0
      const va = String(a[sort.key as keyof Package] ?? '')
      const vb = String(b[sort.key as keyof Package] ?? '')
      const cmp = va.localeCompare(vb, 'es')
      return sort.direction === 'asc' ? cmp : -cmp
    })
    .filter(p =>
      Object.entries(filters).every(([k, v]) =>
        String(p[k as keyof Package] ?? '').toLowerCase().includes(v.toLowerCase())
      )
    )

  const displayed = sorted.slice(0, shown)

  const applyFilter = (key: string) => { setFilters(f => ({ ...f, [key]: filterInput })); setFilterOpen(null); setFilterInput('') }
  const clearFilter = (key: string) => setFilters(f => { const n = { ...f }; delete n[key]; return n })
  const handleSort = (key: string, dir: 'asc' | 'desc') => { setSort({ key, direction: dir }); setFilterOpen(null) }

  const save = () => {
    if (editing) dispatch({ type: 'UPDATE_PACKAGE', pkg: { ...form, id: editing.id } })
    else dispatch({ type: 'ADD_PACKAGE', pkg: form })
    reset()
  }

  const reset = () => {
    setShowForm(false); setEditing(null)
    setForm({ categoria: '', subcategoria: '', paquete: '', precio: '', itemsIncluidos: '' })
  }
  const startEdit = (pkg: Package) => {
    setEditing(pkg)
    setForm({ categoria: pkg.categoria, subcategoria: pkg.subcategoria, paquete: pkg.paquete, precio: pkg.precio, itemsIncluidos: pkg.itemsIncluidos })
    setShowForm(true)
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="font-title text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Paquetes</p>
        <AddButton onClick={() => { reset(); setShowForm(true) }} />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-sage/30 p-4 mb-4 space-y-3">
          <F label="Categoría"><input className={inp} value={form.categoria} onChange={e => set('categoria', e.target.value)} /></F>
          <F label="Subcategoría"><input className={inp} value={form.subcategoria} onChange={e => set('subcategoria', e.target.value)} /></F>
          <F label="Paquete"><input className={inp} value={form.paquete} onChange={e => set('paquete', e.target.value)} /></F>
          <F label="Precio">
            <textarea
              className={`${inp} min-h-[80px] resize-y`}
              value={form.precio}
              onChange={e => set('precio', e.target.value)}
              placeholder="Ingresa un precio por cantidad de personas por línea…"
            />
          </F>
          <F label="Ítems incluidos">
            <textarea className={`${inp} min-h-[80px] resize-y`} value={form.itemsIncluidos} onChange={e => set('itemsIncluidos', e.target.value)} placeholder="Ingresa un ítem por línea..." />
          </F>
          <div className="flex gap-2">
            {editing && <button onClick={() => { dispatch({ type: 'DELETE_PACKAGE', id: editing.id }); reset() }} className="p-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>}
            <button onClick={reset} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-neutral-500 text-sm">Cancelar</button>
            <button onClick={save} className="flex-1 py-2 rounded-xl bg-forest text-white text-sm hover:bg-sage transition-colors">Guardar</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-neutral-700">
        <table className="min-w-full text-xs">
          <thead>
            <tr style={THEAD_BG}>
              {PKG_COLUMNS.map(col => (
                <th key={col.key} className={TH_STYLE}>
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    <button onClick={() => { setFilterOpen(filterOpen === col.key ? null : col.key); setFilterInput(filters[col.key] ?? '') }} className="text-white/70 hover:text-white transition-colors">
                      <Filter size={10} />
                    </button>
                    {filters[col.key] && <button onClick={() => clearFilter(col.key)} className="text-white/70 hover:text-white"><X size={10} /></button>}
                    {sort?.key === col.key && <span>{sort.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />}</span>}
                  </div>
                  {filterOpen === col.key && (
                    <FilterDropdown
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
            {displayed.map((p) => (
              <tr key={p.id} className={TD_ROW} onClick={() => startEdit(p)}>
                <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300 whitespace-nowrap">{p.categoria || '—'}</td>
                <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300 whitespace-nowrap">{p.subcategoria || '—'}</td>
                <td className="px-3 py-2 text-neutral-700 dark:text-neutral-200 font-semibold whitespace-nowrap">{p.paquete || '—'}</td>
                <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300 max-w-[160px]">
                  <span className="whitespace-pre-line">{p.precio || '—'}</span>
                </td>
                <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400 max-w-[140px] truncate">{p.itemsIncluidos.replace(/\n/g, ', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {shown < sorted.length && <button onClick={() => setShown(s => s + 10)} className="mt-2 text-xs text-forest dark:text-sage underline">Mostrar más</button>}
    </section>
  )
}

// ─── Items ────────────────────────────────────────────────────────────────────

const ItemsSection = () => {
  const { state, dispatch } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<InventoryItem | null>(null)
  const [shown, setShown] = useState(10)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [showMovForm, setShowMovForm] = useState<string | null>(null)
  const [movForm, setMovForm] = useState<Omit<InventoryMovement, 'id' | 'itemId'>>({ tipoMovimiento: 'Entrada', cantidad: 0, fecha: new Date().toISOString().split('T')[0], notas: '' })
  const [form, setForm] = useState<Omit<InventoryItem, 'id'>>({ categoria: '', item: '', descripcion: '', referenciaCosteUnitario: 0, observaciones: '' })

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }))

  const getStock = (itemId: string) => state.inventoryMovements
    .filter(m => m.itemId === itemId)
    .reduce((s, m) => s + (m.tipoMovimiento === 'Entrada' ? m.cantidad : -m.cantidad), 0)

  const getHistory = (itemId: string) => [...state.inventoryMovements.filter(m => m.itemId === itemId)].sort((a, b) => b.fecha.localeCompare(a.fecha))

  const save = () => {
    if (editing) dispatch({ type: 'UPDATE_INVENTORY_ITEM', item: { ...form, id: editing.id } })
    else dispatch({ type: 'ADD_INVENTORY_ITEM', item: form })
    reset()
  }

  const reset = () => { setShowForm(false); setEditing(null); setForm({ categoria: '', item: '', descripcion: '', referenciaCosteUnitario: 0, observaciones: '' }) }
  const startEdit = (item: InventoryItem) => { setEditing(item); setForm({ categoria: item.categoria, item: item.item, descripcion: item.descripcion, referenciaCosteUnitario: item.referenciaCosteUnitario, observaciones: item.observaciones }); setShowForm(true) }

  const addMovement = (itemId: string) => {
    if (!movForm.cantidad) return
    dispatch({ type: 'ADD_INVENTORY_MOVEMENT', movement: { ...movForm, itemId } })
    setMovForm({ tipoMovimiento: 'Entrada', cantidad: 0, fecha: new Date().toISOString().split('T')[0], notas: '' })
    setShowMovForm(null)
  }

  const displayed = state.inventoryItems.slice(0, shown)

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="font-title text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Inventario de ítems</p>
        <AddButton onClick={() => { reset(); setShowForm(true) }} />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-sage/30 p-4 mb-4 space-y-3">
          <F label="Categoría"><input className={inp} value={form.categoria} onChange={e => set('categoria', e.target.value)} /></F>
          <F label="Ítem"><input className={inp} value={form.item} onChange={e => set('item', e.target.value)} /></F>
          <F label="Descripción"><input className={inp} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} /></F>
          <F label="Referencia de costo unitario ($)"><input type="number" className={inp} value={form.referenciaCosteUnitario || ''} onChange={e => set('referenciaCosteUnitario', parseFloat(e.target.value) || 0)} /></F>
          <F label="Observaciones"><input className={inp} value={form.observaciones} onChange={e => set('observaciones', e.target.value)} /></F>
          <div className="flex gap-2">
            {editing && <button onClick={() => { dispatch({ type: 'DELETE_INVENTORY_ITEM', id: editing.id }); reset() }} className="p-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>}
            <button onClick={reset} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-neutral-500 text-sm">Cancelar</button>
            <button onClick={save} className="flex-1 py-2 rounded-xl bg-forest text-white text-sm hover:bg-sage transition-colors">Guardar</button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr style={THEAD_BG}>
                {['Categoría', 'Ítem', 'Descripción', 'Stock', 'Historial', 'Costo unit.', 'Observaciones'].map(h => (
                  <th key={h} className={TH_STYLE}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map(item => (
                <>
                  <tr key={item.id} className={TD_ROW} onClick={() => startEdit(item)}>
                    <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300 whitespace-nowrap">{item.categoria}</td>
                    <td className="px-3 py-2 font-semibold text-neutral-700 dark:text-neutral-200 whitespace-nowrap">{item.item}</td>
                    <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400 max-w-[120px] truncate">{item.descripcion}</td>
                    <td className="px-3 py-2">
                      <span className={`font-semibold ${getStock(item.id) > 0 ? 'text-forest' : 'text-red-400'}`}>{getStock(item.id)}</span>
                    </td>
                    <td className="px-3 py-2" onClick={e => { e.stopPropagation(); setExpandedItem(expandedItem === item.id ? null : item.id) }}>
                      <button className="flex items-center gap-1 text-forest dark:text-sage text-xs hover:opacity-70 transition-opacity whitespace-nowrap">
                        <History size={11} />
                        Historial
                        {expandedItem === item.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{formatCurrency(item.referenciaCosteUnitario)}</td>
                    <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400 max-w-[100px] truncate">{item.observaciones}</td>
                  </tr>
                  {expandedItem === item.id && (
                    <tr key={`${item.id}-hist`} className="bg-off-white/50 dark:bg-neutral-900/50 border-t border-gray-50 dark:border-neutral-700">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="ml-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Movimientos de inventario</p>
                            <button
                              onClick={e => { e.stopPropagation(); setShowMovForm(showMovForm === item.id ? null : item.id) }}
                              className="flex items-center gap-1 text-xs text-forest dark:text-sage hover:opacity-70"
                            >
                              <Plus size={11} /> Agregar movimiento
                            </button>
                          </div>

                          {showMovForm === item.id && (
                            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-sage/30 p-3 mb-3 space-y-2" onClick={e => e.stopPropagation()}>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-semibold text-neutral-400 block mb-0.5">Tipo</label>
                                  <select className={`${inp} text-xs`} value={movForm.tipoMovimiento} onChange={e => setMovForm(f => ({ ...f, tipoMovimiento: e.target.value as 'Entrada' | 'Salida' }))}>
                                    <option>Entrada</option>
                                    <option>Salida</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-neutral-400 block mb-0.5">Cantidad</label>
                                  <input type="number" min="0" className={`${inp} text-xs`} value={movForm.cantidad || ''} onChange={e => setMovForm(f => ({ ...f, cantidad: Math.max(0, parseInt(e.target.value) || 0) }))} />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-neutral-400 block mb-0.5">Fecha</label>
                                  <input type="date" className={`${inp} text-xs`} value={movForm.fecha} onChange={e => setMovForm(f => ({ ...f, fecha: e.target.value }))} />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-neutral-400 block mb-0.5">Notas</label>
                                  <input className={`${inp} text-xs`} value={movForm.notas} onChange={e => setMovForm(f => ({ ...f, notas: e.target.value }))} />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => setShowMovForm(null)} className="flex-1 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 text-neutral-500 text-xs">Cancelar</button>
                                <button onClick={() => addMovement(item.id)} className="flex-1 py-1.5 rounded-lg bg-forest text-white text-xs hover:bg-sage transition-colors">Registrar</button>
                              </div>
                            </div>
                          )}

                          {getHistory(item.id).length === 0 ? (
                            <p className="text-xs text-neutral-300">Sin movimientos registrados</p>
                          ) : (
                            <div className="space-y-1">
                              {getHistory(item.id).map(mov => (
                                <div key={mov.id} className="flex items-center gap-3 text-xs py-1">
                                  <span className={`w-14 text-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${mov.tipoMovimiento === 'Entrada' ? 'bg-sage/20 text-forest' : 'bg-pale-pink/30 text-mauve'}`}>
                                    {mov.tipoMovimiento === 'Entrada' ? '+' : '-'}{mov.cantidad}
                                  </span>
                                  <span className="text-neutral-400">{formatShortDate(mov.fecha)}</span>
                                  {mov.notas && <span className="text-neutral-400 italic">{mov.notas}</span>}
                                  <button
                                    onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_INVENTORY_MOVEMENT', id: mov.id }) }}
                                    className="ml-auto text-neutral-200 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {shown < state.inventoryItems.length && <button onClick={() => setShown(s => s + 10)} className="mt-2 text-xs text-forest dark:text-sage underline">Mostrar más</button>}

      <div className="mt-6">
        <MovementsTable />
      </div>
    </section>
  )
}

// ─── Movements ────────────────────────────────────────────────────────────────

const MovementsTable = () => {
  const { state } = useApp()
  const [shown, setShown] = useState(10)
  const sorted = [...state.inventoryMovements].sort((a, b) => b.fecha.localeCompare(a.fecha))
  const displayed = sorted.slice(0, shown)
  const getItemName = (id: string) => state.inventoryItems.find(i => i.id === id)?.item ?? id

  return (
    <div>
      <p className="font-title text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Movimientos de inventario</p>
      <div className="rounded-2xl border border-gray-100 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr style={THEAD_BG}>
                {['Ítem', 'Tipo', 'Cantidad', 'Fecha', 'Notas'].map(h => (
                  <th key={h} className={TH_STYLE}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map(m => (
                <tr key={m.id} className="bg-white dark:bg-neutral-800 border-t border-gray-100 dark:border-neutral-700 hover:bg-pale-pink/10 transition-colors">
                  <td className="px-3 py-2 text-neutral-700 dark:text-neutral-200 whitespace-nowrap">{getItemName(m.itemId)}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.tipoMovimiento === 'Entrada' ? 'bg-sage/20 text-forest' : 'bg-pale-pink/30 text-mauve'}`}>
                      {m.tipoMovimiento}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-semibold text-neutral-600 dark:text-neutral-300">{m.cantidad}</td>
                  <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{formatShortDate(m.fecha)}</td>
                  <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">{m.notas || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {shown < sorted.length && <button onClick={() => setShown(s => s + 10)} className="mt-2 text-xs text-forest dark:text-sage underline">Mostrar más</button>}
    </div>
  )
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

const SuppliersSection = () => {
  const { state, dispatch } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [shown, setShown] = useState(10)
  const [form, setForm] = useState<Omit<Supplier, 'id'>>({ proveedor: '', contactoComercial: '', productoServicio: '', precio: '', telefono: '', email: '', direccion: '', review: '', notas: '' })

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (editing) dispatch({ type: 'UPDATE_SUPPLIER', supplier: { ...form, id: editing.id } })
    else dispatch({ type: 'ADD_SUPPLIER', supplier: form })
    reset()
  }

  const reset = () => { setShowForm(false); setEditing(null); setForm({ proveedor: '', contactoComercial: '', productoServicio: '', precio: '', telefono: '', email: '', direccion: '', review: '', notas: '' }) }
  const startEdit = (s: Supplier) => { setEditing(s); setForm({ proveedor: s.proveedor, contactoComercial: s.contactoComercial, productoServicio: s.productoServicio, precio: s.precio, telefono: s.telefono, email: s.email, direccion: s.direccion, review: s.review, notas: s.notas }); setShowForm(true) }

  const displayed = state.suppliers.slice(0, shown)
  const HEADERS = ['Proveedor', 'Contacto', 'Producto/Servicio', 'Precio', 'Teléfono', 'Email', 'Dirección', 'Review', 'Notas']
  const KEYS: (keyof Supplier)[] = ['proveedor', 'contactoComercial', 'productoServicio', 'precio', 'telefono', 'email', 'direccion', 'review', 'notas']

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="font-title text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Proveedores</p>
        <AddButton onClick={() => { reset(); setShowForm(true) }} />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-sage/30 p-4 mb-4 space-y-3">
          {(['proveedor', 'contactoComercial', 'productoServicio', 'precio', 'telefono', 'email', 'direccion', 'review', 'notas'] as const).map(k => (
            <F key={k} label={SUPPLIER_LABELS[k]}>
              <input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} />
            </F>
          ))}
          <div className="flex gap-2">
            {editing && <button onClick={() => { dispatch({ type: 'DELETE_SUPPLIER', id: editing.id }); reset() }} className="p-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>}
            <button onClick={reset} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-neutral-500 text-sm">Cancelar</button>
            <button onClick={save} className="flex-1 py-2 rounded-xl bg-forest text-white text-sm hover:bg-sage transition-colors">Guardar</button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr style={THEAD_BG}>
                {HEADERS.map(h => <th key={h} className={TH_STYLE}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {displayed.map((s) => (
                <tr key={s.id} className={TD_ROW} onClick={() => startEdit(s)}>
                  {KEYS.map(k => (
                    <td key={k} className="px-3 py-2 text-neutral-600 dark:text-neutral-300 max-w-[140px] truncate">{s[k] || '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {shown < state.suppliers.length && <button onClick={() => setShown(s => s + 10)} className="mt-2 text-xs text-forest dark:text-sage underline">Mostrar más</button>}
    </section>
  )
}

const SUPPLIER_LABELS: Record<string, string> = {
  proveedor: 'Proveedor', contactoComercial: 'Contacto comercial', productoServicio: 'Producto o servicio',
  precio: 'Precio', telefono: 'Teléfono', email: 'Email', direccion: 'Dirección', review: 'Review', notas: 'Notas',
}

const FilterDropdown = ({
  value, onChange, onApply, onSortAsc, onSortDesc,
}: { value: string; onChange: (v: string) => void; onApply: () => void; onSortAsc: () => void; onSortDesc: () => void }) => (
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
      <button onClick={onSortAsc} className="flex items-center gap-1 text-xs w-full hover:text-forest text-left py-0.5"><ChevronUp size={12} /> A → Z</button>
      <button onClick={onSortDesc} className="flex items-center gap-1 text-xs w-full hover:text-forest text-left py-0.5"><ChevronDown size={12} /> Z → A</button>
    </div>
  </div>
)

const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">{label}</label>
    {children}
  </div>
)
