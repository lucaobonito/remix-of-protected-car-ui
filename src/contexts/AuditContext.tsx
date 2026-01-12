import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuditLogEntry, AuditAction, AuditEntity, AuditChange, AuditRetentionConfig, ArchivedAuditBatch } from '@/types/audit';
import { useAuth, setAuditCallback } from '@/contexts/AuthContext';
import { subDays, isBefore } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface AuditContextType {
  logs: AuditLogEntry[];
  archivedBatches: ArchivedAuditBatch[];
  retentionConfig: AuditRetentionConfig;
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
  updateRetentionConfig: (config: AuditRetentionConfig) => void;
  archiveOldLogs: () => number;
  getLogsToArchiveCount: () => number;
  deleteArchivedBatch: (batchId: string) => void;
  exportArchivedBatch: (batchId: string) => string | null;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const STORAGE_KEY = 'audit_logs';
const ARCHIVES_KEY = 'audit_archives';
const CONFIG_KEY = 'audit_retention_config';

const DEFAULT_CONFIG: AuditRetentionConfig = {
  retentionDays: 30,
  archiveEnabled: true,
  autoDeleteArchiveAfterDays: 365
};

export function AuditProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [archivedBatches, setArchivedBatches] = useState<ArchivedAuditBatch[]>(() => {
    const stored = localStorage.getItem(ARCHIVES_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [retentionConfig, setRetentionConfig] = useState<AuditRetentionConfig>(() => {
    const stored = localStorage.getItem(CONFIG_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  });

  // Register session audit callback
  useEffect(() => {
    setAuditCallback((action, userId, userName) => {
      const newEntry: AuditLogEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        userId,
        userName,
        userRole: 'employee',
        action,
        entity: 'SESSION',
        entityId: userId,
        entityDescription: action === 'LOGIN' ? `${userName} fez login no sistema` : `${userName} saiu do sistema`,
      };
      setLogs(prev => [newEntry, ...prev]);
    });
  }, []);

  // Auto-archive on load
  useEffect(() => {
    if (!retentionConfig.archiveEnabled) return;

    const cutoffDate = subDays(new Date(), retentionConfig.retentionDays);
    const logsToArchive = logs.filter(log => isBefore(new Date(log.timestamp), cutoffDate));

    if (logsToArchive.length > 0) {
      const sortedLogs = [...logsToArchive].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const batch: ArchivedAuditBatch = {
        id: `archive_${Date.now()}`,
        archivedAt: new Date().toISOString(),
        dateFrom: sortedLogs[0].timestamp,
        dateTo: sortedLogs[sortedLogs.length - 1].timestamp,
        logsCount: logsToArchive.length,
        logs: logsToArchive
      };

      setArchivedBatches(prev => [...prev, batch]);
      setLogs(prev => prev.filter(log => !isBefore(new Date(log.timestamp), cutoffDate)));

      toast({
        title: "Arquivamento automático",
        description: `${logsToArchive.length} logs antigos foram arquivados.`
      });
    }

    // Auto-delete old archives
    if (retentionConfig.autoDeleteArchiveAfterDays > 0) {
      const archiveCutoff = subDays(new Date(), retentionConfig.autoDeleteArchiveAfterDays);
      setArchivedBatches(prev => {
        const filtered = prev.filter(batch => !isBefore(new Date(batch.archivedAt), archiveCutoff));
        if (filtered.length < prev.length) {
          toast({
            title: "Limpeza de arquivos",
            description: `${prev.length - filtered.length} arquivo(s) antigo(s) foram excluídos.`
          });
        }
        return filtered;
      });
    }
  }, []); // Run only on mount

  // Persist logs
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  // Persist archives
  useEffect(() => {
    localStorage.setItem(ARCHIVES_KEY, JSON.stringify(archivedBatches));
  }, [archivedBatches]);

  // Persist config
  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(retentionConfig));
  }, [retentionConfig]);

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

  const updateRetentionConfig = useCallback((config: AuditRetentionConfig) => {
    setRetentionConfig(config);
  }, []);

  const getLogsToArchiveCount = useCallback(() => {
    const cutoffDate = subDays(new Date(), retentionConfig.retentionDays);
    return logs.filter(log => isBefore(new Date(log.timestamp), cutoffDate)).length;
  }, [logs, retentionConfig.retentionDays]);

  const archiveOldLogs = useCallback(() => {
    const cutoffDate = subDays(new Date(), retentionConfig.retentionDays);
    const logsToArchive = logs.filter(log => isBefore(new Date(log.timestamp), cutoffDate));

    if (logsToArchive.length === 0) return 0;

    const sortedLogs = [...logsToArchive].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const batch: ArchivedAuditBatch = {
      id: `archive_${Date.now()}`,
      archivedAt: new Date().toISOString(),
      dateFrom: sortedLogs[0].timestamp,
      dateTo: sortedLogs[sortedLogs.length - 1].timestamp,
      logsCount: logsToArchive.length,
      logs: logsToArchive
    };

    setArchivedBatches(prev => [...prev, batch]);
    setLogs(prev => prev.filter(log => !isBefore(new Date(log.timestamp), cutoffDate)));

    return logsToArchive.length;
  }, [logs, retentionConfig.retentionDays]);

  const deleteArchivedBatch = useCallback((batchId: string) => {
    setArchivedBatches(prev => prev.filter(batch => batch.id !== batchId));
  }, []);

  const exportArchivedBatch = useCallback((batchId: string) => {
    const batch = archivedBatches.find(b => b.id === batchId);
    if (!batch) return null;

    return JSON.stringify(batch, null, 2);
  }, [archivedBatches]);

  return (
    <AuditContext.Provider value={{ 
      logs, 
      archivedBatches,
      retentionConfig,
      addAuditLog, 
      getLogsForEntity, 
      getLogsByUser, 
      getLogsByDateRange,
      clearLogs,
      updateRetentionConfig,
      archiveOldLogs,
      getLogsToArchiveCount,
      deleteArchivedBatch,
      exportArchivedBatch
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
