import React from 'react';
import { GitMerge, Play, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { mockWorkflows } from '../../mockData.ts';

export const WorkflowsView: React.FC = () => {
    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'SUCCEEDED': return <CheckCircle2 className="text-emerald-500" size={18} />;
            case 'FAILED': return <XCircle className="text-red-500" size={18} />;
            case 'ACTIVE': return <Play className="text-blue-500 animate-pulse" size={18} />;
            default: return <Clock className="text-slate-500" size={18} />;
        }
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <GitMerge className="text-chef-500" />
                        Cloud Workflows
                    </h2>
                    <p className="text-slate-400 mt-1">Manage and monitor workflow executions for chefos-workflow</p>
                </div>
                <button className="px-4 py-2 bg-chef-600 hover:bg-chef-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <Play size={16} />
                    Trigger Execution
                </button>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
                    <div className="text-slate-400 text-sm mb-1">Total Executions (24h)</div>
                    <div className="text-2xl font-bold text-white">1,284</div>
                </div>
                <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
                    <div className="text-slate-400 text-sm mb-1">Success Rate</div>
                    <div className="text-2xl font-bold text-emerald-400">99.2%</div>
                </div>
                <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
                    <div className="text-slate-400 text-sm mb-1">Avg Duration</div>
                    <div className="text-2xl font-bold text-white">1.4s</div>
                </div>
            </div>

            <div className="flex-1 bg-dark-surface border border-dark-border rounded-xl overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-dark-border bg-dark-bg/50 flex justify-between items-center">
                    <h3 className="font-medium text-white">Recent Executions</h3>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                    <div className="space-y-2">
                        {mockWorkflows.map((workflow) => (
                            <div key={workflow.executionId} className="flex items-center justify-between p-4 rounded-lg hover:bg-dark-border/30 transition-colors border border-transparent hover:border-dark-border/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-dark-bg rounded-full border border-dark-border">
                                        {getStatusIcon(workflow.status)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-200">{workflow.workflowName}</span>
                                            <span className="text-xs font-mono text-slate-500">{workflow.executionId}</span>
                                        </div>
                                        <div className="text-sm text-slate-400 mt-1 flex items-center gap-4">
                                            <span>Started: {new Date(workflow.startTime).toLocaleTimeString()}</span>
                                            {workflow.duration !== '-' && (
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} /> {workflow.duration}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <button className="text-sm text-chef-500 hover:text-chef-400 font-medium px-3 py-1 rounded hover:bg-chef-500/10 transition-colors">
                                        View Logs
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
