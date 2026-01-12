import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuditLogEntry, AuditAction, AuditEntity, AuditChange } from '@/types/audit';
import { useAuth, setAuditCallback } from '@/contexts/AuthContext';

interface AuditContextType {
  logs: AuditLogEntry[];
  addAuditLog: (
    action: AuditAction,
    entity: AuditEntity,
    entityId: string,
    entityDescription: string,
    changes?: AuditChange[],
    metadata?: Record<string, unknown>
  ) => void;
  getLogsForEntity: (entity: AuditEntity, entityId: string) => AuditLogEntry[];
  getLogsByUser: (userId: string) => AuditLogEntry[];
  getLogsByDateRange: (from: string, to: string) => AuditLogEntry[];
  clearLogs: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const STORAGE_KEY = 'audit_logs';

export function AuditProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Register session audit callback
  useEffect(() => {
    setAuditCallback((action, userId, userName) => {
      const newEntry: AuditLogEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        userId,
        userName,
        userRole: 'employee', // Will be overwritten if available
        action,
        entity: 'SESSION',
        entityId: userId,
        entityDescription: action === 'LOGIN' ? `${userName} fez login no sistema` : `${userName} saiu do sistema`,
      };
      setLogs(prev => [newEntry, ...prev]);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const addAuditLog = useCallback((
    action: AuditAction,
    entity: AuditEntity,
    entityId: string,
    entityDescription: string,
    changes?: AuditChange[],
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return;

    const newEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      entity,
      entityId,
      entityDescription,
      changes,
      metadata
    };

    setLogs(prev => [newEntry, ...prev]);
  }, [user]);

  const getLogsForEntity = useCallback((entity: AuditEntity, entityId: string) => {
    return logs.filter(log => log.entity === entity && log.entityId === entityId);
  }, [logs]);

  const getLogsByUser = useCallback((userId: string) => {
    return logs.filter(log => log.userId === userId);
  }, [logs]);

  const getLogsByDateRange = useCallback((from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= fromDate && logDate <= toDate;
    });
  }, [logs]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <AuditContext.Provider value={{ 
      logs, 
      addAuditLog, 
      getLogsForEntity, 
      getLogsByUser, 
      getLogsByDateRange,
      clearLogs 
    }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
}
