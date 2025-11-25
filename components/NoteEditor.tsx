import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { Save, X, Hash, PenLine } from 'lucide-react';

interface NoteEditorProps {
  initialData?: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <PenLine size={20} className="text-indigo-500" />
          {initialData ? '编辑笔记' : '撰写新笔记'}
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <X size={24} />
        </button>
      </div>

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

        <div className="flex-1 min-h-[300px] relative rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在此处记录你的学习心得、调试日志或代码片段..."
            className="absolute inset-0 w-full h-full p-4 bg-transparent border-none resize-none focus:ring-0 text-slate-700 dark:text-slate-300 font-mono text-sm leading-relaxed"
            required
          />
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
    </div>
  );
};

export default NoteEditor;