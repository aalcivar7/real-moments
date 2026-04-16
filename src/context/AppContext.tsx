import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { v4 as uuid } from 'uuid'
import type { AppState, Montaje, Package, InventoryItem, InventoryMovement, Supplier, User } from '../types'
import { loadState, saveState } from '../utils/storage'
import { generateMontajeId } from '../utils/formatting'
import {
  sampleUsers, sampleMontajes, samplePackages,
  sampleInventoryItems, sampleInventoryMovements, sampleSuppliers,
} from '../utils/sampleData'

type Action =
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; user: User }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'SET_TAB'; tab: number }
  | { type: 'ADD_MONTAJE'; montaje: Omit<Montaje, 'id' | 'idMontaje' | 'n' | 'ingresoTotal' | 'gananciaNeta'> }
  | { type: 'UPDATE_MONTAJE'; montaje: Montaje }
  | { type: 'DELETE_MONTAJE'; id: string }
  | { type: 'ADD_PACKAGE'; pkg: Omit<Package, 'id'> }
  | { type: 'UPDATE_PACKAGE'; pkg: Package }
  | { type: 'DELETE_PACKAGE'; id: string }
  | { type: 'ADD_INVENTORY_ITEM'; item: Omit<InventoryItem, 'id'> }
  | { type: 'UPDATE_INVENTORY_ITEM'; item: InventoryItem }
  | { type: 'DELETE_INVENTORY_ITEM'; id: string }
  | { type: 'ADD_INVENTORY_MOVEMENT'; movement: Omit<InventoryMovement, 'id'> }
  | { type: 'DELETE_INVENTORY_MOVEMENT'; id: string }
  | { type: 'ADD_SUPPLIER'; supplier: Omit<Supplier, 'id'> }
  | { type: 'UPDATE_SUPPLIER'; supplier: Supplier }
  | { type: 'DELETE_SUPPLIER'; id: string }
  | { type: 'ADD_EVENT_TYPE'; value: string }
  | { type: 'REMOVE_EVENT_TYPE'; value: string }
  | { type: 'UPDATE_EVENT_TYPE'; old: string; updated: string }
  | { type: 'ADD_PAYMENT_STATUS'; value: string }
  | { type: 'REMOVE_PAYMENT_STATUS'; value: string }
  | { type: 'UPDATE_PAYMENT_STATUS'; old: string; updated: string }

const calcIngresos = (m: Pick<Montaje, 'precioPaquete' | 'precioMontajeDesmontaje' | 'precioTotalAddOns'>) =>
  (m.precioPaquete ?? 0) + (m.precioMontajeDesmontaje ?? 0) + (m.precioTotalAddOns ?? 0)

const renumber = (montajes: Montaje[]): Montaje[] => {
  const sorted = [...montajes].sort((a, b) => a.fecha.localeCompare(b.fecha))
  return sorted.map((m, i) => ({ ...m, n: i + 1 }))
}

const DEFAULT_EVENT_TYPES = [
  'Cumpleaños de adultos','Cumpleaños de niños','Pedida de mano','Aniversario',
  'Alquiler','Cita romántica',"Pet's Moments",'Baby session',
  'Navidad','San Valentín date',
]

const DEFAULT_PAYMENT_STATUSES = ['Completo','Pendiente','Canje']

const DATA_VERSION = 2

const getInitialState = (): AppState => {
  const saved = loadState()
  if (saved?.users?.length) {
    const isClean = (saved as AppState & { _v?: number })._v === DATA_VERSION
    return {
      currentUser: saved.currentUser ?? null,
      users: saved.users,
      montajes: isClean ? (saved.montajes ?? []) : [],
      packages: isClean ? (saved.packages ?? []) : [],
      inventoryItems: isClean ? (saved.inventoryItems ?? []) : [],
      inventoryMovements: isClean ? (saved.inventoryMovements ?? []) : [],
      suppliers: isClean ? (saved.suppliers ?? []) : [],
      eventTypes: saved.eventTypes ?? DEFAULT_EVENT_TYPES,
      paymentStatuses: saved.paymentStatuses ?? DEFAULT_PAYMENT_STATUSES,
      theme: saved.theme ?? 'light',
      activeTab: 0,
    }
  }
  return {
    currentUser: null,
    users: sampleUsers,
    montajes: sampleMontajes,
    packages: samplePackages,
    inventoryItems: sampleInventoryItems,
    inventoryMovements: sampleInventoryMovements,
    suppliers: sampleSuppliers,
    eventTypes: DEFAULT_EVENT_TYPES,
    paymentStatuses: DEFAULT_PAYMENT_STATUSES,
    theme: 'light',
    activeTab: 0,
  }
}

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.user }
    case 'LOGOUT':
      return { ...state, currentUser: null }
    case 'REGISTER': {
      const users = [...state.users, action.user]
      return { ...state, users, currentUser: action.user }
    }
    case 'SET_THEME':
      return { ...state, theme: action.theme }
    case 'SET_TAB':
      return { ...state, activeTab: action.tab }

    case 'ADD_MONTAJE': {
      const { ...rest } = action.montaje
      const ingresoTotal = calcIngresos(rest)
      const gananciaNeta = ingresoTotal - (rest.costosMontaje ?? 0)
      const idMontaje = generateMontajeId(rest.cliente, rest.fecha, rest.paquete)
      const newM: Montaje = { ...rest, id: uuid(), idMontaje, n: 0, ingresoTotal, gananciaNeta }
      return { ...state, montajes: renumber([...state.montajes, newM]) }
    }
    case 'UPDATE_MONTAJE': {
      const m = action.montaje
      const ingresoTotal = calcIngresos(m)
      const gananciaNeta = ingresoTotal - (m.costosMontaje ?? 0)
      const idMontaje = generateMontajeId(m.cliente, m.fecha, m.paquete)
      const updated = { ...m, ingresoTotal, gananciaNeta, idMontaje }
      return { ...state, montajes: renumber(state.montajes.map(x => x.id === m.id ? updated : x)) }
    }
    case 'DELETE_MONTAJE':
      return { ...state, montajes: renumber(state.montajes.filter(m => m.id !== action.id)) }

    case 'ADD_PACKAGE':
      return { ...state, packages: [...state.packages, { ...action.pkg, id: uuid() }] }
    case 'UPDATE_PACKAGE':
      return { ...state, packages: state.packages.map(p => p.id === action.pkg.id ? action.pkg : p) }
    case 'DELETE_PACKAGE':
      return { ...state, packages: state.packages.filter(p => p.id !== action.id) }

    case 'ADD_INVENTORY_ITEM':
      return { ...state, inventoryItems: [...state.inventoryItems, { ...action.item, id: uuid() }] }
    case 'UPDATE_INVENTORY_ITEM':
      return { ...state, inventoryItems: state.inventoryItems.map(i => i.id === action.item.id ? action.item : i) }
    case 'DELETE_INVENTORY_ITEM':
      return { ...state, inventoryItems: state.inventoryItems.filter(i => i.id !== action.id) }

    case 'ADD_INVENTORY_MOVEMENT':
      return { ...state, inventoryMovements: [...state.inventoryMovements, { ...action.movement, id: uuid() }] }
    case 'DELETE_INVENTORY_MOVEMENT':
      return { ...state, inventoryMovements: state.inventoryMovements.filter(m => m.id !== action.id) }

    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, { ...action.supplier, id: uuid() }] }
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

    default:
      return state
  }
}

type AppContextValue = { state: AppState; dispatch: React.Dispatch<Action> }
const AppContext = createContext<AppContextValue | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [state.theme])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
