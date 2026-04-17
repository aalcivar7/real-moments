import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Montaje } from '../../types'

type Props = {
  initial?: Montaje
  onClose: () => void
}

const emptyForm = (): Omit<Montaje, 'id' | 'idMontaje' | 'n' | 'ingresoTotal' | 'gananciaNeta'> => ({
  cliente: '', telefono: '', fecha: '', hora: '', sector: '', ubicacion: '',
  categoria: '', subcategoria: '', paquete: '', itemsIncluidos: '', addOns: '',
  precioTotalAddOns: 0, tipoEvento: '', concepto: '', cantidadPersonas: 0,
  precioPaquete: 0, precioMontajeDesmontaje: 0, informacionPagos: '',
  statusPago: '', reviewCliente: '', rubrosCostos: '', costosMontaje: 0, notas: '',
})

export const MontajeForm = ({ initial, onClose }: Props) => {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState(() => initial ? { ...initial } : emptyForm())
  const [newEventType, setNewEventType] = useState('')
  const [newPayStatus, setNewPayStatus] = useState('')
  const [editEventType, setEditEventType] = useState<{ old: string; val: string } | null>(null)
  const [editPayStatus, setEditPayStatus] = useState<{ old: string; val: string } | null>(null)

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }))

  const categories = [...new Set(state.packages.map(p => p.categoria))]
  const subcategories = [...new Set(state.packages.filter(p => p.categoria === form.categoria).map(p => p.subcategoria))]
  const packages = state.packages.filter(p => p.categoria === form.categoria && p.subcategoria === form.subcategoria)

  const handlePackageSelect = (pkgName: string) => {
    const pkg = state.packages.find(p => p.paquete === pkgName && p.categoria === form.categoria)
    set('paquete', pkgName)
    if (pkg) {
      set('itemsIncluidos', pkg.itemsIncluidos)
    }
  }

  const handleSave = () => {
    if (initial) {
      dispatch({ type: 'UPDATE_MONTAJE', montaje: { ...(form as Montaje), id: initial.id, idMontaje: initial.idMontaje, n: initial.n, ingresoTotal: 0, gananciaNeta: 0 } })
    } else {
      dispatch({ type: 'ADD_MONTAJE', montaje: form })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-off-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[95vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-700 flex-shrink-0">
          <h3 className="font-title text-lg text-neutral-800 dark:text-neutral-100">
            {initial ? 'Editar montaje' : 'Nuevo montaje'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-3 flex-1">
          <F label="Cliente" required><input className={inp} value={form.cliente} onChange={e => set('cliente', e.target.value)} /></F>
          <F label="Teléfono"><input className={inp} value={form.telefono} onChange={e => set('telefono', e.target.value)} /></F>

          <div className="grid grid-cols-2 gap-3">
            <F label="Fecha"><input type="date" className={inp} value={form.fecha} onChange={e => set('fecha', e.target.value)} /></F>
            <F label="Hora"><input type="time" className={inp} value={form.hora} onChange={e => set('hora', e.target.value)} /></F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Sector"><input className={inp} value={form.sector} onChange={e => set('sector', e.target.value)} /></F>
            <F label="Ubicación"><input className={inp} value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)} /></F>
          </div>

          <F label="Categoría">
            <select className={inp} value={form.categoria} onChange={e => { set('categoria', e.target.value); set('subcategoria', ''); set('paquete', '') }}>
              <option value="">Seleccionar...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </F>

          <F label="Subcategoría">
            <select className={inp} value={form.subcategoria} onChange={e => { set('subcategoria', e.target.value); set('paquete', '') }}>
              <option value="">Seleccionar...</option>
              {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </F>

          <F label="Paquete">
            <select className={inp} value={form.paquete} onChange={e => handlePackageSelect(e.target.value)}>
              <option value="">Seleccionar...</option>
              {packages.map(p => <option key={p.id} value={p.paquete}>{p.paquete}{p.precio ? ` — ${p.precio}` : ''}</option>)}
            </select>
          </F>

          <F label="Ítems incluidos">
            <textarea className={`${inp} min-h-[80px] resize-y`} value={form.itemsIncluidos} onChange={e => set('itemsIncluidos', e.target.value)} />
          </F>

          <F label="Add-ons"><input className={inp} value={form.addOns} onChange={e => set('addOns', e.target.value)} /></F>
          <F label="Precio total add-ons ($)"><input type="number" className={inp} value={form.precioTotalAddOns || ''} onChange={e => set('precioTotalAddOns', parseFloat(e.target.value) || 0)} /></F>

          <F label="Tipo de evento">
            <div className="space-y-1">
              <select className={inp} value={form.tipoEvento} onChange={e => set('tipoEvento', e.target.value)}>
                <option value="">Seleccionar...</option>
                {state.eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="flex gap-1">
                <input
                  className={`${inp} flex-1 text-xs`}
                  placeholder="Agregar tipo de evento..."
                  value={newEventType}
                  onChange={e => setNewEventType(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newEventType.trim()) { dispatch({ type: 'ADD_EVENT_TYPE', value: newEventType.trim() }); setNewEventType('') } }}
                />
                {newEventType.trim() && (
                  <button onClick={() => { dispatch({ type: 'ADD_EVENT_TYPE', value: newEventType.trim() }); setNewEventType('') }} className="p-2 rounded-xl bg-sage text-white">
                    <Plus size={12} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {state.eventTypes.map(t => (
                  <div key={t} className="flex items-center gap-0.5 bg-off-white dark:bg-neutral-800 rounded-lg px-2 py-0.5 text-xs border border-gray-200 dark:border-neutral-700">
                    {editEventType?.old === t ? (
                      <>
                        <input className="w-20 text-xs bg-transparent border-b border-sage focus:outline-none" value={editEventType.val} onChange={e => setEditEventType({ old: t, val: e.target.value })} />
                        <button onClick={() => { dispatch({ type: 'UPDATE_EVENT_TYPE', old: t, updated: editEventType.val }); setEditEventType(null) }} className="text-forest ml-1 text-[10px]">✓</button>
                      </>
                    ) : (
                      <>
                        <span className="cursor-pointer" onClick={() => setEditEventType({ old: t, val: t })}>{t}</span>
                        <button onClick={() => dispatch({ type: 'REMOVE_EVENT_TYPE', value: t })} className="ml-1 text-neutral-300 hover:text-red-400"><X size={10} /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </F>

          <F label="Concepto"><input className={inp} value={form.concepto} onChange={e => set('concepto', e.target.value)} /></F>
          <F label="Cantidad de personas"><input type="text" className={inp} value={form.cantidadPersonas || ''} onChange={e => set('cantidadPersonas', parseInt(e.target.value) || 0)} /></F>
          <F label="Precio del paquete ($)"><input type="number" className={inp} value={form.precioPaquete || ''} onChange={e => set('precioPaquete', parseFloat(e.target.value) || 0)} /></F>
          <F label="Precio montaje y desmontaje ($)"><input type="number" className={inp} value={form.precioMontajeDesmontaje || ''} onChange={e => set('precioMontajeDesmontaje', parseFloat(e.target.value) || 0)} /></F>
          <F label="Información de pagos"><input className={inp} value={form.informacionPagos} onChange={e => set('informacionPagos', e.target.value)} /></F>

          <F label="Status del pago">
            <div className="space-y-1">
              <select className={inp} value={form.statusPago} onChange={e => set('statusPago', e.target.value)}>
                <option value="">Seleccionar...</option>
                {state.paymentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex gap-1">
                <input
                  className={`${inp} flex-1 text-xs`}
                  placeholder="Agregar status..."
                  value={newPayStatus}
                  onChange={e => setNewPayStatus(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newPayStatus.trim()) { dispatch({ type: 'ADD_PAYMENT_STATUS', value: newPayStatus.trim() }); setNewPayStatus('') } }}
                />
                {newPayStatus.trim() && (
                  <button onClick={() => { dispatch({ type: 'ADD_PAYMENT_STATUS', value: newPayStatus.trim() }); setNewPayStatus('') }} className="p-2 rounded-xl bg-sage text-white">
                    <Plus size={12} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {state.paymentStatuses.map(s => (
                  <div key={s} className="flex items-center gap-0.5 bg-off-white dark:bg-neutral-800 rounded-lg px-2 py-0.5 text-xs border border-gray-200 dark:border-neutral-700">
                    {editPayStatus?.old === s ? (
                      <>
                        <input className="w-20 text-xs bg-transparent border-b border-sage focus:outline-none" value={editPayStatus.val} onChange={e => setEditPayStatus({ old: s, val: e.target.value })} />
                        <button onClick={() => { dispatch({ type: 'UPDATE_PAYMENT_STATUS', old: s, updated: editPayStatus.val }); setEditPayStatus(null) }} className="text-forest ml-1 text-[10px]">✓</button>
                      </>
                    ) : (
                      <>
                        <span className="cursor-pointer" onClick={() => setEditPayStatus({ old: s, val: s })}>{s}</span>
                        <button onClick={() => dispatch({ type: 'REMOVE_PAYMENT_STATUS', value: s })} className="ml-1 text-neutral-300 hover:text-red-400"><X size={10} /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </F>

          <F label="Review del cliente"><input className={inp} value={form.reviewCliente} onChange={e => set('reviewCliente', e.target.value)} /></F>
          <F label="Rubros de costos"><input className={inp} value={form.rubrosCostos} onChange={e => set('rubrosCostos', e.target.value)} /></F>
          <F label="Costos del montaje ($)"><input type="number" className={inp} value={form.costosMontaje || ''} onChange={e => set('costosMontaje', parseFloat(e.target.value) || 0)} /></F>
          <F label="Notas"><textarea className={`${inp} min-h-[60px] resize-y`} value={form.notas} onChange={e => set('notas', e.target.value)} /></F>

          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-3 border border-gray-100 dark:border-neutral-700 text-sm">
            <p className="text-xs font-semibold text-neutral-500 mb-1">Resumen</p>
            <div className="flex justify-between"><span className="text-neutral-500">Ingreso total:</span><span className="text-forest font-semibold">{formatCurrency((form.precioPaquete || 0) + (form.precioMontajeDesmontaje || 0) + (form.precioTotalAddOns || 0))}</span></div>
            <div className="flex justify-between mt-1"><span className="text-neutral-500">Ganancia neta:</span><span className="text-forest font-semibold">{formatCurrency(((form.precioPaquete || 0) + (form.precioMontajeDesmontaje || 0) + (form.precioTotalAddOns || 0)) - (form.costosMontaje || 0))}</span></div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700 flex gap-3 flex-shrink-0">
          {initial && (
            <button onClick={() => { dispatch({ type: 'DELETE_MONTAJE', id: initial.id }); onClose() }} className="p-3 rounded-2xl border border-red-200 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-neutral-700 text-neutral-500 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex-1 py-3 rounded-2xl bg-forest hover:bg-sage transition-colors text-white text-sm font-semibold">
            {initial ? 'Guardar' : 'Añadir'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inp = 'w-full border border-gray-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-sage transition-colors'

const F = ({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) => (
  <div>
    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

const formatCurrency = (n: number) => `$${Math.round(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
