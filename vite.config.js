import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// GitHub Pages 项目站点部署时通过环境变量指定子路径，例如 BASE_PATH=/personal-site/
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [vue()],
});
