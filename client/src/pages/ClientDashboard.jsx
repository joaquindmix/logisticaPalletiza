import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Package, LogOut, ArrowUpRight, Box } from 'lucide-react';

const ClientDashboard = () => {
    const { logout, user } = useAuth();
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        const fetchInventory = async () => {
            try { const res = await api.get('/client/inventory'); setInventory(res.data); } catch (err) { console.error(err); }
        };
        fetchInventory();
    }, []);

    const totalItems = inventory.reduce((acc, curr) => acc + curr.quantity, 0);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans">
            <nav className="glass-card sticky top-0 z-50 border-b border-slate-800 backdrop-blur-md bg-slate-950/80">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600/20 rounded-lg">
                            <Package className="text-indigo-400" size={24} />
                        </div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">Mi Inventario</h1>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{user?.name}</p>
                            <p className="text-xs text-slate-500">Cliente</p>
                        </div>
                        <button onClick={logout} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="p-4 md:p-10 max-w-7xl mx-auto animate-fade-in">
                {/* Stats Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                        <div className="relative z-10">
                            <p className="text-slate-400 text-sm font-medium mb-1">Total Unidades</p>
                            <h3 className="text-3xl md:text-4xl font-bold text-white">{totalItems}</h3>
                            <div className="mt-4 flex items-center text-emerald-400 text-xs font-medium">
                                <ArrowUpRight size={14} className="mr-1" />
                                <span>Disponible en depósitos</span>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all"></div>
                        <div className="relative z-10">
                            <p className="text-slate-400 text-sm font-medium mb-1">Referencias Únicas</p>
                            <h3 className="text-3xl md:text-4xl font-bold text-white">{inventory.length}</h3>
                            <div className="mt-4 flex items-center text-indigo-400 text-xs font-medium">
                                <Box size={14} className="mr-1" />
                                <span>SKUs activos</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                    <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <h2 className="text-lg font-bold text-white">Detalle de Stock</h2>
                        <span className="hidden md:inline text-xs px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                            Actualizado en tiempo real
                        </span>
                    </div>

                    {inventory.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                                <Package size={32} className="text-slate-700" />
                            </div>
                            <p>No hay inventario registrado asociado a tu cuenta.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="p-4 md:p-5 font-semibold">SKU</th>
                                        <th className="p-4 md:p-5 font-semibold">Producto</th>
                                        <th className="p-4 md:p-5 font-semibold">Tipo Pallet</th>
                                        <th className="p-4 md:p-5 font-semibold">Ubicación</th>
                                        <th className="p-4 md:p-5 font-semibold text-right">Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {inventory.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 md:p-5 text-sm font-mono text-slate-500">{item.sku}</td>
                                            <td className="p-4 md:p-5 font-medium text-slate-200">{item.product_name}</td>
                                            <td className="p-4 md:p-5 text-sm text-slate-400">{item.pallet_type}</td>
                                            <td className="p-4 md:p-5">
                                                <span className="px-3 py-1 bg-slate-800 rounded-md text-xs font-mono text-indigo-300 border border-slate-700">
                                                    {item.location}
                                                </span>
                                            </td>
                                            <td className="p-4 md:p-5 text-right font-bold text-white text-lg">{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ClientDashboard;
