import React, { useState } from 'react';
import { Material } from '../types';
import { FileText, FileCode, FileArchive, FileImage, File, Search, Plus, Sparkles, Loader2, X, Tag, HardDrive, ExternalLink, Github } from 'lucide-react';
import { analyzeMaterialWithGemini } from '../services/geminiService';

interface MaterialLibraryProps {
  materials: Material[];
  onUpdateMaterials: (materials: Material[]) => void;
}

const MaterialLibrary: React.FC<MaterialLibraryProps> = ({ materials, onUpdateMaterials }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [fileName, setFileName] = useState('');
  const [fileDesc, setFileDesc] = useState('');
  const [fileLink, setFileLink] = useState(''); // NEW
  const [fileType, setFileType] = useState<Material['type']>('other');
  const [fileTags, setFileTags] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileText className="text-red-500" size={24} />;
      case 'doc': return <FileText className="text-blue-500" size={24} />;
      case 'zip': return <FileArchive className="text-yellow-500" size={24} />;
      case 'code': return <FileCode className="text-green-500" size={24} />;
      case 'image': return <FileImage className="text-purple-500" size={24} />;
      case 'git': return <Github className="text-slate-700 dark:text-slate-300" size={24} />;
      default: return <File className="text-slate-400" size={24} />;
    }
  };

  const handleAnalyze = async () => {
    if (!fileName) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeMaterialWithGemini(fileName, fileDesc || "No context provided");
      if (result) {
        setFileDesc(result.description || fileDesc);
        setFileTags(result.tags ? result.tags.join(', ') : fileTags);
        if (result.type) setFileType(result.type);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newMaterial: Material = {
      id: 'm' + Date.now(),
      name: fileName,
      description: fileDesc,
      type: fileType,
      size: fileType === 'git' ? '-' : 'Local', 
      tags: fileTags.split(/[,，]/).map(t => t.trim()).filter(Boolean),
      createdAt: Date.now(),
      link: fileLink // NEW
    };
    onUpdateMaterials([newMaterial, ...materials]);
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setFileName('');
    setFileDesc('');
    setFileLink('');
    setFileType('other');
    setFileTags('');
  };

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="text-brand-500" /> 开发资料库
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">本地化存储数据手册、文档链接与代码仓库</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} /> 添加资料
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 shrink-0">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="搜索资料..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
        />
      </div>

      {/* File Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map(material => (
            <div key={material.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg shrink-0">
                    {getIcon(material.type)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm" title={material.name}>
                      {material.link ? (
                        <a href={material.link} target="_blank" rel="noreferrer" className="hover:text-brand-500 hover:underline">
                          {material.name}
                        </a>
                      ) : material.name}
                    </h4>
                    <span className="text-xs text-slate-400">{material.size} • {new Date(material.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {material.link && (
                  <a href={material.link} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-500">
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 h-8">
                {material.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-auto">
                {material.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">添加新资料</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">名称 / 标题</label>
                <div className="flex gap-2">
                  <input 
                    value={fileName} onChange={e => setFileName(e.target.value)}
                    placeholder="e.g. STM32 Reference Manual"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                  <button 
                    type="button"
                    onClick={handleAnalyze}
                    disabled={!fileName || isAnalyzing}
                    className="px-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                    title="AI 自动生成描述"
                  >
                    {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">链接 / 路径</label>
                <input 
                  value={fileLink} onChange={e => setFileLink(e.target.value)}
                  placeholder="https://github.com/... or file://..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">类型</label>
                <select 
                  value={fileType} onChange={e => setFileType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="other">其他</option>
                  <option value="pdf">PDF 文档</option>
                  <option value="doc">Word/文本</option>
                  <option value="zip">压缩包</option>
                  <option value="code">代码文件</option>
                  <option value="image">图片/图纸</option>
                  <option value="git">Git 仓库</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">描述</label>
                <textarea 
                  value={fileDesc} onChange={e => setFileDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  rows={3}
                  placeholder="简要说明..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">标签</label>
                <input 
                  value={fileTags} onChange={e => setFileTags(e.target.value)}
                  placeholder="Datasheet, Git, V1.0..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">取消</button>
                <button type="submit" className="px-6 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialLibrary;