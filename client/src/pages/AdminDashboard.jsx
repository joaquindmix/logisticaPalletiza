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
    const [clientForm, setClientForm] = useState({ name: '', email: '', password: '', cuit: '' });
    const [editingClient, setEditingClient] = useState(null);
    const [productForm, setProductForm] = useState({ sku: '', name: '', description: '', weight: '' });

    const [outboundModal, setOutboundModal] = useState({ isOpen: false, item: null, quantity: '', error: '', isSubmitting: false });

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
    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try { await api.post('/admin/products', productForm); alert('Producto creado!'); setProductForm({ sku: '', name: '', description: '', weight: '' }); fetchResources(); } catch (err) { alert('Error creating product'); }
    };

    const handleDeleteClient = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este cliente?')) return;
        try {
            await api.delete(`/admin/clients/${id}`);
            fetchResources();
        } catch (err) {
            alert('Error al eliminar cliente');
        }
    };

    const handleUpdateClient = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/clients/${editingClient.id}`, editingClient);
            setEditingClient(null);
            fetchResources();
        } catch (err) {
            alert('Error al actualizar cliente');
        }
    };

    // Open Modal
    const handleOpenOutbound = (item) => {
        setOutboundModal({ isOpen: true, item: item, quantity: '', error: '', isSubmitting: false });
    };

    // Confirm Withdrawal
    const handleConfirmOutbound = async (e) => {
        e.preventDefault();
        const { item, quantity } = outboundModal;
        if (!item) return;

        setOutboundModal(prev => ({ ...prev, error: '', isSubmitting: true }));

        const removeQty = parseInt(quantity);
        if (isNaN(removeQty) || removeQty <= 0 || removeQty > item.quantity) {
            setOutboundModal(prev => ({ ...prev, error: 'Cantidad inválida (mayor al stock o 0).', isSubmitting: false }));
            return;
        }

        try {
            await api.put(`/admin/inventory/${item.id}`, {
                quantity: item.quantity - removeQty,
                location: item.location,
                pallet_type: item.pallet_type
            });
            await fetchInventory();
            setOutboundModal({ isOpen: false, item: null, quantity: '', error: '', isSubmitting: false });
        } catch (err) {
            console.error(err);
            setOutboundModal(prev => ({ ...prev, error: 'Error de conexión o servidor.', isSubmitting: false }));
        }
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
                    <SidebarItem active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={20} />} label="Gestión Productos" />
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
            <main className="flex-1 p-6 md:p-10 pt-20 md:pt-10 overflow-auto relative">
                <div className="max-w-6xl mx-auto animate-fade-in">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {activeTab === 'inventory' && 'Inventario Global'}
                            {activeTab === 'inbound' && 'Ingreso de Mercadería'}
                            {activeTab === 'products' && 'Gestión de Productos'}
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
                                                    <button onClick={() => handleOpenOutbound(item)} className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded -mr-2 bg-transparent hover:bg-white/5" title="Retirar Salida">
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
                        <div className="space-y-6">
                            {/* Create Client Form */}
                            <div className="glass-card max-w-4xl mx-auto rounded-xl p-8 border border-slate-800">
                                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                                    <PlusCircle size={20} />
                                    Nuevo Cliente
                                </h3>
                                <form onSubmit={handleCreateClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Nombre Empresa</label>
                                        <input type="text" className="input-field" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">CUIT</label>
                                        <input type="text" className="input-field" placeholder="20-12345678-9" value={clientForm.cuit} onChange={e => setClientForm({ ...clientForm, cuit: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                                        <input type="email" className="input-field" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
                                        <input type="password" className="input-field" value={clientForm.password} onChange={e => setClientForm({ ...clientForm, password: e.target.value })} required />
                                    </div>
                                    <div className="md:col-span-2 pt-2">
                                        <button type="submit" className="btn-primary !bg-emerald-600 !from-emerald-600 !to-teal-600 hover:!from-emerald-500 w-full md:w-auto">
                                            Crear Cliente
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Clients List Table */}
                            <div className="glass-card max-w-4xl mx-auto rounded-xl overflow-hidden border border-slate-800">
                                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                                    <h3 className="font-bold text-white">Listado de Clientes</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-900/50">
                                                <th className="p-4 font-semibold">Empresa</th>
                                                <th className="p-4 font-semibold">CUIT</th>
                                                <th className="p-4 font-semibold">Email</th>
                                                <th className="p-4 font-semibold text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {resources.clients.map(client => (
                                                <tr key={client.id} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="p-4 font-medium text-slate-200">{client.name}</td>
                                                    <td className="p-4 text-sm text-slate-400 font-mono">{client.cuit || '-'}</td>
                                                    <td className="p-4 text-sm text-slate-400">{client.email}</td>
                                                    <td className="p-4 text-right flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingClient(client)}
                                                            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-medium border border-slate-700 transition-colors"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClient(client.id)}
                                                            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-medium border border-slate-700 transition-colors"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {resources.clients.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="p-8 text-center text-slate-500">No hay clientes registrados.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="glass-card max-w-xl mx-auto rounded-xl p-8 border border-slate-800">
                            <h3 className="text-xl font-bold mb-6 text-white">Nuevo Producto</h3>
                            <form onSubmit={handleCreateProduct} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">SKU</label>
                                    <input type="text" className="input-field" value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Nombre</label>
                                    <input type="text" className="input-field" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Descripción</label>
                                    <input type="text" className="input-field" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Peso (kg)</label>
                                    <input type="number" step="0.1" className="input-field" value={productForm.weight} onChange={e => setProductForm({ ...productForm, weight: e.target.value })} required />
                                </div>
                                <button type="submit" className="btn-primary !bg-indigo-600 !from-indigo-600 !to-blue-600 hover:!from-indigo-500">
                                    Crear Producto
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* MODAL DE RETIRO - FIXED POSITION */}
                {outboundModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !outboundModal.isSubmitting && setOutboundModal({ ...outboundModal, isOpen: false })}></div>
                        <div className="relative glass-card w-full max-w-md p-6 rounded-xl border border-slate-700 shadow-2xl animate-fade-in">
                            <h3 className="text-xl font-bold text-white mb-2">Registrar Salida</h3>
                            <p className="text-sm text-slate-400 mb-6">
                                Producto: <span className="text-indigo-400 font-mono">{outboundModal.item?.product_name}</span> <br />
                                Stock Actual: <span className="text-emerald-400 font-bold">{outboundModal.item?.quantity}</span>
                            </p>

                            {outboundModal.error && (
                                <div className="mb-4 p-3 bg-red-400/10 border border-red-400/20 text-red-200 text-sm rounded-lg flex items-center">
                                    ⚠️ {outboundModal.error}
                                </div>
                            )}

                            <form onSubmit={handleConfirmOutbound} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Cantidad a Retirar</label>
                                    <input
                                        type="number"
                                        autoFocus
                                        className="input-field text-lg"
                                        placeholder="0"
                                        max={outboundModal.item?.quantity}
                                        min="1"
                                        value={outboundModal.quantity}
                                        onChange={e => setOutboundModal({ ...outboundModal, quantity: e.target.value })}
                                        required
                                        disabled={outboundModal.isSubmitting}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setOutboundModal({ ...outboundModal, isOpen: false })}
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
                                        disabled={outboundModal.isSubmitting}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className={`flex-1 px-4 py-2 rounded-lg text-white shadow-lg text-sm font-bold transition-all flex justify-center items-center gap-2 ${outboundModal.isSubmitting ? 'bg-slate-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'}`}
                                        disabled={outboundModal.isSubmitting}
                                    >
                                        {outboundModal.isSubmitting ? (
                                            <>Processing...</>
                                        ) : (
                                            <>Confirmar Salida</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* EDIT CLIENT MODAL */}
                {editingClient && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingClient(null)}></div>
                        <div className="relative glass-card w-full max-w-md p-6 rounded-xl border border-slate-700 shadow-2xl animate-fade-in">
                            <h3 className="text-xl font-bold text-white mb-6">Editar Cliente</h3>
                            <form onSubmit={handleUpdateClient} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Nombre</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={editingClient.name}
                                        onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">CUIT</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={editingClient.cuit || ''}
                                        onChange={e => setEditingClient({ ...editingClient, cuit: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                                    <input
                                        type="email"
                                        className="input-field"
                                        value={editingClient.email}
                                        onChange={e => setEditingClient({ ...editingClient, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingClient(null)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 text-sm font-bold transition-all"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

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
