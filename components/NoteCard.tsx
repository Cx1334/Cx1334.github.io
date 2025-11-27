import React from 'react';
import { Note } from '../types';
import { Clock, Tag, ChevronRight, Edit2, Trash2, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onClick: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onClick }) => {
  const miniMarkdownComponents = {
    h1: ({...props}: any) => <strong className="block text-sm font-bold mb-1" {...props} />,
    h2: ({...props}: any) => <strong className="block text-sm font-bold mb-1" {...props} />,
    h3: ({...props}: any) => <strong className="block text-xs font-bold mb-1" {...props} />,
    p: ({...props}: any) => <p className="mb-1.5 inline" {...props} />,
    ul: ({...props}: any) => <ul className="list-disc list-inside mb-1 ml-1" {...props} />,
    ol: ({...props}: any) => <ol className="list-decimal list-inside mb-1 ml-1" {...props} />,
    li: ({...props}: any) => <li className="truncate" {...props} />,
    blockquote: ({...props}: any) => <span className="text-slate-400 italic border-l-2 border-slate-300 pl-1 mr-1" {...props} />,
    code: ({inline, ...props}: any) => inline ? <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs font-mono text-rose-500" {...props} /> : <div className="text-xs bg-slate-900 text-slate-400 p-1 rounded mb-1 font-mono truncate">code block</div>,
    a: ({...props}: any) => <span className="text-indigo-500 underline decoration-dashed" {...props} />,
    img: () => <span className="text-xs text-slate-400">[图片]</span>,
    hr: () => null,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(note.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(note);
  };

  return (
    <div 
      onClick={() => onClick(note)} 
      className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer h-[280px]"
    >
      <div className="p-5 flex-1 flex flex-col overflow-hidden relative">
        <div className="flex justify-between items-start mb-2 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText size={16} className="text-indigo-500 shrink-0" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {note.title}
            </h3>
          </div>
          <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 shrink-0" />
        </div>
        
        <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed opacity-80 pl-6 overflow-hidden relative">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={miniMarkdownComponents}>
            {note.content}
          </ReactMarkdown>
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none"></div>
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pl-6 pt-3 shrink-0 relative z-10">
            {note.tags.slice(0, 3).map(tag => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs rounded-full">
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5 pl-1">
          <Clock size={12} />
          {new Date(note.updatedAt).toLocaleDateString()}
        </div>
        
        {/* Buttons are now always visible (removed opacity-0 group-hover:opacity-100) for better UX */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
           <button 
             onClick={handleEdit}
             className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-500 rounded-md transition-colors"
             title="编辑"
           >
             <Edit2 size={14} />
           </button>
           <button 
             onClick={handleDelete}
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