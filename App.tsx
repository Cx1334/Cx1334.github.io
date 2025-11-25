import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Bookmark, Note, Category, User } from './types';
import { INITIAL_BOOKMARKS, INITIAL_NOTES } from './constants';
import BookmarkCard from './components/BookmarkCard';
import AddModal from './components/AddModal';
import NoteEditor from './components/NoteEditor';
import NoteCard from './components/NoteCard';
import QuoteWidget from './components/QuoteWidget';
import AuthPage from './components/AuthPage';
import MindMap from './components/MindMap';
import { 
  Plus, Search, Layers, Command, Github, Cpu, Moon, Sun, 
  Menu, Book, PenTool, Library, Notebook as NotebookIcon,
  PanelLeftClose, PanelLeftOpen, Settings, Download, Upload, AlertCircle, ChevronRight,
  LogOut, BrainCircuit, PanelLeft
} from 'lucide-react';

type ViewMode = 'bookmarks' | 'notes' | 'mindmap';

const App: React.FC = () => {
  // --- State: User & Auth ---
  const [user, setUser] = useState<User | null>(null);
  
  // --- State: Data ---
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('embedlink-bookmarks');
    return saved ? JSON.parse(saved) : INITIAL_BOOKMARKS;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('embedlink-notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  // --- State: UI Control ---
  const [viewMode, setViewMode] = useState<ViewMode>('bookmarks');
  const [selectedCategory, setSelectedCategory] = useState<string>('All'); // For bookmarks
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Editors
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapse
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Dark Mode
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
    // Check local session
    const savedUser = localStorage.getItem('embedlink-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('embedlink-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('embedlink-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // --- Auth Handlers ---
  const handleLogin = (u: User) => {
    setUser(u);
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
       localStorage.removeItem('embedlink-user');
       setUser(null);
    }
  };

  // --- Handlers: Bookmarks ---
  const handleSaveBookmark = (data: Omit<Bookmark, 'id' | 'createdAt'>) => {
    if (editingBookmark) {
      setBookmarks(bookmarks.map(b => b.id === editingBookmark.id ? { ...b, ...data } : b));
      setEditingBookmark(null);
    } else {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        title: data.title,
        url: data.url.startsWith('http') ? data.url : `https://${data.url}`,
        description: data.description,
        category: data.category,
        tags: data.tags,
        createdAt: Date.now(),
      };
      setBookmarks([newBookmark, ...bookmarks]);
    }
    setIsBookmarkModalOpen(false);
  };

  const handleDeleteBookmark = (id: string) => {
    if (confirm('确定要删除这个书签吗？')) setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  // --- Handlers: Notes ---
  const handleSaveNote = (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote.id ? { ...n, ...data, updatedAt: Date.now() } : n));
      setEditingNote(null);
    } else {
      const newNote: Note = {
        id: 'n' + Date.now().toString(),
        title: data.title,
        content: data.content,
        tags: data.tags,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setNotes([newNote, ...notes]);
    }
    setIsNoteEditorOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('确定要删除这条笔记吗？')) setNotes(notes.filter(n => n.id !== id));
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteEditorOpen(true);
    if (viewMode === 'mindmap') setViewMode('notes');
  };

   // --- Import / Export ---
   const handleExport = () => {
    const backupData = { bookmarks, notes, version: 2 };
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
           } else if (json.bookmarks || json.notes) {
              if (json.bookmarks) setBookmarks(json.bookmarks);
              if (json.notes) setNotes(json.notes);
           }
           setIsSettingsOpen(false);
           alert('导入成功！');
        }
      } catch (error) { alert('解析文件失败'); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  // --- Render Helpers ---
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

  // --- AUTH CHECK ---
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-slate-100 font-sans selection:bg-brand-500/30">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen bg-slate-900 border-r border-slate-800
        transform transition-all duration-300 ease-in-out flex flex-col overflow-hidden
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isSidebarCollapsed ? 'md:w-0 md:border-none md:p-0' : 'md:w-72'}
        w-72
      `}>
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between text-white border-b border-slate-800/50 h-[73px] shrink-0">
           <div className="flex items-center gap-3 overflow-hidden">
             <div className="bg-gradient-to-br from-brand-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 shrink-0">
                <Cpu size={22} className="text-white" />
             </div>
             <div className="animate-in fade-in duration-300">
               <h1 className="font-bold text-lg tracking-tight whitespace-nowrap">EmbedLink</h1>
               <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Dev Knowledge OS</p>
             </div>
           </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8 custom-scrollbar">
          {/* Section: Resource Library */}
          <div className="min-w-[15rem]"> 
            {/* Added min-w to prevent text wrapping weirdly during transition */}
            <div className="px-3 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Library size={12} /> 知识库 Resource
            </div>
            
            {renderSidebarItem(
              viewMode === 'bookmarks' && selectedCategory === 'All',
              () => { setViewMode('bookmarks'); setSelectedCategory('All'); setIsSidebarOpen(false); },
              <Layers size={18} />,
              "全部资源",
              bookmarks.length
            )}
            
            <div className="mt-2 space-y-0.5">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setViewMode('bookmarks'); setSelectedCategory(cat); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 ml-2 py-2 rounded-lg transition-colors text-sm border-l-2 ${
                     viewMode === 'bookmarks' && selectedCategory === cat
                       ? 'border-brand-500 text-brand-400 bg-slate-800/50' 
                       : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                  }`}
                >
                    <span className="truncate">{cat}</span>
                    <span className="text-xs opacity-40">{bookmarks.filter(b => b.category === cat).length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Notebook */}
          <div className="min-w-[15rem]">
            <div className="px-3 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <NotebookIcon size={12} /> 笔记本 Notebook
            </div>
            {renderSidebarItem(
              viewMode === 'notes',
              () => { setViewMode('notes'); setIsSidebarOpen(false); setIsNoteEditorOpen(false); },
              <Book size={18} />,
              "学习笔记",
              notes.length
            )}
            {renderSidebarItem(
              viewMode === 'mindmap',
              () => { setViewMode('mindmap'); setIsSidebarOpen(false); },
              <BrainCircuit size={18} />,
              "思维导图",
              undefined
            )}
          </div>
        </nav>
        
        {/* Settings & User */}
        <div className="border-t border-slate-800/50 bg-slate-900/50 min-w-[15rem]">
           {viewMode !== 'mindmap' && <QuoteWidget />}
           
           <div className="p-3 space-y-2">
             <button
                onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all text-sm font-medium"
              >
                <Settings size={18} />
                <span>数据管理</span>
              </button>

              <div className="flex items-center gap-3 px-3 py-2 border-t border-slate-800/50 pt-3">
                 <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full bg-slate-700" />
                 <div className="flex-1 overflow-hidden">
                   <p className="text-sm font-medium text-white truncate">{user.username}</p>
                   <p className="text-xs text-slate-500 truncate">{user.email}</p>
                 </div>
                 <button onClick={handleLogout} className="text-slate-500 hover:text-red-400" title="退出登录">
                   <LogOut size={16} />
                 </button>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative bg-slate-50 dark:bg-slate-950">
        
        {/* Top Header */}
        <header className="px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-4 z-10 sticky top-0">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
               {/* Mobile Toggle */}
               <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                 <Menu size={24} />
               </button>

               {/* Desktop Sidebar Toggle - ONLY VISIBLE ON DESKTOP */}
               <button 
                 onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                 className="hidden md:flex p-2 -ml-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                 title={isSidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
               >
                 {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
               </button>

               {/* Breadcrumbs / Title */}
               <div className="flex items-center gap-2 text-sm text-slate-500 ml-1">
                  <span className="font-medium text-slate-900 dark:text-slate-200 hidden sm:inline">
                     {viewMode === 'bookmarks' ? '知识库' : viewMode === 'notes' ? '笔记本' : '笔记本'}
                  </span>
                  <ChevronRight size={14} className="hidden sm:inline" />
                  <span className="text-brand-600 dark:text-brand-400 font-bold text-lg sm:text-sm sm:font-medium">
                     {viewMode === 'bookmarks' ? (selectedCategory === 'All' ? '仪表盘' : selectedCategory) : viewMode === 'notes' ? '我的笔记' : '思维图谱'}
                  </span>
               </div>
             </div>

             <div className="flex items-center gap-2">
               <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="切换模式"
               >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
               </button>
               <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Github size={20} />
               </a>
             </div>
          </div>

          {viewMode !== 'mindmap' && (
            <div className="flex flex-col md:flex-row items-center gap-3">
               <div className="relative flex-1 w-full group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder={viewMode === 'bookmarks' ? "搜索资源标题、标签..." : "搜索笔记内容、标签..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white transition-all"
                  />
               </div>
               
               {viewMode === 'bookmarks' ? (
                  <button
                    onClick={() => { setEditingBookmark(null); setIsBookmarkModalOpen(true); }}
                    className="w-full md:w-auto bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all active:scale-95 font-medium whitespace-nowrap"
                  >
                    <Plus size={18} /> <span>添加资源</span>
                  </button>
               ) : (
                  !isNoteEditorOpen && (
                    <button
                      onClick={() => { setEditingNote(null); setIsNoteEditorOpen(true); }}
                      className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 font-medium whitespace-nowrap"
                    >
                      <PenTool size={18} /> <span>新建笔记</span>
                    </button>
                  )
               )}
            </div>
          )}
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
           {/* Settings Dropdown Panel */}
           {isSettingsOpen && (
              <div className="absolute top-20 right-4 md:left-8 md:top-auto md:bottom-8 z-50 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 animate-in fade-in zoom-in duration-200">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm flex items-center gap-2">
                  <Settings size={16} /> 数据备份与恢复
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleExport} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-600">
                    <Download size={20} className="text-brand-500" />
                    <span className="text-xs font-medium">导出备份</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-600">
                    <Upload size={20} className="text-indigo-500" />
                    <span className="text-xs font-medium">导入恢复</span>
                  </button>
                </div>
                <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <div className="mt-4 flex items-start gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                  <AlertCircle size={14} className="shrink-0 mt-0.5 text-orange-400" />
                  数据存储在本地浏览器中。请定期导出 JSON 文件以防丢失。
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="mt-4 w-full text-xs text-slate-400 hover:text-slate-600 p-1">关闭面板</button>
              </div>
            )}
            
            {/* --- VIEW: BOOKMARKS --- */}
            {viewMode === 'bookmarks' && (
              filteredBookmarks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
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
                <EmptyState 
                  icon={<Command size={48} />} 
                  title="未找到相关资源" 
                  desc="尝试更换搜索词，或添加新的嵌入式资源。" 
                  action={selectedCategory !== 'All' ? () => setSelectedCategory('All') : undefined}
                  actionLabel="查看全部资源"
                />
              )
            )}

            {/* --- VIEW: NOTES --- */}
            {viewMode === 'notes' && (
              isNoteEditorOpen ? (
                <div className="max-w-4xl mx-auto pb-20">
                   <NoteEditor 
                     initialData={editingNote} 
                     onSave={handleSaveNote} 
                     onCancel={() => { setIsNoteEditorOpen(false); setEditingNote(null); }} 
                   />
                </div>
              ) : (
                filteredNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {filteredNotes.map(note => (
                      <NoteCard 
                        key={note.id} 
                        note={note} 
                        onClick={handleEditNote}
                        onEdit={handleEditNote} 
                        onDelete={handleDeleteNote}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={<Book size={48} />} 
                    title="笔记本是空的" 
                    desc="开始记录你的第一个学习心得或调试记录吧。" 
                    action={() => setIsNoteEditorOpen(true)}
                    actionLabel="创建第一篇笔记"
                  />
                )
              )
            )}

            {/* --- VIEW: MIND MAP --- */}
            {viewMode === 'mindmap' && (
               <div className="h-full pb-20">
                  <MindMap notes={notes} onNoteClick={handleEditNote} />
               </div>
            )}
        </div>
      </main>

      {/* Global Modals */}
      <AddModal
        isOpen={isBookmarkModalOpen}
        onClose={() => setIsBookmarkModalOpen(false)}
        onSave={handleSaveBookmark}
        initialData={editingBookmark}
      />
    </div>
  );
};

// Simple helper component for empty states
const EmptyState = ({ icon, title, desc, action, actionLabel }: any) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in duration-500">
    <div className="bg-white dark:bg-slate-800 p-6 rounded-full mb-6 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
      {desc}
    </p>
    {action && (
      <button 
        onClick={action}
        className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-sm flex items-center gap-1"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default App;