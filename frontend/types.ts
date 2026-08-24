export type ViewState = 'dashboard' | 'leads' | 'firestore' | 'workflows' | 'secrets';

export type DataCollection = 'leads' | 'quotes' | 'reservations';
export interface Lead {
  id: string;
  fullName?: string;
  nombre?: string;
  email?: string;
  phone?: string;
  telefono?: string;
  preferredChannel?: string;
  experienceType?: string;
  servicio?: string;
  serviceArea?: string;
  serviceDate?: string;
  guestCount?: number;
  message?: string;
  status?: string;
  estado?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  landingPage?: string;
  notes?: string[];
  lastNote?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Quote { id: string; leadId?: string; customerName?: string; total?: number; status?: string; createdAt?: string; [key: string]: unknown; }
export interface Reservation { id: string; leadId?: string; customerName?: string; reservationDate?: string; status?: string; createdAt?: string; [key: string]: unknown; }
export interface DashboardMetrics { leads: number; quotes: number; reservations: number; pendingLeads: number; recentActivity: Array<{ time: string; leads: number; quotes: number; reservations: number }>; }

export interface SystemMetrics {
    cpu: number;
    memory: number;
    activeRequests: number;
    errorRate: number;
}

export interface OrderDocument {
    id: string;
    customer: string;
    items: string[];
    total: number;
    status: 'pending' | 'preparing' | 'ready' | 'delivered';
    timestamp: string;
}

export interface WorkflowExecution {
    executionId: string;
    workflowName: string;
    status: 'ACTIVE' | 'SUCCEEDED' | 'FAILED';
    startTime: string;
    duration: string;
}

export interface SecretItem {
    name: string;
    version: string;
    createdAt: string;
    status: 'ENABLED' | 'DISABLED';
}
