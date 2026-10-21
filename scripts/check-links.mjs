import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const dist = path.join(process.cwd(), 'dist');

async function filesIn(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(target));
    else files.push(target);
  }
  return files;
}

const htmlFiles = (await filesIn(dist)).filter((file) => file.endsWith('.html'));
const broken = [];

for (const file of htmlFiles) {
  const html = await fs.readFile(file, 'utf8');
  const links = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const link of links) {
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(link)) continue;
    const clean = decodeURIComponent(link.split('#')[0].split('?')[0]);
    if (!clean) continue;
    const target = path.resolve(path.dirname(file), clean);
    const insideDist = target === dist || target.startsWith(dist + path.sep);
    if (!insideDist) {
      broken.push(path.relative(dist, file) + ' -> escapes dist: ' + link);
      continue;
    }
    const exists = await fs.stat(target).then(() => true).catch(() => false);
    if (!exists) broken.push(path.relative(dist, file) + ' -> missing: ' + link);
  }
}

if (broken.length) {
  console.error(broken.join('\n'));
  process.exit(1);
}

console.log('Link check OK: ' + htmlFiles.length + ' HTML files use valid local targets.');
