import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Modal } from '../common/Modal'
import { useApp } from '../../context/AppContext'

type Props = { onClose: () => void }

const DAYS = ['L','M','M','J','V','S','D']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export const CalendarModal = ({ onClose }: Props) => {
  const { state } = useApp()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const montajesByDate: Record<string, string[]> = {}
  state.montajes.forEach(m => {
    if (!montajesByDate[m.fecha]) montajesByDate[m.fecha] = []
    montajesByDate[m.fecha].push(m.cliente)
  })

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // Monday = 0

  const cells: (number | null)[] = [...Array(startDow).fill(null)]
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const prev = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const dateKey = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const todayKey = new Date().toISOString().split('T')[0]

  return (
    <Modal title="Calendario" onClose={onClose} wide>
      <div>
        <div className="flex items-center justify-between mb-4">
          <button onClick={prev} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-title text-base text-neutral-700 dark:text-neutral-200">
            {MONTHS_ES[month]} {year}
          </span>
          <button onClick={next} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-neutral-400 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const key = dateKey(d)
            const hasMontaje = !!montajesByDate[key]
            const isToday = key === todayKey
            return (
              <div key={i} className="flex justify-center">
                <button
                  onClick={() => setSelectedDate(hasMontaje ? key : null)}
                  className={`w-8 h-8 rounded-full text-xs font-body flex items-center justify-center transition-colors ${
                    hasMontaje
                      ? 'bg-pale-pink text-forest font-semibold hover:bg-mauve cursor-pointer'
                      : isToday
                      ? 'border border-sage text-sage'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {d}
                </button>
              </div>
            )
          })}
        </div>

        {selectedDate && montajesByDate[selectedDate] && (
          <div className="mt-4 p-3 bg-pale-pink/20 rounded-2xl border border-pale-pink/40">
            <p className="text-xs font-semibold text-forest mb-1">{selectedDate}</p>
            {montajesByDate[selectedDate].map((cliente, i) => (
              <p key={i} className="text-sm text-neutral-700 dark:text-neutral-200">{cliente}</p>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
