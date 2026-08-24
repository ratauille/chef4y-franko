import { DashboardMetrics, DataCollection, Lead, Quote, Reservation, WorkflowExecution } from '../types.ts';

declare global {
  interface Window {
    CHEFOS_API_URL?: string;
  }
}

const getApiUrl = (): string => {
  if (typeof window !== 'undefined' && window.CHEFOS_API_URL) {
    return window.CHEFOS_API_URL.replace(/\/$/, '');
  }
  return (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
};

const INTERNAL_API_KEY = 'chefos-internal-key-2026';

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': INTERNAL_API_KEY,
      ...options?.headers,
    },
  });
  if (!response.ok) {
    let errorText = await response.text();
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.message) errorText = parsed.message;
    } catch (_) {}
    throw new Error(`API ${response.status}: ${errorText}`);
  }
  return response.json() as Promise<T>;
};

export const getLeads = async (): Promise<Lead[]> => {
  const res = await request<{ success?: boolean; data: Lead[] }>('/api/leads');
  return Array.isArray(res) ? res : res.data || [];
};

export const createLead = async (leadData: Record<string, unknown>): Promise<{ success: boolean; id: string }> => {
  return request<{ success: boolean; id: string }>('/api/leads', {
    method: 'POST',
    body: JSON.stringify(leadData),
  });
};

export const getCollection = async (collection: DataCollection): Promise<{ data: Array<Lead | Quote | Reservation> }> => {
  const res = await request<{ success?: boolean; data: Array<Lead | Quote | Reservation> }>(`/api/${collection}`);
  return { data: Array.isArray(res) ? res : res.data || [] };
};

export const getDashboardMetrics = () => request<DashboardMetrics>('/api/dashboard/metrics');

export const getWorkflowExecutions = () => request<{ data: WorkflowExecution[] }>('/api/workflows/executions');

export const triggerWorkflow = (workflowName: string, payload: unknown = {}) =>
  request<{ execution: unknown }>(`/api/workflows/${encodeURIComponent(workflowName)}/executions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
