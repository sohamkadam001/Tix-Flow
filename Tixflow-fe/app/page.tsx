'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Search, MapPin, Calendar, Ticket, User, Play, ChevronLeft, ChevronRight, Compass, Flame, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const luxEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const textContainerVariant: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  },
  exit: { opacity: 0, transition: { duration: 0.4 } }
};

const textItemVariant: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: luxEase } }
};
const events = [
  {
    title: "Interstellar",
    synopsis: "Cooper, a former pilot turned farmer, leaves his children to lead a NASA mission through a wormhole to find a new habitable planet for humanity.",
    date: "Nov 07, 2026",
    location: "Sphere, LV",
    genres: ["Sci-Fi", "Epic", "Adventure", "Drama"],
    imageUrl: "https://images3.alphacoders.com/551/551456.jpg",
    gradientText: "from-cyan-400 to-blue-500",
    bgColor: "bg-cyan-900/10",
    borderColor: "border-cyan-500/30",
    badgeColor: "text-cyan-300",
    iconColor: "text-cyan-400",
    navBgActive: "bg-cyan-500/20",
    navTextActive: "text-cyan-400",
    pulseColor: "bg-cyan-500",
    selectionColor: "selection:bg-cyan-500/30"
  },
  {
    title: "Inception",
    synopsis: "A thief's dream-sharing skills are used to implant an idea in a CEO's mind, but his troubled past threatens the mission.",
    date: "Nov 07, 2026",
    location: "Sphere, LV",
    genres: ["Sci-Fi", "Thriller", "Action", "Mind-Bending"],
    imageUrl: "https://w0.peakpx.com/wallpaper/289/913/HD-wallpaper-movie-inception-ellen-page-joseph-gordon-levitt-leonardo-dicaprio-tom-hardy.jpg",
    gradientText: "from-indigo-300 to-blue-500",
    bgColor: "bg-indigo-900/10",
    borderColor: "border-indigo-500/30",
    badgeColor: "text-indigo-300",
    iconColor: "text-indigo-400",
    navBgActive: "bg-indigo-500/20",
    navTextActive: "text-indigo-300",
    pulseColor: "bg-indigo-500",
    selectionColor: "selection:bg-indigo-500/30"
  },
  {
    title: "SAMAY RAINA\nSTILL",
    titleAccent: "ALIVE.",
    showId: "37501e14-0a37-4b81-800b-9cd4d48f1012",
    synopsis: "Experience the raw energy of the world's most exclusive live performances. Your front-row seat to the future of entertainment.",
    date: "Oct 24, 2026",
    location: "Mumbai Arena",
    genres: ["Live Music", "Concert", "Electric", "Performance"],
    imageUrl: "https://i.ytimg.com/vi/LhpZJwUboeI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC6-qKzAZhjIUJ1UkbQQjCRiJX1Cw",
    gradientText: "from-red-500 to-red-700",
    bgColor: "bg-red-900/10",
    borderColor: "border-red-500/30",
    badgeColor: "text-red-400",
    iconColor: "text-red-600",
    navBgActive: "bg-red-500/20",
    navTextActive: "text-red-500",
    pulseColor: "bg-red-600",
    selectionColor: "selection:bg-red-500/30"
  },
  {
    title: "Dhurandhar The",
    titleAccent: "Revenge",
    showId: "5f997d79-ff6a-4cc3-82f7-5a5414937c7e",
    synopsis: "Arrakis comes to life in a breathtaking live orchestral and vocal performance, set against the backdrop of the blockbuster film.",
    date: "Dec 12, 2026",
    location: "Sanskriti Hall",
    genres: ["Orchestral", "Film Score", "Epic", "Live Music"],
    imageUrl: "https://wallpaperaccess.com/full/26347205.jpg",
    gradientText: "from-orange-400 to-amber-400",
    bgColor: "bg-orange-900/10",
    borderColor: "border-orange-500/20",
    badgeColor: "text-orange-300",
    iconColor: "text-orange-400",
    navBgActive: "bg-orange-500/20",
    navTextActive: "text-orange-400",
    pulseColor: "bg-orange-500",
    selectionColor: "selection:bg-orange-500/30"
  },
  {
    title: "Karan Aujla India Tour\n",
    titleAccent: "P-Pop",
    showId: "24eb7cfc-2bdb-47f5-b701-6d2856a308e0",
    synopsis: "Witness the unparalleled spectacle of Coldplay's groundbreaking tour, redefining the live music experience inside the Las Vegas Sphere.",
    date: "Feb 18, 2027",
    location: "Sphere, LV",
    genres: ["Alternative Rock", "Pop", "Spectacle", "Concert"],
    imageUrl: "https://media.insider.in/image/upload/c_crop,g_custom/v1775458665/n6qekoh4v3e2qjorvobm.jpg",
    gradientText: "from-green-400 to-emerald-400",
    bgColor: "bg-green-900/10",
    borderColor: "border-green-500/20",
    badgeColor: "text-green-300",
    iconColor: "text-green-400",
    navBgActive: "bg-green-500/20",
    navTextActive: "text-green-400",
    pulseColor: "bg-green-500",
    selectionColor: "selection:bg-green-500/30"
  },
];

