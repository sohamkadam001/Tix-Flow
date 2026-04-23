'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Calendar as CalIcon, Clock, ChevronLeft, CreditCard, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

const API_BASE_URL = 'https://tix-flow-1.onrender.com/api/v1';

type SeatStatus = 'AVAILABLE' | 'LOCKED' | 'SELECTED';

interface Seat {
  id: string;
  displayId: string;
  row: string;
  number: number;
  tier: string;
  status: SeatStatus;
  price: number;
}

export default function BookingEngine() {
  const router = useRouter();
  const params = useParams();
  const showId = params.showId as string;
  const [seats, setSeats] = useState<Seat[]>([]);
  const [showInfo, setShowInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const selectedSeats = seats.filter(s => s.status === 'SELECTED');
  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const serviceFee = selectedSeats.length > 0 ? 150 : 0;
  const total = subtotal + serviceFee;
  const arenaRows = Array.from(new Set(seats.map(s => s.row))).sort();

  useEffect(() => {
    if (!showId) return;

    const fetchSeats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/shows/${showId}/seats`);
        if (!res.ok) throw new Error("Failed to load seating chart.");

        const data = await res.json();
        setShowInfo(data.showDetails);
        const mappedSeats: Seat[] = data.seatingMatrix.map((s: any) => ({
          id: s.id,
          displayId: `${s.row}${s.number}`,
          row: s.row,
          number: s.number,
          tier: s.category,
          status: s.isBooked ? 'LOCKED' : 'AVAILABLE',
          price: data.showDetails.prices[s.category] || data.showDetails.prices.REGULAR
        }));
        setSeats(mappedSeats);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeats();
  }, [showId]);

  const handleSeatClick = async (seatId: string) => {
    if (isSuccess || isProcessing) return;
    setErrorMsg(null);
    const token = localStorage.getItem('token');
    if (!token) return router.push('/auth?mode=signin');
    const clickedSeat = seats.find(s => s.id === seatId);
    if (!clickedSeat) return;
    if (clickedSeat.status === 'SELECTED') {
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'AVAILABLE' } : s));
      return;
    }

    if (clickedSeat.status === 'AVAILABLE') {
      try {
        const res = await fetch(`${API_BASE_URL}/shows/${showId}/lock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ seatId: clickedSeat.id })
        });

        const data = await res.json();

        if (!res.ok) {
          setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'LOCKED' } : s));
          setErrorMsg(data.error);
          return;
        }
        setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'SELECTED' } : s));
      } catch (err: any) {
        setErrorMsg("Network error while reserving seat.");
      }
    }
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) return router.push('/auth?mode=signin');

    setIsProcessing(true);
    setErrorMsg(null);

    setTimeout(async () => {
      try {
        const seatIds = selectedSeats.map(s => s.id);
        const res = await fetch(`${API_BASE_URL}/booking/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ showId: showId, seatIds: seatIds })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Booking failed.");

        setIsProcessing(false);
        setIsSuccess(true);
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMsg(err.message);
      }
    }, 2000);
  };

  const getSeatStyles = (seat: Seat) => {
    if (seat.status === 'LOCKED') return 'bg-red-500/20 border-red-500/30 text-red-500/50 cursor-not-allowed';
    if (seat.status === 'SELECTED') return 'bg-cyan-400 border-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-110';
    if (seat.tier === 'VIP') return 'bg-transparent border-amber-400/80 text-amber-400 hover:bg-amber-400/10';
    if (seat.tier === 'PREMIUM') return 'bg-transparent border-fuchsia-400/80 text-fuchsia-400 hover:bg-fuchsia-400/10';
    return 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30';
  };

  if (isLoading || !showInfo) {
    return (
      <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
          <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Loading Arena Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-cyan-500/30 pb-20">
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')]" />

      <nav className="relative z-10 px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]/50 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <Ticket className="w-6 h-6 text-cyan-400 transform -rotate-45" />
            <span className="text-xl font-extrabold tracking-tighter text-white">TixFlow</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-3 leading-none uppercase">{showInfo.title}</h1>
              <div className="flex items-center gap-4 text-gray-400 text-sm font-medium mt-4">
                <span className="flex items-center gap-1.5"><CalIcon className="w-4 h-4 text-cyan-500" /> {new Date(showInfo.startTime).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-cyan-500" /> {showInfo.location}</span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl flex items-center gap-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{errorMsg}</p>
            </motion.div>
          )}

          <div className="bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 flex flex-col items-center shadow-2xl overflow-x-auto relative">
            <div className="w-full max-w-2xl mb-16 relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent blur-3xl rounded-t-full opacity-50" />
              <div className="w-full h-24 border-t-4 border-cyan-400/50 rounded-t-[100%] relative flex items-end justify-center pb-2">
                <div className="bg-black/80 border border-white/10 px-8 py-2 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <span className="text-xs font-bold tracking-[0.4em] text-cyan-200">STAGE</span>
                </div>
              </div>
            </div>
            <div className={`flex flex-col gap-6 items-center min-w-max transition-opacity duration-500 ${isSuccess ? 'opacity-50 pointer-events-none' : ''}`}>
              {arenaRows.map(row => (
                <div key={row as string} className="flex gap-4 items-center">
                  <div className="w-6 text-center text-sm font-bold text-gray-600 mr-4">{row as string}</div>
                  <div className="flex gap-3">
                    {seats.filter(s => s.row === row).map((seat, idx) => (
                      <React.Fragment key={seat.id}>
                        {idx === Math.floor(seats.filter(s => s.row === row).length / 2) && <div className="w-8" />}
                        <motion.button
                          whileHover={seat.status !== 'LOCKED' ? { scale: 1.1 } : {}}
                          whileTap={seat.status !== 'LOCKED' ? { scale: 0.95 } : {}}
                          onClick={() => handleSeatClick(seat.id)}
                          disabled={seat.status === 'LOCKED'}
                          className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${getSeatStyles(seat)}`}
                        >
                          {seat.displayId}
                        </motion.button>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="w-6 text-center text-sm font-bold text-gray-600 ml-4">{row as string}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-8 mt-16 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#1a1a1a] border border-white/20" />
                <span className="text-xs text-gray-400 font-medium">Regular (₹{showInfo.prices.REGULAR})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-fuchsia-400" />
                <span className="text-xs text-gray-400 font-medium">Premium (₹{showInfo.prices.PREMIUM})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-amber-400" />
                <span className="text-xs text-gray-400 font-medium">VIP (₹{showInfo.prices.VIP})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-cyan-400" />
                <span className="text-xs text-gray-400 font-medium">Selected</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden sticky top-24 shadow-2xl">

            <div className="relative h-48 w-full border-b border-white/10">
              <img src={showInfo.image} alt={showInfo.title} className="w-full h-full object-cover object-[center_20%] opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
            </div>

            <div className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">Order Summary</h3>
                      <span className="text-sm text-cyan-400 font-medium bg-cyan-400/10 px-3 py-1 rounded-full">{selectedSeats.length} Tickets</span>
                    </div>

                    <div className="min-h-[120px] max-h-[200px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                      <AnimatePresence>
                        {selectedSeats.length === 0 ? (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-500 italic text-center mt-8">
                            Select seats from the map to begin.
                          </motion.p>
                        ) : (
                          selectedSeats.map(seat => (
                            <motion.div
                              key={seat.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex justify-between items-center py-3 border-b border-white/5 last:border-0"
                            >
                              <div>
                                <p className="font-bold text-white">Seat {seat.displayId}</p>
                                <p className={`text-xs ${seat.tier === 'VIP' ? 'text-amber-400' : seat.tier === 'PREMIUM' ? 'text-fuchsia-400' : 'text-gray-400'}`}>{seat.tier}</p>
                              </div>
                              <p className="font-bold">₹{seat.price}</p>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="border-t border-white/10 pt-4 mb-8 space-y-3">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Subtotal</span>
                        <span className="text-white">₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Service Fee</span>
                        <span className="text-white">₹{serviceFee}</span>
                      </div>
                      <div className="flex justify-between items-end pt-4 mt-4 border-t border-white/5">
                        <span className="text-gray-400 font-medium mb-1">Total Amount</span>
                        <span className="text-4xl font-black text-white tracking-tighter">₹{total}</span>
                      </div>
                    </div>

                    <button
                      disabled={selectedSeats.length === 0 || isProcessing}
                      onClick={handleCheckout}
                      className="w-full bg-white text-black font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                      {isProcessing ? "Processing Securely..." : "Proceed to Payment"}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Payment Successful!</h3>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                      You have securely booked <span className="text-white font-bold">{selectedSeats.length} ticket(s)</span> for {showInfo.title}. Your receipt has been sent to your registered email.
                    </p>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-full bg-white/10 border border-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/20 transition-colors"
                    >
                      Return to Dashboard
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}