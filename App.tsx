
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MOCK_EVENTS, MOCK_ARTISTS, MOCK_ADS, MOCK_VIDEOS } from './constants';
import { 
  Event, User, Purchase, PaymentMethod, TicketType, 
  Ad, CartItem, VideoHighlight, Artist, ValidationRecord 
} from './types';
import { 
  Search, ShoppingBag, User as UserIcon, Plus, 
  CheckCircle, X, Ticket, LayoutDashboard, 
  Scan, Check, LogOut, Lock, Trash2, Activity, Moon, Sun, 
  CreditCard, RefreshCcw, Smartphone, ShieldCheck, 
  ArrowLeft, ChevronLeft, ChevronRight, Mic, Heart, AlertCircle, Clock, 
  PlayCircle, Video, Bell, ToggleLeft, ToggleRight, Landmark, 
  BarChart3, Image as ImageIcon, DollarSign, Share2, Filter, MapPin, Calendar as CalendarIcon,
  Cake, UserCheck, Smartphone as PhoneIcon, Compass, Sparkles, Megaphone, Info, ExternalLink, 
  Youtube, Facebook, Instagram, Twitter, Mail, Phone, Map, Globe, Camera, Upload
} from 'lucide-react';
import { Html5QrcodeScanner } from "html5-qrcode";

// --- Utils ---
const playSound = (type: 'success' | 'error' | 'click') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    
    if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.start(); osc.stop(now + 0.6);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(); osc.stop(now + 0.08);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(); osc.stop(now + 0.4);
    }
  } catch (e) {}
};

const validatePhone = (method: PaymentMethod | string, phone: string) => {
  const clean = phone.replace(/\s+/g, '');
  if (clean.length !== 9) return false;
  const validPrefixes = ['84', '85', '86', '87', '82', '83'];
  return validPrefixes.some(p => clean.startsWith(p));
};

const validateCard = (number: string, expiry: string, cvv: string) => {
  const numClean = number.replace(/\s+/g, '');
  const expRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  return numClean.length === 16 && expRegex.test(expiry) && cvv.length === 3;
};

// --- Components ---

const QRScanner: React.FC<{ onScan: (code: string) => void }> = ({ onScan }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader", 
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 }, 
      false
    );
    scanner.render(onScan, () => {});
    return () => {
      scanner.clear().catch(e => console.error("Scanner clear error", e));
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-md mx-auto rounded-[40px] overflow-hidden bg-black border-4 border-gray-800 shadow-2xl relative">
      <div id="qr-reader" className="w-full"></div>
    </div>
  );
};

