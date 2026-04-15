import { X } from 'lucide-react'
import type { ReactNode } from 'react'

type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}

export const Modal = ({ title, onClose, children, wide = false }: ModalProps) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
    <div
      className={`bg-off-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-2xl w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'} max-h-[90vh] overflow-y-auto shadow-xl`}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
        <h3 className="font-title text-lg text-neutral-800 dark:text-neutral-100">{title}</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
          <X size={18} className="text-neutral-500" />
        </button>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  </div>
)
