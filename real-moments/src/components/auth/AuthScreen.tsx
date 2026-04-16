import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const AUTH_ERRORS: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos',
  'Email not confirmed': 'Debes confirmar tu email primero',
  'User already registered': 'Este email ya está registrado',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
}

const toSpanish = (msg: string) =>
  Object.entries(AUTH_ERRORS).find(([k]) => msg.includes(k))?.[1] ?? msg

export const AuthScreen = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleLogin = async () => {
    setError('')
    setSubmitting(true)
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (err) setError(toSpanish(err.message))
    setSubmitting(false)
  }

  const handleRegister = async () => {
    if (!name || !email || !password) { setError('Completa todos los campos'); return }
    setError('')
    setSubmitting(true)
    const { error: err } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name, role } },
    })
    if (err) setError(toSpanish(err.message))
    setSubmitting(false)
  }

  const switchMode = () => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }

  return (
    <div className="min-h-screen bg-off-white dark:bg-neutral-950 flex flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <h1 className="font-title text-4xl text-forest dark:text-sage tracking-wide">Real Moments</h1>
        <p className="text-sm text-neutral-400 mt-1">Gestión de montajes para eventos</p>
        <p className="text-xs text-neutral-300 mt-0.5">v2</p>
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
              <Field label="Nombre completo" value={name} onChange={setName} placeholder="Daniela Real" autoComplete="name" />
              <Field label="Cargo / Rol (opcional)" value={role} onChange={setRole} placeholder="Real Moments CEO" autoComplete="organization-title" />
            </>
          )}
          <Field label="Email" value={email} onChange={setEmail} placeholder="tu@email.com" type="email" autoComplete="email" />
          <Field label="Contraseña" value={password} onChange={setPassword} placeholder="••••••••"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          >
            <button type="button" onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-forest transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </Field>
        </div>

        <button
          onClick={mode === 'login' ? handleLogin : handleRegister}
          disabled={submitting}
          className="mt-6 w-full bg-forest hover:bg-sage disabled:opacity-50 transition-colors text-white font-body text-sm py-3 rounded-2xl"
        >
          {submitting ? '...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>

        <p className="text-center text-xs text-neutral-400 mt-4">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button onClick={switchMode} className="text-forest dark:text-sage underline underline-offset-2">
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}

const Field = ({
  label, value, onChange, placeholder, type = 'text', autoComplete, children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
  autoComplete?: string
  children?: React.ReactNode
}) => (
  <div>
    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full border border-gray-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 placeholder-neutral-300 focus:outline-none focus:border-sage transition-colors pr-9"
      />
      {children}
    </div>
  </div>
)
