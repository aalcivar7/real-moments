import type { Montaje } from '../types'
import { formatLongDate, formatCurrency } from './formatting'

const MONTAJE_HEADERS = [
  'ID Montaje','N','Cliente','Teléfono','Fecha','Hora','Sector','Ubicación',
  'Categoría','Subcategoría','Paquete','Ítems incluidos','Add-ons',
  'Precio Add-ons','Tipo de evento','Concepto','Cant. personas',
  'Precio paquete','Precio mont. y desmont.','Info. pagos','Status pago',
  'Review cliente','Ingreso total','Rubros de costos','Costos del montaje',
  'Ganancia neta','Notas',
]

const montajeToRow = (m: Montaje): (string | number)[] => [
  m.idMontaje, m.n, m.cliente, m.telefono, formatLongDate(m.fecha), m.hora,
  m.sector, m.ubicacion, m.categoria, m.subcategoria, m.paquete,
  m.itemsIncluidos, m.addOns, m.precioTotalAddOns, m.tipoEvento, m.concepto,
  m.cantidadPersonas, m.precioPaquete, m.precioMontajeDesmontaje,
  m.informacionPagos, m.statusPago, m.reviewCliente,
  m.ingresoTotal, m.rubrosCostos, m.costosMontaje, m.gananciaNeta, m.notas,
]

export const exportToPDF = async (montajes: Montaje[], title: string): Promise<void> => {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.setFontSize(14)
  doc.text(title, 14, 16)
  autoTable(doc, {
    head: [MONTAJE_HEADERS],
    body: montajes.map(montajeToRow),
    startY: 22,
    styles: { fontSize: 6, cellPadding: 1 },
    headStyles: { fillColor: [169, 182, 174] },
  })
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`)
}

export const exportToExcel = async (montajes: Montaje[], title: string): Promise<void> => {
  const XLSX = await import('xlsx')
  const data = [MONTAJE_HEADERS, ...montajes.map(montajeToRow)]
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31))
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`)
}

export const formatCurrencyExport = formatCurrency
