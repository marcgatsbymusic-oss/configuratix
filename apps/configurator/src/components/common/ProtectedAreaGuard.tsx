import React, { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

// Specific credentials requested by the user
const PROTECTED_USER = 'marc.truekalia@gmail.com'
const PROTECTED_PASS = 'Poland2026!*!'
const AUTH_STORAGE_KEY = 'mammut_pricing_config_auth'

interface ProtectedAreaGuardProps {
  children: React.ReactNode
}

export function ProtectedAreaGuard({ children }: ProtectedAreaGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Artificial tiny delay for premium micro-animation feel
    setTimeout(() => {
      if (email.trim().toLowerCase() === PROTECTED_USER.toLowerCase() && password === PROTECTED_PASS) {
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, 'true')
        } catch (err) {
          console.error('Failed to save auth state to localStorage', err)
        }
        setIsAuthenticated(true)
      } else {
        setError('Invalid credentials. Access denied.')
      }
      setIsLoading(false)
    }, 450)
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-mammut-darker flex items-center justify-center p-6 font-sans relative overflow-hidden select-none">
      {/* Dynamic Gradient Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-mammut-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Logo & Title */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-20 h-20 bg-mammut-dark border border-mammut-border rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl relative group">
            <div className="absolute inset-0 bg-mammut-gold/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Lock size={32} className="text-mammut-gold transform group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black text-mammut-white tracking-wider uppercase">
            Restricted Area
          </h1>
          <p className="text-mammut-grey-light text-sm mt-3 font-medium tracking-wide">
            Enter your credentials to access this section
          </p>
        </div>

        {/* Login Form */}
        <form 
          onSubmit={handleLogin} 
          className="bg-mammut-dark/80 backdrop-blur-xl border border-mammut-border rounded-3xl p-8 shadow-2xl space-y-6 transition-all duration-300 hover:border-mammut-border/80"
        >
          <div>
            <label className="block text-[10px] font-bold text-mammut-grey-light uppercase tracking-widest mb-2.5">
              Username / Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-mammut-darker/60 border border-mammut-border rounded-xl px-4 py-3.5 text-mammut-white text-sm placeholder-zinc-600 focus:outline-none focus:border-mammut-gold/50 focus:bg-mammut-darker/80 transition-all duration-300"
              placeholder="name@domain.com"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-mammut-grey-light uppercase tracking-widest mb-2.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-mammut-darker/60 border border-mammut-border rounded-xl px-4 py-3.5 text-mammut-white text-sm placeholder-zinc-600 focus:outline-none focus:border-mammut-gold/50 focus:bg-mammut-darker/80 transition-all duration-300 pr-12"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-mammut-grey-light hover:text-mammut-gold transition-colors duration-200 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm animate-scale-in">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-mammut-gold text-mammut-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-mammut-gold-light transition-all duration-300 disabled:opacity-60 cursor-pointer shadow-lg shadow-mammut-gold/10 hover:shadow-mammut-gold/20 active:scale-[0.98]"
          >
            {isLoading ? 'Authenticating...' : 'Unlock Section'}
          </button>
        </form>

        <p className="text-center text-mammut-grey-light/60 text-xs mt-8 tracking-wide">
          Authorized configuration & debug personnel only.
        </p>
      </div>
    </div>
  )
}
