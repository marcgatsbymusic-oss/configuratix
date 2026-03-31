import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LayoutDashboard, Settings, DollarSign, Upload, LogOut } from 'lucide-react'
import { useEffect } from 'react'

export function AdminLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Basic protection: if not loading and no user, or profile loaded and not a partner, boot them.
    // Given the user role will be defined later, we temporarily allow 'partner' or any logged in user if they have access.
    // Alternatively, we use `authenticated` check. For now, we allow any logged in user until roles are strictly defined.
    if (!loading && !user) {
      navigate('/?login=true')
    }
  }, [user, loading, navigate, profile])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eab676]"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <h1 className="text-[#eab676] font-bold text-xl tracking-wider uppercase font-montserrat">
            Admin
          </h1>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-[#eab676] text-zinc-950 font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/setup"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-[#eab676] text-zinc-950 font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`
            }
          >
            <Settings size={20} />
            <span>Window Setup</span>
          </NavLink>

          <NavLink
            to="/admin/pricing"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-[#eab676] text-zinc-950 font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`
            }
          >
            <DollarSign size={20} />
            <span>Pricing Matrices</span>
          </NavLink>

          <NavLink
            to="/admin/upload"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-[#eab676] text-zinc-950 font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`
            }
          >
            <Upload size={20} />
            <span>Matrix Upload</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="text-sm font-medium text-zinc-300 mb-4 px-2 truncate">
            {profile?.full_name || user.email}
          </div>
          <button
            onClick={() => {
              signOut()
              navigate('/')
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-zinc-950 p-8">
        <Outlet />
      </main>
    </div>
  )
}
