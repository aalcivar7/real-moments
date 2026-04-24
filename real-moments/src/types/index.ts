export type Theme = 'light' | 'dark'

export type User = {
  id: string
  name: string
  role: string
  email: string
  password: string
}

export type Package = {
  id: string
  categoria: string
  subcategoria: string
  paquete: string
  precio: string
  itemsIncluidos: string
}

export type Montaje = {
  id: string
  idMontaje: string
  n: number
  cliente: string
  telefono: string
  fecha: string
  hora: string
  sector: string
  ubicacion: string
  categoria: string
  subcategoria: string
  paquete: string
  itemsIncluidos: string
  addOns: string
  precioTotalAddOns: number
  tipoEvento: string
  concepto: string
  cantidadPersonas: number
  precioPaquete: number
  precioMontajeDesmontaje: number
  informacionPagos: string
  statusPago: string
  reviewCliente: string
  ingresoTotal: number
  rubrosCostos: string
  costosMontaje: number
  gananciaNeta: number
  notas: string
}

export type InventoryItem = {
  id: string
  categoria: string
  item: string
  descripcion: string
  referenciaCosteUnitario: number
  observaciones: string
}

export type InventoryMovement = {
  id: string
  itemId: string
  tipoMovimiento: 'Entrada' | 'Salida'
  cantidad: number
  fecha: string
  notas: string
}

export type Supplier = {
  id: string
  proveedor: string
  contactoComercial: string
  productoServicio: string
  precio: string
  telefono: string
  email: string
  direccion: string
  review: string
  notas: string
}

export type AppState = {
  currentUser: User | null
  users: User[]
  montajes: Montaje[]
  packages: Package[]
  inventoryItems: InventoryItem[]
  inventoryMovements: InventoryMovement[]
  suppliers: Supplier[]
  eventTypes: string[]
  paymentStatuses: string[]
  theme: Theme
  activeTab: number
}

export type SortConfig = {
  key: string
  direction: 'asc' | 'desc'
}

export type FilterConfig = Record<string, string>
