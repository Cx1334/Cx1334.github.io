export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  category: Category;
  tags: string[];
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown content
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Quote {
  content: string;
  author: string;
}

export interface User {
  username: string;
  email: string;
  avatar?: string;
  joinDate: number;
}

export type ProjectStatus = 'planning' | 'development' | 'testing' | 'released' | 'archived';
export type ProjectPriority = 'high' | 'medium' | 'low'; 

export interface Task {
  id: string;
  content: string;
  isCompleted: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  githubUrl?: string; 
  status: ProjectStatus;
  priority: ProjectPriority; 
  progress: number; // 0 - 100
  tasks: Task[];
  startDate: number;
  estimatedEndDate?: number; // NEW: 预计结束
  actualEndDate?: number;    // NEW: 实际结束
  tags: string[]; 
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: 'c' | 'cpp' | 'python' | 'bash';
  code: string;
  description?: string;
  tags: string[]; 
  platform?: string; 
  createdAt: number;
}

export interface Material {
  id: string;
  name: string; 
  type: 'pdf' | 'doc' | 'zip' | 'code' | 'image' | 'git' | 'other'; 
  size?: string; 
  description: string;
  tags: string[];
  createdAt: number;
  link?: string; 
}

export interface ScheduleBlock {
  id: string;
  title: string;
  startTime: string; 
  endTime: string;   
  type: 'task' | 'meeting' | 'break' | 'deep_work';
  completed: boolean;
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  schedule: ScheduleBlock[];
  todos: { id: string; text: string; completed: boolean }[]; 
  summary: string;
  mood?: 'happy' | 'neutral' | 'stress' | 'tired';
}

export enum Category {
  EMBEDDED = '嵌入式/MCU',
  LINUX = 'Linux/驱动',
  HARDWARE = '硬件/PCB',
  TOOLS = '工具/软件',
  LEARNING = '教程/博客',
  AI = 'AI/算法',
  OTHER = '其他资源'
}

export interface AIAnalysisResult {
  title: string;
  description: string;
  category: Category;
  tags: string[];
}

export interface PomodoroSession {
  id: string;
  taskName: string;
  startTime: number;
  duration: number;
  status: 'completed' | 'interrupted';
}