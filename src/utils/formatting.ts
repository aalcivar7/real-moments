const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MONTHS_SHORT = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
const DAYS_ES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

export const formatLongDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  const dayName = DAYS_ES[d.getDay()]
  const day = d.getDate()
  const month = MONTHS_ES[d.getMonth()]
  const year = d.getFullYear()
  return `${dayName}, ${day} de ${month}, ${year}`
}

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDate()
  const month = MONTHS_SHORT[d.getMonth()]
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const getClientInitials = (name: string): string => {
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

export const getMonthShort = (dateStr: string): string => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return MONTHS_SHORT[d.getMonth()]
}

export const generateMontajeId = (cliente: string, fecha: string, paquete: string): string => {
  const initials = getClientInitials(cliente)
  const month = getMonthShort(fecha)
  const pkg = paquete.toUpperCase().replace(/\s+/g, '_')
  return `${initials}.${month}.${pkg}`
}

export const getMonthName = (monthIndex: number): string => MONTHS_ES[monthIndex] ?? ''
export const getMonthShortByIndex = (monthIndex: number): string => MONTHS_SHORT[monthIndex] ?? ''
