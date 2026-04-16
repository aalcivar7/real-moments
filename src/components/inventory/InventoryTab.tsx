import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, History } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { AddButton } from '../common/AddButton'
import { formatCurrency, formatShortDate } from '../../utils/formatting'
import type { Package, InventoryItem, InventoryMovement, Supplier } from '../../types'

const inp = 'w-full border border-gray-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-sage transition-colors'

export const InventoryTab = () => {
  return (
    <div className="pb-20 px-4 pt-5 space-y-8">
      <h1 className="font-title text-2xl text-neutral-800 dark:text-neutral-100">Inventario</h1>
      <PackagesSection />
      <ItemsSection />
      <SuppliersSection />
    </div>
  )
}

const PackagesSection = () => {
  const { state, dispatch } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Package | null>(null)
  const [shown, setShown] = useState(10)
  const [form, setForm] = useState<Omit<Package, 'id'>>({ categoria: '', subcategoria: '', paquete: '', precio: 0, itemsIncluidos: '' })

  const sorted = [...state.packages]
  const displayed = sorted.slice(0, shown)

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (editing) dispatch({ type: 'UPDATE_PACKAGE', pkg: { ...form, id: editing.id } })
    else dispatch({ type: 'ADD_PACKAGE', pkg: form })
    reset()
  }

  const reset = () => { setShowForm(false); setEditing(null); setForm({ categoria: '', subcategoria: '', paquete: '', precio: 0, itemsIncluidos: '' }) }
  const startEdit = (pkg: Package) => { setEditing(pkg); setForm({ categoria: pkg.categoria, subcategoria: pkg.subcategoria, paquete: pkg.paquete, precio: pkg.precio, itemsIncluidos: pkg.itemsIncluidos }); setShowForm(true) }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="font-title text-base text-neutral-700 dark:text-neutral-200">Paquetes</p>
        <AddButton onClick={() => { reset(); setShowForm(true) }} />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-sage/30 p-4 mb-4 space-y-3">
          <F label="Categoría"><input className={inp} value={form.categoria} onChange={e => set('categoria', e.target.value)} /></F>
          <F label="Subcategoría"><input className={inp} value={form.subcategoria} onChange={e => set('subcategoria', e.target.value)} /></F>
          <F label="Paquete"><input className={inp} value={form.paquete} onChange={e => set('paquete', e.target.value)} /></F>
          <F label="Precio ($)"><input type="number" className={inp} value={form.precio || ''} onChange={e => set('precio', parseFloat(e.target.value) || 0)} /></F>
          <F label="Ítems incluidos"><textarea className={`${inp} min-h-[80px] resize-y`} value={form.itemsIncluidos} onChange={e => set('itemsIncluidos', e.target.value)} placeholder="Ingresa un ítem por línea..." /></F>
          <div className="flex gap-2">
            {editing && <button onClick={() => { dispatch({ type: 'DELETE_PACKAGE', id: editing.id }); reset() }} className="p-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>}
            <button onClick={reset} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-neutral-500 text-sm">Cancelar</button>
            <button onClick={save} className="flex-1 py-2 rounded-xl bg-forest text-white text-sm hover:bg-sage transition-colors">Guardar</button>
          </div>
        </div>
      )}

      <SimpleTable
        headers={['Categoría', 'Subcategoría', 'Paquete', 'Precio', 'Ítems incluidos']}
        rows={displayed.map(p => [p.categoria, p.subcategoria, p.paquete, formatCurrency(p.precio), p.itemsIncluidos.replace(/\n/g, ', ')])}
        onRowClick={i => startEdit(displayed[i])}
      />
      {shown < sorted.length && <button onClick={() => setShown(s => s + 10)} className="mt-2 text-xs text-forest dark:text-sage underline">Mostrar más</button>}
    </section>
  )
}

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
        <p className="font-title text-base text-neutral-700 dark:text-neutral-200">Inventario de ítems</p>
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
              <tr className="bg-off-white dark:bg-neutral-900">
                {['Categoría', 'Ítem', 'Descripción', 'Stock', 'Historial', 'Costo unit.', 'Observaciones'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map(item => (
                <>
                  <tr key={item.id} className="border-t border-gray-50 dark:border-neutral-700 hover:bg-pale-pink/10 transition-colors cursor-pointer" onClick={() => startEdit(item)}>
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
              <tr className="bg-off-white dark:bg-neutral-900">
                {['Ítem', 'Tipo', 'Cantidad', 'Fecha', 'Notas'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map(m => (
                <tr key={m.id} className="border-t border-gray-50 dark:border-neutral-700 hover:bg-pale-pink/10 transition-colors">
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

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="font-title text-base text-neutral-700 dark:text-neutral-200">Proveedores</p>
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

      <SimpleTable
        headers={['Proveedor', 'Contacto', 'Producto/Servicio', 'Precio', 'Teléfono', 'Email', 'Dirección', 'Review', 'Notas']}
        rows={displayed.map(s => [s.proveedor, s.contactoComercial, s.productoServicio, s.precio, s.telefono, s.email, s.direccion, s.review, s.notas])}
        onRowClick={i => startEdit(displayed[i])}
      />
      {shown < state.suppliers.length && <button onClick={() => setShown(s => s + 10)} className="mt-2 text-xs text-forest dark:text-sage underline">Mostrar más</button>}
    </section>
  )
}

const SUPPLIER_LABELS: Record<string, string> = {
  proveedor: 'Proveedor', contactoComercial: 'Contacto comercial', productoServicio: 'Producto o servicio',
  precio: 'Precio', telefono: 'Teléfono', email: 'Email', direccion: 'Dirección', review: 'Review', notas: 'Notas',
}

const SimpleTable = ({ headers, rows, onRowClick }: { headers: string[]; rows: string[][]; onRowClick?: (i: number) => void }) => (
  <div className="rounded-2xl border border-gray-100 dark:border-neutral-700 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-off-white dark:bg-neutral-900">
            {headers.map(h => <th key={h} className="px-3 py-2.5 text-left font-semibold text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-gray-50 dark:border-neutral-700 hover:bg-pale-pink/10 transition-colors cursor-pointer" onClick={() => onRowClick?.(i)}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-neutral-600 dark:text-neutral-300 max-w-[140px] truncate">{cell || '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">{label}</label>
    {children}
  </div>
)
