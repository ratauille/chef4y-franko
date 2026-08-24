import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/views/DashboardView.tsx';
import { LeadsView } from './components/views/LeadsView.tsx';
import { TrashView } from './components/views/TrashView.tsx';
import { FirestoreView } from './components/views/FirestoreView.tsx';
import { WorkflowsView } from './components/views/WorkflowsView.tsx';
import { SecretsView } from './components/views/SecretsView.tsx';
import { ViewState } from './types.ts';
import { KeyRound, Lock, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('leads');
  const [authenticated, setAuthenticated] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = sessionStorage.getItem('chefos_admin_key');
    if (storedKey) {
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim() || inputKey.trim().length < 16) {
      setAuthError('Por favor ingresa la clave administrativa válida.');
      return;
    }
    sessionStorage.setItem('chefos_admin_key', inputKey.trim());
    setAuthenticated(true);
    setAuthError(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('chefos_admin_key');
    setAuthenticated(false);
    setInputKey('');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen w-full bg-dark-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-surface border border-dark-border rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex bg-chef-500/10 border border-chef-500/20 p-4 rounded-2xl text-chef-500 mb-4">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Acceso Privado ChefOS</h1>
            <p className="text-slate-400 text-sm mt-2">
              Ingresa tu clave administrativa personal de ChefOS para acceder a la bandeja de leads.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Clave Administrativa (x-api-key)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Ingresa tu clave privada..."
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-chef-500 transition-colors pl-10"
                />
                <KeyRound className="absolute left-3 top-3.5 text-slate-500" size={18} />
              </div>
            </div>

            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-xs">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-chef-600 hover:bg-chef-500 text-white font-medium py-3 rounded-xl text-sm transition-colors shadow-lg shadow-chef-600/20"
            >
              Iniciar Sesión en ChefOS
            </button>
          </form>

          <p className="text-xs text-center text-slate-500 mt-6">
            ChefOS v2.0 • Acceso seguro cifrado en sessionStorage
          </p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'leads':
        return <LeadsView />;
      case 'trash':
        return <TrashView />;
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
      <Sidebar currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} />
      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-chef-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative h-full z-10">{renderView()}</div>
      </main>
    </div>
  );
};

export default App;
