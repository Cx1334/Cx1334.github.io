import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    // 你的仓库名是 Cx1334.github.io，这是一个用户主页仓库，所以 base 应该是 '/'
    // 如果是普通项目仓库 (如 Cx1334/my-project)，这里应该是 '/my-project/'
    base: '/', 
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY)
    },
    build: {
      outDir: 'dist',
    }
  };
});