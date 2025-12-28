
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Session, BusinessInfo } from '../types';

interface TimerCardProps {
  session: Session;
  onFinish: (id: string) => void;
  businessInfo: BusinessInfo;
}

const TimerCard: React.FC<TimerCardProps> = ({ session, onFinish, businessInfo }) => {
  // Calculer le temps restant initial basé sur l'heure de début réelle
  const calculateRemainingTime = useCallback(() => {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - session.startTime) / 1000);
    const totalSeconds = session.durationMinutes * 60;
    const remaining = totalSeconds - elapsedSeconds;
    return Math.max(0, remaining);
  }, [session.startTime, session.durationMinutes]);

  const [timeLeft, setTimeLeft] = useState(calculateRemainingTime());
  const [alarmPlayed, setAlarmPlayed] = useState(false);
  const timerRef = useRef<number | null>(null);

  const playAlarm = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };
      
      playBeep(880, 0, 0.2);
      playBeep(880, 0.4, 0.2);
      playBeep(1320, 0.8, 0.5);
    } catch (e) {
      console.warn("Audio Context error", e);
    }
  }, []);

  useEffect(() => {
    if (!session.isActive) return;

    // Mettre à jour immédiatement au montage pour éviter le saut visuel
    const initialRemaining = calculateRemainingTime();
    setTimeLeft(initialRemaining);

    if (initialRemaining <= 0) {
      if (!alarmPlayed) {
        playAlarm();
        setAlarmPlayed(true);
        onFinish(session.id);
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      const remaining = calculateRemainingTime();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerRef.current !== null) window.clearInterval(timerRef.current);
        if (!alarmPlayed) {
          playAlarm();
          setAlarmPlayed(true);
          onFinish(session.id);
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [session.isActive, calculateRemainingTime, onFinish, session.id, alarmPlayed, playAlarm]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = session.durationMinutes * 60;
  const progress = (timeLeft / totalSeconds) * 100;

  const totalCost = session.durationMinutes * (session.type === 'CYBER' ? businessInfo.cyberPricePerMin : businessInfo.gamePricePerMin);

  return (
    <div className={`p-10 rounded-[3rem] shadow-xl border-2 transition-all duration-500 overflow-hidden relative group ${timeLeft === 0 ? 'bg-red-50 border-red-300' : 'bg-white border-slate-100 hover:shadow-2xl'}`}>
      {timeLeft === 0 && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
      )}
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{session.type === 'CYBER' ? 'Poste Internet' : 'Console / PC Jeu'}</p>
          <h3 className="font-black text-3xl text-slate-900 tracking-tighter uppercase truncate max-w-[150px]">{session.clientName}</h3>
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest inline-block mb-2 ${session.type === 'CYBER' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
            {session.type}
          </span>
          <p className="text-2xl font-black text-slate-900 tracking-tighter">
            {totalCost.toLocaleString()} <span className="text-xs font-normal">Ar</span>
          </p>
        </div>
      </div>

      <div className="relative pt-2 pb-6 z-10">
        <div className="flex mb-6 items-center justify-between">
          <div>
            <span className={`text-[10px] font-black inline-block py-2 px-4 uppercase rounded-full tracking-widest ${timeLeft === 0 ? 'bg-red-200 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {timeLeft === 0 ? '⏳ Temps Épuisé' : '⚡ Session Active'}
            </span>
          </div>
          <div className="text-right">
            <span className={`text-5xl font-mono font-black tracking-tighter ${timeLeft < 60 && timeLeft > 0 ? 'text-orange-500' : timeLeft === 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {String(minutes).padStart(2, '0')}<span className="animate-pulse">:</span>{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
        
        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-slate-100 shadow-inner">
          <div
            style={{ width: `${progress}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${timeLeft < 60 ? 'bg-red-500' : 'bg-indigo-600'}`}
          />
        </div>
        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
           <span>00:00</span>
           <span>Fin prévue à {new Date(session.startTime + session.durationMinutes * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
      
      {timeLeft === 0 && (
        <div className="mt-4 p-5 bg-red-600 rounded-2xl flex items-center justify-center gap-4 text-white animate-bounce relative z-10 shadow-lg shadow-red-200">
          <span className="text-2xl">🚨</span>
          <span className="font-black uppercase tracking-widest text-sm">Fin de session !</span>
        </div>
      )}
    </div>
  );
};

export default TimerCard;
