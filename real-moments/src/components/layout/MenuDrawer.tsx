import { useState } from 'react'
import { X, Sun, Moon, LogOut, Check, Link } from 'lucide-react'
import { useApp } from '../../context/AppContext'

type Props = { onClose: () => void }

export const MenuDrawer = ({ onClose }: Props) => {
  const { state, dispatch } = useApp()
  const [editingName, setEditingName] = useState(false)
  const [editingRole, setEditingRole] = useState(false)
  const [nameVal, setNameVal] = useState(state.currentUser?.name ?? '')
  const [roleVal, setRoleVal] = useState(state.currentUser?.role ?? '')
  const [teamLinkCopied, setTeamLinkCopied] = useState(false)
  const [viewerLinkCopied, setViewerLinkCopied] = useState(false)

  const appUrl = window.location.origin

  const saveName = () => {
    if (nameVal.trim() && nameVal !== state.currentUser?.name) {
      dispatch({ type: 'UPDATE_PROFILE', name: nameVal.trim(), role: state.currentUser?.role ?? '' })
    }
    setEditingName(false)
  }

  const saveRole = () => {
    if (roleVal !== state.currentUser?.role) {
      dispatch({ type: 'UPDATE_PROFILE', name: state.currentUser?.name ?? '', role: roleVal.trim() })
    }
    setEditingRole(false)
  }

  const copyLink = (setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(appUrl).then(() => {
      setter(true)
      setTimeout(() => setter(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 h-full w-64 shadow-2xl p-6 flex flex-col overflow-y-auto"
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

            {editingName ? (
              <div className="flex items-center gap-1 mb-1">
                <input
                  autoFocus
                  className="flex-1 text-sm font-semibold bg-transparent border-b border-sage focus:outline-none text-neutral-800 dark:text-neutral-100"
                  value={nameVal}
                  onChange={e => setNameVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                />
                <button onClick={saveName} className="text-forest"><Check size={14} /></button>
              </div>
            ) : (
              <p
                className="font-semibold text-sm text-neutral-800 dark:text-neutral-100 cursor-pointer hover:text-forest transition-colors mb-1"
                onClick={() => { setNameVal(state.currentUser?.name ?? ''); setEditingName(true) }}
              >
                {state.currentUser.name || 'Nombre completo'}
              </p>
            )}

            {editingRole ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  className="flex-1 text-xs bg-transparent border-b border-sage focus:outline-none text-neutral-400"
                  value={roleVal}
                  onChange={e => setRoleVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveRole(); if (e.key === 'Escape') setEditingRole(false) }}
                />
                <button onClick={saveRole} className="text-forest"><Check size={12} /></button>
              </div>
            ) : (
              <p
                className="text-xs text-neutral-400 cursor-pointer hover:text-forest transition-colors"
                onClick={() => { setRoleVal(state.currentUser?.role ?? ''); setEditingRole(true) }}
              >
                {state.currentUser.role || 'Cargo / Rol (opcional)'}
              </p>
            )}
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

        <div className="border-t border-gray-100 dark:border-neutral-800 pt-4 mb-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-0.5">Add Team Member</p>
            <p className="text-[10px] text-neutral-400 leading-snug mb-2">
              Compartir acceso a tu cuenta de Real Moments para que pueda editar información.
            </p>
            <button
              onClick={() => copyLink(setTeamLinkCopied)}
              className="flex items-center gap-1.5 text-xs text-forest dark:text-sage border border-sage/40 rounded-xl px-3 py-1.5 hover:bg-sage/10 transition-colors w-full justify-center"
            >
              {teamLinkCopied ? <Check size={12} /> : <Link size={12} />}
              {teamLinkCopied ? 'Enlace copiado' : 'Copiar enlace de acceso'}
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-0.5">Add Viewer</p>
            <p className="text-[10px] text-neutral-400 leading-snug mb-2">
              Compartir acceso a tu cuenta de Real Moments únicamente para que pueda visualizar y navegar la información.
            </p>
            <button
              onClick={() => copyLink(setViewerLinkCopied)}
              className="flex items-center gap-1.5 text-xs text-forest dark:text-sage border border-sage/40 rounded-xl px-3 py-1.5 hover:bg-sage/10 transition-colors w-full justify-center"
            >
              {viewerLinkCopied ? <Check size={12} /> : <Link size={12} />}
              {viewerLinkCopied ? 'Enlace copiado' : 'Copiar enlace de acceso'}
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
