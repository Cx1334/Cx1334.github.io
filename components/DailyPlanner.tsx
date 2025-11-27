import React, { useState, useEffect } from 'react';
import { DailyPlan, ScheduleBlock, TodoItem } from '../types';
import { Calendar, CheckSquare, Edit3, Sparkles, Loader2, Plus, Trash2, Smile, Frown, Meh, Battery, Clock, GripVertical } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DailyPlannerProps {
  plans: DailyPlan[];
  onUpdatePlans: (plans: DailyPlan[]) => void;
}

const DailyPlanner: React.FC<DailyPlannerProps> = ({ plans, onUpdatePlans }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPlan, setCurrentPlan] = useState<DailyPlan | null>(null);
  const [newTodo, setNewTodo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Schedule Form
  const [schedTitle, setSchedTitle] = useState('');
  const [schedStart, setSchedStart] = useState('09:00');
  const [schedEnd, setSchedEnd] = useState('10:00');
  const [schedType, setSchedType] = useState<ScheduleBlock['type']>('task');

  useEffect(() => {
    const found = plans.find(p => p.date === selectedDate);
    if (found) {
      setCurrentPlan(found);
    } else {
      const emptyPlan: DailyPlan = {
        date: selectedDate,
        schedule: [],
        todos: [],
        summary: '',
        mood: 'neutral'
      };
      setCurrentPlan(emptyPlan);
    }
  }, [selectedDate, plans]);

  const savePlan = (plan: DailyPlan) => {
    const otherPlans = plans.filter(p => p.date !== plan.date);
    onUpdatePlans([...otherPlans, plan]);
    setCurrentPlan(plan);
  };

  // --- Todo Logic ---
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !currentPlan) return;
    const updatedPlan = {
      ...currentPlan,
      todos: [...currentPlan.todos, { id: Date.now().toString(), text: newTodo, completed: false }]
    };
    savePlan(updatedPlan);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    if (!currentPlan) return;
    const updatedPlan = {
      ...currentPlan,
      todos: currentPlan.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    };
    savePlan(updatedPlan);
  };

  const deleteTodo = (id: string) => {
    if (!currentPlan) return;
    savePlan({ ...currentPlan, todos: currentPlan.todos.filter(t => t.id !== id) });
  };

  // --- Schedule Logic ---
  const addScheduleBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan || !schedTitle) return;
    const newBlock: ScheduleBlock = {
      id: 'sb' + Date.now(),
      title: schedTitle,
      startTime: schedStart,
      endTime: schedEnd,
      type: schedType,
      completed: false
    };
    // Simple sort by start time
    const newSchedule = [...(currentPlan.schedule || []), newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    savePlan({ ...currentPlan, schedule: newSchedule });
    setSchedTitle('');
  };

  const deleteScheduleBlock = (id: string) => {
    if (!currentPlan) return;
    savePlan({ ...currentPlan, schedule: (currentPlan.schedule || []).filter(s => s.id !== id) });
  };

  // --- Summary Logic ---
  const updateSummary = (text: string) => {
    if (!currentPlan) return;
    savePlan({ ...currentPlan, summary: text });
  };

  const setMood = (mood: DailyPlan['mood']) => {
    if (!currentPlan) return;
    savePlan({ ...currentPlan, mood });
  };

  const generateSummary = async () => {
    if (!process.env.API_KEY || !currentPlan) return;
    
    const doneTodos = currentPlan.todos.filter(t => t.completed).map(t => t.text);
    const scheduleItems = (currentPlan.schedule || []).map(s => `${s.startTime}-${s.endTime}: ${s.title}`);
    
    setIsGenerating(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Based on today's schedule and tasks, write a concise daily summary (Chinese).
      Schedule: ${scheduleItems.join(', ')}
      Completed Tasks: ${doneTodos.join(', ')}
      Tone: Professional yet personal. Max 80 words.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      const text = response.text || "";
      updateSummary(text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const getBlockColor = (type: string) => {
    switch(type) {
      case 'meeting': return 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300';
      case 'deep_work': return 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300';
      case 'break': return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300';
      default: return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Header Bar */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-4">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500"
          />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white hidden md:block">
            {new Date(selectedDate).toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
        </div>
        <div className="flex gap-2">
          {['happy', 'neutral', 'stress'].map((m) => (
            <button 
              key={m}
              onClick={() => setMood(m as any)}
              className={`p-2 rounded-full transition-all ${currentPlan?.mood === m ? 'bg-brand-100 text-brand-600 scale-110' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {m === 'happy' && <Smile size={18} />}
              {m === 'neutral' && <Meh size={18} />}
              {m === 'stress' && <Battery size={18} />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left: Backlog & Todo */}
        <div className="w-full lg:w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900/50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <CheckSquare size={18} className="text-brand-500" /> 待办清单 (Backlog)
            </h3>
            <form onSubmit={addTodo} className="flex gap-2">
              <input 
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="添加任务..."
              />
              <button type="submit" disabled={!newTodo.trim()} className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50">
                <Plus size={18} />
              </button>
            </form>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {currentPlan?.todos.map(todo => (
              <div key={todo.id} className="group flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    todo.completed ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {todo.completed && <Plus size={10} className="rotate-45" />}
                </button>
                <span className={`flex-1 text-sm ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                  {todo.text}
                </span>
                <GripVertical size={14} className="text-slate-300 cursor-move opacity-0 group-hover:opacity-100" />
                <button onClick={() => deleteTodo(todo.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {currentPlan?.todos.length === 0 && <p className="text-center text-slate-400 text-xs mt-4">暂无待办任务</p>}
          </div>

          {/* Summary Box */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-sm text-slate-600 dark:text-slate-400">每日总结</h4>
              <button onClick={generateSummary} disabled={isGenerating} className="text-xs text-purple-600 hover:text-purple-500 flex items-center gap-1">
                {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI 生成
              </button>
            </div>
            <textarea 
              value={currentPlan?.summary || ''}
              onChange={(e) => updateSummary(e.target.value)}
              className="w-full h-24 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none outline-none focus:border-purple-500"
              placeholder="记录今天的收获..."
            />
          </div>
        </div>

        {/* Right: Timeline Schedule */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Clock size={18} className="text-brand-500" /> 时间轴 (Timeline)
            </h3>
            
            {/* Quick Add Schedule Form */}
            <form onSubmit={addScheduleBlock} className="flex gap-2 items-center">
              <input 
                value={schedStart} onChange={e => setSchedStart(e.target.value)} type="time" 
                className="bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-xs outline-none"
              />
              <span className="text-slate-400">-</span>
              <input 
                value={schedEnd} onChange={e => setSchedEnd(e.target.value)} type="time" 
                className="bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-xs outline-none"
              />
              <input 
                value={schedTitle} onChange={e => setSchedTitle(e.target.value)}
                placeholder="事项内容..."
                className="w-32 lg:w-48 px-2 py-1 bg-slate-100 dark:bg-slate-800 border-none rounded text-xs outline-none"
              />
              <select 
                value={schedType} onChange={e => setSchedType(e.target.value as any)}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border-none rounded text-xs outline-none"
              >
                <option value="task">任务</option>
                <option value="deep_work">深度</option>
                <option value="meeting">会议</option>
                <option value="break">休息</option>
              </select>
              <button type="submit" disabled={!schedTitle} className="p-1 bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-50">
                <Plus size={14} />
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
            {/* Time Grid Background */}
            <div className="absolute left-16 top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800 z-0"></div>
            
            <div className="space-y-4 relative z-10">
              {(currentPlan?.schedule || []).map(block => (
                <div key={block.id} className="flex gap-4 group">
                  <div className="w-12 text-right text-xs text-slate-400 font-mono pt-1 shrink-0">
                    {block.startTime}
                  </div>
                  <div className={`flex-1 p-3 rounded-lg border ${getBlockColor(block.type)} relative transition-all hover:shadow-md`}>
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{block.title}</span>
                      <button onClick={() => deleteScheduleBlock(block.id)} className="opacity-0 group-hover:opacity-100 text-current hover:scale-110 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="text-xs opacity-70 mt-1 flex items-center gap-2">
                      <span>{block.startTime} - {block.endTime}</span>
                      <span className="uppercase tracking-wider text-[10px] border border-current px-1 rounded opacity-60">{block.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(currentPlan?.schedule || []).length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Clock size={32} className="opacity-20 mb-2" />
                  <p className="text-sm">时间轴空空如也，规划一下你的时间吧</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DailyPlanner;