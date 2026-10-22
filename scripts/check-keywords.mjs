import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { keywordGroups } from '../src/data.mjs';

const dist = path.join(process.cwd(), 'dist');

async function collectHtml(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const parts = [];
  for (const entry of entries) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) parts.push(await collectHtml(target));
    if (entry.isFile() && entry.name.endsWith('.html')) parts.push(await fs.readFile(target, 'utf8'));
  }
  return parts.join('\n');
}

const html = await collectHtml(dist);
const keywords = [...new Set(keywordGroups.flatMap((group) => group.keywords))];
const missing = keywords.filter((keyword) => !html.includes(keyword));
if (missing.length) {
  console.error('Missing keywords:\n' + missing.join('\n'));
  process.exit(1);
}

const missingArticles = [];
for (const group of keywordGroups) {
  for (const [index, keyword] of group.keywords.entries()) {
    for (const type of ['guide', 'checklist']) {
      const slug = 'keyword-' + group.id + '-' + String(index + 1).padStart(2, '0') + '-' + type;
      const target = path.join(dist, 'articles', slug, 'index.html');
      const source = await fs.readFile(target, 'utf8').catch(() => '');
      if (!source.includes(keyword)) missingArticles.push(keyword + ' -> ' + slug);
    }
  }
}
if (missingArticles.length) {
  console.error('Missing keyword article pages:\n' + missingArticles.join('\n'));
  process.exit(1);
}

console.log('Keyword coverage OK: ' + keywords.length + ' unique phrases found.');
console.log('Keyword article expansion OK: ' + keywords.length + ' keywords × 2 articles.');
