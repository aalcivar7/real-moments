import { X, Sun, Moon, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'

type Props = { onClose: () => void }

export const MenuDrawer = ({ onClose }: Props) => {
  const { state, dispatch } = useApp()

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 h-full w-64 shadow-2xl p-6 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="font-title text-base text-neutral-800 dark:text-neutral-100">Menú</span>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        {state.currentUser && (
          <div className="mb-6 pb-6 border-b border-gray-100 dark:border-neutral-800">
            <div className="w-12 h-12 rounded-full bg-pale-pink flex items-center justify-center mb-3">
              <span className="font-title text-lg text-forest">
                {state.currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </span>
            </div>
            <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">{state.currentUser.name}</p>
            <p className="text-xs text-neutral-400">{state.currentUser.role}</p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Theme</p>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch({ type: 'SET_THEME', theme: 'light' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs border transition-colors ${
                state.theme === 'light'
                  ? 'bg-off-white border-sage text-forest font-semibold'
                  : 'border-gray-200 dark:border-neutral-700 text-neutral-400 hover:border-sage'
              }`}
            >
              <Sun size={14} /> Light
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_THEME', theme: 'dark' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs border transition-colors ${
                state.theme === 'dark'
                  ? 'bg-neutral-800 border-sage text-sage font-semibold'
                  : 'border-gray-200 dark:border-neutral-700 text-neutral-400 hover:border-sage'
              }`}
            >
              <Moon size={14} /> Dark
            </button>
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={() => { dispatch({ type: 'LOGOUT' }); onClose() }}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition-colors py-2"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </div>
    </div>
  )
}
