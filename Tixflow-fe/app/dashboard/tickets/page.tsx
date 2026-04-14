'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Calendar, Clock, MapPin, ChevronRight, Loader2, Download, Share2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://localhost:3001/api/v1';

// --- Types based on your backend response ---
interface SeatData {
  id: string;
  row: string;
  number: number;
  category: string;
}

interface TicketData {
  id: string;
  seat: SeatData;
}

interface Booking {
  id: string;
  status: string;
  show: {
    startTime: string;
    movie: {
      title: string;
      posterUrl: string;
    };
    auditorium: {
      name: string;
      venue: {
        name: string;
        location: string;
      };
    };
  };
  tickets: TicketData[];
}

export default function MyTickets() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth?mode=signin');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/booking/my-tickets`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to fetch tickets");
        
        setBookings(data.history);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [router]);

  // Format helpers
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options).toUpperCase();
  };

  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleTimeString('en-US', options).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-fuchsia-500" />
          <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Retrieving Your Tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans p-4 md:p-8 selection:bg-fuchsia-500/30">
      {/* Background Texture */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')]" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Active Tickets</h1>
            <p className="text-gray-400">Your next big stage awaits.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Live Sync</span>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl flex items-center gap-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {bookings.length === 0 && !error ? (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No active tickets found</h3>
            <p className="text-gray-400 mb-6">Looks like you haven't booked any shows yet.</p>
            <button onClick={() => router.push('/dashboard')} className="bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors">
              Explore Events
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {bookings.map((booking, index) => {
                const seatsStr = booking.tickets.map(t => `${t.seat.row}${t.seat.number}`).join(', ');
                const mainCategory = booking.tickets[0]?.seat.category || 'STANDARD';
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={booking.id} 
                    className="group flex flex-col md:flex-row bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden hover:border-white/20 transition-colors shadow-2xl relative"
                  >
                    
                    {/* Glowing Backdrop Effect on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/0 to-cyan-500/0 group-hover:from-fuchsia-500/5 group-hover:to-cyan-500/5 transition-all duration-500 pointer-events-none" />

                    {/* Left: Poster */}
                    <div className="w-full md:w-64 h-64 md:h-auto relative shrink-0">
                      <img src={booking.show.movie.posterUrl} alt="Poster" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent md:bg-gradient-to-r" />
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <span className="text-[10px] font-bold tracking-widest text-white uppercase">{mainCategory}</span>
                      </div>
                    </div>

                    {/* Middle: Details */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative z-10">
                      <p className="text-fuchsia-400 text-xs font-bold tracking-widest uppercase mb-2">Now Showing</p>
                      <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-8 uppercase line-clamp-2">
                        {booking.show.movie.title}
                      </h2>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                        <div>
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Cinema</p>
                          <p className="text-white font-bold text-sm truncate" title={booking.show.auditorium.venue.name}>
                            {booking.show.auditorium.venue.name}
                          </p>
                          <p className="text-gray-400 text-xs truncate">{booking.show.auditorium.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Date</p>
                          <p className="text-white font-bold text-sm">{formatDate(booking.show.startTime)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Time</p>
                          <p className="text-white font-bold text-sm">{formatTime(booking.show.startTime)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Seats</p>
                          <p className="text-white font-bold text-sm">{seatsStr}</p>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-cyan-400" />
                           <span className="text-gray-400 text-xs">Gates open 45 mins prior</span>
                         </div>
                         <button className="flex items-center gap-2 text-white hover:text-fuchsia-400 transition-colors text-sm font-bold">
                           <Share2 className="w-4 h-4" /> Share Ticket
                         </button>
                      </div>
                    </div>

                    {/* The Perforated Divider Line */}
                    <div className="hidden md:block w-px relative bg-transparent shrink-0">
                      {/* Dashed line */}
                      <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-white/10" />
                      {/* Top Cutout */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#030303] rounded-full border-b border-white/10" />
                      {/* Bottom Cutout */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#030303] rounded-full border-t border-white/10" />
                    </div>

                    {/* Mobile Divider */}
                    <div className="md:hidden h-px relative bg-transparent w-full my-4">
                       <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-white/10" />
                    </div>

                    {/* Right: QR Code */}
                    <div className="w-full md:w-64 p-8 flex flex-col items-center justify-center bg-[#0a0a0a] relative z-10 shrink-0">
                      <div className="bg-white p-3 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-4">
                        {/* Using a public API to generate a real, scannable QR code based on the Booking ID! 
                          If you scan this with your phone, it will output the Prisma UUID.
                        */}
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.id}&bgcolor=ffffff&color=000000`} 
                          alt="Ticket QR Code"
                          className="w-32 h-32"
                        />
                      </div>
                      <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-1">Scan for Entry</p>
                      <p className="text-[10px] text-gray-600 font-mono truncate w-full text-center">#{booking.id.split('-')[0]}</p>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}