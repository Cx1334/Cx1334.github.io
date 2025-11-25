import React, { useState, useEffect } from 'react';
import { Category, Bookmark } from '../types';
import { X, Sparkles, Loader2, Link as LinkIcon, Tag } from 'lucide-react';
import { analyzeUrlWithGemini } from '../services/geminiService';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  initialData?: Bookmark | null;
}

const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.EMBEDDED);
  const [tags, setTags] = useState(''); // Comma separated string
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setUrl(initialData.url);
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setTags(initialData.tags ? initialData.tags.join(', ') : '');
    } else {
      // Reset logic handled in handleClose, but effectively reset on open if not editing
      if (!isOpen) resetForm(); 
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setUrl('');
    setTitle('');
    setDescription('');
    setCategory(Category.EMBEDDED);
    setTags('');
  };

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!url) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeUrlWithGemini(url);
      setTitle(result.title);
      setDescription(result.description);
      setCategory(result.category);
      setTags(result.tags.join(', '));
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    
    // Process tags
    const processedTags = tags
      .split(/[,，]/) // Split by english or chinese comma
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave({ title, url, description, category, tags: processedTags });
    handleClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <LinkIcon size={20} className="text-brand-500"/>
            {initialData ? '编辑书签' : '添加新书签'}
          </h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* URL Input with Magic Button */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">网址 (URL)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!url || isAnalyzing}
                className="px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm font-medium text-sm whitespace-nowrap"
              >
                {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                智能识别
              </button>
            </div>
            {!initialData && <p className="text-xs text-slate-400">输入网址点击"智能识别"，让 AI 自动填写信息。</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
             </div>
             <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">分类</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  {Object.values(Category).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
               标签 <span className="text-xs text-slate-400 font-normal">(用逗号分隔)</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="STM32, Linux, HAL"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              {initialData ? '更新书签' : '保存书签'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;