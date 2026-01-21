import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Package, LogOut } from 'lucide-react';

const ClientDashboard = () => {
    const { logout, user } = useAuth();
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await api.get('/client/inventory');
                setInventory(res.data);
            } catch (err) { console.error(err); }
        };
        fetchInventory();
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <nav className="bg-white dark:bg-slate-800 shadow p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Package className="text-indigo-600" />
                    <h1 className="text-xl font-bold">Mi Inventario</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span>{user?.name}</span>
                    <button onClick={logout} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><LogOut size={20} /></button>
                </div>
            </nav>

            <main className="p-6 max-w-7xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="font-semibold">Estado Actual</h2>
                        <span className="text-sm text-slate-500">Total Items: {inventory.reduce((acc, curr) => acc + curr.quantity, 0)}</span>
                    </div>
                    {inventory.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No hay inventario registrado.</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th className="p-4">SKU</th>
                                    <th className="p-4">Producto</th>
                                    <th className="p-4">Tipo Pallet</th>
                                    <th className="p-4">Ubicación</th>
                                    <th className="p-4 text-right">Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map(item => (
                                    <tr key={item.id} className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="p-4 text-sm font-mono text-slate-500">{item.sku}</td>
                                        <td className="p-4 font-medium">{item.product_name}</td>
                                        <td className="p-4 text-sm">{item.pallet_type}</td>
                                        <td className="p-4"><span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">{item.location}</span></td>
                                        <td className="p-4 text-right font-bold">{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ClientDashboard;
