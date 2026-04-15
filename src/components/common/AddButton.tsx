import { Plus } from 'lucide-react'

export const AddButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center w-7 h-7 rounded-full bg-sage hover:bg-forest transition-colors shadow-sm"
    aria-label="Agregar"
  >
    <Plus size={16} className="text-white" />
  </button>
)
