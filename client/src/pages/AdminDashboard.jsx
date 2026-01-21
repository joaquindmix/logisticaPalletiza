import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Package, Users, LogOut, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('inventory'); // inventory, inbound, clients
    const [inventory, setInventory] = useState([]);
    const [resources, setResources] = useState({ clients: [], products: [] });

    // Forms state
    const [inboundForm, setInboundForm] = useState({ product_id: '', client_id: '', quantity: '', location: '', pallet_type: 'Standard' });
    const [clientForm, setClientForm] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        if (activeTab === 'inventory') fetchInventory();
        if (activeTab === 'inbound') fetchResources();
    }, [activeTab]);

    const fetchInventory = async () => {
        try {
            const res = await api.get('/admin/inventory');
            setInventory(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchResources = async () => {
        try {
            const res = await api.get('/admin/resources');
            setResources(res.data);
        } catch (err) { console.error(err); }
    };

    const handleInbound = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/inventory', inboundForm);
            alert('Mercadería ingresada!');
            setInboundForm({ ...inboundForm, quantity: '', location: '' });
        } catch (err) { alert('Error inbound'); }
    };

    const handleCreateClient = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/clients', clientForm);
            alert('Cliente creado!');
            setClientForm({ name: '', email: '', password: '' });
        } catch (err) { alert('Error creating client'); }
    };

    const handleOutbound = async (id, currentQty) => {
        const removeQty = prompt(`Cantidad actual: ${currentQty}. Cuánto retirar?`);
        if (!removeQty) return;
        const qty = parseInt(removeQty);
        if (isNaN(qty) || qty > currentQty) return alert('Cantidad inválida');

        const newQty = currentQty - qty;
        try {
            // Re-using the update endpoint, but passing all required fields?
            // My backend update requires location/pallet_type too. I should retain them.
            // For MVP I'll iterate or just find the item in state.
            const item = inventory.find(i => i.id === id);
            await api.put(`/admin/inventory/${id}`, {
                quantity: newQty,
                location: item.location,
                pallet_type: item.pallet_type
            });
            fetchInventory();
        } catch (err) { alert('Error outbound'); }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <nav className="bg-white dark:bg-slate-800 shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-indigo-600">Admin WMS</h1>
                <div className="flex items-center gap-4">
                    <span>{user?.name}</span>
                    <button onClick={logout} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><LogOut size={20} /></button>
                </div>
            </nav>

            {/* Content */}
            <main className="p-6 max-w-7xl mx-auto">
                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                    <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={18} />} label="Inventario" />
                    <TabButton active={activeTab === 'inbound'} onClick={() => setActiveTab('inbound')} icon={<ArrowDownCircle size={18} />} label="Ingreso (Inbound)" />
                    <TabButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<Users size={18} />} label="Clientes" />
                </div>

                {activeTab === 'inventory' && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th className="p-4">Producto</th>
                                    <th className="p-4">SKU</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Ubicación</th>
                                    <th className="p-4">Cant.</th>
                                    <th className="p-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map(item => (
                                    <tr key={item.id} className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="p-4 font-medium">{item.product_name}</td>
                                        <td className="p-4 text-sm text-slate-500">{item.sku}</td>
                                        <td className="p-4">{item.client_name}</td>
                                        <td className="p-4"><span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">{item.location}</span></td>
                                        <td className="p-4">{item.quantity}</td>
                                        <td className="p-4">
                                            <button onClick={() => handleOutbound(item.id, item.quantity)} className="text-red-500 hover:text-red-700 text-sm font-medium">Outbound</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'inbound' && (
                    <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow">
                        <h2 className="text-2xl font-bold mb-6">Ingreso de Mercadería</h2>
                        <form onSubmit={handleInbound} className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">Cliente</label>
                                <select
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                                    value={inboundForm.client_id}
                                    onChange={e => setInboundForm({ ...inboundForm, client_id: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar Cliente</option>
                                    {resources.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">Producto</label>
                                <select
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                                    value={inboundForm.product_id}
                                    onChange={e => setInboundForm({ ...inboundForm, product_id: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar Producto</option>
                                    {resources.products.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium">Cantidad</label>
                                    <input type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                                        value={inboundForm.quantity} onChange={e => setInboundForm({ ...inboundForm, quantity: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium">Ubicación (Ej: A1)</label>
                                    <input type="text" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                                        value={inboundForm.location} onChange={e => setInboundForm({ ...inboundForm, location: e.target.value })} required />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">Tipo Pallet</label>
                                <select className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                                    value={inboundForm.pallet_type} onChange={e => setInboundForm({ ...inboundForm, pallet_type: e.target.value })}>
                                    <option>Standard</option>
                                    <option>Euro</option>
                                    <option>Especial</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Registrar Ingreso</button>
                        </form>
                    </div>
                )}

                {activeTab === 'clients' && (
                    <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow">
                        <h2 className="text-2xl font-bold mb-6">Crear Nuevo Cliente</h2>
                        <form onSubmit={handleCreateClient} className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">Nombre Empresa</label>
                                <input type="text" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                                    value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">Email (Login)</label>
                                <input type="email" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                                    value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">Contraseña</label>
                                <input type="password" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                                    value={clientForm.password} onChange={e => setClientForm({ ...clientForm, password: e.target.value })} required />
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Crear Cliente</button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default AdminDashboard;
