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
  content: string;
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