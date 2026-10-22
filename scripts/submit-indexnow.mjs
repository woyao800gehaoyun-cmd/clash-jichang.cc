import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import config from '../site.config.mjs';
import { indexNowKey } from '../indexnow.config.mjs';

const root = process.cwd();
const sitemapPath = path.join(root, 'dist', 'sitemap.xml');
const dryRun = process.argv.includes('--dry-run');

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

const sitemap = await fs.readFile(sitemapPath, 'utf8').catch(() => {
  throw new Error('未找到 dist/sitemap.xml，请先运行 npm run build。');
});

const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decodeXml(match[1]));
if (urlList.length === 0) throw new Error('站点地图中没有可提交的 URL。');
if (urlList.length > 10000) throw new Error('IndexNow 单次最多提交 10,000 个 URL，请拆分提交。');

const baseUrl = config.baseUrl.replace(/\/$/, '');
const payload = {
  host: new URL(baseUrl).hostname,
  key: indexNowKey,
  keyLocation: `${baseUrl}/${indexNowKey}.txt`,
  urlList
};

if (dryRun) {
  console.log(`IndexNow 检查通过：${urlList.length} 个 URL`);
  console.log(`验证文件：${payload.keyLocation}`);
  process.exit(0);
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload)
});
const responseText = await response.text();

if (response.status !== 200 && response.status !== 202) {
  throw new Error(`IndexNow 提交失败（HTTP ${response.status}）：${responseText || '无响应正文'}`);
}

console.log(`IndexNow 提交成功：HTTP ${response.status}，共 ${urlList.length} 个 URL。`);
if (responseText) console.log(responseText);

