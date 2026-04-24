import { Heart, FolderOpen, DollarSign, ClipboardList } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const TABS = [
  { icon: Heart, label: 'Dashboard' },
  { icon: FolderOpen, label: 'Montajes' },
  { icon: DollarSign, label: 'Finanzas' },
  { icon: ClipboardList, label: 'Inventario' },
]

export const BottomNav = () => {
  const { state, dispatch } = useApp()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800 flex justify-around items-center h-16 px-2 safe-area-inset-bottom">
      {TABS.map(({ icon: Icon, label }, i) => {
        const active = state.activeTab === i
        return (
          <button
            key={i}
            onClick={() => dispatch({ type: 'SET_TAB', tab: i })}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              active ? 'text-forest dark:text-sage' : 'text-neutral-300 dark:text-neutral-600'
            }`}
            aria-label={label}
          >
            <Icon
              size={22}
              strokeWidth={active ? 1.8 : 1.5}
              className={active ? 'drop-shadow-sm' : ''}
            />
            {active && <span className="w-1 h-1 rounded-full bg-forest dark:bg-sage" />}
          </button>
        )
      })}
    </nav>
  )
}
