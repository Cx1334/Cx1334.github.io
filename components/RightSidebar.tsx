import React from 'react';
import { Activity, Lightbulb, AlertTriangle, ShieldCheck, HardDrive } from 'lucide-react';

interface RightSidebarProps {
  viewMode: string;
  stats: {
    projectCount: number;
    snippetCount: number;
    noteCount: number;
    bookmarkCount: number;
    materialCount: number;
    planCount: number;
  };
}

const RightSidebar: React.FC<RightSidebarProps> = ({ viewMode, stats }) => {
  
  const usedStorage = 14.2; 
  const totalStorage = 50; 

  const renderContent = () => {
    // ... (Content rendering logic remains mostly same, just removed QuoteWidget from return)
    switch (viewMode) {
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 text-sm">
                <Activity size={16} className="text-brand-500" /> 风险监控
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-orange-500 shrink-0 mt-0.5" />
                  <span>"智能温湿度..." 进度滞后</span>
                </li>
              </ul>
            </div>
          </div>
        );
      
      // ... (Keep other cases)

      default:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 text-sm">
                <HardDrive size={16} className="text-brand-500" /> 离线存储
              </h3>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>已用: {usedStorage} MB</span>
                <span>配额: {totalStorage} MB</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                <div className="bg-brand-500 h-full" style={{ width: '28%' }} />
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck size={10} /> 本地安全存储模式
              </p>
            </div>
            {/* Stats ... */}
          </div>
        );
    }
  };

  return (
    <div className="w-64 border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 h-screen overflow-y-auto custom-scrollbar p-4 hidden lg:flex flex-col gap-6">
      {renderContent()}
    </div>
  );
};

export default RightSidebar;