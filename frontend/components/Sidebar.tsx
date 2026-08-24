import React from 'react';
import { LayoutDashboard, MessageSquare, Database, GitMerge, KeyRound, Settings, ChefHat, LogOut } from 'lucide-react';
import { ViewState } from '../types.ts';

interface SidebarProps {
    currentView: ViewState;
    onViewChange: (view: ViewState) => void;
    onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onLogout }) => {
    const navItems = [
        { id: 'dashboard' as ViewState, label: 'Overview', icon: LayoutDashboard },
        { id: 'leads' as ViewState, label: 'Bandeja de Leads', icon: MessageSquare },
        { id: 'firestore' as ViewState, label: 'Firestore DB', icon: Database },
        { id: 'workflows' as ViewState, label: 'Workflows', icon: GitMerge },
        { id: 'secrets' as ViewState, label: 'Secret Manager', icon: KeyRound },
    ];

    return (
        <div className="w-64 bg-dark-surface border-r border-dark-border flex flex-col h-full">
            <div className="p-6 flex items-center gap-3 border-b border-dark-border">
                <div className="bg-chef-500 p-2 rounded-lg">
                    <ChefHat size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-lg text-white tracking-tight">ChefOS</h1>
                    <p className="text-xs text-slate-400 font-mono">Project: chefos-502422</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                                isActive 
                                    ? 'bg-chef-500/10 text-chef-500 border border-chef-500/20' 
                                    : 'text-slate-400 hover:bg-dark-border/50 hover:text-slate-200'
                            }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-dark-border space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-dark-border/50 hover:text-slate-200 transition-colors text-sm">
                    <Settings size={18} />
                    <span className="font-medium">Configuración</span>
                </button>
                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} />
                        <span>Cerrar Sesión</span>
                    </button>
                )}
            </div>
        </div>
    );
};
