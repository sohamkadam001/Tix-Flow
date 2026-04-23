'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, MapPin, Film, CalendarPlus, CheckCircle2, AlertCircle, Loader2, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'https://tix-flow-1.onrender.com/api/v1/admin';

type Tab = 'VENUE' | 'MOVIE' | 'SHOW';

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('VENUE');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [venueData, setVenueData] = useState({ name: '', location: '', audName: 'Main Arena', rows: 10, seatsPerRow: 15 });
  const [movieData, setMovieData] = useState({ title: '', description: '', language: 'English', durationMin: 120, posterUrl: '' });
  const [showData, setShowData] = useState({ movieId: '', auditoriumId: '', startTime: '', regularPrice: 999, premiumPrice: 1499, vipPrice: 2500 });
  const [options, setOptions] = useState<{ movies: any[], auditoriums: any[] }>({ movies: [], auditoriums: [] });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/auth?mode=signin');

    const decodedToken = parseJwt(token);
    if (!decodedToken || decodedToken.role !== 'ADMIN') {
      router.push('/admin-setup');
    }
  }, [router]);

  useEffect(() => {
    if (activeTab === 'SHOW') {
      const fetchOptions = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/dropdown-data`, { headers: getHeaders() });
          const data = await res.json();
          if (res.ok) {
            setOptions(data);
            if (data.movies.length > 0 && !showData.movieId) {
              setShowData(prev => ({ ...prev, movieId: data.movies[0].id }));
            }
            if (data.auditoriums.length > 0 && !showData.auditoriumId) {
              setShowData(prev => ({ ...prev, auditoriumId: data.auditoriums[0].id }));
            }
          }
        } catch (error) {
          console.error("Failed to load dropdowns");
        }
      };
      fetchOptions();
    }
  }, [activeTab]);

  const displayMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });
  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        name: venueData.name,
        location: venueData.location,
        auditoriums: [{ name: venueData.audName, totalRows: Number(venueData.rows), seatsPerRow: Number(venueData.seatsPerRow) }]
      };
      const res = await fetch(`${API_BASE_URL}/venue`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      displayMessage('success', `Venue constructed successfully!`);
      setTimeout(() => setActiveTab('MOVIE'), 800);

    } catch (err: any) {
      displayMessage('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...movieData, durationMin: Number(movieData.durationMin) };
      const res = await fetch(`${API_BASE_URL}/movie`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      displayMessage('success', `Content registered successfully!`);
      setShowData(prev => ({ ...prev, movieId: data.movieId }));
      setTimeout(() => setActiveTab('SHOW'), 800);

    } catch (err: any) {
      displayMessage('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...showData,
        regularPrice: Number(showData.regularPrice),
        premiumPrice: Number(showData.premiumPrice),
        vipPrice: Number(showData.vipPrice)
      };
      const res = await fetch(`${API_BASE_URL}/show`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      displayMessage('success', `Success! Show is live. Redirecting to dashboard...`);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err: any) {
      displayMessage('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans p-8 selection:bg-fuchsia-500/30">
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')]" />
      <div className="max-w-4xl mx-auto mt-12 relative z-10">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center border border-fuchsia-500/30">
            <Settings className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Admin Control Center</h1>
            <p className="text-gray-400 text-sm mt-1">Provision infrastructure and schedule events.</p>
          </div>
        </div>
        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-2">
            <TabButton active={activeTab === 'VENUE'} onClick={() => setActiveTab('VENUE')} icon={<MapPin size={18} />} label="1. Venues" />
            <TabButton active={activeTab === 'MOVIE'} onClick={() => setActiveTab('MOVIE')} icon={<Film size={18} />} label="2. Content" />
            <TabButton active={activeTab === 'SHOW'} onClick={() => setActiveTab('SHOW')} icon={<CalendarPlus size={18} />} label="3. Schedule" />
          </div>

          <div className="md:col-span-3 bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[100px] pointer-events-none" />
            {activeTab === 'VENUE' && (
              <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleCreateVenue} className="space-y-6 relative z-10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><MapPin className="text-fuchsia-400" /> Build a Venue</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Venue Name" value={venueData.name} onChange={(e) => setVenueData({ ...venueData, name: e.target.value })} placeholder="e.g. Mumbai Arena" />
                  <Input label="Location / City" value={venueData.location} onChange={(e) => setVenueData({ ...venueData, location: e.target.value })} placeholder="e.g. Mumbai, IN" />
                </div>
                <div className="p-5 border border-white/10 rounded-2xl bg-white/5 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Auditorium Configuration</h3>
                  <Input label="Auditorium Name" value={venueData.audName} onChange={(e) => setVenueData({ ...venueData, audName: e.target.value })} placeholder="e.g. Main Stage" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Total Rows" type="number" value={venueData.rows} onChange={(e) => setVenueData({ ...venueData, rows: Number(e.target.value) })} />
                    <Input label="Seats Per Row" type="number" value={venueData.seatsPerRow} onChange={(e) => setVenueData({ ...venueData, seatsPerRow: Number(e.target.value) })} />
                  </div>
                  <p className="text-xs text-fuchsia-400 italic">This will auto-generate {venueData.rows * venueData.seatsPerRow} seats.</p>
                </div>
                <SubmitButton loading={isLoading} label="Construct Venue" />
              </motion.form>
            )}
            {activeTab === 'MOVIE' && (
              <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleCreateMovie} className="space-y-6 relative z-10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Film className="text-fuchsia-400" /> Register Content</h2>
                <Input label="Title" value={movieData.title} onChange={(e) => setMovieData({ ...movieData, title: e.target.value })} placeholder="e.g. Samay Raina Standup" />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Description</label>
                  <textarea
                    required
                    value={movieData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMovieData({ ...movieData, description: e.target.value })}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500 h-24 resize-none"
                    placeholder="Experience the raw energy..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Language" value={movieData.language} onChange={(e) => setMovieData({ ...movieData, language: e.target.value })} />
                  <Input label="Duration (Minutes)" type="number" value={movieData.durationMin} onChange={(e) => setMovieData({ ...movieData, durationMin: Number(e.target.value) })} />
                </div>
                <Input label="Poster Image URL" value={movieData.posterUrl} onChange={(e) => setMovieData({ ...movieData, posterUrl: e.target.value })} placeholder="https://..." />
                <SubmitButton loading={isLoading} label="Save Content" />
              </motion.form>
            )}
            {activeTab === 'SHOW' && (
              <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleCreateShow} className="space-y-6 relative z-10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><CalendarPlus className="text-fuchsia-400" /> Schedule a Show</h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Select Content (Movie/Event)</label>
                  <div className="relative">
                    <select
                      required
                      value={showData.movieId}
                      onChange={(e) => setShowData({ ...showData, movieId: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-fuchsia-500"
                    >
                      <option value="" disabled>-- Select a Movie --</option>
                      {options.movies.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Select Auditorium</label>
                  <div className="relative">
                    <select
                      required
                      value={showData.auditoriumId}
                      onChange={(e) => setShowData({ ...showData, auditoriumId: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-fuchsia-500"
                    >
                      <option value="" disabled>-- Select an Auditorium --</option>
                      {options.auditoriums.map((a: any) => (
                        <option key={a.id} value={a.id}>{a.venue.name} - {a.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Start Time</label>
                  <input required type="datetime-local" value={showData.startTime} onChange={(e) => setShowData({ ...showData, startTime: e.target.value })} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500 [color-scheme:dark]" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Input label="Regular (₹)" type="number" value={showData.regularPrice} onChange={(e) => setShowData({ ...showData, regularPrice: Number(e.target.value) })} />
                  <Input label="Premium (₹)" type="number" value={showData.premiumPrice} onChange={(e) => setShowData({ ...showData, premiumPrice: Number(e.target.value) })} />
                  <Input label="VIP (₹)" type="number" value={showData.vipPrice} onChange={(e) => setShowData({ ...showData, vipPrice: Number(e.target.value) })} />
                </div>
                <SubmitButton loading={isLoading} label="Initialize Show" />
              </motion.form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button onClick={onClick} type="button" className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${active ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
      <div className="flex items-center gap-3 font-semibold text-sm">
        {icon} {label}
      </div>
      {active && <ChevronRight size={16} />}
    </button>
  );
}

interface InputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

function Input({ label, type = "text", value, onChange, placeholder }: InputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-400">{label}</label>
      <input
        required
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500 transition-colors placeholder:text-gray-600"
      />
    </div>
  );
}

interface SubmitButtonProps {
  loading: boolean;
  label: string;
}

function SubmitButton({ loading, label }: SubmitButtonProps) {
  return (
    <button disabled={loading} type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 mt-4">
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} {loading ? "Processing..." : label}
    </button>
  );
}