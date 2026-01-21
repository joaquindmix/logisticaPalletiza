import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Package, Users, LogOut, ArrowDownCircle, Search, LayoutDashboard, PlusCircle, ArrowRightCircle } from 'lucide-react';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('inventory');
    const [inventory, setInventory] = useState([]);
    const [resources, setResources] = useState({ clients: [], products: [] });
    // Keep forms same as before just restyled
    const [inboundForm, setInboundForm] = useState({ product_id: '', client_id: '', quantity: '', location: '', pallet_type: 'Standard' });
    const [clientForm, setClientForm] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        if (activeTab === 'inventory') fetchInventory();
        if (activeTab === 'inbound') fetchResources();
    }, [activeTab]);

    const fetchInventory = async () => {
        try { const res = await api.get('/admin/inventory'); setInventory(res.data); } catch (err) { console.error(err); }
    };
    const fetchResources = async () => {
        try { const res = await api.get('/admin/resources'); setResources(res.data); } catch (err) { console.error(err); }
    };

    const handleInbound = async (e) => {
        e.preventDefault();
        try { await api.post('/admin/inventory', inboundForm); alert('Mercadería ingresada!'); setInboundForm({ ...inboundForm, quantity: '', location: '' }); } catch (err) { alert('Error inbound'); }
    };
    const handleCreateClient = async (e) => {
        e.preventDefault();
        try { await api.post('/admin/clients', clientForm); alert('Cliente creado!'); setClientForm({ name: '', email: '', password: '' }); } catch (err) { alert('Error creating client'); }
    };
    const handleOutbound = async (id, currentQty) => {
        const removeQty = prompt(`Cantidad actual: ${currentQty}. Cuánto retirar?`);
        if (!removeQty) return;
        const qty = parseInt(removeQty);
        if (isNaN(qty) || qty > currentQty) return alert('Cantidad inválida');
        const item = inventory.find(i => i.id === id);
        try { await api.put(`/admin/inventory/${id}`, { quantity: currentQty - qty, location: item.location, pallet_type: item.pallet_type }); fetchInventory(); } catch (err) { alert('Error outbound'); }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-100 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-950 p-6 flex flex-col hidden md:flex">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg">
                        <Package size={20} className="text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">LogisticaAdmin</span>
                </div>

                <nav className="space-y-1 flex-1">
                    <SidebarItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<LayoutDashboard size={20} />} label="Inventario Global" />
                    <SidebarItem active={activeTab === 'inbound'} onClick={() => setActiveTab('inbound')} icon={<ArrowDownCircle size={20} />} label="Ingreso Mercadería" />
                    <SidebarItem active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<Users size={20} />} label="Gestión Clientes" />
                </nav>

                <div className="pt-6 border-t border-slate-800 mt-6">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold">
                            {user?.name?.[0] || 'A'}
                        </div>
                        <div className="text-sm">
                            <p className="font-medium text-slate-200">{user?.name}</p>
                            <p className="text-xs text-slate-500">Administrador</p>
                        </div>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-slate-950 border-b border-slate-800 p-4 flex justify-between items-center z-50">
                <span className="font-bold">LogisticaAdmin</span>
                <button onClick={logout}><LogOut size={20} /></button>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 pt-20 md:pt-10 overflow-auto">
                <div className="max-w-6xl mx-auto animate-fade-in">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {activeTab === 'inventory' && 'Inventario Global'}
                            {activeTab === 'inbound' && 'Ingreso de Mercadería'}
                            {activeTab === 'clients' && 'Gestión de Clientes'}
                        </h1>
                        <p className="text-slate-400">Administra el stock y los movimientos del depósito.</p>
                    </header>

                    {activeTab === 'inventory' && (
                        <div className="glass-card rounded-xl overflow-hidden shadow-2xl">
                            {/* Stats row can be added here */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-900/50">
                                            <th className="p-5 font-semibold">Producto</th>
                                            <th className="p-5 font-semibold">SKU</th>
                                            <th className="p-5 font-semibold">Cliente</th>
                                            <th className="p-5 font-semibold">Ubicación</th>
                                            <th className="p-5 font-semibold text-right">Cantidad</th>
                                            <th className="p-5 font-semibold text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {inventory.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                                                <td className="p-5 font-medium text-slate-200 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-500"><Package size={16} /></div>
                                                    {item.product_name}
                                                </td>
                                                <td className="p-5 text-sm text-slate-500 font-mono">{item.sku}</td>
                                                <td className="p-5 text-sm text-slate-300">
                                                    <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">{item.client_name}</span>
                                                </td>
                                                <td className="p-5 text-sm">
                                                    <span className="text-indigo-400 font-medium">{item.location}</span>
                                                    <span className="text-slate-600 text-xs ml-2">({item.pallet_type})</span>
                                                </td>
                                                <td className="p-5 text-right font-bold text-emerald-400">{item.quantity}</td>
                                                <td className="p-5 text-right">
                                                    <button onClick={() => handleOutbound(item.id, item.quantity)} className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded -mr-2 bg-transparent hover:bg-white/5">
                                                        <ArrowRightCircle size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'inbound' && (
                        <div className="glass-card max-w-2xl mx-auto rounded-xl p-8 border border-slate-800">
                            <form onSubmit={handleInbound} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Cliente</label>
                                        <select
                                            className="input-field appearance-none"
                                            value={inboundForm.client_id} onChange={e => setInboundForm({ ...inboundForm, client_id: e.target.value })} required
                                        >
                                            <option value="">Seleccionar Cliente</option>
                                            {resources.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Producto</label>
                                        <select
                                            className="input-field appearance-none"
                                            value={inboundForm.product_id} onChange={e => setInboundForm({ ...inboundForm, product_id: e.target.value })} required
                                        >
                                            <option value="">Seleccionar Producto</option>
                                            {resources.products.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2 col-span-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Cantidad</label>
                                        <input type="number" className="input-field" value={inboundForm.quantity} onChange={e => setInboundForm({ ...inboundForm, quantity: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2 col-span-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Ubicación</label>
                                        <input type="text" className="input-field" placeholder="A1" value={inboundForm.location} onChange={e => setInboundForm({ ...inboundForm, location: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2 col-span-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Pallet</label>
                                        <select className="input-field appearance-none" value={inboundForm.pallet_type} onChange={e => setInboundForm({ ...inboundForm, pallet_type: e.target.value })}>
                                            <option>Standard</option>
                                            <option>Euro</option>
                                            <option>Especial</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary flex items-center justify-center gap-2">
                                    <PlusCircle size={18} />
                                    <span>Registrar Entrada</span>
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'clients' && (
                        <div className="glass-card max-w-xl mx-auto rounded-xl p-8 border border-slate-800">
                            <h3 className="text-xl font-bold mb-6 text-white">Nuevo Cliente</h3>
                            <form onSubmit={handleCreateClient} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Nombre Empresa</label>
                                    <input type="text" className="input-field" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                                    <input type="email" className="input-field" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
                                    <input type="password" className="input-field" value={clientForm.password} onChange={e => setClientForm({ ...clientForm, password: e.target.value })} required />
                                </div>
                                <button type="submit" className="btn-primary !bg-emerald-600 !from-emerald-600 !to-teal-600 hover:!from-emerald-500">
                                    Crear Cliente
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const SidebarItem = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${active
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default AdminDashboard;
