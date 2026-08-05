import React, { createContext, useContext, useState, useEffect } from 'react';

type AppRole = 'ADMIN' | 'DISPATCHER' | 'SUPERVISOR' | 'MANAGEMENT' | 'CREW_LEAD' | 'INSTALLER';

interface User {
  id: string;
  name: string;
  email: string;
  roles: AppRole[];
}

interface AuthContextType {
  user: User | null;
  loginAs: (role: AppRole) => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load from local storage for persistence across reloads during dev
  useEffect(() => {
    const savedRole = localStorage.getItem('mockRole');
    if (savedRole) {
      setUser({ id: 'marc-user-1', name: 'Marc', email: 'marc.truekalia@gmail.com', roles: [savedRole as AppRole] });
      setToken(savedRole);
    }
  }, []);

  const loginAs = (role: AppRole) => {
    setUser({ id: 'marc-user-1', name: 'Marc', email: 'marc.truekalia@gmail.com', roles: [role] });
    setToken(role);
    localStorage.setItem('mockRole', role);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mockRole');
  };

  return (
    <AuthContext.Provider value={{ user, loginAs, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
