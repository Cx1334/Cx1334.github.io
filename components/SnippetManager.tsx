import React, { useState, useMemo } from 'react';
import { CodeSnippet } from '../types';
import { Search, Plus, Copy, Trash2, Code2, Tag, Cpu, Check } from 'lucide-react';

interface SnippetManagerProps {
  snippets: CodeSnippet[];
  onUpdateSnippets: (snippets: CodeSnippet[]) => void;
}

const SnippetManager: React.FC<SnippetManagerProps> = ({ snippets, onUpdateSnippets }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formLang, setFormLang] = useState<'c' | 'cpp' | 'python'>('c');
  const [formDesc, setFormDesc] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formPlatform, setFormPlatform] = useState('');

  const filteredSnippets = useMemo(() => {
    const lowerQ = searchQuery.toLowerCase();
    return snippets.filter(s => 
      s.title.toLowerCase().includes(lowerQ) || 
      s.tags.some(t => t.toLowerCase().includes(lowerQ)) ||
      s.platform?.toLowerCase().includes(lowerQ)
    );
  }, [snippets, searchQuery]);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startCreate = () => {
    setSelectedSnippet(null);
    setFormTitle('');
    setFormCode('');
    setFormDesc('');
    setFormTags('');
    setFormPlatform('');
    setIsEditing(true);
  };

  const startEdit = (snippet: CodeSnippet) => {
    setSelectedSnippet(snippet);
    setFormTitle(snippet.title);
    setFormCode(snippet.code);
    setFormLang(snippet.language as any);
    setFormDesc(snippet.description || '');
    setFormTags(snippet.tags.join(', '));
    setFormPlatform(snippet.platform || '');
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = formTags.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    
    if (selectedSnippet) {
      // Update
      const updated = snippets.map(s => s.id === selectedSnippet.id ? {
        ...s,
        title: formTitle,
        code: formCode,
        language: formLang,
        description: formDesc,
        tags,
        platform: formPlatform
      } : s);
      onUpdateSnippets(updated);
    } else {
      // Create
      const newSnippet: CodeSnippet = {
        id: 's' + Date.now(),
        title: formTitle,
        code: formCode,
        language: formLang,
        description: formDesc,
        tags,
        platform: formPlatform,
        createdAt: Date.now()
      };
      onUpdateSnippets([newSnippet, ...snippets]);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if(confirm('确认删除此代码片段？')) {
      onUpdateSnippets(snippets.filter(s => s.id !== id));
      if (selectedSnippet?.id === id) {
        setSelectedSnippet(null);
        setIsEditing(false);
      }
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Code2 size={20} className="text-brand-500" /> 代码片段库
            </h3>
            <button 
              onClick={startCreate}
              className="p-1.5 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-lg hover:bg-brand-200 dark:hover:bg-brand-900/50 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索片段..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredSnippets.map(snippet => (
            <div 
              key={snippet.id}
              onClick={() => { setSelectedSnippet(snippet); setIsEditing(false); }}
              className={`p-3 rounded-lg cursor-pointer transition-all group ${
                selectedSnippet?.id === snippet.id 
                  ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className="font-medium text-slate-800 dark:text-slate-200 text-sm mb-1 truncate">{snippet.title}</div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="uppercase font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1 rounded">{snippet.language}</span>
                {snippet.platform && <span>{snippet.platform}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
        {isEditing ? (
          <form onSubmit={handleSave} className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {selectedSnippet ? '编辑片段' : '新建片段'}
              </h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">取消</button>
                <button type="submit" className="px-4 py-1.5 text-sm bg-brand-600 text-white rounded hover:bg-brand-700">保存</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">标题</label>
                  <input 
                    value={formTitle} onChange={e => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">语言</label>
                  <select 
                    value={formLang} onChange={e => setFormLang(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="bash">Shell/Bash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">平台/芯片</label>
                  <input 
                    value={formPlatform} onChange={e => setFormPlatform(e.target.value)}
                    placeholder="e.g. STM32F103"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">标签 (逗号分隔)</label>
                  <input 
                    value={formTags} onChange={e => setFormTags(e.target.value)}
                    placeholder="UART, Init, Driver..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">代码内容</label>
                  <textarea 
                    value={formCode} onChange={e => setFormCode(e.target.value)}
                    className="w-full h-64 px-3 py-2 bg-slate-900 text-slate-200 font-mono text-sm border border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                    spellCheck={false}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">备注说明</label>
                  <textarea 
                    value={formDesc} onChange={e => setFormDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </form>
        ) : selectedSnippet ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-white dark:bg-slate-900">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{selectedSnippet.title}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedSnippet.platform && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs rounded border border-indigo-100 dark:border-indigo-800">
                      <Cpu size={12} /> {selectedSnippet.platform}
                    </span>
                  )}
                  {selectedSnippet.tags.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs rounded">
                      <Tag size={12} /> {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => startEdit(selectedSnippet)}
                  className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Code2 size={18} /> 编辑
                </button>
                <button 
                  onClick={() => handleDelete(selectedSnippet.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50 dark:bg-slate-950">
              <div className="relative group">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleCopy(selectedSnippet.code, selectedSnippet.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 rounded text-xs text-slate-600 dark:text-slate-300 hover:text-brand-500"
                  >
                    {copiedId === selectedSnippet.id ? <Check size={12} /> : <Copy size={12} />}
                    {copiedId === selectedSnippet.id ? '已复制' : '复制'}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-sm overflow-x-auto border border-slate-800 shadow-sm">
                  <code>{selectedSnippet.code}</code>
                </pre>
              </div>
              
              {selectedSnippet.description && (
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">说明</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {selectedSnippet.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-3">
            <Code2 size={48} className="opacity-20" />
            <p>选择或创建一个代码片段</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnippetManager;