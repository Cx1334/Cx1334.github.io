import React, { useState, useEffect, useMemo, useRef } from 'react';
// ... (imports)
import { Bookmark, Note, Category, User, Project, CodeSnippet, Material, DailyPlan } from './types';
import { INITIAL_BOOKMARKS, INITIAL_NOTES, INITIAL_PROJECTS, INITIAL_SNIPPETS, INITIAL_MATERIALS, INITIAL_PLANS } from './constants';
import BookmarkCard from './components/BookmarkCard';
import AddModal from './components/AddModal';
import NoteEditor from './components/NoteEditor';
import NoteCard from './components/NoteCard';
import AuthPage from './components/AuthPage';
import MindMap from './components/MindMap';
import ProjectManager from './components/ProjectManager';
import DevTools from './components/DevTools';
import SnippetManager from './components/SnippetManager';
import EmbeddedCalc from './components/EmbeddedCalc';
import MaterialLibrary from './components/MaterialLibrary';
import DailyPlanner from './components/DailyPlanner';
import RightSidebar from './components/RightSidebar';
import { saveToGist, loadFromGist } from './services/githubService';
import { 
  Plus, Search, Layers, Command, Github, Cpu, Moon, Sun, 
  Menu, Book, PenTool, Library, Notebook as NotebookIcon,
  PanelLeftClose, PanelLeftOpen, Settings, Download, Upload, ChevronRight,
  LogOut, BrainCircuit, FolderGit2, Wrench, Code2, Calculator,
  HardDrive, PanelRightClose, PanelRightOpen, WifiOff, CalendarCheck, AlertCircle, CloudDownload, CloudUpload, Key
} from 'lucide-react';

type ViewMode = 'bookmarks' | 'notes' | 'mindmap' | 'projects' | 'tools' | 'snippets' | 'calcs' | 'materials' | 'daily';

