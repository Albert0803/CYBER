
import React, { useState, useEffect } from 'react';
import { BusinessInfo, Session, Subscription, Order, Transaction, Currency } from './types';
import TimerCard from './components/TimerCard';
import InvoiceView from './components/InvoiceView';

const INITIAL_BUSINESS: BusinessInfo = {
  name: "",
  owner: "",
  ownerPhoto: "",
  logo: "",
  address: "",
  phone: "",
  email: "",
  nif: "",
  stat: "",
  cyberPricePerMin: 100,
  gamePricePerMin: 200,
  currency: Currency.MGA,
  isConfigured: false
};

const App: React.FC = () => {
  // --- STATE WITH LOCAL STORAGE PERSISTENCE ---
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(() => {
    const saved = localStorage.getItem('starlink_business_v3');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS;
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('starlink_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('starlink_subs');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('starlink_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('starlink_txs');
    return saved ? JSON.parse(saved) : [];
  });

  const [setupStep, setSetupStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'CYBER' | 'GAMES' | 'SUBS' | 'ORDERS' | 'REPORT'>('DASHBOARD');
  const [showInvoice, setShowInvoice] = useState<any>(null);

  // --- SYNC TO LOCAL STORAGE ---
  useEffect(() => { localStorage.setItem('starlink_business_v3', JSON.stringify(businessInfo)); }, [businessInfo]);
  useEffect(() => { localStorage.setItem('starlink_sessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('starlink_subs', JSON.stringify(subscriptions)); }, [subscriptions]);
  useEffect(() => { localStorage.setItem('starlink_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('starlink_txs', JSON.stringify(transactions)); }, [transactions]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'ownerPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessInfo(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSession = (type: 'CYBER' | 'GAME', clientName: string, minutes: number) => {
    if (!clientName) return;
    const newSession: Session = {
      id: `SESS-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      clientName,
      durationMinutes: minutes,
      startTime: Date.now(),
      isActive: true,
      isFinished: false,
    };
    setSessions(prev => [newSession, ...prev]);
    const price = minutes * (type === 'CYBER' ? businessInfo.cyberPricePerMin : businessInfo.gamePricePerMin);
    addTransaction(`Session ${type} - ${clientName}`, price);
  };

  const addTransaction = (desc: string, amount: number) => {
    const newTx: Transaction = {
      id: `TX-${Date.now()}`,
      date: new Date().toLocaleString('fr-FR'),
      description: desc,
      amount,
      type: 'INCOME'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const finishSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isActive: false, isFinished: true } : s));
  };

  // --- WIZARD FLOW ---
  if (!businessInfo.isConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-700">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-10 text-white">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-black italic tracking-tighter">CYBER STARLINK</h1>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest">Étape {setupStep}/3</span>
              </div>
            </div>
            <div className="flex gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${setupStep >= i ? 'bg-white' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>

          <div className="p-12 space-y-10">
            {setupStep === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900">Propriétaire</h2>
                  <p className="text-slate-500 font-medium">Configurez votre identité professionnelle pour les reçus.</p>
                </div>
                
                <div className="flex items-center gap-8 p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-colors group relative">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-2xl bg-white shadow-inner flex items-center justify-center overflow-hidden border">
                      {businessInfo.ownerPhoto ? (
                        <img src={businessInfo.ownerPhoto} className="w-full h-full object-cover" alt="Owner" />
                      ) : (
                        <span className="text-4xl">📸</span>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'ownerPhoto')} />
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Cliquez pour uploader votre photo</p>
                    <input 
                      className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold" 
                      placeholder="Nom et Prénom du Propriétaire" 
                      value={businessInfo.owner} 
                      onChange={e => setBusinessInfo({...businessInfo, owner: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                    <input className="w-full px-5 py-3 border border-slate-200 rounded-2xl outline-none" placeholder="+261 ..." value={businessInfo.phone} onChange={e => setBusinessInfo({...businessInfo, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input className="w-full px-5 py-3 border border-slate-200 rounded-2xl outline-none" placeholder="exemple@mail.com" value={businessInfo.email} onChange={e => setBusinessInfo({...businessInfo, email: e.target.value})} />
                  </div>
                </div>
                
                <button 
                  onClick={() => businessInfo.owner && setSetupStep(2)}
                  className="w-full py-5 bg-slate-900 text-white font-black rounded-[1.5rem] hover:bg-slate-800 transition shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group"
                  disabled={!businessInfo.owner}
                >
                  Continuer <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
                </button>
              </div>
            )}

            {setupStep === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900">Identité du Cyber</h2>
                  <p className="text-slate-500 font-medium">Ces informations apparaîtront sur vos factures officielles.</p>
                </div>

                <div className="flex items-center gap-8 p-6 bg-indigo-50 rounded-3xl border-2 border-dashed border-indigo-200 group relative">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-2xl bg-white shadow-inner flex items-center justify-center overflow-hidden border">
                      {businessInfo.logo ? (
                        <img src={businessInfo.logo} className="w-full h-full object-cover" alt="Logo" />
                      ) : (
                        <span className="text-4xl font-black italic text-indigo-200">STAR</span>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'logo')} />
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em]">Upload du Logo Cyber</p>
                    <input 
                      className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-indigo-900" 
                      placeholder="NOM DU CYBER" 
                      value={businessInfo.name} 
                      onChange={e => setBusinessInfo({...businessInfo, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-xs">Adresse du Cyber</label>
                  <input className="w-full px-5 py-3 border border-slate-200 rounded-2xl outline-none" placeholder="Lot ..., Antananarivo" value={businessInfo.address} onChange={e => setBusinessInfo({...businessInfo, address: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">NIF</label>
                    <input className="w-full px-5 py-3 border border-slate-200 rounded-2xl outline-none font-mono" placeholder="000 000 000" value={businessInfo.nif} onChange={e => setBusinessInfo({...businessInfo, nif: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">STAT</label>
                    <input className="w-full px-5 py-3 border border-slate-200 rounded-2xl outline-none font-mono" placeholder="00000 00 0000" value={businessInfo.stat} onChange={e => setBusinessInfo({...businessInfo, stat: e.target.value})} />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setSetupStep(1)} className="flex-1 py-5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition">Retour</button>
                  <button 
                    onClick={() => businessInfo.name && setSetupStep(3)}
                    className="flex-[2] py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition shadow-xl"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {setupStep === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900">Tarification Finale</h2>
                  <p className="text-slate-500 font-medium">Définissez vos prix pour le Cyber et la Salle de Jeux.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Devise par défaut</label>
                    <select value={businessInfo.currency} onChange={e => setBusinessInfo({...businessInfo, currency: e.target.value as Currency})} className="w-full px-5 py-4 border-2 border-slate-100 bg-slate-50 rounded-2xl outline-none font-black text-slate-800 text-lg">
                      <option value={Currency.MGA}>Ariary Malagasy (Ar)</option>
                      <option value={Currency.USD}>US Dollar ($)</option>
                      <option value={Currency.EUR}>Euro (€)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 group">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-3">Prix Cyber / min</label>
                      <div className="flex items-center gap-2">
                         <input type="number" className="w-full bg-transparent text-3xl font-black text-indigo-900 outline-none" value={businessInfo.cyberPricePerMin} onChange={e => setBusinessInfo({...businessInfo, cyberPricePerMin: Number(e.target.value)})} />
                         <span className="font-bold text-indigo-300">Ar</span>
                      </div>
                    </div>
                    <div className="p-6 bg-purple-50 rounded-[2rem] border border-purple-100 group">
                      <label className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] block mb-3">Prix Jeux / min</label>
                      <div className="flex items-center gap-2">
                        <input type="number" className="w-full bg-transparent text-3xl font-black text-purple-900 outline-none" value={businessInfo.gamePricePerMin} onChange={e => setBusinessInfo({...businessInfo, gamePricePerMin: Number(e.target.value)})} />
                        <span className="font-bold text-purple-300">Ar</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setSetupStep(2)} className="flex-1 py-5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition">Retour</button>
                  <button 
                    onClick={() => setBusinessInfo({...businessInfo, isConfigured: true})}
                    className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 text-lg"
                  >
                    🎉 Terminer l'installation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD INTERFACE ---
  return (
    <div className="min-h-screen flex bg-slate-50 no-print font-sans selection:bg-indigo-100">
      {/* Sidebar navigation */}
      <aside className="w-80 bg-white flex flex-col fixed inset-y-0 border-r border-slate-200 shadow-sm z-40">
        <div className="p-10 border-b border-slate-50">
          <div className="flex items-center gap-5 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center overflow-hidden shadow-2xl shadow-indigo-200 border-4 border-white">
              {businessInfo.logo ? <img src={businessInfo.logo} className="w-full h-full object-cover" alt="Logo" /> : <span className="text-white font-black italic text-xl">S</span>}
            </div>
            <div>
              <h1 className="font-black text-2xl text-slate-900 tracking-tighter leading-none">{businessInfo.name}</h1>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em] mt-2">Professional Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm">
              <img src={businessInfo.ownerPhoto || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="Owner" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Responsable</p>
              <p className="text-sm font-bold text-slate-700 truncate">{businessInfo.owner}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-6 py-10 space-y-2 overflow-y-auto">
          <SidebarItem icon="📊" label="Dashboard" active={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} />
          <div className="pt-8 pb-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Zones Actives</div>
          <SidebarItem icon="💻" label="Cybercafé" active={activeTab === 'CYBER'} onClick={() => setActiveTab('CYBER')} />
          <SidebarItem icon="🎮" label="Salle de Jeux" active={activeTab === 'GAMES'} onClick={() => setActiveTab('GAMES')} />
          <div className="pt-8 pb-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Commerce</div>
          <SidebarItem icon="💿" label="Vente & Gravure" active={activeTab === 'ORDERS'} onClick={() => setActiveTab('ORDERS')} />
          <SidebarItem icon="💎" label="Abonnements" active={activeTab === 'SUBS'} onClick={() => setActiveTab('SUBS')} />
          <div className="pt-8 pb-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gestion</div>
          <SidebarItem icon="🏦" label="Relevé de Caisse" active={activeTab === 'REPORT'} onClick={() => setActiveTab('REPORT')} />
        </nav>

        <div className="p-8 border-t border-slate-50">
          <button 
            onClick={() => { if(confirm("Réinitialiser les paramètres ?")) { setBusinessInfo({...businessInfo, isConfigured: false}); setSetupStep(1); } }}
            className="w-full p-4 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest"
          >
            ⚙️ Modifier Infos Entreprise
          </button>
        </div>
      </aside>

      {/* Main viewport */}
      <main className="flex-1 ml-80 p-16 overflow-y-auto">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Bienvenue, Chef.</h2>
                <p className="text-slate-500 font-medium text-lg mt-2">Voici la santé financière de {businessInfo.name} aujourd'hui.</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Statut Système</p>
                <div className="flex items-center gap-2 text-green-500 font-black mt-1">
                   <span className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-200"></span>
                   OPÉRATIONNEL
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <StatCard label="Recettes Totales" value={`${transactions.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} Ar`} icon="💰" color="text-emerald-600" />
              <StatCard label="Postes Actifs" value={sessions.filter(s => s.isActive).length.toString()} icon="⚡" color="text-indigo-600" />
              <StatCard label="Fidélité (Abos)" value={subscriptions.length.toString()} icon="👑" color="text-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-500">
                <h3 className="text-2xl font-black mb-8 text-slate-800 flex items-center gap-4">
                   <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">🕒</span>
                   Flux de Caisse Récent
                </h3>
                <div className="space-y-4">
                  {transactions.slice(0, 8).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-5 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm font-black text-xs text-slate-400">IN</div>
                          <div>
                            <p className="font-black text-slate-800 text-sm group-hover:text-indigo-900 transition-colors">{tx.description}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tx.date}</p>
                          </div>
                       </div>
                       <p className="font-black text-emerald-600 text-lg">+{tx.amount.toLocaleString()} Ar</p>
                    </div>
                  ))}
                  {transactions.length === 0 && <div className="py-20 text-center text-slate-300 italic">Aucune transaction enregistrée.</div>}
                </div>
              </section>

              <section className="space-y-6 flex flex-col">
                 <h3 className="text-2xl font-black text-slate-800 px-2">Accès Rapide aux Zones</h3>
                 <div className="grid grid-cols-2 gap-6 flex-1">
                    <DashboardBox icon="💻" label="Cybercafé" color="indigo" onClick={() => setActiveTab('CYBER')} count={sessions.filter(s => s.isActive && s.type === 'CYBER').length} />
                    <DashboardBox icon="🎮" label="Zone Jeux" color="purple" onClick={() => setActiveTab('GAMES')} count={sessions.filter(s => s.isActive && s.type === 'GAME').length} />
                    <DashboardBox icon="📀" label="Ventes" color="emerald" onClick={() => setActiveTab('ORDERS')} count={orders.length} />
                    <DashboardBox icon="🏦" label="Caisse" color="slate" onClick={() => setActiveTab('REPORT')} count={transactions.length} />
                 </div>
              </section>
            </div>
          </div>
        )}

        {/* CYBER & GAMES TAB */}
        {(activeTab === 'CYBER' || activeTab === 'GAMES') && (
          <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            <header className="flex justify-between items-end">
              <div className="space-y-2">
                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${activeTab === 'CYBER' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}`}>Gestion Temps Réel</span>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{activeTab === 'CYBER' ? 'Zone Internet' : 'Zone Gaming'}</h2>
                <p className="text-slate-500 font-medium text-lg">Lancez et suivez les sessions de vos clients ici.</p>
              </div>
              <SessionForm onAdd={(name, min) => addSession(activeTab === 'CYBER' ? 'CYBER' : 'GAME', name, min)} />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {sessions.filter(s => s.type === (activeTab === 'CYBER' ? 'CYBER' : 'GAME') && !s.isFinished).map(session => (
                <TimerCard 
                  key={session.id} 
                  session={session} 
                  businessInfo={businessInfo} 
                  onFinish={finishSession} 
                />
              ))}
              {sessions.filter(s => s.type === (activeTab === 'CYBER' ? 'CYBER' : 'GAME') && !s.isFinished).length === 0 && (
                <div className="col-span-full py-40 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 gap-6">
                  <span className="text-8xl opacity-20">⏲️</span>
                  <div className="text-center">
                    <p className="font-black text-slate-400 text-xl">Aucun poste occupé actuellement</p>
                    <p className="font-medium mt-2">Utilisez le formulaire en haut à droite pour démarrer une session.</p>
                  </div>
                </div>
              )}
            </div>

            {sessions.filter(s => s.type === (activeTab === 'CYBER' ? 'CYBER' : 'GAME') && s.isFinished).length > 0 && (
              <section className="pt-16 border-t border-slate-200">
                <h3 className="font-black text-slate-400 uppercase tracking-[0.3em] text-xs mb-8 flex items-center gap-4">
                  Sessions Cloturées
                  <div className="h-px flex-1 bg-slate-100" />
                </h3>
                <div className="grid grid-cols-1 gap-4">
                   {sessions.filter(s => s.type === (activeTab === 'CYBER' ? 'CYBER' : 'GAME') && s.isFinished).slice(0, 10).map(s => (
                     <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center group hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-300 text-xs">#END</div>
                           <div>
                              <p className="font-black text-slate-800 text-lg uppercase">{s.clientName}</p>
                              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{s.durationMinutes} minutes de service</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => setShowInvoice(s)} 
                          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                        >
                          Imprimer Reçu 📄
                        </button>
                     </div>
                   ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* SUBSCRIPTIONS TAB */}
        {activeTab === 'SUBS' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">Abonnements</h2>
                <p className="text-slate-500 font-medium text-lg mt-2">Gérez vos clients VIP avec des pass mensuels.</p>
              </div>
              <button 
                onClick={() => {
                  const name = prompt("NOM DU CLIENT ?");
                  if(name) {
                    const priceStr = prompt("PRIX DE L'ABONNEMENT ?", "50000");
                    const price = Number(priceStr);
                    const newSub: Subscription = {
                      id: `SUB-${Date.now()}`,
                      clientName: name,
                      startDate: new Date().toLocaleDateString('fr-FR'),
                      endDate: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('fr-FR'),
                      type: 'PREMIUM',
                      price: price || 50000
                    };
                    setSubscriptions(prev => [...prev, newSub]);
                    addTransaction(`Abonnement Mensuel - ${name}`, newSub.price);
                    setShowInvoice(newSub); // Auto show receipt
                  }
                }}
                className="px-10 py-5 bg-amber-500 text-white font-black rounded-3xl hover:bg-amber-600 shadow-2xl shadow-amber-200 transition flex items-center gap-3 text-lg"
              >
                💎 Nouveau Pass Premium
              </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {subscriptions.map(sub => (
                <div key={sub.id} className="bg-white border-2 border-slate-100 p-10 rounded-[3rem] shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all duration-500">
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-50 rounded-full group-hover:scale-125 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-3xl mb-10 shadow-lg shadow-amber-100 text-white">🏆</div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{sub.clientName}</h3>
                    <p className="text-xs font-black text-amber-500 mb-8 uppercase tracking-[0.3em] italic">Statut: Membre Premium</p>
                    <div className="space-y-4 pt-8 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold text-slate-400 uppercase">Valable jusqu'au</span>
                         <span className="text-sm font-black text-slate-900">{sub.endDate}</span>
                      </div>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">{sub.price.toLocaleString()} <span className="text-sm font-medium">Ar</span></p>
                    </div>
                    <button onClick={() => setShowInvoice(sub)} className="mt-10 w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-black transition shadow-lg shadow-slate-100">Éditer Facture</button>
                  </div>
                </div>
              ))}
              {subscriptions.length === 0 && <div className="col-span-full py-40 border-4 border-dashed border-slate-100 rounded-[3rem] flex items-center justify-center text-slate-300 font-black text-xl">Aucun abonné enregistré.</div>}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-12 animate-in slide-in-from-right-8 duration-700">
            <header>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Vente de Contenus</h2>
              <p className="text-slate-500 font-medium text-lg mt-2">Gestion des téléchargements, films, logiciels et gravures.</p>
            </header>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
               <div className="xl:col-span-2 space-y-10">
                  <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                     <h3 className="text-2xl font-black flex items-center gap-4 text-slate-800">
                        <span className="bg-emerald-500 text-white px-4 py-2 rounded-2xl text-xs font-black">POINT DE VENTE</span>
                        Nouvelle Commande Client
                     </h3>
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client</label>
                           <input id="ord_name" className="w-full px-6 py-4 border-2 border-slate-50 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold" placeholder="Nom complet du client" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie</label>
                           <select id="ord_cat" className="w-full px-6 py-4 border-2 border-slate-50 bg-slate-50 rounded-2xl outline-none font-bold">
                              <option value="FILM">Cinéma (HD / 4K)</option>
                              <option value="MUSIC">Musique (Audio / Vidéo)</option>
                              <option value="GAME">Installation Jeux Vidéo</option>
                              <option value="SOFTWARE">Logiciel & Maintenance</option>
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Désignation</label>
                           <input id="ord_item" className="w-full px-6 py-4 border-2 border-slate-50 bg-slate-50 rounded-2xl outline-none" placeholder="Nom du film ou logiciel" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prix de Vente (Ar)</label>
                           <input id="ord_price" type="number" className="w-full px-6 py-4 border-2 border-slate-50 bg-slate-50 rounded-2xl outline-none font-black text-emerald-700 text-xl" placeholder="0" />
                        </div>
                     </div>
                     <button 
                       onClick={() => {
                         const n = (document.getElementById('ord_name') as HTMLInputElement).value;
                         const i = (document.getElementById('ord_item') as HTMLInputElement).value;
                         const p = Number((document.getElementById('ord_price') as HTMLInputElement).value);
                         const c = (document.getElementById('ord_cat') as HTMLSelectElement).value;
                         if(n && i && p) {
                            const ord: Order = { id: `ORD-${Date.now()}`, clientName: n, item: i, category: c as any, price: p, status: 'COMPLETED' };
                            setOrders(prev => [ord, ...prev]);
                            addTransaction(`Vente ${c}: ${i}`, p);
                            setShowInvoice(ord); // Auto show receipt
                            (document.getElementById('ord_name') as HTMLInputElement).value = '';
                            (document.getElementById('ord_item') as HTMLInputElement).value = '';
                            (document.getElementById('ord_price') as HTMLInputElement).value = '';
                         } else { alert("Veuillez remplir tous les champs !"); }
                       }}
                       className="w-full py-6 bg-emerald-600 text-white font-black rounded-[2rem] hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 uppercase tracking-[0.2em] flex items-center justify-center gap-4 text-lg"
                     >
                       ✅ Valider et Imprimer le Reçu
                     </button>
                  </div>

                  <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
                     <h4 className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] mb-10 flex items-center gap-4">
                        Historique des Commandes
                        <div className="h-px flex-1 bg-slate-50" />
                     </h4>
                     <div className="space-y-5">
                        {orders.map(o => (
                          <div key={o.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-emerald-200 transition-all duration-300 group">
                             <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                   {o.category === 'FILM' && '🍿'}
                                   {o.category === 'MUSIC' && '🎧'}
                                   {o.category === 'GAME' && '🎮'}
                                   {o.category === 'SOFTWARE' && '💿'}
                                </div>
                                <div>
                                   <p className="font-black text-slate-800 text-xl tracking-tight">{o.item}</p>
                                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{o.clientName} • {o.category}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="font-black text-slate-900 text-2xl tracking-tighter">{o.price.toLocaleString()} Ar</p>
                                <button onClick={() => setShowInvoice(o)} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline mt-1">Revoir Reçu</button>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="space-y-10">
                  <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-8 shadow-2xl shadow-slate-200">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Statistiques Ventes</p>
                     <div className="space-y-6">
                        <div className="flex justify-between items-end">
                           <span className="text-sm text-slate-400 font-bold">Total Chiffre d'Affaire</span>
                           <span className="text-4xl font-black">{orders.reduce((a, b) => a + b.price, 0).toLocaleString()} <span className="text-xs font-light">Ar</span></span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 rounded-full" style={{width: '75%'}} />
                        </div>
                     </div>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-8 shadow-sm">
                     <h4 className="font-black text-slate-800 text-xl border-b pb-4">Barème Conseillé</h4>
                     <div className="space-y-4">
                        <PriceItem label="Film HD / 4K" price="1,000 Ar" />
                        <PriceItem label="Saison Série" price="5,000 Ar" />
                        <PriceItem label="Installation Jeu PC" price="10,000 Ar" />
                        <PriceItem label="Logiciel PRO" price="15,000 Ar" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* REPORT / BANK RELEVE TAB */}
        {activeTab === 'REPORT' && (
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
             <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Relevé de Caisse</h2>
                  <p className="text-slate-500 font-medium text-lg mt-2 italic">Document de gestion financière confidentiel.</p>
                </div>
                <button onClick={() => window.print()} className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-2xl flex items-center gap-3">
                   <span className="text-xl">🖨️</span> EXPORTER PDF / IMPRIMER
                </button>
             </header>

             <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-16 text-white relative">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full" />
                   <div className="relative z-10 flex justify-between items-start">
                      <div className="space-y-10">
                         <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 p-1 flex items-center justify-center overflow-hidden backdrop-blur-md shadow-2xl">
                               {businessInfo.logo ? <img src={businessInfo.logo} className="w-full h-full object-cover" alt="Logo" /> : <span className="font-black italic text-2xl">S</span>}
                            </div>
                            <h3 className="text-4xl font-black tracking-tighter uppercase">{businessInfo.name}</h3>
                         </div>
                         <div className="space-y-2">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1">Solde Total de Caisse</p>
                            <p className="text-7xl font-black tracking-tighter">{transactions.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} <span className="text-3xl font-light text-indigo-300">Ar</span></p>
                         </div>
                      </div>
                      <div className="text-right space-y-3 pt-4">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Identification Fiscale</p>
                            <p className="text-sm font-bold text-slate-200 font-mono">NIF: {businessInfo.nif}</p>
                            <p className="text-sm font-bold text-slate-200 font-mono">STAT: {businessInfo.stat}</p>
                         </div>
                         <div className="pt-8 opacity-40">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1">Date d'émission</p>
                            <p className="text-xs font-mono">{new Date().toLocaleString('fr-FR')}</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-16">
                   <table className="w-full">
                      <thead>
                        <tr className="text-left border-b-2 border-slate-50">
                           <th className="pb-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Horodatage</th>
                           <th className="pb-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Nature du Flux / Client</th>
                           <th className="pb-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Crédit (Ar)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {transactions.map(tx => (
                          <tr key={tx.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                             <td className="py-8 text-xs text-slate-500 font-mono font-medium">{tx.date}</td>
                             <td className="py-8">
                                <p className="font-black text-slate-800 text-lg uppercase tracking-tight">{tx.description}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Transaction Autorisée</p>
                             </td>
                             <td className="py-8 text-right">
                                <span className="font-black text-emerald-600 text-2xl tracking-tighter">+{tx.amount.toLocaleString()}</span>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                   {transactions.length === 0 && <div className="py-40 text-center text-slate-200 font-black text-2xl italic">Aucun mouvement de fonds détecté.</div>}
                </div>
             </div>
          </div>
        )}
      </main>

      {/* MODAL SYSTEM (Receipts) */}
      {showInvoice && (
        <InvoiceView 
          businessInfo={businessInfo} 
          data={showInvoice} 
          onClose={() => setShowInvoice(null)} 
        />
      )}
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const SidebarItem: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all duration-300 group ${active ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
  >
    <span className={`text-2xl transition-transform duration-300 ${active ? 'scale-110 rotate-0' : 'group-hover:scale-110 group-hover:-rotate-12'}`}>{icon}</span>
    <span className={`font-black text-sm tracking-tight ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{label}</span>
  </button>
);

const StatCard: React.FC<{ label: string, value: string, icon: string, color: string }> = ({ label, value, icon, color }) => (
  <div className={`p-10 rounded-[3rem] border border-slate-100 bg-white shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-bl-full -z-0 pointer-events-none transition-transform group-hover:scale-110" />
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-10">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</p>
         <span className="text-3xl group-hover:rotate-12 transition-transform">{icon}</span>
      </div>
      <p className={`text-5xl font-black tracking-tighter ${color}`}>{value}</p>
    </div>
  </div>
);

const DashboardBox: React.FC<{ icon: string, label: string, color: string, onClick: () => void, count: number }> = ({ icon, label, color, onClick, count }) => {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700'
  };
  return (
    <button onClick={onClick} className={`p-8 rounded-[2.5rem] border-2 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl flex flex-col items-center justify-center gap-4 group ${colors[color]}`}>
       <div className="relative">
          <span className="text-5xl group-hover:rotate-12 transition-transform inline-block">{icon}</span>
          <span className="absolute -top-2 -right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm border border-current">{count}</span>
       </div>
       <span className="font-black text-lg uppercase tracking-widest">{label}</span>
    </button>
  );
};

const SessionForm: React.FC<{ onAdd: (name: string, minutes: number) => void }> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [min, setMin] = useState(30);

  return (
    <div className="bg-white p-4 pl-10 rounded-[2.5rem] border-2 border-slate-100 shadow-xl flex items-center gap-8 animate-in slide-in-from-right-10 duration-700">
      <div className="flex flex-col min-w-[200px]">
         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nom du Client</label>
         <input 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Entrez le nom..." 
          className="outline-none bg-transparent text-lg font-black text-slate-800 placeholder:text-slate-200"
          onKeyDown={(e) => { if(e.key === 'Enter' && name) { onAdd(name, min); setName(''); } }}
        />
      </div>
      <div className="h-12 w-px bg-slate-100" />
      <div className="flex flex-col">
         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Durée (Min)</label>
         <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={min} 
              onChange={e => setMin(Number(e.target.value))} 
              className="w-16 outline-none font-black text-indigo-600 bg-transparent text-2xl"
            />
         </div>
      </div>
      <button 
        onClick={() => {
          if (name) {
            onAdd(name, min);
            setName('');
          } else { alert("Nom du client requis !"); }
        }}
        className="bg-slate-900 text-white font-black px-12 py-5 rounded-3xl text-sm uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-200 hover:-translate-y-1 active:scale-95"
      >
        Lancer Session 🚀
      </button>
    </div>
  );
};

const PriceItem: React.FC<{ label: string, price: string }> = ({ label, price }) => (
  <div className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition cursor-default group">
     <span className="text-sm font-black text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{label}</span>
     <span className="text-base font-black text-slate-900 bg-slate-100 px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">{price}</span>
  </div>
);

export default App;
