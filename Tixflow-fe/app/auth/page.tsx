'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Mail, Lock, User, KeyRound, ArrowRight, Ticket, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
const API_BASE_URL = 'https://tix-flow-1.onrender.com/api/v1/auth';

type ViewState = 'signin' | 'signup' | 'otp';

export default function TixFlowAuth() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const [view, setView] = useState<ViewState>(
    (mode === 'signup' || mode === 'signin') ? mode : 'signin'
  );
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Signup failed');

      setSuccess(data.message);
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setTimeout(() => {
        setSuccess(null);
        setView('otp');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.status === 403 && data.error === "Please verify your account.") {
        setError("Account not verified. Redirecting to OTP...");
        setTimeout(() => {
          setError(null);
          setView('otp');
        }, 2000);
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Signin failed');

      localStorage.setItem('token', data.token);
      setSuccess("Welcome back to the front row.");

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setSuccess("Account verified successfully! You can now sign in.");
      setDevOtp(null);

      setTimeout(() => {
        setSuccess(null);
        setFormData({ ...formData, password: '', otp: '' });
        setView('signin');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend');

      setSuccess("A new OTP has been sent to your email.");
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const luxEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const formVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: luxEase } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center relative overflow-hidden font-sans selection:bg-fuchsia-500/30">
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-fuchsia-900/20">
          <div className="flex flex-col items-center justify-center mb-8 cursor-pointer group" onClick={() => router.push('/')}>
            <div className="w-14 h-14 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Ticket className="w-8 h-8 text-fuchsia-400 transform -rotate-45" />
            </div>
            <span className="text-3xl font-extrabold tracking-tighter text-white">
              Tix<span className="text-gray-400 font-light">Flow</span>
            </span>
          </div>

          <AnimatePresence mode="wait">
            {view === 'signin' && (
              <motion.div key="signin" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome Back.</h2>
                  <p className="text-gray-400 text-sm">The performance is about to begin.</p>
                </div>

                <form onSubmit={handleSignin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Password</label>
                      <button type="button" className="text-xs font-medium text-fuchsia-400 hover:text-fuchsia-300 transition-colors">Forgot?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input required type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all" />
                      <button type="button" onClick={togglePasswordVisibility} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <AlertBox error={error} success={success} />

                  <button disabled={loading} type="submit" className="w-full mt-6 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_-5px_rgba(217,70,239,0.4)]">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                  New to the stage? <button onClick={() => setView('signup')} className="text-white font-semibold hover:text-fuchsia-400 transition-colors">Create Account</button>
                </p>
              </motion.div>
            )}
            {view === 'signup' && (
              <motion.div key="signup" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Join TixFlow.</h2>
                  <p className="text-gray-400 text-sm">Secure your front-row seat to the future.</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@tixflow.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input required minLength={8} type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all" />
                      <button type="button" onClick={togglePasswordVisibility} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <AlertBox error={error} success={success} />

                  <button disabled={loading} type="submit" className="w-full mt-6 bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                  Already have a pass? <button onClick={() => setView('signin')} className="text-white font-semibold hover:text-cyan-400 transition-colors">Sign In</button>
                </p>
              </motion.div>
            )}
            {view === 'otp' && (
              <motion.div key="otp" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
                <h2 className="text-2xl font-bold tracking-tight mb-2">Verify your Email</h2>
                <p className="text-gray-400 text-sm mb-6">
                  We sent a 6-digit code to <span className="text-white font-medium">{formData.email || 'your email'}</span>.
                </p>
                {devOtp && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6 p-4 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl backdrop-blur-sm"
                  >
                    <p className="text-xs text-fuchsia-300 font-semibold uppercase tracking-widest mb-1">Code</p>
                    <p className="text-3xl font-mono tracking-[0.3em] text-white font-bold">{devOtp}</p>

                  </motion.div>
                )}

                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <input required type="text" maxLength={6} name="otp" value={formData.otp} onChange={handleChange} placeholder="000000" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-center text-3xl tracking-[0.5em] font-mono text-white placeholder-gray-700 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all" />

                  <AlertBox error={error} success={success} />

                  <button disabled={loading || formData.otp.length !== 6} type="submit" className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-lg">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
                  </button>
                </form>

                <p className="mt-8 text-sm text-gray-400">
                  Didn't receive the code? <button onClick={handleResendOTP} type="button" disabled={loading} className="text-fuchsia-400 font-semibold hover:text-fuchsia-300 transition-colors disabled:opacity-50">Resend</button>
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
function AlertBox({ error, success }: { error: string | null, success: string | null }) {
  if (!error && !success) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-lg flex items-center gap-3 text-sm mt-4 ${error ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
      {error ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
      <p>{error || success}</p>
    </motion.div>
  );
}