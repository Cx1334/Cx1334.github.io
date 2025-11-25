import React, { useMemo, useState } from 'react';
import { Note } from '../types';
import { BrainCircuit, FileText } from 'lucide-react';

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
  
  // Basic Layout Configuration
  const centerX = 400;
  const centerY = 300;
  const radius = 180; // Distance of tags from center

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4 overflow-hidden">
      
      {/* Left: Interactive Graph Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-inner border border-slate-200 dark:border-slate-800 relative overflow-hidden min-h-[400px]">
        <div className="absolute top-4 left-4 z-10 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs text-slate-500 font-mono">
           知识图谱 (Auto-Generated)
        </div>

        <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
          {/* Defs for gradients */}
          <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0 }} />
            </radialGradient>
          </defs>

          {/* Connection Lines */}
          {tags.map((tag, i) => {
            const angle = (i / tags.length) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const isActive = selectedTag === tag;

            return (
              <g key={`line-${tag}`}>
                <line 
                  x1={centerX} y1={centerY} 
                  x2={x} y2={y} 
                  stroke={isActive ? '#6366f1' : '#cbd5e1'} 
                  strokeWidth={isActive ? 2 : 1}
                  className="transition-all duration-300 dark:stroke-slate-700"
                />
              </g>
            );
          })}

          {/* Tag Nodes */}
          {tags.map((tag, i) => {
            const angle = (i / tags.length) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const count = clusters[tag].length;
            const isActive = selectedTag === tag;

            return (
              <g 
                key={tag} 
                onClick={() => setSelectedTag(isActive ? null : tag)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {/* Glow effect for active */}
                {isActive && <circle cx={x} cy={y} r={40} fill="url(#grad1)" />}
                
                <circle 
                  cx={x} cy={y} r={Math.max(20, 15 + count * 2)} 
                  fill={isActive ? '#4f46e5' : '#e2e8f0'} 
                  className="transition-colors duration-300 dark:fill-slate-700"
                  stroke={isActive ? '#fff' : 'none'}
                  strokeWidth={2}
                />
                <text 
                  x={x} y={y} dy={4} 
                  textAnchor="middle" 
                  fill={isActive ? '#fff' : '#475569'}
                  className="text-xs font-bold pointer-events-none select-none dark:fill-slate-300"
                  fontSize="12"
                >
                  {tag.slice(0, 10)}
                </text>
                <text 
                  x={x} y={y + 20} 
                  textAnchor="middle" 
                  fill={isActive ? '#a5b4fc' : '#94a3b8'}
                  fontSize="10"
                >
                  {count}
                </text>
              </g>
            );
          })}

          {/* Center Brain Node */}
          <g onClick={() => setSelectedTag(null)} className="cursor-pointer">
             <circle cx={centerX} cy={centerY} r={50} className="fill-brand-500 shadow-lg" />
             <foreignObject x={centerX - 12} y={centerY - 12} width={24} height={24}>
                <BrainCircuit className="text-white w-6 h-6" />
             </foreignObject>
             <text x={centerX} y={centerY + 60} textAnchor="middle" className="fill-slate-400 text-xs font-mono">My Brain</text>
          </g>
        </svg>
      </div>

      {/* Right: Filtered List Area */}
      <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col h-[400px] md:h-auto">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          {selectedTag ? (
            <>
              <span className="w-2 h-2 rounded-full bg-brand-500"></span>
              {selectedTag} ({clusters[selectedTag].length})
            </>
          ) : (
            '所有笔记分类'
          )}
        </h3>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
          {(selectedTag ? clusters[selectedTag] : notes).map(note => (
            <div 
              key={note.id}
              onClick={() => onNoteClick(note)}
              className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 cursor-pointer transition-all group"
            >
              <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm mb-1 group-hover:text-brand-600 transition-colors truncate">
                {note.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                 <FileText size={10} />
                 <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                 {note.tags && note.tags.length > 0 && !selectedTag && (
                   <span className="bg-slate-100 dark:bg-slate-700 px-1.5 rounded text-[10px]">
                     {note.tags[0]}
                   </span>
                 )}
              </div>
            </div>
          ))}
          {notes.length === 0 && (
             <div className="text-center text-slate-400 text-sm mt-10">暂无笔记</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindMap;