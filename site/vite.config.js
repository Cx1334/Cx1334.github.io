import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// 用户站点（根路径部署）：构建产物经 publish.mjs 复制到仓库根
export default defineConfig({
  plugins: [vue()],
  base: '/',
});
