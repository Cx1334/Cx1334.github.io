import React from 'react';
import { Note } from '../types';
import { Clock, Tag, ChevronRight, Edit2, Trash2, FileText } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onClick: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onClick }) => {
  return (
    <div 
      onClick={() => onClick(note)}
      className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-500 shrink-0" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {note.title}
            </h3>
          </div>
          <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
        </div>
        
        <div className="text-slate-600 dark:text-slate-400 text-sm line-clamp-4 whitespace-pre-wrap font-mono mb-4 leading-relaxed opacity-80 pl-6">
          {note.content}
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pl-6">
            {note.tags.slice(0, 3).map(tag => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs rounded-full">
                <Tag size={10} />
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
               <span className="text-xs text-slate-400 self-center">+{note.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs text-slate-400">
        <div className="flex items-center gap-1.5 pl-1">
          <Clock size={12} />
          {new Date(note.updatedAt).toLocaleDateString()}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
           <button 
             onClick={() => onEdit(note)}
             className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-500 rounded-md transition-colors"
             title="编辑"
           >
             <Edit2 size={14} />
           </button>
           <button 
             onClick={() => onDelete(note.id)}
             className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 rounded-md transition-colors"
             title="删除"
           >
             <Trash2 size={14} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;