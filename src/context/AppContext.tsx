import { createContext, useContext, useReducer, useEffect, useRef, useCallback, useState, type ReactNode } from 'react'
import { v4 as uuid } from 'uuid'
import type { AppState, Montaje, Package, InventoryItem, InventoryMovement, Supplier, User } from '../types'
import { supabase } from '../lib/supabase'
import { generateMontajeId } from '../utils/formatting'

// ─── constants ────────────────────────────────────────────────────────────────

const DEFAULT_EVENT_TYPES = [
  'Cumpleaños de adultos', 'Cumpleaños de niños', 'Pedida de mano', 'Aniversario',
  'Alquiler', 'Cita romántica', "Pet's Moments", 'Baby session',
  'Navidad', 'San Valentín date',
]
const DEFAULT_PAYMENT_STATUSES = ['Completo', 'Pendiente', 'Canje']

// ─── action types ─────────────────────────────────────────────────────────────

type Action =
  | { type: 'INIT'; payload: Partial<AppState> & { currentUser: User } }
  | { type: 'LOGOUT' }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'SET_TAB'; tab: number }
  | { type: 'ADD_MONTAJE'; montaje: Omit<Montaje, 'id' | 'idMontaje' | 'n' | 'ingresoTotal' | 'gananciaNeta'>; _id?: string }
  | { type: 'UPDATE_MONTAJE'; montaje: Montaje }
  | { type: 'DELETE_MONTAJE'; id: string }
  | { type: 'ADD_PACKAGE'; pkg: Omit<Package, 'id'>; _id?: string }
  | { type: 'UPDATE_PACKAGE'; pkg: Package }
  | { type: 'DELETE_PACKAGE'; id: string }
  | { type: 'ADD_INVENTORY_ITEM'; item: Omit<InventoryItem, 'id'>; _id?: string }
  | { type: 'UPDATE_INVENTORY_ITEM'; item: InventoryItem }
  | { type: 'DELETE_INVENTORY_ITEM'; id: string }
  | { type: 'ADD_INVENTORY_MOVEMENT'; movement: Omit<InventoryMovement, 'id'>; _id?: string }
  | { type: 'DELETE_INVENTORY_MOVEMENT'; id: string }
  | { type: 'ADD_SUPPLIER'; supplier: Omit<Supplier, 'id'>; _id?: string }
  | { type: 'UPDATE_SUPPLIER'; supplier: Supplier }
  | { type: 'DELETE_SUPPLIER'; id: string }
  | { type: 'ADD_EVENT_TYPE'; value: string }
  | { type: 'REMOVE_EVENT_TYPE'; value: string }
  | { type: 'UPDATE_EVENT_TYPE'; old: string; updated: string }
  | { type: 'ADD_PAYMENT_STATUS'; value: string }
  | { type: 'REMOVE_PAYMENT_STATUS'; value: string }
  | { type: 'UPDATE_PAYMENT_STATUS'; old: string; updated: string }
  | { type: 'UPDATE_PROFILE'; name: string; role: string }

// ─── helpers ──────────────────────────────────────────────────────────────────

type Row = Record<string, unknown>

const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
const toSnake = (s: string) => s.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)

const rowToObj = (row: Row): Row =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamel(k), v]))

const objToRow = (obj: Row, omit: string[] = []): Row =>
  Object.fromEntries(
    Object.entries(obj)
      .filter(([k]) => !omit.includes(k))
      .map(([k, v]) => [toSnake(k), v])
  )

const calcIngresos = (m: Pick<Montaje, 'precioPaquete' | 'precioMontajeDesmontaje' | 'precioTotalAddOns'>) =>
  (m.precioPaquete ?? 0) + (m.precioMontajeDesmontaje ?? 0) + (m.precioTotalAddOns ?? 0)

const renumber = (montajes: Montaje[]): Montaje[] => {
  const sorted = [...montajes].sort((a, b) => a.fecha.localeCompare(b.fecha))
  return sorted.map((m, i) => ({ ...m, n: i + 1 }))
}

// ─── supabase data fetch ───────────────────────────────────────────────────────

const fetchAllData = async (): Promise<Partial<AppState>> => {
  const [m, p, ii, im, s, cfg] = await Promise.all([
    supabase.from('montajes').select('*'),
    supabase.from('packages').select('*'),
    supabase.from('inventory_items').select('*'),
    supabase.from('inventory_movements').select('*'),
    supabase.from('suppliers').select('*'),
    supabase.from('app_settings').select('*').eq('id', 1).maybeSingle(),
  ])

  const errs = [m, p, ii, im, s].map((r, i) => r.error ? `[${['montajes','packages','inventory_items','inventory_movements','suppliers'][i]}] ${r.error.message}` : null).filter(Boolean)
  if (errs.length) throw new Error(`Error cargando datos: ${errs.join(' | ')}`)

  return {
    montajes: renumber((m.data ?? []).map(r => rowToObj(r) as Montaje)),
    packages: (p.data ?? []).map(r => rowToObj(r) as Package),
    inventoryItems: (ii.data ?? []).map(r => rowToObj(r) as InventoryItem),
    inventoryMovements: (im.data ?? []).map(r => rowToObj(r) as InventoryMovement),
    suppliers: (s.data ?? []).map(r => rowToObj(r) as Supplier),
    eventTypes: (cfg.data?.event_types as string[]) ?? DEFAULT_EVENT_TYPES,
    paymentStatuses: (cfg.data?.payment_statuses as string[]) ?? DEFAULT_PAYMENT_STATUSES,
  }
}

// ─── supabase sync ────────────────────────────────────────────────────────────

const sb = async (p: PromiseLike<{ error: { message: string; code?: string; details?: string; hint?: string } | null }>) => {
  const { error } = await p
  if (error) {
    const detail = [error.message, error.hint, error.details].filter(Boolean).join(' — ')
    throw new Error(detail)
  }
}

const syncToSupabase = async (action: Action, state: AppState): Promise<void> => {
  const uid = state.currentUser?.id
  switch (action.type) {
    case 'ADD_MONTAJE': {
      const id = action._id!
      const m = action.montaje
      const ingresoTotal = calcIngresos(m)
      const gananciaNeta = ingresoTotal - (m.costosMontaje ?? 0)
      const idMontaje = generateMontajeId(m.cliente, m.fecha, m.paquete)
      await sb(supabase.from('montajes').insert(
        objToRow({ ...m, id, idMontaje, ingresoTotal, gananciaNeta, userId: uid }, ['n'])
      ))
      break
    }
    case 'UPDATE_MONTAJE': {
      const m = action.montaje
      const ingresoTotal = calcIngresos(m)
      const gananciaNeta = ingresoTotal - (m.costosMontaje ?? 0)
      const idMontaje = generateMontajeId(m.cliente, m.fecha, m.paquete)
      await sb(supabase.from('montajes')
        .update(objToRow({ ...m, idMontaje, ingresoTotal, gananciaNeta }, ['id', 'n']))
        .eq('id', m.id))
      break
    }
    case 'DELETE_MONTAJE':
      await sb(supabase.from('montajes').delete().eq('id', action.id))
      break

    case 'ADD_PACKAGE':
      await sb(supabase.from('packages').insert(objToRow({ ...action.pkg, id: action._id!, userId: uid })))
      break
    case 'UPDATE_PACKAGE':
      await sb(supabase.from('packages').update(objToRow(action.pkg as unknown as Row, ['id'])).eq('id', action.pkg.id))
      break
    case 'DELETE_PACKAGE':
      await sb(supabase.from('packages').delete().eq('id', action.id))
      break

    case 'ADD_INVENTORY_ITEM':
      await sb(supabase.from('inventory_items').insert(objToRow({ ...action.item, id: action._id!, userId: uid })))
      break
    case 'UPDATE_INVENTORY_ITEM':
      await sb(supabase.from('inventory_items').update(objToRow(action.item as unknown as Row, ['id'])).eq('id', action.item.id))
      break
    case 'DELETE_INVENTORY_ITEM':
      await sb(supabase.from('inventory_items').delete().eq('id', action.id))
      break

    case 'ADD_INVENTORY_MOVEMENT':
      await sb(supabase.from('inventory_movements').insert(objToRow({ ...action.movement, id: action._id!, userId: uid })))
      break
    case 'DELETE_INVENTORY_MOVEMENT':
      await sb(supabase.from('inventory_movements').delete().eq('id', action.id))
      break

    case 'ADD_SUPPLIER':
      await sb(supabase.from('suppliers').insert(objToRow({ ...action.supplier, id: action._id!, userId: uid })))
      break
    case 'UPDATE_SUPPLIER':
      await sb(supabase.from('suppliers').update(objToRow(action.supplier as unknown as Row, ['id'])).eq('id', action.supplier.id))
      break
    case 'DELETE_SUPPLIER':
      await sb(supabase.from('suppliers').delete().eq('id', action.id))
      break

    case 'ADD_EVENT_TYPE':
      await sb(supabase.from('app_settings').upsert({ id: 1, event_types: [...state.eventTypes, action.value] }))
      break
    case 'REMOVE_EVENT_TYPE':
      await sb(supabase.from('app_settings').upsert({ id: 1, event_types: state.eventTypes.filter(e => e !== action.value) }))
      break
    case 'UPDATE_EVENT_TYPE':
      await sb(supabase.from('app_settings').upsert({ id: 1, event_types: state.eventTypes.map(e => e === action.old ? action.updated : e) }))
      break

    case 'ADD_PAYMENT_STATUS':
      await sb(supabase.from('app_settings').upsert({ id: 1, payment_statuses: [...state.paymentStatuses, action.value] }))
      break
    case 'REMOVE_PAYMENT_STATUS':
      await sb(supabase.from('app_settings').upsert({ id: 1, payment_statuses: state.paymentStatuses.filter(s => s !== action.value) }))
      break
    case 'UPDATE_PAYMENT_STATUS':
      await sb(supabase.from('app_settings').upsert({ id: 1, payment_statuses: state.paymentStatuses.map(s => s === action.old ? action.updated : s) }))
      break

    case 'UPDATE_PROFILE':
      await supabase.auth.updateUser({ data: { name: action.name, role: action.role } })
      break

    case 'LOGOUT':
      await supabase.auth.signOut()
      break
  }
}