export default function TixFlowDynamic() {
  const router = useRouter();
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trendingShows, setTrendingShows] = useState<any[]>([]);
  const [isLoadingShows, setIsLoadingShows] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    setMounted(true);

    const fetchTrendingShows = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/v1/shows`);
        const data = await res.json();

        if (res.ok) {
          const validArray = Array.isArray(data.shows) ? data.shows : [];
          setTrendingShows(validArray);
        }
      } catch (err) {
        console.error("Failed to fetch trending shows:", err);
      } finally {
        setIsLoadingShows(false);
      }
    };

    fetchTrendingShows();
  }, []);
  useEffect(() => {
    if (!isLoaded || isPaused) return;
    const intervalId = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % events.length);
    }, 6000);
    return () => clearInterval(intervalId);
  }, [isLoaded, isPaused, currentEventIndex]);
  const nextEvent = () => setCurrentEventIndex((prev) => (prev + 1) % events.length);
  const prevEvent = () => setCurrentEventIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  const currentEvent = events[currentEventIndex];

  if (!isLoaded) return null;

  return (
    <div className={`min-h-screen bg-[#030303] text-white font-sans overflow-x-hidden ${currentEvent.selectionColor}`}>
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')]" />
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: luxEase, delay: 0.1 }}
        className="fixed top-0 w-full z-50 flex items-center justify-between px-12 py-8 bg-gradient-to-b from-[#030303]/90 to-transparent pointer-events-none"
      >
        <div className="flex items-center gap-3 pointer-events-auto cursor-pointer group">
          <Ticket className={`w-8 h-8 ${currentEvent.iconColor} transform -rotate-45 group-hover:scale-110 transition-transform duration-500`} />
          <span className="text-3xl font-extrabold tracking-tighter text-white drop-shadow-2xl">
            Tix<span className="text-gray-400 font-light">Flow</span>
          </span>
        </div>
        <div className="flex items-center gap-6 pointer-events-auto">
          <button
            onClick={() => router.push('/auth?mode=signin')}
            className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => router.push('/auth?mode=signup')}
            className={`text-sm font-bold bg-gradient-to-r ${currentEvent.gradientText} text-white px-6 py-2.5 rounded-full hover:scale-105 transition-transform shadow-lg`}
          >
            Sign Up
          </button>
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all backdrop-blur-md">
            <User size={18} />
          </div>
        </div>
      </motion.header>
      <motion.nav
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, ease: luxEase, delay: 0.3 }}
        className="fixed left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4 py-6 px-3 bg-[#0a0a0a]/40 backdrop-blur-2xl border border-white/5 rounded-full shadow-2xl"
      >
        <NavItem icon={<Compass size={22} />} active tooltip="Discover" eventTheme={currentEvent} />
        <NavItem icon={<Search size={22} />} tooltip="Search" eventTheme={currentEvent} />
        <NavItem icon={<Flame size={22} />} tooltip="Trending" eventTheme={currentEvent} />
        <div className="w-6 h-[1px] bg-white/10 my-1" />
        <NavItem icon={<Ticket size={22} />} tooltip="My Tickets" eventTheme={currentEvent} />
      </motion.nav>
      <main className="relative">
        <div className="relative w-full h-screen min-h-[800px] overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentEvent.imageUrl}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 1 } }}
              transition={{ duration: 1.8, ease: luxEase }}
              className="absolute inset-0 w-full h-full"
            >
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat origin-center"
                style={{ backgroundImage: `url('${currentEvent.imageUrl}')` }}
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-[#030303]/80 to-transparent w-[80%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent h-full" />
          <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-[#030303] to-transparent" />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEvent.title}
              variants={textContainerVariant}
              initial="hidden"
              animate="show"
              exit="exit"
              className="absolute left-32 top-[55%] -translate-y-1/2 w-full max-w-3xl z-10"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <motion.div variants={textItemVariant} className={`inline-flex items-center gap-3 mb-8 ${currentEvent.bgColor} border ${currentEvent.borderColor} px-5 py-2.5 rounded-full backdrop-blur-xl shadow-2xl`}>
                <span className={`w-2 h-2 rounded-full ${currentEvent.pulseColor} animate-pulse`} />
                <span className={`${currentEvent.badgeColor} font-bold text-xs tracking-[0.2em] uppercase`}>
                  Premium Experience
                </span>
              </motion.div>

              <motion.h1 variants={textItemVariant} className="text-[4.5rem] md:text-[6rem] font-black text-white mb-4 tracking-tighter leading-[0.9] drop-shadow-2xl uppercase whitespace-pre-line">
                {currentEvent.title}
                {" "}
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentEvent.gradientText}`}>
                  {currentEvent.titleAccent}
                </span>
              </motion.h1>

              <motion.p variants={textItemVariant} className="text-gray-300 text-xl leading-relaxed mb-10 max-w-xl font-light">
                {currentEvent.synopsis}
              </motion.p>

              <motion.div variants={textItemVariant} className="flex items-center gap-6">
                <motion.button
                  onClick={() => router.push("/auth?mode=signin")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="group relative flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-full font-extrabold overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${currentEvent.gradientText} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <Ticket className="w-5 h-5 relative z-10 group-hover:text-white transition-colors" />
                  <span className="text-lg relative z-10 group-hover:text-white transition-colors">Book Tickets</span>
                </motion.button>

                <button className="flex items-center justify-center gap-3 text-white px-6 py-5 rounded-full font-semibold group">
                  <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white transition-colors duration-500">
                    <Play className="w-4 h-4 ml-1 group-hover:text-black transition-colors" />
                  </div>
                  <span className="text-lg group-hover:text-gray-300 transition-colors">Trailer</span>
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute right-16 bottom-16 z-10 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <button onClick={prevEvent} className="w-12 h-12 flex items-center justify-center bg-[#111]/50 backdrop-blur-xl hover:bg-white hover:text-black rounded-full border border-white/10 text-white transition-all duration-500">
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                {events.map((_, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ width: idx === currentEventIndex ? 32 : 8, backgroundColor: idx === currentEventIndex ? "#fff" : "rgba(255,255,255,0.2)" }}
                    transition={{ ease: luxEase, duration: 0.8 }}
                    className="h-2 rounded-full cursor-pointer"
                    onClick={() => setCurrentEventIndex(idx)}
                  />
                ))}
              </div>
              <button onClick={nextEvent} className="w-12 h-12 flex items-center justify-center bg-[#111]/50 backdrop-blur-xl hover:bg-white hover:text-black rounded-full border border-white/10 text-white transition-all duration-500">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="pl-32 pr-12 py-16 relative z-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tighter flex items-center gap-3">
              <Flame className={`w-7 h-7 ${currentEvent.iconColor} transition-colors duration-500`} />
              Hot Experiences
            </h2>
            <button className="text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 scrollbar-hide">
            {isLoadingShows && (
              <>
                {[1, 2, 3, 4].map((skeleton) => (
                  <div key={skeleton} className="w-[280px] h-[400px] flex-shrink-0 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
                ))}
              </>
            )}
            {!isLoadingShows && trendingShows?.map((show, idx) => {
              const tagColors = ["text-green-400", "text-orange-400", "text-red-400"];
              const tagLabels = ["Available", "Fast Filling", "Almost Full"];
              const themeIndex = idx % 3;

              return (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: idx * 0.1 }}
                  className="w-[280px] group flex-shrink-0 cursor-pointer"
                  onClick={() => router.push('/auth?mode=signin')}
                >
                  <motion.div
                    whileHover={{ y: -10, scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                    className="relative h-[400px] rounded-2xl overflow-hidden mb-4 border border-white/10 group-hover:border-white/30 transition-colors shadow-xl"
                  >
                    <img
                      src={show.movie?.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
                      alt={show.movie?.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                      <span className={`text-xs font-bold ${tagColors[themeIndex]}`}>
                        {tagLabels[themeIndex]}
                      </span>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="text-xl font-bold text-white mb-2 tracking-tight transition-colors group-hover:text-white leading-tight">
                        {show.movie?.title}
                      </h3>
                      <div className="flex items-center gap-5 text-sm text-gray-400">
                        <p className="flex items-center gap-1.5 truncate max-w-[120px]">
                          <MapPin size={14} className="shrink-0" />
                          <span className="truncate">{show.auditorium?.venue?.location || 'Unknown'}</span>
                        </p>

                        <p className="flex items-center gap-1.5 shrink-0">
                          <Clock size={14} />
                          {mounted ? new Date(show.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "--"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}

function NavItem({ icon, active = false, tooltip, eventTheme }: { icon: React.ReactNode, active?: boolean, tooltip: string, eventTheme: typeof events[0] }) {
  return (
    <div className="relative group cursor-pointer">
      <div className={`p-3.5 rounded-full transition-all duration-500 ${active ? `${eventTheme.navBgActive} ${eventTheme.navTextActive}` : 'text-gray-500 hover:text-white hover:bg-white/10'}`}>
        {icon}
      </div>
      <div className="absolute left-full ml-6 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#1a1a1a] backdrop-blur-xl border border-white/5 rounded-xl text-sm font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 whitespace-nowrap pointer-events-none shadow-2xl">
        {tooltip}
      </div>
    </div>
  );
}