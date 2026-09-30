/**
 * 发布脚本：把 dist/ 构建产物复制到仓库根（GitHub Pages 从 main 分支根目录发布）。
 * 用法：cd site; npm run publish（通常在 npm run build 之后）
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const siteDir = fileURLToPath(new URL('.', import.meta.url));
const rootDir = path.resolve(siteDir, '..');
const distDir = path.join(siteDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('dist 不存在，请先 npm run build');
  process.exit(1);
}

// 清理旧的 assets（防止 hash 文件堆积）
const assetsDir = path.join(rootDir, 'assets');
fs.rmSync(assetsDir, { recursive: true, force: true });

// 复制 dist 全部内容到仓库根
for (const name of fs.readdirSync(distDir)) {
  fs.cpSync(path.join(distDir, name), path.join(rootDir, name), { recursive: true, force: true });
}

console.log('已发布到仓库根:', rootDir);