// ─── reducer ──────────────────────────────────────────────────────────────────

const initialState: AppState = {
  currentUser: null,
  users: [],
  montajes: [],
  packages: [],
  inventoryItems: [],
  inventoryMovements: [],
  suppliers: [],
  eventTypes: DEFAULT_EVENT_TYPES,
  paymentStatuses: DEFAULT_PAYMENT_STATUSES,
  theme: (localStorage.getItem('rm_theme') as 'light' | 'dark') ?? 'light',
  activeTab: 0,
}

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload }
    case 'LOGOUT':
      return { ...initialState, theme: state.theme }
    case 'SET_THEME':
      return { ...state, theme: action.theme }
    case 'SET_TAB':
      return { ...state, activeTab: action.tab }

    case 'ADD_MONTAJE': {
      const id = action._id ?? uuid()
      const m = action.montaje
      const ingresoTotal = calcIngresos(m)
      const gananciaNeta = ingresoTotal - (m.costosMontaje ?? 0)
      const idMontaje = generateMontajeId(m.cliente, m.fecha, m.paquete)
      return { ...state, montajes: renumber([...state.montajes, { ...m, id, idMontaje, n: 0, ingresoTotal, gananciaNeta }]) }
    }
    case 'UPDATE_MONTAJE': {
      const m = action.montaje
      const ingresoTotal = calcIngresos(m)
      const gananciaNeta = ingresoTotal - (m.costosMontaje ?? 0)
      const idMontaje = generateMontajeId(m.cliente, m.fecha, m.paquete)
      return { ...state, montajes: renumber(state.montajes.map(x => x.id === m.id ? { ...m, ingresoTotal, gananciaNeta, idMontaje } : x)) }
    }
    case 'DELETE_MONTAJE':
      return { ...state, montajes: renumber(state.montajes.filter(m => m.id !== action.id)) }

    case 'ADD_PACKAGE':
      return { ...state, packages: [...state.packages, { ...action.pkg, id: action._id ?? uuid() }] }
    case 'UPDATE_PACKAGE':
      return { ...state, packages: state.packages.map(p => p.id === action.pkg.id ? action.pkg : p) }
    case 'DELETE_PACKAGE':
      return { ...state, packages: state.packages.filter(p => p.id !== action.id) }

    case 'ADD_INVENTORY_ITEM':
      return { ...state, inventoryItems: [...state.inventoryItems, { ...action.item, id: action._id ?? uuid() }] }
    case 'UPDATE_INVENTORY_ITEM':
      return { ...state, inventoryItems: state.inventoryItems.map(i => i.id === action.item.id ? action.item : i) }
    case 'DELETE_INVENTORY_ITEM':
      return { ...state, inventoryItems: state.inventoryItems.filter(i => i.id !== action.id) }

    case 'ADD_INVENTORY_MOVEMENT':
      return { ...state, inventoryMovements: [...state.inventoryMovements, { ...action.movement, id: action._id ?? uuid() }] }
    case 'DELETE_INVENTORY_MOVEMENT':
      return { ...state, inventoryMovements: state.inventoryMovements.filter(m => m.id !== action.id) }

    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, { ...action.supplier, id: action._id ?? uuid() }] }
    case 'UPDATE_SUPPLIER':
      return { ...state, suppliers: state.suppliers.map(s => s.id === action.supplier.id ? action.supplier : s) }
    case 'DELETE_SUPPLIER':
      return { ...state, suppliers: state.suppliers.filter(s => s.id !== action.id) }

    case 'ADD_EVENT_TYPE':
      return { ...state, eventTypes: [...state.eventTypes, action.value] }
    case 'REMOVE_EVENT_TYPE':
      return { ...state, eventTypes: state.eventTypes.filter(e => e !== action.value) }
    case 'UPDATE_EVENT_TYPE':
      return { ...state, eventTypes: state.eventTypes.map(e => e === action.old ? action.updated : e) }

    case 'ADD_PAYMENT_STATUS':
      return { ...state, paymentStatuses: [...state.paymentStatuses, action.value] }
    case 'REMOVE_PAYMENT_STATUS':
      return { ...state, paymentStatuses: state.paymentStatuses.filter(s => s !== action.value) }
    case 'UPDATE_PAYMENT_STATUS':
      return { ...state, paymentStatuses: state.paymentStatuses.map(s => s === action.old ? action.updated : s) }

    case 'UPDATE_PROFILE':
      return { ...state, currentUser: state.currentUser ? { ...state.currentUser, name: action.name, role: action.role } : null }

    default:
      return state
  }
}

