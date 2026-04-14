'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Mail, Loader2, CheckCircle2, Ticket, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://localhost:3001/api/v1/auth';

export default function AdminSetup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`${API_BASE_URL}/make-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, adminSecret })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Authorization failed");

      setStatus({ type: 'success', message: data.message });
      
      setEmail('');
      setAdminSecret('');

    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6 selection:bg-fuchsia-500/30 relative">
      {/* Background Texture */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')]" />

      {/* Brand Navigation */}
      <nav className="absolute top-0 left-0 w-full p-8 z-50 flex justify-center md:justify-start">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <Ticket className="w-5 h-5 text-fuchsia-400 transform -rotate-45 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white group-hover:text-fuchsia-400 transition-colors">
            TixFlow
          </span>
        </button>
      </nav>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mt-16 md:mt-0"
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-fuchsia-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative p-8 sm:p-10">
          
          <div className="flex flex-col items-center text-center mb-10">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Admin Setup</h1>
            <p className="text-gray-400 text-sm">Authorize an account for infrastructure access.</p>
          </div>

          <AnimatePresence>
            {status && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className={`mb-8 p-4 rounded-xl flex items-start gap-3 text-sm font-medium border ${
                  status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                <p className="leading-relaxed">{status.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleUpgrade} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-fuchsia-400 transition-colors" />
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-fuchsia-500 transition-colors placeholder:text-gray-600"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Admin Secret</label>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-fuchsia-400 transition-colors" />
                <input 
                  required
                  type="password"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-fuchsia-500 transition-colors font-mono placeholder:text-gray-600"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              type="submit" 
              className="w-full bg-white text-black font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 mt-8"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Authorize"}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-sm text-gray-400">
              Return to{' '}
              <button
                onClick={() => router.push('/auth?mode=signin')}
                className="text-white font-bold hover:text-fuchsia-400 transition-colors"
              >
                Standard Login
              </button>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}