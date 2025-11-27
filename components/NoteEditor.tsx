import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { Save, X, Hash, PenLine, Eye, FileText, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteEditorProps {
  initialData?: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [showMiniMap, setShowMiniMap] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setTags(initialData.tags.join(', '));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedTags = tags
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave({ title, content, tags: processedTags });
  };

  // Custom styles for markdown elements
  const markdownComponents = {
    // ... (same as before)
    h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold mt-4 mb-2 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-xl font-bold mt-3 mb-2 text-slate-800 dark:text-slate-100" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-lg font-semibold mt-3 mb-1 text-slate-800 dark:text-slate-100" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-3 leading-relaxed text-slate-700 dark:text-slate-300" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-inside mb-3 ml-2 text-slate-700 dark:text-slate-300" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal list-inside mb-3 ml-2 text-slate-700 dark:text-slate-300" {...props} />,
    li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
    blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-indigo-400 pl-4 py-1 my-3 bg-slate-50 dark:bg-slate-800/50 italic text-slate-600 dark:text-slate-400 rounded-r" {...props} />,
    code: ({node, inline, className, children, ...props}: any) => {
      return inline ? (
        <code className="bg-slate-100 dark:bg-slate-700 text-rose-500 dark:text-rose-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      ) : (
        <div className="mockup-code bg-slate-900 text-slate-200 rounded-lg p-4 my-3 overflow-x-auto font-mono text-sm shadow-sm">
          <code {...props}>{children}</code>
        </div>
      );
    },
    a: ({node, ...props}: any) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
    table: ({node, ...props}: any) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg" {...props} /></div>,
    th: ({node, ...props}: any) => <th className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" {...props} />,
    td: ({node, ...props}: any) => <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700" {...props} />,
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <PenLine size={20} className="text-indigo-500" />
            {initialData ? '编辑笔记' : '撰写新笔记'}
          </h2>
          
          {/* View Mode Toggle */}
          <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMode('write')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${mode === 'write' ? 'bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <PenLine size={12} /> 编辑
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${mode === 'preview' ? 'bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Eye size={12} /> 预览
            </button>
          </div>

          <button 
            type="button"
            onClick={() => setShowMiniMap(!showMiniMap)}
            className={`p-1.5 rounded-md transition-colors ${showMiniMap ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
            title="显示思维导图结构 (Mock)"
          >
            <BrainCircuit size={18} />
          </button>
        </div>

        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入笔记标题..."
              className="w-full text-2xl font-bold bg-transparent border-none placeholder-slate-300 dark:placeholder-slate-600 text-slate-900 dark:text-white focus:ring-0 px-0"
              autoFocus
              required
            />
          </div>

          <div className="mb-4 flex items-center gap-2 text-slate-400 focus-within:text-indigo-500 transition-colors">
            <Hash size={16} />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="标签 (如: I2C, Debug, Linux)..."
              className="flex-1 bg-transparent border-none text-sm placeholder-slate-400 dark:placeholder-slate-600 text-slate-700 dark:text-slate-300 focus:ring-0 px-0"
            />
          </div>

          <div className="flex-1 min-h-[300px] relative rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
            {mode === 'write' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在此处记录你的学习心得、调试日志或代码片段... (支持 Markdown)"
                className="absolute inset-0 w-full h-full p-4 bg-transparent border-none resize-none focus:ring-0 text-slate-700 dark:text-slate-300 font-mono text-sm leading-relaxed"
                required
              />
            ) : (
              <div className="absolute inset-0 w-full h-full p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {content}
                  </ReactMarkdown>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 flex-col gap-2">
                    <FileText size={32} className="opacity-20" />
                    <p className="text-sm">暂无内容预览</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              放弃
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              <Save size={16} />
              保存笔记
            </button>
          </div>
        </form>

        {/* Mini MindMap Overlay (Mock Implementation for Visual) */}
        {showMiniMap && (
          <div className="w-64 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 flex flex-col animate-in slide-in-from-right duration-300">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">结构导图</h3>
            <div className="flex-1 relative">
               {/* Simple visual representation of nodes */}
               <div className="absolute top-10 left-10 w-3 h-3 bg-indigo-500 rounded-full"></div>
               <div className="absolute top-20 left-20 w-2 h-2 bg-slate-400 rounded-full"></div>
               <div className="absolute top-30 left-20 w-2 h-2 bg-slate-400 rounded-full"></div>
               <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <line x1="46" y1="46" x2="80" y2="80" stroke="#cbd5e1" strokeWidth="1" />
                 <line x1="46" y1="46" x2="80" y2="120" stroke="#cbd5e1" strokeWidth="1" />
               </svg>
               <p className="text-center mt-32 text-xs text-slate-400">
                 (节点分析预览)
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteEditor;