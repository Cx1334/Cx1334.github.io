import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Timer, Hash, Binary, Play, Pause, RotateCcw, Laptop, Type, Code, History, CheckCircle2, XCircle, Trash2, Quote } from 'lucide-react';
import { PomodoroSession } from '../types';
import { QUOTES } from '../constants';

const DevTools: React.FC = () => {
  // --- Tab State ---
  const [activeTab, setActiveTab] = useState<'base' | 'ascii'>('base');

  // --- Base Converter State ---
  const [dec, setDec] = useState('');
  const [hex, setHex] = useState('');
  const [bin, setBin] = useState('');

  // --- ASCII Converter State ---
  const [asciiText, setAsciiText] = useState('');
  const [asciiHex, setAsciiHex] = useState('');

  // --- Timer State ---
  const DEFAULT_WORK_TIME = 25;
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORK_TIME * 60); 
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [taskName, setTaskName] = useState('');
  const [sessions, setSessions] = useState<PomodoroSession[]>(() => {
    const saved = localStorage.getItem('embedlink-pomodoro-history');
    return saved ? JSON.parse(saved) : [];
  });
  
  // --- Quote State ---
  const [quote, setQuote] = useState(QUOTES[0]);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('embedlink-pomodoro-history', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    // Random quote on mount
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIndex]);
  }, []);

  // --- Base Converter Logic ---
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

  // --- ASCII Converter Logic ---
  const handleAsciiTextChange = (text: string) => {
    setAsciiText(text);
    const hexResult = text.split('')
      .map(char => char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');
    setAsciiHex(hexResult);
  };

  const handleAsciiHexChange = (hexStr: string) => {
    setAsciiHex(hexStr);
    // Remove spaces and try to parse
    const cleanHex = hexStr.replace(/\s+/g, '');
    if (cleanHex.length % 2 !== 0) return; // Wait for complete bytes

    try {
      let str = '';
      for (let i = 0; i < cleanHex.length; i += 2) {
        const code = parseInt(cleanHex.substr(i, 2), 16);
        if (!isNaN(code)) str += String.fromCharCode(code);
      }
      setAsciiText(str);
    } catch (e) {
      // Ignore incomplete parsing
    }
  };

  // --- Timer Logic ---
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      completeSession();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const startTimer = () => {
    if (!isActive) {
      startTimeRef.current = Date.now();
      setIsActive(true);
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const completeSession = () => {
    setIsActive(false);
    if (mode === 'work') {
      const newSession: PomodoroSession = {
        id: Date.now().toString(),
        taskName: taskName || '未命名任务',
        startTime: startTimeRef.current || Date.now(),
        duration: DEFAULT_WORK_TIME,
        status: 'completed'
      };
      setSessions([newSession, ...sessions]);
      alert("专注时间结束！休息一下吧。");
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? DEFAULT_WORK_TIME * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'work' ? DEFAULT_WORK_TIME * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const clearHistory = () => {
    if(confirm("确定清空所有专注记录吗？")) {
      setSessions([]);
    }
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto custom-scrollbar space-y-8">
      <div className="animate-in slide-in-from-top-4 duration-500">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Laptop className="text-brand-500" /> 开发者工具箱
        </h2>
        <p className="text-slate-500 dark:text-slate-400">嵌入式开发必备辅助与效率工具</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- 1. Multi-Function Converter --- */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-700">
          {/* Header & Tabs */}
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="p-4 pb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Calculator size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">数据转换器</h3>
                  <p className="text-xs text-slate-500">常用数据格式实时互转</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <button 
                  onClick={() => setActiveTab('base')}
                  className={`pb-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'base' ? 'text-brand-600 border-brand-500' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                >
                  数值进制 (Base)
                </button>
                <button 
                  onClick={() => setActiveTab('ascii')}
                  className={`pb-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'ascii' ? 'text-brand-600 border-brand-500' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                >
                  字符编码 (ASCII)
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 flex-1">
            {activeTab === 'base' ? (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* DEC */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 group-focus-within:text-brand-500 transition-colors">
                    <Hash size={14} /> Decimal (十进制)
                  </label>
                  <input
                    type="number"
                    value={dec}
                    onChange={(e) => handleDecChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none font-mono transition-all"
                    placeholder="1024"
                  />
                </div>

                {/* HEX */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 group-focus-within:text-brand-500 transition-colors">
                    <span className="font-mono text-xs border border-slate-300 dark:border-slate-600 rounded px-1">0x</span> Hex (十六进制)
                  </label>
                  <input
                    type="text"
                    value={hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none font-mono uppercase transition-all"
                    placeholder="400"
                  />
                </div>

                {/* BIN */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 group-focus-within:text-brand-500 transition-colors">
                    <Binary size={14} /> Binary (二进制)
                  </label>
                  <input
                    type="text"
                    value={bin}
                    onChange={(e) => handleBinChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none font-mono transition-all"
                    placeholder="10000000000"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Text */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 group-focus-within:text-brand-500 transition-colors">
                    <Type size={14} /> ASCII 文本
                  </label>
                  <textarea
                    rows={3}
                    value={asciiText}
                    onChange={(e) => handleAsciiTextChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm resize-none transition-all"
                    placeholder="Hello World"
                  />
                </div>

                {/* Hex View */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 group-focus-within:text-brand-500 transition-colors">
                    <Code size={14} /> Hex Values (空格分隔)
                  </label>
                  <textarea
                    rows={3}
                    value={asciiHex}
                    onChange={(e) => handleAsciiHexChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm resize-none uppercase transition-all"
                    placeholder="48 65 6C 6C 6F 20 57 6F 72 6C 64"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- 2. Task-Based Pomodoro --- */}
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
          
          {/* Timer Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-100 to-transparent dark:from-rose-900/20 rounded-bl-full transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600 dark:text-rose-400">
                <Timer size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">专注番茄钟</h3>
                <p className="text-xs text-slate-500">Task-Based Focus Timer</p>
              </div>
            </div>

            <div className="flex flex-col items-center relative z-10">
               {/* Task Input */}
               <div className="w-full mb-6">
                 <input 
                   type="text"
                   value={taskName}
                   onChange={(e) => setTaskName(e.target.value)}
                   placeholder="正在专注什么任务？(例如：I2C调试)"
                   disabled={isActive}
                   className="w-full text-center bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:border-rose-500 outline-none transition-all disabled:opacity-70"
                 />
               </div>

               {/* Time Display */}
               <div className={`text-7xl font-mono font-bold mb-8 tracking-wider transition-colors duration-300 ${isActive ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>
                 {formatTime(timeLeft)}
               </div>

               {/* Controls */}
               <div className="flex items-center gap-4 w-full">
                 <button 
                   onClick={isActive ? pauseTimer : startTimer}
                   className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                     isActive 
                       ? 'bg-slate-700 hover:bg-slate-600' 
                       : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
                   }`}
                 >
                   {isActive ? <><Pause size={20} fill="currentColor" /> 暂停</> : <><Play size={20} fill="currentColor" /> 开始专注</>}
                 </button>
                 
                 <button 
                   onClick={resetTimer}
                   className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                   title="重置"
                 >
                   <RotateCcw size={20} />
                 </button>
               </div>

               {/* Mode Switcher */}
               <div className="flex gap-4 mt-6 text-sm font-medium">
                 <button onClick={() => switchMode('work')} className={`px-3 py-1 rounded-full transition-colors ${mode === 'work' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'text-slate-400 hover:text-slate-600'}`}>工作模式</button>
                 <button onClick={() => switchMode('break')} className={`px-3 py-1 rounded-full transition-colors ${mode === 'break' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'text-slate-400 hover:text-slate-600'}`}>休息模式</button>
               </div>
            </div>
          </div>

          {/* Task History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 overflow-hidden flex flex-col min-h-[300px]">
             <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
               <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                 <History size={16} /> 专注记录
               </h4>
               {sessions.length > 0 && (
                 <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                   <Trash2 size={12} /> 清空
                 </button>
               )}
             </div>
             
             <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
               {sessions.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-50 min-h-[200px]">
                   <CheckCircle2 size={32} />
                   <p className="text-xs">完成一次专注后，记录将显示在这里</p>
                 </div>
               ) : (
                 <div className="space-y-2">
                   {sessions.map(session => (
                     <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 animate-in slide-in-from-left-2 fade-in duration-300">
                        <div className="flex items-center gap-3">
                          {session.status === 'completed' ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : (
                            <XCircle size={16} className="text-orange-400" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{session.taskName}</div>
                            <div className="text-xs text-slate-400">{new Date(session.startTime).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="text-sm font-mono font-bold text-slate-600 dark:text-slate-400">
                          {session.duration}m
                        </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>

        </div>
      </div>

      {/* Daily Quote Section (Moved from Sidebar) */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-start gap-4">
          <Quote size={24} className="opacity-30 shrink-0 fill-current" />
          <div>
            <p className="text-lg font-medium italic leading-relaxed mb-2">
              "{quote.content}"
            </p>
            <div className="text-sm opacity-70 flex items-center gap-2">
              <span className="w-4 h-px bg-white/50"></span>
              {quote.author}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevTools;