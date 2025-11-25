import React, { useState } from 'react';
import { Bookmark, Category } from '../types';
import { Trash2, ExternalLink, Cpu, Database, Wrench, BookOpen, Monitor, Box, Copy, Check, Edit2 } from 'lucide-react';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
}

const CategoryIcon = ({ category }: { category: Category }) => {
  switch (category) {
    case Category.EMBEDDED: return <Cpu size={16} className="text-blue-500" />;
    case Category.LINUX: return <Monitor size={16} className="text-yellow-600 dark:text-yellow-400" />;
    case Category.HARDWARE: return <Box size={16} className="text-orange-500" />;
    case Category.TOOLS: return <Wrench size={16} className="text-purple-500" />;
    case Category.LEARNING: return <BookOpen size={16} className="text-green-500" />;
    case Category.AI: return <Database size={16} className="text-rose-500" />;
    default: return <ExternalLink size={16} className="text-gray-500" />;
  }
};

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onDelete, onEdit }) => {
  const [copied, setCopied] = useState(false);
  
  // Use Google's favicon service
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=32`;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(bookmark.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-300 flex flex-col h-full overflow-hidden">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img 
              src={faviconUrl} 
              alt="" 
              className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 p-0.5 object-cover shrink-0" 
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32?text=?' }}
            />
            <div className="flex flex-col min-w-0">
               <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-lg group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" title={bookmark.title}>
                {bookmark.title}
              </h3>
              <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <CategoryIcon category={bookmark.category} />
                <span>{bookmark.category}</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 leading-relaxed mb-4">
          {bookmark.description}
        </p>

        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto mb-2">
            {bookmark.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
         <span className="text-xs text-slate-400 font-mono">
           {new Date(bookmark.createdAt).toLocaleDateString()}
         </span>
         
         <div className="flex space-x-1">
            <button 
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
              title="复制链接"
            >
              {copied ? <Check size={16} className="text-green-500"/> : <Copy size={16} />}
            </button>
            <button 
              onClick={() => onEdit(bookmark)}
              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
              title="编辑"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={() => onDelete(bookmark.id)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
              title="删除"
            >
              <Trash2 size={16} />
            </button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1 self-center"></div>
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1.5 text-brand-500 hover:text-brand-700 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
              title="访问"
            >
              <ExternalLink size={16} />
            </a>
         </div>
      </div>
    </div>
  );
};

export default BookmarkCard;