const FeaturedSlider: React.FC = () => {
  const images = [
    { url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=1200&h=500', title: 'Festivais Épicos' },
    { url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=1200&h=500', title: 'Artistas Locais' },
    { url: 'https://images.unsplash.com/photo-1514525253361-bee871870472?auto=format&fit=crop&q=80&w=1200&h=500', title: 'Noites de Jazz' }
  ];
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % images.length), 5000);
    return () => clearInterval(timer);
  }, [images.length]);
  return (
    <div className="relative w-full h-[300px] md:h-[500px] rounded-[40px] overflow-hidden shadow-2xl bg-gray-200 dark:bg-gray-900 group">
      {images.map((img, idx) => (
        <div key={idx} className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${idx === current ? 'opacity-100' : 'opacity-0'}`}>
          <img src={img.url} className="w-full h-full object-cover" alt={img.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex flex-col justify-end p-12">
            <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">{img.title}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

const Toast: React.FC<{ message: string; onClose: () => void; type?: 'success' | 'error' }> = ({ message, onClose, type = 'success' }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[5000] ${type === 'success' ? 'bg-red-600' : 'bg-orange-600'} text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in border border-white/20 text-[11px] font-black uppercase tracking-widest backdrop-blur-md`}>
      {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span>{message}</span>
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('moztickets_theme') as 'light' | 'dark') || 'dark');
  const [user, setUser] = useState<User | null>(() => { const s = localStorage.getItem('moztickets_user'); return s ? JSON.parse(s) : null; });
  const [events, setEvents] = useState<Event[]>(() => { const s = localStorage.getItem('moztickets_events'); return s ? JSON.parse(s) : MOCK_EVENTS; });
  const [artists] = useState<Artist[]>(MOCK_ARTISTS);
  const [ads] = useState<Ad[]>(MOCK_ADS);
  const [videos, setVideos] = useState<VideoHighlight[]>(() => { const s = localStorage.getItem('moztickets_videos'); return s ? JSON.parse(s) : MOCK_VIDEOS; });
  const [purchases, setPurchases] = useState<Purchase[]>(() => { const s = localStorage.getItem('moztickets_purchases'); return s ? JSON.parse(s) : []; });
  const [favorites, setFavorites] = useState<string[]>(() => { const s = localStorage.getItem('moztickets_favorites'); return s ? JSON.parse(s) : []; });
  
  const [notifSettings, setNotifSettings] = useState(() => {
    const s = localStorage.getItem('moztickets_notif_settings');
    return s ? JSON.parse(s) : { master: false, newEvents: true, purchaseUpdates: true };
  });

  const [activeView, setActiveView] = useState<'home' | 'explore' | 'artists' | 'about' | 'contact'>('home');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'dash' | 'finance' | 'scan' | 'videos' | 'events'>('dash');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoHighlight | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => { localStorage.setItem('moztickets_theme', theme); document.documentElement.className = theme; }, [theme]);
  useEffect(() => { localStorage.setItem('moztickets_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('moztickets_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('moztickets_purchases', JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem('moztickets_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('moztickets_videos', JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem('moztickets_notif_settings', JSON.stringify(notifSettings)); }, [notifSettings]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            e.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(e.category);
      const matchesCity = selectedCity === 'all' || e.city === selectedCity;
      const matchesDate = !selectedDate || e.date.split('T')[0] === selectedDate;
      return matchesSearch && matchesCategory && matchesCity && matchesDate;
    });
  }, [events, searchQuery, selectedCategories, selectedCity, selectedDate]);

  const reports = useMemo(() => {
    const validated = purchases.filter(p => p.status === 'validated' || p.status === 'completed');
    const total = validated.reduce((acc, p) => acc + p.total, 0);
    const byMethod = validated.reduce((acc: any, p) => {
      acc[p.method] = (acc[p.method] || 0) + p.total;
      return acc;
    }, {});
    return { total, byMethod };
  }, [purchases]);

  const handleBuy = (e: Event, type: TicketType) => {
    if (!user) { setIsAuthModalOpen(true); return; }
    setCart([{ event: e, ticketType: type, quantity: 1 }]);
    setIsCartOpen(true);
  };

  const handleCheckout = (method: PaymentMethod, details: any) => {
    const newP: Purchase = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      userId: user?.id || 'guest',
      eventId: cart[0].event.id,
      eventTitle: cart[0].event.title,
      date: new Date().toISOString(),
      total: cart[0].ticketType.price,
      method,
      tickets: [{ type: cart[0].ticketType.name, quantity: 1, price: cart[0].ticketType.price }],
      qrCode: `MOZ-${Math.random().toString(36).substring(7).toUpperCase()}`,
      status: 'pending', 
    };
    setPurchases([...purchases, newP]);
    setCart([]);
    setIsCheckoutOpen(false);
    playSound('success');
    setToast({msg: "Solicitação enviada! Aguarde validação.", type: 'success'});
    setIsMyTicketsOpen(true);
  };

  const toggleMasterNotifications = async () => {
    if (notifSettings.master) {
      setNotifSettings({ ...notifSettings, master: false });
      return;
    }
    if (!('Notification' in window)) {
      setToast({msg: 'Browser não suporta notificações.', type: 'error'});
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotifSettings({ ...notifSettings, master: true });
      setToast({msg: 'Notificações ativadas!', type: 'success'});
      playSound('success');
    } else {
      setToast({msg: 'Permissão negada.', type: 'error'});
      playSound('error');
    }
  };

  const handleShareTicket = async (purchase: Purchase) => {
    const shareData = {
      title: `Bilhete: ${purchase.eventTitle}`,
      text: `Meu bilhete para ${purchase.eventTitle}. Código: ${purchase.qrCode}`,
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setToast({ msg: "Partilhado!", type: "success" });
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(shareData.text);
      setToast({ msg: "Código copiado!", type: "success" });
    }
  };

  const handleValidateScan = (code: string) => {
    const p = purchases.find(x => x.qrCode === code || x.id === code);
    if (!p) { playSound('error'); setScanResult({ type: 'error', msg: 'BILHETE INVÁLIDO' }); return; }
    if (p.status === 'validated') { playSound('error'); setScanResult({ type: 'error', msg: 'JÁ VALIDADO' }); return; }
    if (p.status === 'pending') { playSound('error'); setScanResult({ type: 'error', msg: 'PAGAMENTO PENDENTE' }); return; }

    setPurchases(purchases.map(x => x.id === p.id ? { ...x, status: 'validated' as const } : x));
    playSound('success');
    setScanResult({ type: 'success', msg: 'AUTORIZADO' });
    setTimeout(() => setScanResult(null), 3000);
  };

  const addVideo = (v: VideoHighlight) => {
    setVideos([...videos, v]);
    setToast({ msg: 'Vídeo adicionado com sucesso!', type: 'success' });
  };

  const deleteVideo = (id: string) => {
    setVideos(videos.filter(v => v.id !== id));
    setToast({ msg: 'Vídeo removido.', type: 'error' });
  };

  const addEvent = (e: Event) => {
    setEvents([...events, e]);
    setToast({ msg: 'Evento publicado!', type: 'success' });
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    setToast({ msg: 'Evento removido.', type: 'error' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] dark:bg-[#0a0f1e] text-gray-900 dark:text-gray-100 transition-all overflow-x-hidden text-left">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <header className="sticky top-0 z-[1000] bg-white/80 dark:bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 h-20">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h1 className="text-2xl font-black tracking-tighter text-red-600 italic cursor-pointer" onClick={() => { setActiveView('home'); setIsAdminOpen(false); }}>
              MOZ<span className="text-black dark:text-white">TICKETS</span>
            </h1>
            <nav className="hidden lg:flex items-center gap-6">
              {[
                { id: 'home', label: 'Início' },
                { id: 'explore', label: 'Descobrir' },
                { id: 'artists', label: 'Artistas' },
                { id: 'about', label: 'Sobre Nós' },
                { id: 'contact', label: 'Contactos' }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => { setActiveView(item.id as any); setIsAdminOpen(false); }} 
                  className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeView === item.id ? 'text-red-600' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl">
              {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl">
              <ShoppingBag size={20}/>
              {cart.length > 0 && <span className="absolute top-1 right-1 bg-red-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-bounce">!</span>}
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => setIsAdminOpen(true)} className="p-3 bg-red-600 text-white rounded-2xl shadow-lg hover:scale-105 transition-transform">
                <LayoutDashboard size={20}/>
              </button>
            )}
            <button onClick={() => user ? setIsMyTicketsOpen(true) : setIsAuthModalOpen(true)} className="flex items-center gap-3 pl-4 pr-1 py-1 bg-gray-950 dark:bg-white rounded-full transition-transform active:scale-95">
              <span className="text-[9px] font-black uppercase text-white dark:text-black hidden sm:block">{user ? user.name.split(' ')[0] : 'Entrar'}</span>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white"><UserIcon size={16}/></div>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 flex-1">
        {isAdminOpen ? (
          <div className="flex animate-fade-in h-[85vh] bg-white dark:bg-white/5 rounded-[60px] shadow-2xl overflow-hidden border dark:border-white/5">
            <aside className="w-64 border-r border-gray-200 dark:border-white/5 flex flex-col pt-8 bg-gray-50 dark:bg-black/20">
              <nav className="flex-1 px-4 space-y-2">
                 {[
                   { id:'dash', label:'Dashboard', icon: Activity },
                   { id:'events', label:'Eventos', icon: Ticket },
                   { id:'finance', label:'Finanças', icon: DollarSign },
                   { id:'scan', label:'Portaria', icon: Scan },
                   { id:'videos', label:'Vídeos', icon: Video },
                 ].map(t => (
                   <button key={t.id} onClick={() => setAdminTab(t.id as any)} className={`w-full flex items-center gap-4 p-5 rounded-[24px] text-[10px] font-black uppercase transition-all ${adminTab === t.id ? 'bg-red-600 text-white shadow-xl translate-x-2' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                     <t.icon size={18}/> {t.label}
                   </button>
                 ))}
              </nav>
              <button onClick={() => setIsAdminOpen(false)} className="m-8 p-4 text-gray-500 font-black uppercase text-[10px] flex items-center gap-2 hover:text-red-600 transition-colors"><LogOut size={16}/> Sair do Painel</button>
            </aside>
            <main className="flex-1 p-12 overflow-y-auto no-scrollbar">
              {adminTab === 'dash' && <AdminDash reports={reports} purchases={purchases} events={events} />}
              {adminTab === 'scan' && <AdminScanner onScan={handleValidateScan} scanResult={scanResult} />}
              {adminTab === 'finance' && <AdminFinance purchases={purchases} setPurchases={setPurchases} />}
              {adminTab === 'videos' && <AdminVideos videos={videos} onAdd={addVideo} onDelete={deleteVideo} />}
              {adminTab === 'events' && <AdminEvents events={events} artists={artists} onAdd={addEvent} onDelete={removeEvent} />}
            </main>
          </div>
        ) : activeView === 'home' ? (
          <div className="space-y-12">
            <FeaturedSlider />
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <input type="text" placeholder="Pesquisar concertos, teatros ou festivais..." className="w-full p-6 pl-14 bg-white dark:bg-white/5 rounded-[30px] shadow-xl outline-none font-bold border-2 border-transparent focus:border-red-600/30 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20}/>
                </div>
                <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`px-8 py-5 rounded-[28px] font-black uppercase text-[10px] flex items-center justify-center gap-2 transition-all shadow-xl ${showAdvancedFilters ? 'bg-red-600 text-white' : 'bg-white dark:bg-white/5 text-gray-500'}`}><Filter size={18}/> Filtros</button>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                  <Video className="text-red-600" size={28}/> Momentos Épicos
                </h2>
                <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 px-2">
                  {videos.map(v => (
                    <div key={v.id} onClick={() => setPlayingVideo(v)} className="flex-shrink-0 w-80 group cursor-pointer space-y-4">
                      <div className="relative aspect-video rounded-[32px] overflow-hidden shadow-xl border-2 border-transparent group-hover:border-red-600 transition-all duration-500">
                        <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={v.title}/>
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                          <div className="p-5 bg-red-600/90 rounded-full text-white shadow-2xl transform scale-90 group-hover:scale-110 transition-transform">
                            <PlayCircle size={32} fill="currentColor"/>
                          </div>
                        </div>
                      </div>
                      <div className="px-2">
                        <h4 className="text-sm font-black uppercase italic tracking-tighter text-black dark:text-white line-clamp-1">{v.title}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{v.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                <button onClick={() => setSelectedCategories([])} className={`flex-shrink-0 px-6 py-3 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${selectedCategories.length === 0 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-white/5 text-gray-500'}`}>Tudo</button>
                {['concert', 'theater', 'festival', 'business'].map(cat => (
                  <button key={cat} onClick={() => setSelectedCategories([cat])} className={`flex-shrink-0 px-6 py-3 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${selectedCategories.includes(cat) ? 'bg-red-600 text-white' : 'bg-white dark:bg-white/5 text-gray-500'}`}>{cat}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredEvents.map(e => (
                <div key={e.id} onClick={() => setSelectedEvent(e)} className="group bg-white dark:bg-white/5 rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl border dark:border-white/5 transition-all cursor-pointer animate-fade-in">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={e.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={e.title}/>
                    <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                      <span className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-[8px] font-black uppercase text-white tracking-widest">{e.city}</span>
                    </div>
                  </div>
                  <div className="p-8 text-left">
                    <span className="text-[9px] font-black uppercase text-red-600 tracking-widest">{e.category}</span>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-black dark:text-white mt-2 leading-tight">{e.title}</h3>
                    <div className="mt-8 flex items-center justify-between pt-6 border-t dark:border-white/5">
                      <p className="text-lg font-black text-black dark:text-white">{e.ticketTypes[0].price.toLocaleString()} MT</p>
                      <button onClick={me => { me.stopPropagation(); handleBuy(e, e.ticketTypes[0]); }} className="bg-gray-950 dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Reservar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeView === 'explore' ? (
          <DiscoveryPage 
            artists={artists} 
            ads={ads} 
            newEvents={events.slice(0, 3)} 
            onArtistClick={(a) => { setSelectedArtist(a); setActiveView('artists'); }}
            onEventClick={setSelectedEvent}
          />
        ) : activeView === 'artists' ? (
          <ArtistsPage 
            artists={artists} 
            selectedArtist={selectedArtist} 
            onSelectArtist={setSelectedArtist} 
            events={events}
            onEventClick={setSelectedEvent}
          />
        ) : activeView === 'about' ? (
          <AboutPage />
        ) : activeView === 'contact' ? (
          <ContactPage />
        ) : null}
      </main>

      <footer className="bg-white dark:bg-[#030712] border-t dark:border-white/5 py-32 mt-auto">
         <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 text-left">
            <div className="col-span-1 md:col-span-1 space-y-6">
               <h1 className="text-4xl font-black text-red-600 italic tracking-tighter">MOZ<span className="text-black dark:text-white">TICKETS</span></h1>
               <p className="text-gray-500 font-bold max-w-sm leading-relaxed">Sua porta de entrada para a cultura de Moçambique. Onde os momentos épicos acontecem em cada clique.</p>
               <div className="flex gap-4">
                 {[Instagram, Facebook, Twitter, Youtube].map((Ico, idx) => (
                   <button key={idx} className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                     <Ico size={20}/>
                   </button>
                 ))}
               </div>
            </div>
            <div>
               <h4 className="text-[11px] font-black uppercase text-gray-400 mb-8 tracking-[0.2em] border-l-4 border-red-600 pl-4">Navegação</h4>
               <nav className="flex flex-col gap-4">
                 <button onClick={() => setActiveView('home')} className="text-sm font-black uppercase text-gray-500 hover:text-red-600 transition-colors text-left w-fit italic">Início</button>
                 <button onClick={() => setActiveView('explore')} className="text-sm font-black uppercase text-gray-500 hover:text-red-600 transition-colors text-left w-fit italic">Novos Cartazes</button>
                 <button onClick={() => setActiveView('artists')} className="text-sm font-black uppercase text-gray-500 hover:text-red-600 transition-colors text-left w-fit italic">Artistas</button>
               </nav>
            </div>
            <div>
               <h4 className="text-[11px] font-black uppercase text-gray-400 mb-8 tracking-[0.2em] border-l-4 border-red-600 pl-4">Institucional</h4>
               <nav className="flex flex-col gap-4">
                 <button onClick={() => setActiveView('about')} className="text-sm font-black uppercase text-gray-500 hover:text-red-600 transition-colors text-left w-fit italic">Sobre Nós</button>
                 <button onClick={() => setActiveView('contact')} className="text-sm font-black uppercase text-gray-500 hover:text-red-600 transition-colors text-left w-fit italic">Contactos</button>
                 <button className="text-sm font-black uppercase text-gray-500 hover:text-red-600 transition-colors text-left w-fit italic">Privacidade</button>
               </nav>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 p-10 rounded-[50px] space-y-4 border dark:border-white/5 shadow-inner">
               <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">MozTickets APP</h4>
               <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">Em breve na Play Store e App Store.</p>
               <button className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-3xl text-[10px] font-black uppercase hover:scale-105 transition-transform">Brevemente</button>
            </div>
         </div>
         <div className="container mx-auto px-6 mt-20 pt-10 border-t dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">&copy; 2024 MOZTICKETS. ESTAMOS JUNTOS.</p>
           <div className="flex items-center gap-8 grayscale opacity-50">
             <Smartphone size={16}/> <span className="text-[10px] font-black">M-PESA</span>
             <Smartphone size={16}/> <span className="text-[10px] font-black">E-MOLA</span>
             <CreditCard size={16}/> <span className="text-[10px] font-black">LOCAL CARDS</span>
           </div>
         </div>
      </footer>

      {isAuthModalOpen && <AuthModal onAuth={(u) => { setUser(u); setIsAuthModalOpen(false); }} onClose={() => setIsAuthModalOpen(false)} />}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}/>
      <CheckoutModal isOpen={isCheckoutOpen} cart={cart} onConfirm={handleCheckout} onClose={() => setIsCheckoutOpen(false)} />
      <MyTicketsModal 
        isOpen={isMyTicketsOpen} 
        user={user} 
        purchases={purchases} 
        onLogout={() => { setUser(null); setIsMyTicketsOpen(false); }} 
        onClose={() => setIsMyTicketsOpen(false)} 
        notifSettings={notifSettings}
        setNotifSettings={setNotifSettings}
        onToggleMaster={toggleMasterNotifications}
        onShare={handleShareTicket}
      />
      {selectedEvent && <EventDetailsModal event={selectedEvent} onBuy={handleBuy} onClose={() => setSelectedEvent(null)} />}
      {playingVideo && <VideoPlayerModal video={playingVideo} onClose={() => setPlayingVideo(null)} />}
    </div>
  );
}

// --- Specific Page Components ---

const DiscoveryPage: React.FC<{ 
  artists: Artist[], 
  ads: Ad[], 
  newEvents: Event[], 
  onArtistClick: (a: Artist) => void,
  onEventClick: (e: Event) => void
}> = ({ artists, ads, newEvents, onArtistClick, onEventClick }) => (
  <div className="space-y-20 animate-fade-in text-left">
    <section className="space-y-8">
      <h2 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4">
        <Sparkles className="text-red-600" size={32}/> Talentos Nacionais
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {artists.slice(0, 4).map(artist => (
          <div key={artist.id} onClick={() => onArtistClick(artist)} className="group cursor-pointer space-y-4">
            <div className="relative aspect-square rounded-[40px] overflow-hidden border-4 border-transparent group-hover:border-red-600 transition-all duration-500 shadow-xl">
              <img src={artist.photo} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" alt={artist.name}/>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-8">
                <span className="text-white font-black uppercase tracking-widest text-[9px] flex items-center gap-2">Ver Perfil <Info size={14}/></span>
              </div>
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-center">{artist.name}</h3>
          </div>
        ))}
      </div>
    </section>

    <section className="space-y-8">
      <h2 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4">
        <Compass className="text-red-600" size={32}/> Novos Cartazes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {newEvents.map(e => (
          <div key={e.id} onClick={() => onEventClick(e)} className="group relative rounded-[40px] overflow-hidden shadow-2xl h-[450px] cursor-pointer">
            <img src={e.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={e.title}/>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-10">
              <div className="flex gap-2 mb-4">
                <span className="px-4 py-1.5 bg-red-600 text-white font-black uppercase text-[8px] rounded-full">Novo</span>
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white font-black uppercase text-[8px] rounded-full">{e.city}</span>
              </div>
              <h4 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-tight drop-shadow-xl">{e.title}</h4>
              <p className="text-gray-300 text-[11px] font-bold mt-3 flex items-center gap-2"><MapPin size={14}/> {e.location}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="space-y-8">
      <h2 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4">
        <Megaphone className="text-red-600" size={32}/> Campanhas Activas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ads.map(ad => (
          <a key={ad.id} href={ad.link} className="group relative h-72 rounded-[40px] overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500 border-2 border-transparent hover:border-red-600/30">
            <img src={ad.imageUrl} className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-700" alt={ad.title}/>
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-12">
              <div className="space-y-4 text-center">
                <h4 className="text-4xl font-black uppercase italic text-white drop-shadow-2xl tracking-tighter">{ad.title}</h4>
                <span className="inline-block px-8 py-3 bg-red-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Aproveitar Oferta</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  </div>
);

const ArtistsPage: React.FC<{ 
  artists: Artist[], 
  selectedArtist: Artist | null, 
  onSelectArtist: (a: Artist | null) => void,
  events: Event[],
  onEventClick: (e: Event) => void
}> = ({ artists, selectedArtist, onSelectArtist, events, onEventClick }) => {
  if (selectedArtist) {
    const artistEvents = events.filter(e => e.artistId === selectedArtist.id);
    return (
      <div className="animate-fade-in space-y-16 text-left">
        <button onClick={() => onSelectArtist(null)} className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-black uppercase text-[10px] transition-colors">
          <ArrowLeft size={16}/> Voltar para Artistas
        </button>
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="w-full lg:w-1/3">
            <div className="relative aspect-[3/4] rounded-[60px] overflow-hidden shadow-3xl border-8 border-white dark:border-white/5">
              <img src={selectedArtist.photo} className="w-full h-full object-cover" alt={selectedArtist.name}/>
            </div>
          </div>
          <div className="w-full lg:w-2/3 space-y-12">
            <div className="space-y-4">
              <h2 className="text-7xl font-black uppercase italic tracking-tighter text-black dark:text-white leading-none">{selectedArtist.name}</h2>
              <div className="flex gap-4">
                 {[Instagram, Facebook, Twitter].map((Ico, i) => (
                   <button key={i} className="p-4 bg-gray-100 dark:bg-white/5 rounded-3xl hover:text-red-600 transition-all"><Ico size={20}/></button>
                 ))}
              </div>
            </div>
            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase text-red-600 tracking-[0.2em] border-l-4 border-red-600 pl-6">Biografia Detalhada</h4>
              <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed text-xl italic">{selectedArtist.bio}</p>
            </div>
            {artistEvents.length > 0 && (
              <div className="space-y-8">
                <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">Próximos Espectáculos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {artistEvents.map(e => (
                    <div key={e.id} onClick={() => onEventClick(e)} className="p-8 bg-white dark:bg-white/5 rounded-[40px] border dark:border-white/5 flex items-center justify-between group cursor-pointer hover:shadow-2xl transition-all">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-red-600 uppercase">{new Date(e.date).toLocaleDateString()}</p>
                        <h5 className="text-xl font-black uppercase italic tracking-tighter leading-tight">{e.title}</h5>
                      </div>
                      <ChevronRight size={24} className="text-gray-300 group-hover:text-red-600 transition-colors"/>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-16 text-left">
      <div className="space-y-4">
        <h2 className="text-6xl font-black uppercase italic tracking-tighter text-black dark:text-white">Nossas Estrelas</h2>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Descubra os artistas que fazem Moçambique brilhar</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {artists.map(artist => (
          <div key={artist.id} onClick={() => onSelectArtist(artist)} className="group cursor-pointer space-y-6">
            <div className="relative aspect-[3/4] rounded-[50px] overflow-hidden shadow-2xl border-4 border-transparent group-hover:border-red-600 transition-all duration-500">
              <img src={artist.photo} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" alt={artist.name}/>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-60"></div>
              <div className="absolute bottom-10 left-10 right-10">
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white drop-shadow-xl leading-tight">{artist.name}</h3>
                 <span className="inline-block mt-4 px-6 py-2 bg-red-600 text-white font-black uppercase text-[8px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Ver Biografia</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-20 animate-fade-in text-left py-12">
    <div className="text-center space-y-6">
      <h2 className="text-7xl font-black uppercase italic tracking-tighter text-black dark:text-white">Sobre Nós</h2>
      <p className="text-xl font-bold text-gray-500 uppercase tracking-widest">Inovação e Cultura em cada clique</p>
    </div>
    <div className="relative aspect-video rounded-[60px] overflow-hidden shadow-2xl">
      <img src="https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&q=80&w=1200&h=600" className="w-full h-full object-cover" alt="MozTickets Team"/>
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
         <Sparkles className="text-white opacity-20" size={120}/>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
      <div className="space-y-6">
         <h4 className="text-2xl font-black uppercase italic border-b-4 border-red-600 w-fit pb-2">Nossa Missão</h4>
         <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed text-lg">Conectar o público moçambicano às melhores experiências culturais através de uma plataforma segura, moderna e acessível. Acreditamos no talento nacional e na facilitação do acesso à diversão.</p>
      </div>
      <div className="space-y-6">
         <h4 className="text-2xl font-black uppercase italic border-b-4 border-red-600 w-fit pb-2">O Que Fazemos</h4>
         <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed text-lg">Gerimos a bilhética digital dos maiores eventos de Moçambique, oferecendo integração com métodos de pagamento locais como M-Pesa e e-Mola, garantindo confiança tanto para organizadores quanto para clientes.</p>
      </div>
    </div>
    <div className="bg-red-600 p-16 rounded-[60px] text-white text-center space-y-6 shadow-3xl">
       <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Juntos Pela Cultura.</h3>
       <p className="text-red-100 font-bold text-lg max-w-2xl mx-auto italic">"A MozTickets nasceu da vontade de ver Moçambique vibrar sem barreiras de acesso. Kanimambo por fazer parte desta história."</p>
    </div>
  </div>
);

const ContactPage: React.FC = () => (
  <div className="max-w-6xl mx-auto space-y-20 animate-fade-in text-left py-12">
    <div className="text-center space-y-6">
      <h2 className="text-7xl font-black uppercase italic tracking-tighter text-black dark:text-white">Contactos</h2>
      <p className="text-xl font-bold text-gray-500 uppercase tracking-widest">Dúvidas? Estamos aqui para si</p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div className="space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
           <div className="p-8 bg-white dark:bg-white/5 rounded-[40px] border dark:border-white/5 space-y-4 shadow-sm hover:shadow-xl transition-all">
              <Mail className="text-red-600" size={32}/>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">E-mail Comercial</p>
              <p className="text-lg font-black italic">comercial@moztickets.co.mz</p>
           </div>
           <div className="p-8 bg-white dark:bg-white/5 rounded-[40px] border dark:border-white/5 space-y-4 shadow-sm hover:shadow-xl transition-all">
              <Phone className="text-red-600" size={32}/>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Suporte 24/7</p>
              <p className="text-lg font-black italic">+258 84 123 4567</p>
           </div>
           <div className="p-8 bg-white dark:bg-white/5 rounded-[40px] border dark:border-white/5 space-y-4 sm:col-span-2 shadow-sm hover:shadow-xl transition-all">
              <MapPin className="text-red-600" size={32}/>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Sede MozTickets</p>
              <p className="text-lg font-black italic">Avenida 24 de Julho, n.º 2024, Maputo, Moçambique</p>
           </div>
        </div>
        <div className="p-10 bg-black dark:bg-white rounded-[50px] text-white dark:text-black space-y-6 shadow-2xl">
           <h4 className="text-2xl font-black uppercase italic leading-none">Horários</h4>
           <div className="space-y-4 opacity-80 text-sm font-bold uppercase tracking-widest">
             <div className="flex justify-between border-b border-white/10 dark:border-black/10 pb-2"><span>Segunda - Sexta</span> <span>08:00 - 18:00</span></div>
             <div className="flex justify-between border-b border-white/10 dark:border-black/10 pb-2"><span>Sábado</span> <span>09:00 - 13:00</span></div>
             <div className="flex justify-between"><span>Domingo</span> <span className="text-red-600">Online 24h</span></div>
           </div>
        </div>
      </div>
      <div className="bg-white dark:bg-white/5 p-12 rounded-[60px] border dark:border-white/5 shadow-2xl space-y-8">
        <h4 className="text-3xl font-black uppercase italic tracking-tighter">Envie Mensagem</h4>
        <div className="space-y-6">
           <input type="text" placeholder="Nome Completo" className="w-full p-5 bg-gray-50 dark:bg-black/40 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-red-600/30 transition-all"/>
           <input type="email" placeholder="Seu E-mail" className="w-full p-5 bg-gray-50 dark:bg-black/40 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-red-600/30 transition-all"/>
           <textarea placeholder="Como podemos ajudar?" className="w-full p-5 bg-gray-50 dark:bg-black/40 rounded-2xl outline-none font-bold h-40 no-scrollbar border-2 border-transparent focus:border-red-600/30 transition-all"></textarea>
           <button className="w-full py-6 bg-red-600 text-white rounded-3xl font-black uppercase shadow-xl hover:scale-[1.02] active:scale-98 transition-all tracking-widest">Enviar Agora</button>
        </div>
      </div>
    </div>
  </div>
);

const VideoPlayerModal: React.FC<{ video: VideoHighlight, onClose: () => void }> = ({ video, onClose }) => (
  <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-fade-in">
    <div className="w-full max-w-5xl space-y-8 relative">
      <button onClick={onClose} className="absolute -top-16 right-0 p-4 text-white hover:text-red-600 transition-colors bg-white/5 rounded-full">
        <X size={32}/>
      </button>
      <div className="aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/5">
        {video.type === 'link' ? (
          <iframe 
            src={video.url + "?autoplay=1"} 
            className="w-full h-full" 
            frameBorder="0" 
            allow="autoplay; fullscreen" 
            allowFullScreen
          ></iframe>
        ) : (
          <video src={video.url} controls autoPlay className="w-full h-full object-contain"></video>
        )}
      </div>
      <div className="text-left space-y-2">
        <h3 className="text-3xl font-black uppercase italic italic text-white tracking-tighter">{video.title}</h3>
        <p className="text-gray-400 font-bold">{video.description}</p>
      </div>
    </div>
  </div>
);

// --- Admin Section ---

const AdminEvents: React.FC<{ events: Event[], artists: Artist[], onAdd: (e: Event) => void, onDelete: (id: string) => void }> = ({ events, artists, onAdd, onDelete }) => {
  const [newE, setNewE] = useState<Partial<Event>>({ 
    title: '', 
    description: '', 
    image: '', 
    city: 'Maputo', 
    location: '', 
    category: 'concert',
    date: new Date().toISOString().split('T')[0],
    artistId: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewE({ ...newE, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!newE.title || !newE.image) return;
    onAdd({
      id: Math.random().toString(36).substring(7),
      title: newE.title!,
      description: newE.description || '',
      image: newE.image!,
      city: newE.city!,
      location: newE.location || 'Local a definir',
      category: newE.category as any,
      date: newE.date!,
      organizer: 'Administrador MozTickets',
      artistId: newE.artistId,
      ticketTypes: [
        { id: Math.random().toString(36), name: 'Normal', price: 1000, available: 100, description: 'Acesso Geral' }
      ]
    });
    setNewE({ title: '', description: '', image: '', city: 'Maputo', category: 'concert', artistId: '' });
  };

  return (
    <div className="space-y-12 animate-fade-in text-left">
      <h3 className="text-3xl font-black uppercase italic tracking-tighter">Gestão de Cartazes</h3>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-black/20 p-10 rounded-[50px] border dark:border-white/5 shadow-xl space-y-6">
          <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Publicar Novo Evento</h4>
          
          <div className="space-y-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="aspect-[16/9] rounded-3xl bg-gray-50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-red-600/50">
                {newE.image ? (
                  <img src={newE.image} className="w-full h-full object-cover"/>
                ) : (
                  <>
                    <Upload size={32} className="text-gray-300 mb-2"/>
                    <p className="text-[9px] font-black uppercase text-gray-400">Clique para Upload de Capa</p>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload}/>
            </div>

            <input type="text" placeholder="Nome do Espectáculo" className="w-full p-5 bg-gray-50 dark:bg-black/40 rounded-2xl outline-none font-bold" value={newE.title} onChange={e => setNewE({...newE, title: e.target.value})}/>
            
            <div className="grid grid-cols-2 gap-4">
              <select className="p-5 bg-gray-50 dark:bg-black/40 rounded-2xl outline-none font-bold text-sm" value={newE.category} onChange={e => setNewE({...newE, category: e.target.value as any})}>
                <option value="concert">Concerto</option>
                <option value="festival">Festival</option>
                <option value="theater">Teatro</option>
                <option value="business">Negócios</option>
              </select>
              <select className="p-5 bg-gray-50 dark:bg-black/40 rounded-2xl outline-none font-bold text-sm" value={newE.artistId} onChange={e => setNewE({...newE, artistId: e.target.value})}>
                <option value="">Nenhum Artista</option>
                {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <input type="text" placeholder="Cidade" className="p-5 bg-gray-50 dark:bg-black/40 rounded-2xl outline-none font-bold" value={newE.city} onChange={e => setNewE({...newE, city: e.target.value})}/>
               <input type="date" className="p-5 bg-gray-50 dark:bg-black/40 rounded-2xl outline-none font-bold" value={newE.date} onChange={e => setNewE({...newE, date: e.target.value})}/>
            </div>
            
            <textarea placeholder="Detalhes do evento..." className="w-full p-5 bg-gray-50 dark:bg-black/40 rounded-2xl outline-none font-bold h-32 no-scrollbar" value={newE.description} onChange={e => setNewE({...newE, description: e.target.value})}></textarea>
            
            <button onClick={handleAdd} className="w-full py-6 bg-red-600 text-white rounded-[28px] font-black uppercase text-[11px] shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all">
               <Plus size={18}/> Publicar no MozTickets
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Cartazes Online ({events.length})</h4>
          <div className="grid grid-cols-1 gap-4">
            {events.map(e => (
              <div key={e.id} className="p-6 bg-white dark:bg-black/20 rounded-3xl border dark:border-white/5 flex items-center justify-between shadow-sm group">
                <div className="flex items-center gap-6">
                  <img src={e.image} className="w-16 h-16 rounded-2xl object-cover shadow-md"/>
                  <div>
                    <h5 className="font-black uppercase italic tracking-tighter line-clamp-1">{e.title}</h5>
                    <div className="flex items-center gap-3 text-[8px] font-bold text-gray-400 uppercase mt-1">
                      <span>{e.city}</span>
                      <span>•</span>
                      <span>{e.category}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => onDelete(e.id)} className="p-4 text-red-600 hover:bg-red-600/10 rounded-2xl transition-all opacity-40 group-hover:opacity-100">
                  <Trash2 size={18}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminVideos: React.FC<{ videos: VideoHighlight[], onAdd: (v: VideoHighlight) => void, onDelete: (id: string) => void }> = ({ videos, onAdd, onDelete }) => {
  const [newV, setNewV] = useState({ title: '', description: '', url: '', type: 'link' as 'link' | 'upload', thumbnail: '' });
  
  const handleAdd = () => {
    if (!newV.title || !newV.url) return;
    onAdd({
      id: Math.random().toString(36).substring(7),
      ...newV,
      active: true,
      thumbnail: newV.thumbnail || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800&h=450'
    });
    setNewV({ title: '', description: '', url: '', type: 'link', thumbnail: '' });
  };

  return (
    <div className="space-y-12 animate-fade-in text-left">
      <h3 className="text-3xl font-black uppercase italic tracking-tighter">Gestão de Vídeos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-white/5 p-10 rounded-[50px] border dark:border-white/5 shadow-xl">
        <div className="space-y-6">
          <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Adicionar Novo Vídeo</h4>
          <input type="text" placeholder="Título do Vídeo" className="w-full p-5 bg-gray-50 dark:bg-black/20 rounded-2xl outline-none font-bold" value={newV.title} onChange={e => setNewV({...newV, title: e.target.value})}/>
          <input type="text" placeholder="URL (YouTube Embed ou MP4 Direct)" className="w-full p-5 bg-gray-50 dark:bg-black/20 rounded-2xl outline-none font-bold" value={newV.url} onChange={e => setNewV({...newV, url: e.target.value})}/>
          <input type="text" placeholder="URL da Miniatura" className="w-full p-5 bg-gray-50 dark:bg-black/20 rounded-2xl outline-none font-bold" value={newV.thumbnail} onChange={e => setNewV({...newV, thumbnail: e.target.value})}/>
          <textarea placeholder="Pequena descrição" className="w-full p-5 bg-gray-50 dark:bg-black/20 rounded-2xl outline-none font-bold h-32 no-scrollbar" value={newV.description} onChange={e => setNewV({...newV, description: e.target.value})}></textarea>
          <button onClick={handleAdd} className="w-full py-6 bg-red-600 text-white rounded-[28px] font-black uppercase text-[11px] shadow-lg flex items-center justify-center gap-3"><Plus size={18}/> Publicar Momento</button>
        </div>
        <div className="space-y-6">
          <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Vídeos Atuais ({videos.length})</h4>
          <div className="space-y-4">
            {videos.map(v => (
              <div key={v.id} className="p-4 bg-gray-50 dark:bg-black/20 rounded-3xl flex items-center justify-between border dark:border-white/5">
                <div className="flex items-center gap-4">
                  <img src={v.thumbnail} className="w-16 h-12 object-cover rounded-xl"/>
                  <div>
                    <p className="text-xs font-black uppercase italic line-clamp-1">{v.title}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">{v.type}</p>
                  </div>
                </div>
                <button onClick={() => onDelete(v.id)} className="p-3 text-red-600 hover:bg-red-600/10 rounded-xl transition-colors"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthModal: React.FC<{ onAuth: (u: User) => void, onClose: () => void }> = ({ onAuth, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Masculino' | 'Feminino' | 'Outro' | ''>('');
  const [age, setAge] = useState<string>('');
  const [error, setError] = useState('');

  const handleAction = (isAdmin: boolean) => {
    if (!email || !password) { setError('Email e senha obrigatórios.'); return; }
    if (mode === 'register' && (!fullName || !phone || !gender || !age)) { setError('Preencha todos os campos.'); return; }
    
    onAuth({
      id: Math.random().toString(36).substring(7),
      name: mode === 'register' ? fullName : (isAdmin ? 'Administrador' : 'Explorador Moz'),
      email,
      role: isAdmin ? 'admin' : 'user',
      phone, gender, age: age ? parseInt(age) : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-xl animate-fade-in">
      <div className="bg-white dark:bg-[#0a0f1e] w-full max-w-md p-10 rounded-[50px] shadow-2xl border dark:border-white/5 space-y-6 text-black dark:text-white overflow-y-auto max-h-[90vh] no-scrollbar">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-center">{mode === 'login' ? 'Identificação' : 'Novo Membro'}</h2>
        <div className="space-y-4">
          {mode === 'register' && (
            <>
              <input type="text" placeholder="Seu Nome Completo" className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl outline-none font-bold" value={fullName} onChange={e => setFullName(e.target.value)}/>
              <input type="text" placeholder="Contacto (84...)" className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl outline-none font-bold" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}/>
              <div className="grid grid-cols-2 gap-4">
                <select className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl outline-none font-bold text-sm appearance-none" value={gender} onChange={e => setGender(e.target.value as any)}>
                  <option value="">Género</option>
                  <option value="Masculino">Masc</option>
                  <option value="Feminino">Fem</option>
                </select>
                <input type="number" placeholder="Idade" className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl outline-none font-bold" value={age} onChange={e => setAge(e.target.value)}/>
              </div>
            </>
          )}
          <input type="email" placeholder="Email" className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl outline-none font-bold" value={email} onChange={e => setEmail(e.target.value)}/>
          <input type="password" placeholder="Senha" className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl outline-none font-bold" value={password} onChange={e => setPassword(e.target.value)}/>
          {error && <p className="text-red-600 text-[10px] font-black uppercase text-center animate-shake">{error}</p>}
          <button onClick={() => handleAction(false)} className="w-full py-5 bg-red-600 text-white rounded-[28px] font-black uppercase text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all">
            {mode === 'login' ? 'Entrar Agora' : 'Finalizar Perfil'}
          </button>
          {mode === 'login' && (
            <button onClick={() => handleAction(true)} className="w-full py-4 border-2 border-red-600/20 text-red-600 rounded-[28px] font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all">
              <Lock size={14}/> Administração
            </button>
          )}
        </div>
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="w-full text-[10px] font-black uppercase text-gray-400 hover:text-red-600 transition-colors">
          {mode === 'login' ? 'Não possui conta? Crie aqui' : 'Já possui conta? Aceda aqui'}
        </button>
        <button onClick={onClose} className="w-full text-center p-2 text-gray-400 text-[9px] font-black uppercase tracking-widest mt-2">Fechar</button>
      </div>
    </div>
  );
};

const CartSidebar: React.FC<{ isOpen: boolean, onClose: () => void, cart: CartItem[], onCheckout: () => void }> = ({ isOpen, onClose, cart, onCheckout }) => (
  <div className={`fixed inset-y-0 right-0 z-[2000] w-full max-w-md bg-white dark:bg-[#0a0f1e] shadow-2xl transition-transform duration-500 border-l dark:border-white/5 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
    <div className="h-full flex flex-col p-12 text-left">
      <h2 className="text-3xl font-black italic uppercase text-black dark:text-white leading-none mb-12">Carrinho Moz</h2>
      <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
        {cart.length > 0 ? cart.map((item, idx) => (
          <div key={idx} className="flex gap-6 items-center animate-fade-in p-4 bg-gray-50 dark:bg-white/5 rounded-3xl">
            <img src={item.event.image} className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-white/10"/>
            <div className="flex-1 text-black dark:text-white font-black italic uppercase">
              <p className="text-sm leading-none">{item.event.title}</p>
              <p className="text-red-600 mt-1 text-lg">{item.ticketType.price.toLocaleString()} MT</p>
              <p className="text-[9px] text-gray-400">{item.ticketType.name}</p>
            </div>
          </div>
        )) : <div className="py-20 text-center text-gray-400 font-black uppercase text-[10px] space-y-4"><ShoppingBag size={48} className="mx-auto opacity-10"/><p>Nada por aqui ainda.</p></div>}
      </div>
      {cart.length > 0 && <button onClick={onCheckout} className="w-full py-6 bg-red-600 text-white rounded-[28px] font-black uppercase shadow-xl mt-8 transform hover:scale-102 active:scale-98 transition-all">Confirmar Reservas</button>}
      <button onClick={onClose} className="w-full text-center p-4 text-gray-400 font-black uppercase text-[10px] mt-4 tracking-widest italic">Continuar a Explorar</button>
    </div>
  </div>
);

const CheckoutModal: React.FC<{ isOpen: boolean, cart: CartItem[], onConfirm: (m: PaymentMethod, details: any) => void, onClose: () => void }> = ({ isOpen, cart, onConfirm, onClose }) => {
  const [step, setStep] = useState<'method' | 'details'>('method');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({ phone: '', cardNumber: '', expiry: '', cvv: '' });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || cart.length === 0) return null;

  const handleFinalize = () => {
    if (!method) return;
    let isValid = false;
    if (['mpesa', 'emola', 'mkesh'].includes(method)) {
      isValid = validatePhone(method, formData.phone);
      if (!isValid) setError(`Introduza um número ${method.toUpperCase()} válido (82/83/84/85/86/87).`);
    } else if (method === 'card') {
      isValid = validateCard(formData.cardNumber, formData.expiry, formData.cvv);
      if (!isValid) setError('Dados do cartão incorrectos.');
    } else isValid = true;

    if (isValid) {
      onConfirm(method, formData);
      setStep('method'); setMethod(null); setFormData({ phone: '', cardNumber: '', expiry: '', cvv: '' });
      setError(null);
    } else playSound('error');
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-2xl text-left">
      <div className="bg-white dark:bg-[#0a0f1e] w-full max-w-2xl p-12 rounded-[60px] shadow-2xl space-y-10 border dark:border-white/5 animate-scale-up">
        <h2 className="text-3xl font-black italic uppercase text-black dark:text-white tracking-tighter">
          {step === 'method' ? 'Modo de Pagamento' : 'Confirmação'}
        </h2>
        {step === 'method' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['mpesa', 'emola', 'mkesh', 'card', 'bank_transfer'].map(m => (
              <button key={m} onClick={() => { setMethod(m as any); setStep('details'); }} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-white/5 rounded-3xl group transition-all text-black dark:text-white hover:bg-red-600 hover:text-white border dark:border-white/5">
                 <div className="flex items-center gap-4">
                   <Smartphone size={20}/> 
                   <span className="font-black uppercase text-[10px] tracking-widest">{m.toUpperCase()}</span>
                 </div>
                 <ChevronRight size={16}/>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {['mpesa', 'emola', 'mkesh'].includes(method!) && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Telemóvel {method?.toUpperCase()}</label>
                <input type="text" placeholder="8X XXX XXXX" maxLength={9} className="w-full p-5 bg-gray-100 dark:bg-white/5 rounded-2xl outline-none font-bold text-black dark:text-white border-2 border-transparent focus:border-red-600/20 transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}/>
              </div>
            )}
            {method === 'card' && (
              <div className="space-y-4">
                <input type="text" placeholder="Número do Cartão" maxLength={16} className="w-full p-5 bg-gray-100 dark:bg-white/5 rounded-2xl outline-none font-bold text-black dark:text-white" value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value.replace(/\D/g, '')})}/>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM/AA" maxLength={5} className="w-full p-5 bg-gray-100 dark:bg-white/5 rounded-2xl outline-none font-bold text-black dark:text-white" value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})}/>
                  <input type="password" placeholder="CVV" maxLength={3} className="w-full p-5 bg-gray-100 dark:bg-white/5 rounded-2xl outline-none font-bold text-black dark:text-white" value={formData.cvv} onChange={e => setFormData({...formData, cvv: e.target.value.replace(/\D/g, '')})}/>
                </div>
              </div>
            )}
            {error && <p className="text-red-600 text-[10px] font-black uppercase text-center animate-shake leading-relaxed">{error}</p>}
            <button onClick={handleFinalize} className="w-full py-6 bg-red-600 text-white rounded-[28px] font-black uppercase text-[11px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Pagar e Gerar Bilhete</button>
            <button onClick={() => setStep('method')} className="w-full text-center text-gray-400 uppercase font-black text-[9px] tracking-widest italic">Escolher outro método</button>
          </div>
        )}
        <button onClick={onClose} className="w-full text-center text-gray-500 uppercase font-black text-[9px] tracking-widest mt-4">Desistir</button>
      </div>
    </div>
  );
};

const AdminDash: React.FC<{ reports: any, purchases: Purchase[], events: Event[] }> = ({ reports, purchases, events }) => (
  <div className="space-y-12 animate-fade-in text-left">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
       <div className="bg-white dark:bg-black/20 p-10 rounded-[40px] border dark:border-white/10 shadow-xl">
          <div className="flex justify-between items-start">
            <DollarSign size={24} className="text-red-600"/>
            <p className="text-[10px] font-black text-gray-500 uppercase">Receita Total</p>
          </div>
          <p className="text-5xl font-black italic mt-6">{reports.total.toLocaleString()} MT</p>
       </div>
       <div className="bg-white dark:bg-black/20 p-10 rounded-[40px] border dark:border-white/10 shadow-xl">
          <div className="flex justify-between items-start">
            <CheckCircle size={24} className="text-green-600"/>
            <p className="text-[10px] font-black text-gray-500 uppercase">Acessos Validados</p>
          </div>
          <p className="text-5xl font-black italic mt-6">{purchases.filter(p => p.status === 'validated').length}</p>
       </div>
       <div className="bg-white dark:bg-black/20 p-10 rounded-[40px] border dark:border-white/10 shadow-xl">
          <div className="flex justify-between items-start">
            <Ticket size={24} className="text-red-600"/>
            <p className="text-[10px] font-black text-gray-500 uppercase">Cartazes Activos</p>
          </div>
          <p className="text-5xl font-black italic mt-6">{events.length}</p>
       </div>
    </div>
  </div>
);

const AdminFinance: React.FC<{ purchases: Purchase[], setPurchases: any }> = ({ purchases, setPurchases }) => {
  const pending = purchases.filter(p => p.status === 'pending');
  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Validação de Pagamentos ({pending.length})</h3>
        <RefreshCcw size={20} className="text-gray-400 cursor-pointer hover:rotate-180 transition-all duration-500"/>
      </div>
      {pending.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {pending.map(p => (
            <div key={p.id} className="bg-white dark:bg-black/20 p-8 rounded-[40px] flex items-center justify-between shadow-xl border dark:border-white/5">
               <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-red-600/10 text-red-600 rounded-full text-[8px] font-black">{p.method.toUpperCase()}</span>
                    <p className="text-[10px] font-black text-gray-500 uppercase">REF: {p.id}</p>
                  </div>
                  <h4 className="text-xl font-black uppercase italic tracking-tighter leading-none mt-2">{p.eventTitle}</h4>
                  <p className="font-black text-red-600 text-lg">{p.total.toLocaleString()} MT</p>
               </div>
               <button onClick={() => setPurchases(purchases.map(x => x.id === p.id ? {...x, status: 'completed' as const} : x))} className="bg-green-600 text-white px-10 py-5 rounded-3xl font-black uppercase text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-3">
                 <Check size={18}/> Confirmar Recebimento
               </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center text-gray-400 font-black uppercase text-[10px] italic">Tudo em dia. Não há pendentes.</div>
      )}
    </div>
  );
};

const AdminScanner: React.FC<{ onScan: (code: string) => void, scanResult: any }> = ({ onScan, scanResult }) => (
  <div className="max-w-2xl mx-auto space-y-12 animate-fade-in text-center">
    <div className="space-y-3">
      <h3 className="text-3xl font-black uppercase italic text-black dark:text-white tracking-tighter">Controlo de Acessos</h3>
      <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Scanner activo na portaria</p>
    </div>
    <div className="relative p-8 bg-white dark:bg-white/5 rounded-[60px] shadow-2xl border-4 border-gray-100 dark:border-white/10">
       <QRScanner onScan={onScan} />
       {scanResult && (
         <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-3xl rounded-[56px] animate-scale-up ${scanResult.type === 'success' ? 'bg-green-600/70' : 'bg-red-600/70'}`}>
            <div className="bg-white p-8 rounded-full shadow-2xl animate-bounce">
              {scanResult.type === 'success' ? <Check className="text-green-600" size={56}/> : <X className="text-red-600" size={56}/>}
            </div>
            <p className="text-5xl font-black uppercase italic text-white mt-10 tracking-tighter drop-shadow-2xl">{scanResult.msg}</p>
         </div>
       )}
    </div>
    <div className="flex items-center justify-center gap-8">
       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400"><Activity size={16} className="text-green-500"/> Portaria Activa</div>
       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400"><Lock size={16} className="text-red-500"/> Protecção TLS</div>
    </div>
  </div>
);

const MyTicketsModal: React.FC<{
  isOpen: boolean,
  user: User | null,
  purchases: Purchase[],
  onLogout: () => void,
  onClose: () => void,
  notifSettings: any,
  setNotifSettings: any,
  onToggleMaster: () => void,
  onShare: (p: Purchase) => void
}> = ({ isOpen, user, purchases, onLogout, onClose, notifSettings, onToggleMaster, onShare }) => {
  if (!isOpen) return null;
  const userPurchases = purchases.filter(p => p.userId === user?.id);

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-2xl animate-fade-in text-left">
      <div className="bg-white dark:bg-[#0a0f1e] w-full max-w-4xl h-[90vh] rounded-[60px] overflow-hidden flex flex-col shadow-2xl border dark:border-white/5 animate-scale-up">
        <div className="p-10 md:p-14 border-b dark:border-white/5 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">A Minha Área</span>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-black dark:text-white leading-none">Moz Wallet</h2>
          </div>
          <button onClick={onClose} className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl hover:text-red-600 transition-colors"><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-10 md:p-14 space-y-12">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-50 dark:bg-white/5 p-8 rounded-[40px]">
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl font-black italic">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black uppercase italic text-black dark:text-white leading-none">{user?.name}</h3>
              <p className="text-gray-500 font-bold mt-1">{user?.email}</p>
              <p className="text-[10px] font-black uppercase text-gray-400 mt-2 tracking-widest">{user?.phone || 'Telemóvel não definido'}</p>
            </div>
            <button onClick={onLogout} className="px-8 py-4 border-2 border-red-600/20 text-red-600 rounded-[24px] font-black uppercase text-[10px] flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all">
              <LogOut size={16}/> Sair da Conta
            </button>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest border-l-4 border-red-600 pl-4">Notificações</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={onToggleMaster} className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${notifSettings.master ? 'border-red-600/30 bg-red-600/5' : 'border-gray-100 dark:border-white/5 bg-transparent'}`}>
                <div className="flex items-center gap-4">
                  <Bell className={notifSettings.master ? 'text-red-600' : 'text-gray-400'} size={20}/>
                  <span className="text-[10px] font-black uppercase tracking-widest">Push Alerts</span>
                </div>
                {notifSettings.master ? <ToggleRight className="text-red-600" size={32}/> : <ToggleLeft className="text-gray-400" size={32}/>}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest border-l-4 border-red-600 pl-4">Meus Acessos</h4>
            {userPurchases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userPurchases.map(p => (
                  <div key={p.id} className="bg-white dark:bg-white/5 rounded-[40px] p-8 border dark:border-white/5 shadow-xl relative group overflow-hidden">
                    <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[8px] font-black uppercase ${p.status === 'completed' ? 'bg-green-600 text-white' : p.status === 'validated' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'}`}>
                      {p.status}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-600/10 rounded-2xl text-red-600"><Ticket size={24}/></div>
                        <div>
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">REF: {p.id}</p>
                          <h5 className="text-xl font-black uppercase italic tracking-tighter text-black dark:text-white leading-none mt-1">{p.eventTitle}</h5>
                        </div>
                      </div>
                      <div className="pt-4 border-t dark:border-white/5 flex items-center justify-between">
                        <div className="text-center p-3 bg-gray-50 dark:bg-black/40 rounded-2xl flex-1 mr-2">
                           <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Acesso Digital</p>
                           <p className="font-black italic text-sm">{p.qrCode}</p>
                        </div>
                        <button onClick={() => onShare(p)} className="p-4 bg-gray-100 dark:bg-white/10 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Share2 size={20}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-400 font-black uppercase text-[10px] space-y-4 italic">
                <Ticket size={48} className="mx-auto opacity-10"/>
                <p>Nenhum bilhete encontrado. Vamos celebrar?</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EventDetailsModal: React.FC<{
  event: Event,
  onBuy: (e: Event, t: TicketType) => void,
  onClose: () => void
}> = ({ event, onBuy, onClose }) => {
  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-gray-950/95 backdrop-blur-3xl animate-fade-in text-left">
      <div className="bg-white dark:bg-[#0a0f1e] w-full max-w-5xl h-[90vh] rounded-[60px] overflow-hidden flex flex-col md:flex-row shadow-2xl border dark:border-white/5 animate-scale-up">
        <div className="md:w-1/2 relative h-64 md:h-auto">
          <img src={event.image} className="absolute inset-0 w-full h-full object-cover" alt={event.title}/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/80 via-transparent to-transparent"></div>
          <button onClick={onClose} className="absolute top-8 left-8 p-4 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-red-600 transition-all md:hidden"><X size={20}/></button>
        </div>
        <div className="md:w-1/2 flex flex-col overflow-y-auto no-scrollbar">
          <div className="p-10 md:p-16 space-y-10 flex-1">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">{event.category}</span>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white leading-tight">{event.title}</h2>
              </div>
              <button onClick={onClose} className="hidden md:block p-4 bg-gray-100 dark:bg-white/5 rounded-2xl hover:text-red-600 transition-colors"><X size={24}/></button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4 text-left">
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-red-600"><CalendarIcon size={20}/></div>
                <div>
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Quando</p>
                   <p className="text-xs font-bold uppercase">{new Date(event.date).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-red-600"><MapPin size={20}/></div>
                <div>
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Onde</p>
                   <p className="text-xs font-bold line-clamp-1 uppercase">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest border-l-4 border-red-600 pl-4">O Cartaz</h4>
              <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed">{event.description}</p>
            </div>

            <div className="space-y-6 text-left">
              <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest border-l-4 border-red-600 pl-4">Escolha o seu Bilhete</h4>
              <div className="space-y-4">
                {event.ticketTypes.map(type => (
                  <div key={type.id} className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border dark:border-white/5 flex items-center justify-between group hover:border-red-600/30 transition-all shadow-sm">
                    <div className="text-left">
                      <h5 className="font-black uppercase italic text-black dark:text-white leading-none">{type.name}</h5>
                      <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase">{type.description}</p>
                      <p className="text-red-600 font-black text-2xl mt-2 italic tracking-tighter">{type.price.toLocaleString()} MT</p>
                    </div>
                    <button onClick={() => onBuy(event, type)} className="px-8 py-4 bg-gray-950 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-md">Reservar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
