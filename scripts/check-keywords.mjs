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
console.log('Keyword coverage OK: ' + keywords.length + ' unique phrases found.');
