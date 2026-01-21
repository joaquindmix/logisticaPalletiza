import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Truck, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (res.success) {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData.role === 'admin') navigate('/admin');
            else navigate('/client');
        } else {
            // Detailed debug info
            setError(typeof res.error === 'object' ? JSON.stringify(res.error) : res.error);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px] animate-fade-in"></div>
                <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-violet-500/10 blur-[120px] animate-fade-in delay-100"></div>
            </div>

            <div className="relative glass-card p-8 md:p-12 rounded-2xl w-full max-w-md animate-slide-up border border-white/10">
                <div className="flex flex-col items-center mb-10">
                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/20 mb-6 group transition-transform hover:scale-105">
                        <Truck size={40} className="text-white transform group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                        Logistica Palletiza
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm font-medium">Gestiona tu logística con precisión</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm text-center backdrop-blur-sm animate-fade-in">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-slate-300 text-xs font-bold uppercase tracking-wider ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="nombre@empresa.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-slate-300 text-xs font-bold uppercase tracking-wider ml-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary group flex items-center justify-center gap-2 mt-2"
                    >
                        <span>Ingresar</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-slate-500">
                    &copy; 2026 Logistica Palletiza System
                </div>
            </div>
        </div>
    );
};

export default Login;