const App: React.FC = () => {
  // ... (Keep other state)
  const [user, setUser] = useState<User | null>(null);
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('embedlink-github-token') || '');
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('embedlink-bookmarks');
    return saved ? JSON.parse(saved) : INITIAL_BOOKMARKS;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('embedlink-notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('embedlink-projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [snippets, setSnippets] = useState<CodeSnippet[]>(() => {
    const saved = localStorage.getItem('embedlink-snippets');
    return saved ? JSON.parse(saved) : INITIAL_SNIPPETS;
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('embedlink-materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [plans, setPlans] = useState<DailyPlan[]>(() => {
    const saved = localStorage.getItem('embedlink-daily-plans');
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [viewMode, setViewMode] = useState<ViewMode>('bookmarks');
  const [selectedCategory, setSelectedCategory] = useState<string>('All'); 
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  useEffect(() => {
    const savedUser = localStorage.getItem('embedlink-user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) { localStorage.removeItem('embedlink-user'); }
    }
  }, []);

  useEffect(() => { localStorage.setItem('embedlink-bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('embedlink-notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('embedlink-projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('embedlink-snippets', JSON.stringify(snippets)); }, [snippets]);
  useEffect(() => { localStorage.setItem('embedlink-materials', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('embedlink-daily-plans', JSON.stringify(plans)); }, [plans]);
  useEffect(() => { localStorage.setItem('embedlink-github-token', githubToken); }, [githubToken]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // --- Handlers ---
  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
       localStorage.removeItem('embedlink-user');
       setUser(null);
    }
  };

  // --- CRUD Handlers ---
  const handleSaveBookmark = (data: Omit<Bookmark, 'id' | 'createdAt'>) => {
    if (editingBookmark) {
      setBookmarks(prev => prev.map(b => b.id === editingBookmark.id ? { ...b, ...data } : b));
      setEditingBookmark(null);
    } else {
      const newBookmark: Bookmark = {
        // Improved ID generation to avoid collisions
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title: data.title,
        url: data.url.startsWith('http') ? data.url : `https://${data.url}`,
        description: data.description,
        category: data.category,
        tags: data.tags,
        createdAt: Date.now(),
      };
      setBookmarks(prev => [newBookmark, ...prev]);
    }
    setIsBookmarkModalOpen(false);
  };

  const handleDeleteBookmark = (id: string) => {
    if (window.confirm('确定要删除这个书签吗？')) {
      setBookmarks(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleSaveNote = (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingNote) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, ...data, updatedAt: Date.now() } : n));
      setEditingNote(null);
    } else {
      const newNote: Note = {
        id: 'n' + Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title: data.title,
        content: data.content,
        tags: data.tags,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setNotes(prev => [newNote, ...prev]);
    }
    setIsNoteEditorOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('确定要删除这条笔记吗？')) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteEditorOpen(true);
    if (viewMode === 'mindmap') setViewMode('notes');
  };

   // --- Import / Export / Sync ---
   const handleExport = () => {
    const backupData = { bookmarks, notes, projects, snippets, materials, plans, version: 6 };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "embedlink_backup_" + new Date().toISOString().slice(0,10) + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (confirm('导入将覆盖当前所有数据，确定继续吗？')) {
           if (Array.isArray(json)) {
              setBookmarks(json); 
           } else {
              if (json.bookmarks) setBookmarks(json.bookmarks);
              if (json.notes) setNotes(json.notes);
              if (json.projects) setProjects(json.projects);
              if (json.snippets) setSnippets(json.snippets);
              if (json.materials) setMaterials(json.materials);
              if (json.plans) setPlans(json.plans);
           }
           setIsSettingsOpen(false);
           alert('导入成功！');
        }
      } catch (error) { alert('解析文件失败'); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGistSync = async (action: 'push' | 'pull') => {
    if (!githubToken) {
      alert("请先在下方输入 GitHub Token");
      return;
    }
    setIsSyncing(true);
    try {
      if (action === 'push') {
        const data = { bookmarks, notes, projects, snippets, materials, plans, version: 6, timestamp: Date.now() };
        await saveToGist(githubToken, data);
        alert("✅ 备份上传成功！(Private Gist: embedlink_backup.json)");
      } else {
        if(confirm("从 GitHub 恢复将覆盖当前所有数据，确定继续吗？")) {
          const data = await loadFromGist(githubToken);
          if (data) {
            if (data.bookmarks) setBookmarks(data.bookmarks);
            if (data.notes) setNotes(data.notes);
            if (data.projects) setProjects(data.projects);
            if (data.snippets) setSnippets(data.snippets);
            if (data.materials) setMaterials(data.materials);
            if (data.plans) setPlans(data.plans);
            alert("✅ 数据恢复成功！");
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("❌ 同步失败: " + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Filter Logic ---
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch = b.title.toLowerCase().includes(lowerQuery) || 
                            b.description.toLowerCase().includes(lowerQuery) ||
                            b.tags.some(t => t.toLowerCase().includes(lowerQuery));
      return matchesCategory && matchesSearch;
    });
  }, [bookmarks, selectedCategory, searchQuery]);

  const filteredNotes = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return notes.filter(n => 
      n.title.toLowerCase().includes(lowerQuery) ||
      n.content.toLowerCase().includes(lowerQuery) ||
      n.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }, [notes, searchQuery]);

  const renderSidebarItem = (active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count?: number) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm mb-1 ${
        active 
           ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20 font-medium' 
           : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-xs py-0.5 px-2 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'}`}>
          {count}
        </span>
      )}
    </button>
  );

  const getPageTitle = () => {
    switch(viewMode) {
      case 'bookmarks': return '知识库';
      case 'notes': return '笔记本';
      case 'mindmap': return '思维图谱';
      case 'projects': return '项目管理';
      case 'tools': return '开发者工具';
      case 'snippets': return '代码片段';
      case 'calcs': return '嵌入式计算器';
      case 'materials': return '开发资料库';
      case 'daily': return '每日计划';
      default: return '';
    }
  };

  const getPageSubtitle = () => {
    switch(viewMode) {
      case 'bookmarks': return selectedCategory === 'All' ? '仪表盘' : selectedCategory;
      case 'notes': return '我的笔记';
      case 'mindmap': return '知识网络';
      case 'projects': return '进度追踪';
      case 'tools': return '实用工具箱';
      case 'snippets': return '代码复用';
      case 'calcs': return '配置助手';
      case 'materials': return '文档与固件';
      case 'daily': return '日程管理';
      default: return '';
    }
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-slate-100 font-sans selection:bg-brand-500/30 overflow-hidden">
      {/* Sidebar Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      {/* --- LEFT SIDEBAR --- */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-slate-900 border-r border-slate-800 transform transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${isSidebarCollapsed ? 'md:w-0 md:border-none md:p-0' : 'md:w-72'} w-72 shrink-0`}>
        <div className="p-4 flex items-center justify-between text-white border-b border-slate-800/50 h-[73px] shrink-0">
           <div className="flex items-center gap-3 overflow-hidden">
             <div className="bg-gradient-to-br from-brand-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 shrink-0"><Cpu size={22} className="text-white" /></div>
             <div className="animate-in fade-in duration-300"><h1 className="font-bold text-lg tracking-tight whitespace-nowrap">EmbedLink</h1><p className="text-xs text-slate-500 font-medium whitespace-nowrap">Dev Knowledge OS</p></div>
           </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8 custom-scrollbar">
          <div className="min-w-[15rem]"> 
            <div className="px-3 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Library size={12} /> 知识库 Resource</div>
            {renderSidebarItem(viewMode === 'bookmarks' && selectedCategory === 'All', () => { setViewMode('bookmarks'); setSelectedCategory('All'); setIsSidebarOpen(false); }, <Layers size={18} />, "资源导航", bookmarks.length)}
            {renderSidebarItem(viewMode === 'materials', () => { setViewMode('materials'); setIsSidebarOpen(false); }, <HardDrive size={18} />, "开发资料库", materials.length)}
            {renderSidebarItem(viewMode === 'notes', () => { setViewMode('notes'); setIsSidebarOpen(false); setIsNoteEditorOpen(false); }, <Book size={18} />, "开发笔记", notes.length)}
          </div>
          <div className="min-w-[15rem]">
            <div className="px-3 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Wrench size={12} /> 工作台 Workbench</div>
            {renderSidebarItem(viewMode === 'daily', () => { setViewMode('daily'); setIsSidebarOpen(false); }, <CalendarCheck size={18} />, "每日计划", undefined)}
            {renderSidebarItem(viewMode === 'projects', () => { setViewMode('projects'); setIsSidebarOpen(false); }, <FolderGit2 size={18} />, "项目管理", projects.length)}
            {renderSidebarItem(viewMode === 'snippets', () => { setViewMode('snippets'); setIsSidebarOpen(false); }, <Code2 size={18} />, "代码片段库", snippets.length)}
            {renderSidebarItem(viewMode === 'calcs', () => { setViewMode('calcs'); setIsSidebarOpen(false); }, <Calculator size={18} />, "硬件计算器")}
            {renderSidebarItem(viewMode === 'tools', () => { setViewMode('tools'); setIsSidebarOpen(false); }, <Wrench size={18} />, "通用工具箱")}
          </div>
        </nav>
        
        <div className="border-t border-slate-800/50 bg-slate-900/50 min-w-[15rem]">
           <div className="p-3 space-y-2">
             <button onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all text-sm font-medium"><Settings size={18} /><span>数据管理</span></button>
             <div className="flex items-center gap-3 px-3 py-2 border-t border-slate-800/50 pt-3">
                 <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full bg-slate-700" />
                 <div className="flex-1 overflow-hidden"><p className="text-sm font-medium text-white truncate">{user.username}</p><p className="text-xs text-slate-500 truncate">{user.email}</p></div>
                 <button onClick={handleLogout} className="text-slate-500 hover:text-red-400" title="退出登录"><LogOut size={16} /></button>
              </div>
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50 dark:bg-slate-950 min-w-0">
        <header className="px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-4 z-10 shrink-0">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
               <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Menu size={24} /></button>
               <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden md:flex p-2 -ml-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><PanelLeftOpen size={20} /></button>
               <div className="flex items-center gap-2 text-sm text-slate-500 ml-1">
                  <span className="font-medium text-slate-900 dark:text-slate-200 hidden sm:inline">{getPageTitle()}</span>
                  <ChevronRight size={14} className="hidden sm:inline" />
                  <span className="text-brand-600 dark:text-brand-400 font-bold text-lg sm:text-sm sm:font-medium">{getPageSubtitle()}</span>
               </div>
             </div>
             <div className="flex items-center gap-2">
               <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full border border-green-200 dark:border-green-800 mr-2"><WifiOff size={12} /><span className="font-medium">本地模式</span></div>
               <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className="hidden lg:flex p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><PanelRightOpen size={20} /></button>
               <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
               <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Github size={20} /></a>
             </div>
          </div>
          {viewMode === 'bookmarks' && (
            <div className="flex flex-col md:flex-row items-center gap-3">
               <div className="relative flex-1 w-full group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input type="text" placeholder="搜索资源标题、标签..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white transition-all" />
               </div>
               <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                 {Object.values(Category).map(cat => (
                   <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 whitespace-nowrap text-xs rounded-lg transition-colors ${selectedCategory === cat ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{cat}</button>
                 ))}
                 <button onClick={() => setSelectedCategory('All')} className={`px-3 py-1.5 whitespace-nowrap text-xs rounded-lg transition-colors ${selectedCategory === 'All' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>全部</button>
               </div>
               <button onClick={() => { setEditingBookmark(null); setIsBookmarkModalOpen(true); }} className="w-full md:w-auto bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all active:scale-95 font-medium whitespace-nowrap shrink-0"><Plus size={18} /> <span className="hidden sm:inline">添加</span></button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
           {isSettingsOpen && (
              <div className="absolute top-4 right-4 z-50 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2"><Settings size={16} /> 数据管理</h3><button onClick={() => setIsSettingsOpen(false)}><ChevronRight size={16} className="text-slate-400" /></button></div>
                <div className="mb-4"><label className="text-xs font-medium text-slate-500 mb-1 block">GitHub Token (Gist Sync)</label><div className="relative"><Key size={14} className="absolute left-2 top-2.5 text-slate-400" /><input type="password" value={githubToken} onChange={(e) => setGithubToken(e.target.value)} className="w-full pl-8 pr-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-xs outline-none focus:border-brand-500" placeholder="ghp_xxxxxxxxxxxx" /></div></div>
                <div className="grid grid-cols-2 gap-3 mb-4"><button onClick={() => handleGistSync('push')} disabled={isSyncing} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-600 disabled:opacity-50"><CloudUpload size={20} className="text-brand-500" /><span className="text-xs font-medium">上传备份</span></button><button onClick={() => handleGistSync('pull')} disabled={isSyncing} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-600 disabled:opacity-50"><CloudDownload size={20} className="text-indigo-500" /><span className="text-xs font-medium">拉取恢复</span></button></div>
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4"><h4 className="text-xs font-bold text-slate-500 mb-2">本地文件操作</h4><div className="flex gap-2"><button onClick={handleExport} className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 text-xs hover:bg-slate-100"><Download size={12} /> 导出JSON</button><button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 text-xs hover:bg-slate-100"><Upload size={12} /> 导入JSON</button></div></div>
                <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              </div>
            )}
            
            {viewMode === 'bookmarks' && (
              filteredBookmarks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 pb-20">
                  {filteredBookmarks.map((bookmark) => (
                    <BookmarkCard 
                      key={bookmark.id} 
                      bookmark={bookmark} 
                      onDelete={handleDeleteBookmark} 
                      onEdit={(b) => { setEditingBookmark(b); setIsBookmarkModalOpen(true); }}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Command size={48} />} title="未找到相关资源" desc="尝试更换搜索词，或添加新的嵌入式资源。" action={selectedCategory !== 'All' ? () => setSelectedCategory('All') : undefined} actionLabel="查看全部资源" />
              )
            )}

            {viewMode === 'notes' && (
              isNoteEditorOpen ? (
                <div className="max-w-4xl mx-auto pb-20">
                   <NoteEditor initialData={editingNote} onSave={handleSaveNote} onCancel={() => { setIsNoteEditorOpen(false); setEditingNote(null); }} />
                </div>
              ) : filteredNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {filteredNotes.map(note => (
                      <NoteCard key={note.id} note={note} onClick={handleEditNote} onEdit={handleEditNote} onDelete={handleDeleteNote} />
                    ))}
                  </div>
              ) : (
                  <EmptyState icon={<Book size={48} />} title="笔记本是空的" desc="开始记录你的第一个学习心得或调试记录吧。" action={() => setIsNoteEditorOpen(true)} actionLabel="创建第一篇笔记" />
              )
            )}

            {viewMode === 'mindmap' && <div className="h-full pb-20"><MindMap notes={notes} onNoteClick={handleEditNote} /></div>}
            
            {viewMode === 'daily' && <div className="h-full -m-4 md:-m-8"><DailyPlanner plans={plans} onUpdatePlans={setPlans} /></div>}
            {viewMode === 'projects' && <div className="h-full -m-4 md:-m-8"><ProjectManager projects={projects} onUpdateProjects={setProjects} /></div>}
            {viewMode === 'snippets' && <div className="h-full -m-4 md:-m-8"><SnippetManager snippets={snippets} onUpdateSnippets={setSnippets} /></div>}
            {viewMode === 'tools' && <div className="h-full -m-4 md:-m-8"><DevTools /></div>}
            {viewMode === 'materials' && <div className="h-full -m-4 md:-m-8"><MaterialLibrary materials={materials} onUpdateMaterials={setMaterials} /></div>}
            {viewMode === 'calcs' && <div className="h-full pb-20"><EmbeddedCalc /></div>}
        </div>
      </main>

      {isRightSidebarOpen && (
        <RightSidebar 
          viewMode={viewMode} 
          stats={{ 
            projectCount: projects.length,
            snippetCount: snippets.length,
            noteCount: notes.length,
            bookmarkCount: bookmarks.length,
            materialCount: materials.length,
            planCount: plans.length
          }} 
        />
      )}

      <AddModal
        isOpen={isBookmarkModalOpen}
        onClose={() => setIsBookmarkModalOpen(false)}
        onSave={handleSaveBookmark}
        initialData={editingBookmark}
      />
    </div>
  );
};

const EmptyState = ({ icon, title, desc, action, actionLabel }: any) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in duration-500">
    <div className="bg-white dark:bg-slate-800 p-6 rounded-full mb-6 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600">{icon}</div>
    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">{desc}</p>
    {action && <button onClick={action} className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-sm flex items-center gap-1">{actionLabel}</button>}
  </div>
);

export default App;