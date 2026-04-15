import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { useApp } from '../../context/AppContext'

export const AuthScreen = () => {
  const { state, dispatch } = useApp()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    const user = state.users.find(u => u.email === email && u.password === password)
    if (!user) { setError('Email o contraseña incorrectos'); return }
    dispatch({ type: 'LOGIN', user })
  }

  const handleRegister = () => {
    if (!name || !email || !password) { setError('Completa todos los campos'); return }
    if (state.users.find(u => u.email === email)) { setError('Este email ya está registrado'); return }
    dispatch({ type: 'REGISTER', user: { id: uuid(), name, role, email, password } })
  }

  return (
    <div className="min-h-screen bg-off-white dark:bg-neutral-950 flex flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <h1 className="font-title text-4xl text-forest dark:text-sage tracking-wide">Real Moments</h1>
        <p className="text-sm text-neutral-400 mt-1">Gestión de montajes para eventos</p>
      </div>

      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-800 p-8">
        <h2 className="font-title text-xl text-neutral-700 dark:text-neutral-200 mb-6 text-center">
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h2>

        {error && (
          <p className="text-red-400 text-xs text-center mb-4 bg-red-50 dark:bg-red-900/20 rounded-xl p-2">{error}</p>
        )}

        <div className="space-y-3">
          {mode === 'register' && (
            <>
              <Field label="Nombre completo" value={name} onChange={setName} placeholder="Daniela Real" />
              <Field label="Cargo / Rol (opcional)" value={role} onChange={setRole} placeholder="Real Moments CEO" />
            </>
          )}
          <Field label="Email" value={email} onChange={setEmail} placeholder="tu@email.com" type="email" />
          <Field label="Contraseña" value={password} onChange={setPassword} placeholder="••••••••" type="password" />
        </div>

        <button
          onClick={mode === 'login' ? handleLogin : handleRegister}
          className="mt-6 w-full bg-forest hover:bg-sage transition-colors text-white font-body text-sm py-3 rounded-2xl"
        >
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>

        <p className="text-center text-xs text-neutral-400 mt-4">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="text-forest dark:text-sage underline underline-offset-2"
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>

        {mode === 'login' && state.users.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
            <p className="text-[10px] text-neutral-400 text-center mb-2">Acceso rápido (demo)</p>
            {state.users.map(u => (
              <button
                key={u.id}
                onClick={() => dispatch({ type: 'LOGIN', user: u })}
                className="w-full text-xs text-forest dark:text-sage text-left px-3 py-2 hover:bg-off-white dark:hover:bg-neutral-800 rounded-xl transition-colors"
              >
                {u.name} · {u.email}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const Field = ({
  label, value, onChange, placeholder, type = 'text',
}: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) => (
  <div>
    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 placeholder-neutral-300 focus:outline-none focus:border-sage transition-colors"
    />
  </div>
)
