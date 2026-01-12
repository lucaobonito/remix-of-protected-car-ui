export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'STATUS_CHANGE' 
  | 'LOGIN' 
  | 'LOGOUT';

export type AuditEntity = 
  | 'INSPECTION' 
  | 'VEHICLE' 
  | 'USER' 
  | 'GOAL' 
  | 'SESSION';

export interface AuditChange {
  field: string;
  previousValue: string;
  newValue: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'employee';
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  entityDescription: string;
  changes?: AuditChange[];
  metadata?: Record<string, unknown>;
}

export interface AuditFilters {
  search: string;
  entity: AuditEntity | 'all';
  action: AuditAction | 'all';
  userId: string;
  dateFrom: string;
  dateTo: string;
}
