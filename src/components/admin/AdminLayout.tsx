import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  LayoutDashboard, Settings, DollarSign, Upload, LogOut,
  FileText, Factory, Eye, EyeOff, Lock
} from 'lucide-react'
import { ThemeToggle } from '../common/ThemeToggle'

// ─── Local-access credentials (dev bypass ─ no Supabase required) ───────────
const LOCAL_ADMIN_EMAIL    = 'admin@shadow.bo'
const LOCAL_ADMIN_PASSWORD = 'Shadow2026!'
const LOCAL_STORAGE_KEY    = 'bo_local_auth'
// ─────────────────────────────────────────────────────────────────────────────

function useLocalAuth() {
  const [authed, setAuthed] = useState<boolean>(() => {
    try { return localStorage.getItem(LOCAL_STORAGE_KEY) === '1' } catch { return false }
  })

  const localSignIn = (email: string, pass: string): boolean => {
    if (email.trim().toLowerCase() === LOCAL_ADMIN_EMAIL.toLowerCase() && pass === LOCAL_ADMIN_PASSWORD) {
      localStorage.setItem(LOCAL_STORAGE_KEY, '1')
      setAuthed(true)
      return true
    }
    return false
  }

  const localSignOut = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    setAuthed(false)
  }

  return { authed, localSignIn, localSignOut }
}

function AdminLoginScreen({ onLocalLogin }: { onLocalLogin: (e: string, p: string) => boolean }) {
  const { signIn } = useAuth()
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShow]     = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 1️⃣ Try hardcoded local bypass first
    if (onLocalLogin(email, password)) {
      setLoading(false)
      return
    }

    // 2️⃣ Fall back to Supabase auth
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError('Invalid email or password.')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-mammut-gold/10 border border-mammut-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock size={28} className="text-mammut-gold" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black text-mammut-white tracking-tight">Back Office</h1>
          <p className="text-zinc-500 text-sm mt-2">Sign in with your admin credentials</p>
        </div>

        <form onSubmit={handleLogin} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-mammut-white text-sm placeholder-zinc-600 focus:outline-none focus:border-mammut-gold/60 transition-colors"
              placeholder="admin@shadow.bo"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-mammut-white text-sm placeholder-zinc-600 focus:outline-none focus:border-mammut-gold/60 transition-colors pr-12"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShow(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-mammut-gold text-zinc-950 py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-[#ffc882] transition-colors disabled:opacity-60 mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-zinc-700 text-xs mt-6">
          Restricted access — authorised personnel only
        </p>
      </div>
    </div>
  )
}

const NAV_ITEMS = [
  { to: '/admin',           end: true,  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/quotations',end: false, icon: FileText,         label: 'Quotations' },
  { to: '/admin/factory',   end: false, icon: Factory,          label: 'Factory Queue' },
  { to: '/admin/setup',     end: false, icon: Settings,         label: 'Window Setup' },
  { to: '/admin/pricing',   end: false, icon: DollarSign,       label: 'Pricing Matrices' },
  { to: '/admin/upload',    end: false, icon: Upload,           label: 'Matrix Upload' },
]

export function AdminLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const { authed, localSignIn, localSignOut } = useLocalAuth()

  // Bypass Supabase loading spinner when local auth is active
  if (loading && !authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mammut-gold" />
      </div>
    )
  }

  // Show login if neither local-authed nor Supabase-authed
  if (!authed && !user) {
    return <AdminLoginScreen onLocalLogin={localSignIn} />
  }

  const displayName = profile?.full_name || user?.email || LOCAL_ADMIN_EMAIL

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 gap-3">
          <div className="w-7 h-7 bg-mammut-gold/20 rounded-lg flex items-center justify-center shrink-0">
            <Lock size={14} className="text-mammut-gold" />
          </div>
          <h1 className="text-mammut-gold font-black text-lg tracking-wider uppercase">Back Office</h1>
        </div>

        <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, end, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-mammut-gold text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-mammut-white hover:bg-zinc-800'
                }`
              }>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="text-xs font-medium text-zinc-500 mb-3 px-2 truncate">
            {displayName}
          </div>
          <button
            onClick={() => {
              if (authed) { localSignOut(); navigate('/') }
              else { signOut(); navigate('/') }
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-mammut-white hover:bg-zinc-800 transition-all text-sm"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-950 p-8 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <Outlet />
      </main>
    </div>
  )
}
