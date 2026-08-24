import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/views/DashboardView.tsx';
import { LeadsView } from './components/views/LeadsView.tsx';
import { FirestoreView } from './components/views/FirestoreView.tsx';
import { WorkflowsView } from './components/views/WorkflowsView.tsx';
import { SecretsView } from './components/views/SecretsView.tsx';
import { ViewState } from './types.ts';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('leads');

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardView />;
            case 'leads':
                return <LeadsView />;
            case 'firestore':
                return <FirestoreView />;
            case 'workflows':
                return <WorkflowsView />;
            case 'secrets':
                return <SecretsView />;
            default:
                return <LeadsView />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-dark-bg text-slate-200 font-sans">
            <Sidebar currentView={currentView} onViewChange={setCurrentView} />
            <main className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-chef-900/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative h-full z-10">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default App;