// ─── context ──────────────────────────────────────────────────────────────────

type AppContextValue = {
  state: AppState
  loading: boolean
  syncError: string | null
  clearSyncError: () => void
  dispatch: (action: Action) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, rawDispatch] = useReducer(reducer, initialState)
  const [loading, setLoading] = useState(true)
  const [syncError, setSyncError] = useState<string | null>(null)
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem('rm_theme', state.theme)
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
  }, [state.theme])

  // Auth listener — fires on page load and on login/logout
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session) {
          // getUser() runs first to ensure the session token is fully propagated
          // to the PostgREST client before fetchAllData() makes its SELECT queries.
          const userRes = await supabase.auth.getUser()
          const data = await fetchAllData()
          const meta = userRes.data.user?.user_metadata ?? {}
          const currentUser: User = {
            id: session.user.id,
            name: (meta.name as string) ?? '',
            role: (meta.role as string) ?? '',
            email: session.user.email ?? '',
            password: '',
          }
          rawDispatch({ type: 'INIT', payload: { ...data, currentUser } })
        } else {
          rawDispatch({ type: 'LOGOUT' })
        }
      } catch (err) {
        console.error('Auth state change error:', err)
        setSyncError(`Error al cargar datos: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Wrapped dispatch: pre-generates IDs for ADD actions, then syncs to Supabase
  const dispatch = useCallback((action: Action) => {
    const enriched: Action = (() => {
      switch (action.type) {
        case 'ADD_MONTAJE': return { ...action, _id: action._id ?? uuid() }
        case 'ADD_PACKAGE': return { ...action, _id: action._id ?? uuid() }
        case 'ADD_INVENTORY_ITEM': return { ...action, _id: action._id ?? uuid() }
        case 'ADD_INVENTORY_MOVEMENT': return { ...action, _id: action._id ?? uuid() }
        case 'ADD_SUPPLIER': return { ...action, _id: action._id ?? uuid() }
        default: return action
      }
    })()
    rawDispatch(enriched)
    syncToSupabase(enriched, stateRef.current).catch((err: unknown) => {
      console.error('Supabase sync error:', err)
      const msg = err instanceof Error ? err.message : String(err)
      setSyncError(`Error al guardar: ${msg}`)
    })
  }, [])

  const clearSyncError = useCallback(() => setSyncError(null), [])

  return (
    <AppContext.Provider value={{ state, loading, syncError, clearSyncError, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
