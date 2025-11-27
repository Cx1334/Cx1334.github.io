import React, { useState } from 'react';
import { Calculator, Clock, Activity, Cpu } from 'lucide-react';

const EmbeddedCalc: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'baud' | 'timer'>('baud');

  // Baud Rate State
  const [pclk, setPclk] = useState('72'); // MHz
  const [targetBaud, setTargetBaud] = useState('115200');
  const [baudResult, setBaudResult] = useState<{div: string, error: string} | null>(null);

  // Timer State
  const [timerFreq, setTimerFreq] = useState('72'); // MHz
  const [prescaler, setPrescaler] = useState('71'); // 0-based usually, here we input N (divide by N+1)
  const [period, setPeriod] = useState('999'); // ARR
  const [timerResult, setTimerResult] = useState<{freq: string, time: string} | null>(null);

  const calculateBaud = () => {
    const f = parseFloat(pclk) * 1000000;
    const b = parseFloat(targetBaud);
    if (!f || !b) return;

    // Standard USARTDIV formula (simplified for illustration, assumes oversampling 16)
    // USARTDIV = f_PCLK / (16 * Baud)
    const div = f / (16 * b);
    const mantissa = Math.floor(div);
    const fraction = Math.round((div - mantissa) * 16);
    const actualBaud = f / (16 * (mantissa + fraction / 16));
    const error = ((actualBaud - b) / b) * 100;

    setBaudResult({
      div: div.toFixed(4),
      error: error.toFixed(2) + '%'
    });
  };

  const calculateTimer = () => {
    const f = parseFloat(timerFreq) * 1000000;
    const psc = parseFloat(prescaler) + 1;
    const arr = parseFloat(period) + 1;
    
    if (!f || !psc || !arr) return;

    const updateFreq = f / (psc * arr);
    const updateTime = 1 / updateFreq;

    setTimerResult({
      freq: updateFreq < 1000 ? `${updateFreq.toFixed(2)} Hz` : `${(updateFreq/1000).toFixed(2)} KHz`,
      time: updateTime < 0.001 ? `${(updateTime*1000000).toFixed(2)} us` : `${(updateTime*1000).toFixed(2)} ms`
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      
      {/* Baud Rate Calculator */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
            <Activity size={24} />
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">波特率计算器</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">PCLK 频率 (MHz)</label>
            <input 
              type="number" value={pclk} onChange={e => setPclk(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">目标波特率</label>
            <select 
              value={targetBaud} onChange={e => setTargetBaud(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="9600">9600</option>
              <option value="115200">115200</option>
              <option value="256000">256000</option>
              <option value="921600">921600</option>
            </select>
          </div>
          <button 
            onClick={calculateBaud}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            计算
          </button>

          {baudResult && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 text-sm">USARTDIV:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{baudResult.div}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">误差率:</span>
                <span className={`font-mono font-bold ${parseFloat(baudResult.error) > 2 ? 'text-red-500' : 'text-green-500'}`}>
                  {baudResult.error}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timer Calculator */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
            <Clock size={24} />
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">定时器溢出计算</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Timer Clock (MHz)</label>
            <input 
              type="number" value={timerFreq} onChange={e => setTimerFreq(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Prescaler (PSC)</label>
              <input 
                type="number" value={prescaler} onChange={e => setPrescaler(e.target.value)}
                placeholder="e.g. 71"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Period (ARR)</label>
              <input 
                type="number" value={period} onChange={e => setPeriod(e.target.value)}
                placeholder="e.g. 999"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <button 
            onClick={calculateTimer}
            className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            计算溢出时间
          </button>

          {timerResult && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 text-sm">溢出频率:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{timerResult.freq}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">溢出周期:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {timerResult.time}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default EmbeddedCalc;