import React from 'react';
import { Activity, Server, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartData } from '../../mockData.ts';

export const DashboardView: React.FC = () => {
    return (
        <div className="p-8 h-full overflow-y-auto">
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-white">System Overview</h2>
                <p className="text-slate-400">Real-time metrics for Cloud Run & Workflows</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Cloud Run Status" 
                    value="Healthy" 
                    icon={<CheckCircle2 className="text-emerald-500" size={24} />} 
                    trend="us-central1"
                />
                <StatCard 
                    title="Active Requests" 
                    value="243/s" 
                    icon={<Activity className="text-blue-500" size={24} />} 
                    trend="+12% from last hour"
                />
                <StatCard 
                    title="Active Workflows" 
                    value="12" 
                    icon={<Server className="text-purple-500" size={24} />} 
                    trend="3 pending"
                />
                <StatCard 
                    title="Error Rate" 
                    value="0.02%" 
                    icon={<AlertCircle className="text-chef-500" size={24} />} 
                    trend="Normal"
                />
            </div>

            {/* Chart Section */}
            <div className="bg-dark-surface border border-dark-border rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-6">Traffic & Errors (Last 30m)</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} dot={false} name="Requests" />
                            <Line type="monotone" dataKey="errors" stroke="#f97316" strokeWidth={2} dot={false} name="Errors" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* Deployment Info */}
            <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Deployments</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-dark-border/50">
                        <div>
                            <p className="font-medium text-white">chefos-dashboard</p>
                            <p className="text-sm text-slate-400">us-docker.pkg.dev/cloudrun/container/hello</p>
                        </div>
                        <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                Active
                            </span>
                            <p className="text-xs text-slate-500 mt-1">Deployed 2h ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-6 flex flex-col">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-medium">{title}</h3>
            {icon}
        </div>
        <div className="mt-auto">
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-slate-500">{trend}</p>
        </div>
    </div>
);
