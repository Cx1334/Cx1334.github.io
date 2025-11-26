import React, { useState } from 'react';
import { Project, ProjectStatus, Task, ProjectPriority } from '../types';
import { 
  FolderGit2, Github, CheckCircle2, Circle, Plus, Trash2, 
  ExternalLink, Calendar, Terminal, Copy, Loader2, PlayCircle, 
  PauseCircle, CheckCircle, Package, Sparkles, Edit, LayoutDashboard,
  Save, X, PieChart, BarChart3, ChevronDown, Check, Flag, Signal
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ProjectManagerProps {
  projects: Project[];
  onUpdateProjects: (projects: Project[]) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, onUpdateProjects }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // -- Dropdown States --
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  // -- Edit State --
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editGithub, setEditGithub] = useState('');
  
  // New Project Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newGithub, setNewGithub] = useState('');

  // Task Input State
  const [newTaskContent, setNewTaskContent] = useState('');

  // AI Commit Gen State
  const [aiCommitMsg, setAiCommitMsg] = useState('');
  const [isGeneratingCommit, setIsGeneratingCommit] = useState(false);

  // --- Handlers ---

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: 'p' + Date.now(),
      name: newName,
      description: newDesc,
      githubUrl: newGithub,
      status: 'planning',
      priority: 'medium', // Default priority
      progress: 0,
      startDate: Date.now(),
      tags: [],
      tasks: []
    };
    onUpdateProjects([newProject, ...projects]);
    setIsAdding(false);
    setNewName(''); setNewDesc(''); setNewGithub('');
  };

  const startEdit = () => {
    if (!selectedProject) return;
    setEditName(selectedProject.name);
    setEditDesc(selectedProject.description);
    setEditGithub(selectedProject.githubUrl || '');
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    const updatedProject = {
      ...selectedProject,
      name: editName,
      description: editDesc,
      githubUrl: editGithub
    };
    
    updateProject(updatedProject);
    setIsEditing(false);
  };

  const handleDeleteProject = (id: string) => {
    if(confirm('确定要删除这个项目吗？数据无法恢复。')) {
      const updated = projects.filter(p => p.id !== id);
      onUpdateProjects(updated);
      if (selectedProject?.id === id) setSelectedProject(null);
    }
  };

  const updateProject = (updatedProject: Project) => {
    const updatedList = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    onUpdateProjects(updatedList);
    setSelectedProject(updatedProject);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskContent.trim()) return;
    
    const newTask: Task = {
      id: 't' + Date.now(),
      content: newTaskContent,
      isCompleted: false
    };

    const updatedProject = {
      ...selectedProject,
      tasks: [...selectedProject.tasks, newTask],
      progress: calculateProgress([...selectedProject.tasks, newTask])
    };
    
    updateProject(updatedProject);
    setNewTaskContent('');
  };

  const toggleTask = (taskId: string) => {
    if (!selectedProject) return;
    const newTasks = selectedProject.tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    updateProject({
      ...selectedProject,
      tasks: newTasks,
      progress: calculateProgress(newTasks)
    });
  };

  const deleteTask = (taskId: string) => {
    if (!selectedProject) return;
    const newTasks = selectedProject.tasks.filter(t => t.id !== taskId);
    updateProject({
      ...selectedProject,
      tasks: newTasks,
      progress: calculateProgress(newTasks)
    });
  };

  const calculateProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.isCompleted).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const changeStatus = (status: ProjectStatus) => {
    if (!selectedProject) return;
    updateProject({ ...selectedProject, status });
    setIsStatusOpen(false);
  };

  const changePriority = (priority: ProjectPriority) => {
    if (!selectedProject) return;
    updateProject({ ...selectedProject, priority });
    setIsPriorityOpen(false);
  };

  // --- AI Feature ---
  const generateCommitMessage = async () => {
    if (!selectedProject || !process.env.API_KEY) return;
    
    const completedTasks = selectedProject.tasks.filter(t => t.isCompleted).map(t => t.content);
    if (completedTasks.length === 0) {
      setAiCommitMsg("没有完成的任务，无法生成 Commit Message。");
      return;
    }

    setIsGeneratingCommit(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Based on these completed tasks: ${completedTasks.join(', ')}.
      Generate a concise and standard Git commit message (Conventional Commits format).
      Only return the commit message code block.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      setAiCommitMsg(response.text?.replace(/```/g, '').trim() || "Failed to generate");
    } catch (e) {
      console.error(e);
      setAiCommitMsg("AI 生成失败，请检查 API Key");
    } finally {
      setIsGeneratingCommit(false);
    }
  };

  // --- Helpers & Configs ---

  const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: React.ReactNode }> = {
    planning: { label: '规划中', color: 'bg-slate-100 text-slate-600', icon: <Circle size={14} /> },
    development: { label: '开发中', color: 'bg-blue-100 text-blue-600', icon: <PlayCircle size={14} /> },
    testing: { label: '测试中', color: 'bg-orange-100 text-orange-600', icon: <PauseCircle size={14} /> },
    released: { label: '已发布', color: 'bg-green-100 text-green-600', icon: <CheckCircle size={14} /> },
    archived: { label: '已归档', color: 'bg-slate-200 text-slate-500', icon: <Package size={14} /> },
  };

  const PRIORITY_CONFIG: Record<ProjectPriority, { label: string; color: string; icon: React.ReactNode }> = {
    high: { label: '高优先级', color: 'text-red-500 bg-red-50', icon: <Flag size={14} fill="currentColor" /> },
    medium: { label: '中优先级', color: 'text-yellow-500 bg-yellow-50', icon: <Flag size={14} fill="currentColor" /> },
    low: { label: '低优先级', color: 'text-blue-500 bg-blue-50', icon: <Flag size={14} fill="currentColor" /> },
  };

  // --- Dashboard Logic ---
  const renderDashboard = () => {
    const total = projects.length;
    const avgProgress = total > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / total) : 0;
    const highPriorityCount = projects.filter(p => p.priority === 'high').length;
    const statusCounts = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
         <div className="mb-8">
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
             <LayoutDashboard className="text-brand-500" /> 项目控制台
           </h2>
           <p className="text-slate-500 dark:text-slate-400">所有项目的宏观概览与进度追踪</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <FolderGit2 size={24} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
               </div>
               <div className="text-3xl font-bold text-slate-900 dark:text-white">{total}</div>
               <div className="text-xs text-slate-500 mt-1">活跃项目</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                    <BarChart3 size={24} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Avg Progress</span>
               </div>
               <div className="text-3xl font-bold text-slate-900 dark:text-white">{avgProgress}%</div>
               <div className="text-xs text-slate-500 mt-1">整体完成度</div>
            </div>

             <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                    <Signal size={24} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">High Priority</span>
               </div>
               <div className="text-3xl font-bold text-slate-900 dark:text-white">{highPriorityCount}</div>
               <div className="text-xs text-slate-500 mt-1">重点攻坚项目</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
               <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                 <PieChart size={16} /> 状态分布
               </h3>
               <div className="flex items-center gap-2 flex-wrap">
                  {['planning', 'development', 'testing', 'released'].map(status => (
                    <div key={status} className="flex flex-col items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800 min-w-[60px]">
                       <span className={`text-[10px] px-1.5 py-0.5 rounded-full mb-1 ${STATUS_CONFIG[status as ProjectStatus].color}`}>
                         {STATUS_CONFIG[status as ProjectStatus].label}
                       </span>
                       <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                         {statusCounts[status] || 0}
                       </span>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {projects.length > 0 && (
           <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-white">
               活跃项目列表
             </div>
             <div className="divide-y divide-slate-100 dark:divide-slate-800">
               {projects.map(p => (
                 <div 
                    key={p.id} 
                    onClick={() => setSelectedProject(p)}
                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                 >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${p.progress === 100 ? 'bg-green-500' : 'bg-brand-500'}`} />
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          {p.name}
                          {p.priority === 'high' && <Flag size={12} className="text-red-500 fill-current" />}
                        </div>
                        <div className="text-xs text-slate-500">{new Date(p.startDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${STATUS_CONFIG[p.status].color}`}>
                         {STATUS_CONFIG[p.status].icon}
                         {STATUS_CONFIG[p.status].label}
                       </span>
                       <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-brand-500 h-full" style={{ width: `${p.progress}%` }} />
                       </div>
                       <span className="text-xs font-mono text-slate-500 w-8 text-right">{p.progress}%</span>
                    </div>
                 </div>
               ))}
             </div>
           </div>
         )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden pb-20 md:pb-0 relative">
      
      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Edit size={18} /> 编辑项目信息
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">项目名称</label>
                <input 
                  value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">描述</label>
                <textarea 
                  value={editDesc} onChange={e => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">GitHub 链接</label>
                <input 
                  value={editGithub} onChange={e => setEditGithub(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">取消</button>
                <button type="submit" className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2">
                  <Save size={16} /> 保存更改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List Sidebar */}
      <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col ${selectedProject ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FolderGit2 className="text-brand-500" size={20} /> 项目列表
          </h2>
          <div className="flex gap-1">
            <button 
              onClick={() => setSelectedProject(null)}
              className={`p-1.5 rounded-lg transition-colors ${!selectedProject ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
              title="总览仪表盘"
            >
              <LayoutDashboard size={18} />
            </button>
            <button 
              onClick={() => setIsAdding(true)}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-500 rounded-lg transition-colors"
              title="添加新项目"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {isAdding && (
          <form onSubmit={handleAddProject} className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 animate-in slide-in-from-top-2">
            <input 
              autoFocus
              className="w-full mb-2 px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="项目名称"
              value={newName} onChange={e => setNewName(e.target.value)}
              required
            />
            <textarea 
              className="w-full mb-2 px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
              placeholder="简短描述"
              rows={2}
              value={newDesc} onChange={e => setNewDesc(e.target.value)}
            />
            <input 
              className="w-full mb-3 px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="GitHub 仓库地址 (可选)"
              value={newGithub} onChange={e => setNewGithub(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded">取消</button>
              <button type="submit" className="px-3 py-1.5 text-xs bg-brand-600 text-white rounded hover:bg-brand-700">创建</button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {projects.map(p => (
            <div 
              key={p.id}
              onClick={() => setSelectedProject(p)}
              className={`p-3 rounded-xl cursor-pointer border transition-all ${
                selectedProject?.id === p.id 
                  ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-semibold text-sm ${selectedProject?.id === p.id ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-200'}`}>{p.name}</h3>
                <div className="flex items-center gap-1">
                   {p.priority === 'high' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                   <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ${STATUS_CONFIG[p.status].color}`}>
                     {STATUS_CONFIG[p.status].label}
                   </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${p.progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={12} /> {p.tasks.filter(t => t.isCompleted).length}/{p.tasks.length}
                </span>
                {p.githubUrl && <Github size={12} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail View / Dashboard */}
      <div className={`flex-1 flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden ${selectedProject ? 'flex' : 'hidden md:flex'}`}>
        {selectedProject ? (
          <>
            {/* Header */}
            <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <button onClick={() => setSelectedProject(null)} className="md:hidden text-sm text-slate-500 mb-2 flex items-center gap-1">← 返回概览</button>
                   <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedProject.name}</h1>
                   <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">{selectedProject.description}</p>
                </div>
                <div className="flex gap-2">
                   {selectedProject.githubUrl && (
                     <a 
                       href={selectedProject.githubUrl} 
                       target="_blank" 
                       rel="noreferrer"
                       className="p-2 text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                       title="打开 GitHub 仓库"
                     >
                       <Github size={20} />
                     </a>
                   )}
                   <button 
                     onClick={startEdit}
                     className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                     title="编辑项目信息"
                   >
                     <Edit size={20} />
                   </button>
                   <button 
                     onClick={() => handleDeleteProject(selectedProject.id)}
                     className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                     title="删除项目"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center text-sm relative z-20">
                {/* 1. Custom Status Dropdown */}
                <div className="relative">
                   <button 
                     onClick={() => { setIsStatusOpen(!isStatusOpen); setIsPriorityOpen(false); }}
                     className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                   >
                     <span className={`text-xs ${STATUS_CONFIG[selectedProject.status].color} px-1.5 py-0.5 rounded-md flex items-center gap-1`}>
                       {STATUS_CONFIG[selectedProject.status].icon}
                       {STATUS_CONFIG[selectedProject.status].label}
                     </span>
                     <ChevronDown size={14} className="text-slate-400" />
                   </button>

                   {isStatusOpen && (
                     <>
                       <div className="fixed inset-0 z-10" onClick={() => setIsStatusOpen(false)} />
                       <div className="absolute top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                         <div className="p-1">
                           {(Object.keys(STATUS_CONFIG) as ProjectStatus[]).map(status => (
                             <button
                               key={status}
                               onClick={() => changeStatus(status)}
                               className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedProject.status === status ? 'bg-slate-50 dark:bg-slate-700' : ''}`}
                             >
                               <span className={`flex items-center gap-2 ${STATUS_CONFIG[status].color.split(' ')[1]}`}>
                                 {STATUS_CONFIG[status].icon}
                                 {STATUS_CONFIG[status].label}
                               </span>
                               {selectedProject.status === status && <Check size={14} className="text-slate-600 dark:text-slate-300" />}
                             </button>
                           ))}
                         </div>
                       </div>
                     </>
                   )}
                </div>

                {/* 2. Custom Priority Dropdown */}
                <div className="relative">
                   <button 
                     onClick={() => { setIsPriorityOpen(!isPriorityOpen); setIsStatusOpen(false); }}
                     className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                   >
                     <span className={`text-xs ${PRIORITY_CONFIG[selectedProject.priority || 'medium'].color} px-1.5 py-0.5 rounded-md flex items-center gap-1 font-medium bg-opacity-10`}>
                       {PRIORITY_CONFIG[selectedProject.priority || 'medium'].icon}
                       {PRIORITY_CONFIG[selectedProject.priority || 'medium'].label}
                     </span>
                     <ChevronDown size={14} className="text-slate-400" />
                   </button>

                   {isPriorityOpen && (
                     <>
                       <div className="fixed inset-0 z-10" onClick={() => setIsPriorityOpen(false)} />
                       <div className="absolute top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                         <div className="p-1">
                           {(Object.keys(PRIORITY_CONFIG) as ProjectPriority[]).map(priority => (
                             <button
                               key={priority}
                               onClick={() => changePriority(priority)}
                               className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedProject.priority === priority ? 'bg-slate-50 dark:bg-slate-700' : ''}`}
                             >
                               <span className={`flex items-center gap-2 ${PRIORITY_CONFIG[priority].color.split(' ')[0]}`}>
                                 {PRIORITY_CONFIG[priority].icon}
                                 {PRIORITY_CONFIG[priority].label}
                               </span>
                               {selectedProject.priority === priority && <Check size={14} className="text-slate-600 dark:text-slate-300" />}
                             </button>
                           ))}
                         </div>
                       </div>
                     </>
                   )}
                </div>
                
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar size={16} />
                  <span>启动: {new Date(selectedProject.startDate).toLocaleDateString()}</span>
                </div>
                
                <div className="flex-1 flex items-center gap-3 min-w-[200px]">
                  <span className="text-slate-500 text-xs font-bold">进度 {selectedProject.progress}%</span>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${selectedProject.progress === 100 ? 'bg-green-500' : 'bg-brand-500'}`}
                      style={{ width: `${selectedProject.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 
                 {/* Left: Tasks */}
                 <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                       <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                         <CheckCircle2 className="text-brand-500" /> 任务规划 & 进度
                       </h3>
                       
                       <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                         <input 
                           className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                           placeholder="添加新任务 (例如: 完成 SPI 驱动调试)..."
                           value={newTaskContent}
                           onChange={e => setNewTaskContent(e.target.value)}
                         />
                         <button 
                           type="submit"
                           disabled={!newTaskContent.trim()}
                           className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                         >
                           添加
                         </button>
                       </form>

                       <div className="space-y-2">
                         {selectedProject.tasks.length === 0 ? (
                           <div className="text-center py-8 text-slate-400">暂无任务，开始规划你的项目吧！</div>
                         ) : (
                           selectedProject.tasks.map(task => (
                             <div key={task.id} className="group flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                               <button 
                                 onClick={() => toggleTask(task.id)}
                                 className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                   task.isCompleted 
                                     ? 'bg-brand-500 border-brand-500 text-white' 
                                     : 'border-slate-300 dark:border-slate-600 hover:border-brand-500'
                                 }`}
                               >
                                 {task.isCompleted && <CheckCircle2 size={14} />}
                               </button>
                               <span className={`flex-1 text-sm ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                 {task.content}
                               </span>
                               <button 
                                 onClick={() => deleteTask(task.id)}
                                 className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"
                               >
                                 <Trash2 size={14} />
                               </button>
                             </div>
                           ))
                         )}
                       </div>
                    </div>
                 </div>

                 {/* Right: Git Helper */}
                 <div className="space-y-6">
                    <div className="bg-slate-900 text-slate-300 rounded-xl p-5 shadow-lg relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Terminal size={100} />
                       </div>
                       
                       <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                         <Terminal size={18} className="text-green-400" /> Git 提交助手
                       </h3>
                       <p className="text-xs text-slate-400 mb-4">根据已完成的任务自动生成 Commit Message</p>

                       <div className="bg-black/50 rounded-lg p-3 font-mono text-xs mb-3 min-h-[60px] whitespace-pre-wrap border border-slate-700">
                         {aiCommitMsg || <span className="text-slate-600">// 点击下方按钮生成...</span>}
                       </div>

                       <div className="flex gap-2">
                         <button 
                           onClick={generateCommitMessage}
                           disabled={isGeneratingCommit}
                           className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                         >
                           {isGeneratingCommit ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                           AI 生成
                         </button>
                         {aiCommitMsg && (
                           <button 
                             onClick={() => navigator.clipboard.writeText(aiCommitMsg)}
                             className="px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                             title="复制"
                           >
                             <Copy size={14} />
                           </button>
                         )}
                       </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                       <h3 className="font-bold text-sm mb-3 text-slate-700 dark:text-slate-300">快速操作</h3>
                       <div className="flex flex-col gap-2">
                         {selectedProject.githubUrl ? (
                           <a 
                             href={selectedProject.githubUrl}
                             target="_blank"
                             rel="noreferrer"
                             className="w-full text-center py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 transition-colors flex items-center justify-center gap-2"
                           >
                             <Github size={16} /> 访问仓库
                           </a>
                         ) : (
                           <button disabled className="w-full text-center py-2 px-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-sm text-slate-400 cursor-not-allowed">
                             未关联 GitHub
                           </button>
                         )}
                       </div>
                    </div>
                 </div>

               </div>
            </div>
          </>
        ) : (
          renderDashboard()
        )}
      </div>
    </div>
  );
};

export default ProjectManager;