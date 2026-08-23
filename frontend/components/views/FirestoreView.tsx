import React, { useState } from 'react';
import { Search, Filter, Database, ChevronRight } from 'lucide-react';
import { mockOrders } from '../../mockData.ts';

export const FirestoreView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = mockOrders.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'preparing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'ready': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'delivered': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <Database size={16} />
                        <span>chefos-db</span>
                        <ChevronRight size={14} />
                        <span className="text-slate-200">orders (collection)</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Firestore Data Explorer</h2>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search documents..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-chef-500 w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm hover:bg-dark-border/50 transition-colors">
                        <Filter size={16} />
                        Filter
                    </button>
                </div>
            </header>

            <div className="flex-1 bg-dark-surface border border-dark-border rounded-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-dark-bg/50 text-slate-400 border-b border-dark-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">Document ID</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Items</th>
                                <th className="px-6 py-4 font-medium">Total</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-dark-border/20 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 font-mono text-chef-500">{order.id}</td>
                                    <td className="px-6 py-4 text-slate-200">{order.customer}</td>
                                    <td className="px-6 py-4 text-slate-400 truncate max-w-[200px]">
                                        {order.items.join(', ')}
                                    </td>
                                    <td className="px-6 py-4 text-slate-200">${order.total.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(order.timestamp).toLocaleTimeString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        No documents found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};
