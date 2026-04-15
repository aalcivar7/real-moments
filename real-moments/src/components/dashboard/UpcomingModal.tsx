import { Modal } from '../common/Modal'
import { useApp } from '../../context/AppContext'
import { formatLongDate } from '../../utils/formatting'
import { CalendarDays } from 'lucide-react'

type Props = { onClose: () => void }

export const UpcomingModal = ({ onClose }: Props) => {
  const { state } = useApp()
  const today = new Date().toISOString().split('T')[0]
  const upcoming = state.montajes
    .filter(m => m.fecha >= today)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 20)

  return (
    <Modal title="Upcoming Montajes" onClose={onClose}>
      {upcoming.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-4">No hay montajes próximos</p>
      ) : (
        <div className="space-y-3">
          {upcoming.map(m => (
            <div key={m.id} className="flex items-start gap-3 p-3 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700">
              <div className="w-8 h-8 rounded-full bg-pale-pink/50 flex items-center justify-center flex-shrink-0">
                <CalendarDays size={15} className="text-forest" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{m.idMontaje}</p>
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{m.cliente}</p>
                <p className="text-xs text-neutral-400">{formatLongDate(m.fecha)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
