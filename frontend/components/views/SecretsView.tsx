import React, { useState } from 'react';
import { KeyRound, Plus, Eye, EyeOff, Copy, ShieldAlert } from 'lucide-react';
import { mockSecrets } from '../../mockData.ts';

export const SecretsView: React.FC = () => {
    const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());

    const toggleReveal = (name: string) => {
        const newSet = new Set(revealedSecrets);
        if (newSet.has(name)) {
            newSet.delete(name);
        } else {
            newSet.add(name);
        }
        setRevealedSecrets(newSet);
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <KeyRound className="text-chef-500" />
                        Secret Manager
                    </h2>
                    <p className="text-slate-400 mt-1">Manage API keys, passwords, and certificates for chefos-secrets</p>
                </div>
                <button className="px-4 py-2 bg-chef-600 hover:bg-chef-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <Plus size={16} />
                    Create Secret
                </button>
            </header>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
                <ShieldAlert className="text-yellow-500 shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="text-yellow-500 font-medium text-sm">Security Notice</h4>
                    <p className="text-yellow-500/80 text-sm mt-1">
                        Secrets are encrypted at rest. Ensure your Cloud Run service account has the 
                        <code>roles/secretmanager.secretAccessor</code> role to access these values at runtime.
                    </p>
                </div>
            </div>

            <div className="flex-1 bg-dark-surface border border-dark-border rounded-xl overflow-hidden flex flex-col">
                <table className="w-full text-left text-sm">
                    <thead className="bg-dark-bg/50 text-slate-400 border-b border-dark-border">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Latest Version</th>
                            <th className="px-6 py-4 font-medium">Created</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                        {mockSecrets.map((secret) => (
                            <tr key={secret.name} className="hover:bg-dark-border/20 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-200 flex items-center gap-2">
                                    <KeyRound size={14} className="text-slate-500" />
                                    {secret.name}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-dark-bg border border-dark-border text-slate-300">
                                        v{secret.version}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400">
                                    {new Date(secret.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        secret.status === 'ENABLED' 
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                    }`}>
                                        {secret.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => toggleReveal(secret.name)}
                                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-dark-border rounded transition-colors"
                                            title={revealedSecrets.has(secret.name) ? "Hide value" : "Reveal value"}
                                        >
                                            {revealedSecrets.has(secret.name) ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button 
                                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-dark-border rounded transition-colors"
                                            title="Copy resource name"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
