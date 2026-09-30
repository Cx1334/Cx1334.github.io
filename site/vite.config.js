import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// 构建产物直接输出到仓库根（GitHub Pages 从 main 分支根目录发布）。
// emptyOutDir 关闭：仓库根混有 .git/.github/site 等源码，不能整体清空。
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: path.resolve(__dirname, '..'),
    emptyOutDir: false,
  },
});
