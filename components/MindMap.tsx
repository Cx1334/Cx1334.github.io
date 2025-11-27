import React, { useMemo, useState } from 'react';
import { Note } from '../types';
import { BrainCircuit, FileText, Tag } from 'lucide-react';

interface MindMapProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
}

const MindMap: React.FC<MindMapProps> = ({ notes, onNoteClick }) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 1. Cluster notes by tags
  const clusters = useMemo(() => {
    const map: Record<string, Note[]> = {};
    notes.forEach(note => {
      const primaryTag = note.tags && note.tags.length > 0 ? note.tags[0] : 'Uncategorized';
      if (!map[primaryTag]) map[primaryTag] = [];
      map[primaryTag].push(note);
    });
    return map;
  }, [notes]);

  const tags = Object.keys(clusters);
  
  // Layout Configuration
  const centerX = 400;
  const centerY = 300;
  const radius = 160; 

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-6 overflow-hidden">
      
      {/* Left: Graph Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden min-h-[400px] group">
        <div className="absolute top-4 left-4 z-10 bg-slate-100 dark:bg-slate-800/80 backdrop-blur px-3 py-1 rounded-full text-xs text-slate-500 font-mono">
           知识图谱 (MindMap)
        </div>

        <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0 }} />
            </radialGradient>
          </defs>

          {/* Center Node */}
          <g onClick={() => setSelectedTag(null)} className="cursor-pointer hover:scale-110 transition-transform origin-center">
             <circle cx={centerX} cy={centerY} r={60} fill="url(#glow)" />
             <circle cx={centerX} cy={centerY} r={40} className="fill-brand-600 shadow-lg" />
             <foreignObject x={centerX - 12} y={centerY - 12} width={24} height={24} style={{ pointerEvents: 'none' }}>
                <BrainCircuit className="text-white w-6 h-6" />
             </foreignObject>
             <text x={centerX} y={centerY + 55} textAnchor="middle" className="fill-slate-400 text-xs font-mono tracking-widest">SECOND BRAIN</text>
          </g>

          {/* Tag Nodes & Lines */}
          {tags.map((tag, i) => {
            const angle = (i / tags.length) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const count = clusters[tag].length;
            const isActive = selectedTag === tag;

            // Quadratic Bezier Curve for smoother lines
            const midX = (centerX + x) / 2;
            const midY = (centerY + y) / 2;

            return (
              <g key={tag}>
                {/* Line */}
                <path 
                  d={`M ${centerX} ${centerY} Q ${midX} ${midY} ${x} ${y}`}
                  fill="none"
                  stroke={isActive ? '#6366f1' : '#cbd5e1'} 
                  strokeWidth={isActive ? 2 : 1}
                  className="transition-all duration-500 dark:stroke-slate-700"
                  strokeDasharray={isActive ? "0" : "4 2"}
                />

                {/* Node Group */}
                <g 
                  onClick={() => setSelectedTag(isActive ? null : tag)}
                  className="cursor-pointer transition-all hover:opacity-80"
                >
                  <circle 
                    cx={x} cy={y} r={Math.max(24, 18 + count * 3)} 
                    fill={isActive ? '#4f46e5' : '#f1f5f9'} 
                    className="transition-colors duration-300 dark:fill-slate-800"
                    stroke={isActive ? '#fff' : '#94a3b8'}
                    strokeWidth={isActive ? 3 : 1}
                  />
                  <text 
                    x={x} y={y} dy={4} 
                    textAnchor="middle" 
                    fill={isActive ? '#fff' : '#475569'}
                    className="text-xs font-bold pointer-events-none select-none dark:fill-slate-300"
                    fontSize="11"
                  >
                    {tag.slice(0, 8)}
                  </text>
                  <text 
                    x={x} y={y + 28} 
                    textAnchor="middle" 
                    fill={isActive ? '#6366f1' : '#94a3b8'}
                    fontSize="9"
                    className="font-mono"
                  >
                    {count} notes
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right: Detail List Area */}
      <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col h-[400px] md:h-auto shrink-0">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3">
          {selectedTag ? (
            <>
              <Tag size={16} className="text-brand-500" />
              {selectedTag}
            </>
          ) : (
            '最新笔记'
          )}
        </h3>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
          {(selectedTag ? clusters[selectedTag] : notes).map(note => (
            <div 
              key={note.id}
              onClick={() => onNoteClick(note)}
              className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md cursor-pointer transition-all group"
            >
              <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm mb-2 group-hover:text-brand-600 transition-colors truncate">
                {note.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-slate-400">
                 <div className="flex items-center gap-1.5">
                   <FileText size={12} />
                   <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                 </div>
                 {note.tags && note.tags.length > 0 && !selectedTag && (
                   <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-[10px] text-slate-500">
                     {note.tags[0]}
                   </span>
                 )}
              </div>
            </div>
          ))}
          {notes.length === 0 && (
             <div className="text-center text-slate-400 text-sm mt-10 flex flex-col items-center gap-2">
               <BrainCircuit size={32} className="opacity-20"/>
               <span>大脑空空如也</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindMap;