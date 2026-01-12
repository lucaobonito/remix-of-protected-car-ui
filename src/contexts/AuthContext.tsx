import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<UserRole, User> = {
  admin: {
    id: '1',
    name: 'Carlos Silva',
    email: 'admin@protectedcar.com',
    role: 'admin',
    avatar: 'CS',
  },
  employee: {
    id: '2',
    name: 'Ana Santos',
    email: 'funcionario@protectedcar.com',
    role: 'employee',
    avatar: 'AS',
  },
};

// Callback type for audit logging (injected to avoid circular dependency)
type AuditCallback = (action: 'LOGIN' | 'LOGOUT', userId: string, userName: string) => void;
let auditCallback: AuditCallback | null = null;

export function setAuditCallback(callback: AuditCallback) {
  auditCallback = callback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (password.length >= 4) {
      const loggedUser = mockUsers[role];
      setUser(loggedUser);
      // Audit log will be handled by AuditProvider after mount
      setTimeout(() => {
        if (auditCallback) {
          auditCallback('LOGIN', loggedUser.id, loggedUser.name);
        }
      }, 100);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (user && auditCallback) {
      auditCallback('LOGOUT', user.id, user.name);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
