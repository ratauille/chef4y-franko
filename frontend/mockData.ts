import { OrderDocument, WorkflowExecution, SecretItem } from './types.ts';

export const mockOrders: OrderDocument[] = [
    { id: 'ORD-001', customer: 'Alice Smith', items: ['Truffle Pasta', 'Garlic Bread'], total: 45.50, status: 'preparing', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    { id: 'ORD-002', customer: 'Bob Jones', items: ['Wagyu Burger', 'Fries'], total: 32.00, status: 'pending', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 'ORD-003', customer: 'Charlie Brown', items: ['Caesar Salad'], total: 12.00, status: 'ready', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: 'ORD-004', customer: 'Diana Prince', items: ['Steak Frites', 'Red Wine'], total: 85.00, status: 'delivered', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 'ORD-005', customer: 'Evan Wright', items: ['Margherita Pizza'], total: 18.00, status: 'pending', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
];

export const mockWorkflows: WorkflowExecution[] = [
    { executionId: 'exec-8f7d6a', workflowName: 'process-order-payment', status: 'SUCCEEDED', startTime: new Date(Date.now() - 1000 * 60 * 10).toISOString(), duration: '1.2s' },
    { executionId: 'exec-2b3c4d', workflowName: 'inventory-sync', status: 'ACTIVE', startTime: new Date(Date.now() - 1000 * 30).toISOString(), duration: '-' },
    { executionId: 'exec-9e8f7g', workflowName: 'send-delivery-alert', status: 'FAILED', startTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(), duration: '0.8s' },
    { executionId: 'exec-1a2b3c', workflowName: 'process-order-payment', status: 'SUCCEEDED', startTime: new Date(Date.now() - 1000 * 60 * 65).toISOString(), duration: '1.1s' },
];

export const mockSecrets: SecretItem[] = [
    { name: 'stripe-api-key', version: '3', createdAt: '2023-10-27T10:00:00Z', status: 'ENABLED' },
    { name: 'db-password-prod', version: '1', createdAt: '2023-09-15T08:30:00Z', status: 'ENABLED' },
    { name: 'twilio-auth-token', version: '2', createdAt: '2023-11-01T14:20:00Z', status: 'ENABLED' },
    { name: 'legacy-api-key', version: '1', createdAt: '2022-01-10T09:00:00Z', status: 'DISABLED' },
];

export const chartData = [
    { time: '10:00', requests: 120, errors: 2 },
    { time: '10:05', requests: 150, errors: 5 },
    { time: '10:10', requests: 180, errors: 1 },
    { time: '10:15', requests: 130, errors: 0 },
    { time: '10:20', requests: 210, errors: 8 },
    { time: '10:25', requests: 250, errors: 3 },
    { time: '10:30', requests: 190, errors: 1 },
];
