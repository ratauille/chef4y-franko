export type ViewState = 'dashboard' | 'firestore' | 'workflows' | 'secrets';

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
