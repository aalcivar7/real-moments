import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { Modal } from '../common/Modal'
import { useApp } from '../../context/AppContext'

type Props = { onClose: () => void }

export const PackagesModal = ({ onClose }: Props) => {
  const { state } = useApp()
  const [openCats, setOpenCats] = useState<Set<string>>(new Set())
  const [openSubs, setOpenSubs] = useState<Set<string>>(new Set())

  const tree: Record<string, Record<string, string[]>> = {}
  state.packages.forEach(pkg => {
    if (!tree[pkg.categoria]) tree[pkg.categoria] = {}
    if (!tree[pkg.categoria][pkg.subcategoria]) tree[pkg.categoria][pkg.subcategoria] = []
    tree[pkg.categoria][pkg.subcategoria].push(pkg.paquete)
  })

  const toggleCat = (cat: string) => setOpenCats(s => { const n = new Set(s); n.has(cat) ? n.delete(cat) : n.add(cat); return n })
  const toggleSub = (sub: string) => setOpenSubs(s => { const n = new Set(s); n.has(sub) ? n.delete(sub) : n.add(sub); return n })

  return (
    <Modal title="Paquetes" onClose={onClose}>
      <div className="space-y-1">
        {Object.entries(tree).map(([cat, subs]) => (
          <div key={cat}>
            <button
              onClick={() => toggleCat(cat)}
              className="flex items-center gap-2 w-full text-left py-2 px-2 rounded-xl hover:bg-off-white dark:hover:bg-neutral-800 transition-colors"
            >
              {openCats.has(cat) ? <ChevronDown size={14} className="text-forest" /> : <ChevronRight size={14} className="text-neutral-400" />}
              <span className="font-semibold text-sm text-neutral-700 dark:text-neutral-200">{cat}</span>
            </button>
            {openCats.has(cat) && (
              <div className="ml-4 space-y-1">
                {Object.entries(subs).map(([sub, pkgs]) => (
                  <div key={sub}>
                    <button
                      onClick={() => toggleSub(`${cat}::${sub}`)}
                      className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-xl hover:bg-off-white dark:hover:bg-neutral-800 transition-colors"
                    >
                      {openSubs.has(`${cat}::${sub}`) ? <ChevronDown size={13} className="text-mauve" /> : <ChevronRight size={13} className="text-neutral-400" />}
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">{sub}</span>
                    </button>
                    {openSubs.has(`${cat}::${sub}`) && (
                      <div className="ml-8 space-y-1 py-1">
                        {pkgs.map(pkg => (
                          <div key={pkg} className="flex items-center gap-2 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-pale-pink flex-shrink-0" />
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">{pkg}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  )
}
