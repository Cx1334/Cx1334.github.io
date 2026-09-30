/**
 * 单站发布脚本：主页（/）+ 工作台（/app/）合并到仓库根，供 GitHub Pages 分支模式发布。
 *
 * 用法：cd profile; node scripts/publish-site.mjs
 * 产物：
 *   仓库根 index.html + assets/ + og-cover*   ← 主页（site 工程构建）
 *   仓库根 app/                               ← 工作台（web 工程构建，BASE_PATH=/app/）
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const profileDir = fileURLToPath(new URL('..', import.meta.url));
const siteDir = path.join(profileDir, 'site');
const webDir = path.resolve(profileDir, '..', 'web');
const appDir = path.join(profileDir, 'app');

function run(command, cwd, env = {}) {
  console.log(`> ${command}  (${path.basename(cwd)})`);
  execSync(command, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });
}

// 1. 主页构建并发布到仓库根
run('npm run build', siteDir);
run('node publish.mjs', siteDir);

// 2. 工作台构建（子路径 /app/）并复制到仓库根 app/
run('npm run build', webDir, { BASE_PATH: '/app/' });
fs.rmSync(appDir, { recursive: true, force: true });
fs.cpSync(path.join(webDir, 'dist'), appDir, { recursive: true });

console.log(`\n单站发布完成：
  主页    -> ${profileDir}（index.html / assets / og-cover）
  工作台  -> ${appDir}

接下来：git add -A && git commit && git push origin main`);
