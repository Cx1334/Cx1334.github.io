import React, { useState } from 'react';
import { User } from '../types';
import { Cpu, ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const mockUser: User = {
        username: isLogin ? (email.split('@')[0] || 'Developer') : username,
        email: email,
        joinDate: Date.now(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
      
      // Save simulated session
      localStorage.setItem('embedlink-user', JSON.stringify(mockUser));
      onLogin(mockUser);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 mb-4">
            <Cpu size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">EmbedLink</h1>
          <p className="text-slate-400 text-sm">嵌入式开发者的第二大脑</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 ml-1">用户名</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-3 text-slate-500" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                  placeholder="Your Name"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 ml-1">邮箱</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-slate-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                placeholder="developer@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-xs font-medium text-slate-300 ml-1">密码</label>
             <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                  placeholder="••••••••"
                  required
                />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? '进入系统' : '立即注册'} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 hover:text-brand-400 text-sm transition-colors"
          >
            {isLogin ? '还没有账号？创建新账号' : '已有账号？直接登录'}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
           <p className="text-xs text-slate-500">
             Local Demo Mode: 账号数据仅存储在本地浏览器中
           </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;