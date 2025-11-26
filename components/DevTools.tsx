import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Timer, Hash, Binary, Play, Pause, RotateCcw, Laptop2 } from 'lucide-react';

const DevTools: React.FC = () => {
  // --- Converter State ---
  const [dec, setDec] = useState('');
  const [hex, setHex] = useState('');
  const [bin, setBin] = useState('');

  // --- Timer State ---
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const timerRef = useRef<number | null>(null);

  // --- Converter Logic ---
  const handleDecChange = (val: string) => {
    setDec(val);
    if (!val) { setHex(''); setBin(''); return; }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setHex(num.toString(16).toUpperCase());
      setBin(num.toString(2));
    }
  };

  const handleHexChange = (val: string) => {
    setHex(val);
    if (!val) { setDec(''); setBin(''); return; }
    const num = parseInt(val, 16);
    if (!isNaN(num)) {
      setDec(num.toString(10));
      setBin(num.toString(2));
    }
  };

  const handleBinChange = (val: string) => {
    setBin(val);
    if (!val) { setDec(''); setHex(''); return; }
    const num = parseInt(val, 2);
    if (!isNaN(num)) {
      setDec(num.toString(10));
      setHex(num.toString(16).toUpperCase());
    }
  };

  // --- Timer Logic ---
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // Could add notification sound here
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Laptop2 className="text-brand-500" /> 开发者工具箱
        </h2>
        <p className="text-slate-500 dark:text-slate-400">常用的嵌入式开发辅助小工具</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Base Converter Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Calculator size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">进制转换器</h3>
              <p className="text-xs text-slate-500">Hex / Decimal / Binary 实时互转</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* DEC */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                <Hash size={14} /> Decimal (十进制)
              </label>
              <input
                type="number"
                value={dec}
                onChange={(e) => handleDecChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                placeholder="1024"
              />
            </div>

            {/* HEX */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                <span className="font-mono text-xs border border-slate-300 dark:border-slate-600 rounded px-1">0x</span> Hex (十六进制)
              </label>
              <input
                type="text"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none font-mono uppercase"
                placeholder="400"
              />
            </div>

            {/* BIN */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                <Binary size={14} /> Binary (二进制)
              </label>
              <input
                type="text"
                value={bin}
                onChange={(e) => handleBinChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                placeholder="10000000000"
              />
            </div>
          </div>
        </div>

        {/* 2. Focus Timer Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600 dark:text-rose-400">
              <Timer size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">专注番茄钟</h3>
              <p className="text-xs text-slate-500">保持心流，高效开发</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4">
             {/* Mode Switcher */}
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-8">
               <button 
                 onClick={() => switchMode('work')}
                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'work' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
               >
                 工作 (25m)
               </button>
               <button 
                 onClick={() => switchMode('break')}
                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'break' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
               >
                 休息 (5m)
               </button>
             </div>

             {/* Time Display */}
             <div className="text-7xl font-mono font-bold text-slate-800 dark:text-white mb-8 tracking-wider">
               {formatTime(timeLeft)}
             </div>

             {/* Controls */}
             <div className="flex gap-4">
               <button 
                 onClick={toggleTimer}
                 className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                   isActive 
                     ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
                     : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'
                 }`}
               >
                 {isActive ? <><Pause size={20} fill="currentColor" /> 暂停</> : <><Play size={20} fill="currentColor" /> 开始</>}
               </button>
               
               <button 
                 onClick={resetTimer}
                 className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                 title="重置"
               >
                 <RotateCcw size={20} />
               </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DevTools;