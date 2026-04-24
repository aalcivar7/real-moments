import { Modal } from '../common/Modal'
import { useApp } from '../../context/AppContext'
import { formatLongDate } from '../../utils/formatting'

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
        <div className="grid grid-cols-2 gap-2">
          {upcoming.map(m => (
            <div key={m.id} className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 p-3 text-left">
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 truncate">{m.cliente}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5 truncate">{formatLongDate(m.fecha)}</p>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {m.tipoEvento && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pale-pink/40 text-mauve">{m.tipoEvento}</span>
                )}
                {m.sector && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sage/20 text-forest">{m.sector}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
