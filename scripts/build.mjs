import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import config from '../site.config.mjs';
import { navItems, keywordGroups, aiGroups, clientMatrix, regionCards } from '../src/data.mjs';

const root = process.cwd();
const outDir = path.join(root, 'dist');
const contentDir = path.join(root, 'content', 'articles');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function stripHtml(value = '') {
  return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function inline(value = '') {
  let result = escapeHtml(value);
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  return result;
}

function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s/]+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-');
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const output = [];
  const headings = [];
  let paragraph = [];
  let listType = null;

  function flushParagraph() {
    if (!paragraph.length) return;
    output.push('<p>' + inline(paragraph.join(' ')) + '</p>');
    paragraph = [];
  }

  function closeList() {
    if (!listType) return;
    output.push('</' + listType + '>');
    listType = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    const headingMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      const level = headingMatch[1].length;
      const text = headingMatch[2].replace(/\*\*/g, '');
      const id = slugify(text) || 'section-' + (headings.length + 1);
      headings.push({ level, text, id });
      output.push('<h' + level + ' id="' + escapeHtml(id) + '">' + inline(headingMatch[2]) + '</h' + level + '>');
      continue;
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    const numberMatch = line.match(/^\d+\.\s+(.+)$/);
    if (bulletMatch || numberMatch) {
      flushParagraph();
      const nextType = bulletMatch ? 'ul' : 'ol';
      if (listType && listType !== nextType) closeList();
      if (!listType) {
        listType = nextType;
        output.push('<' + listType + '>');
      }
      output.push('<li>' + inline((bulletMatch || numberMatch)[1]) + '</li>');
      continue;
    }

    if (line.startsWith('> ')) {
      flushParagraph();
      closeList();
      output.push('<blockquote>' + inline(line.slice(2)) + '</blockquote>');
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  closeList();
  return { html: output.join('\n'), headings };
}

function parseFrontmatter(source) {
  const normalized = source.replace(/\r/g, '');
  if (!normalized.startsWith('---\n')) return { data: {}, body: normalized };
  const end = normalized.indexOf('\n---\n', 4);
  if (end < 0) return { data: {}, body: normalized };
  const block = normalized.slice(4, end);
  const data = {};
  block.split('\n').forEach((line) => {
    const index = line.indexOf(':');
    if (index < 0) return;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((item) => item.trim()).filter(Boolean);
    }
    data[key] = value;
  });
  return { data, body: normalized.slice(end + 5) };
}

async function readArticles() {
  const names = (await fs.readdir(contentDir)).filter((name) => name.endsWith('.md')).sort();
  const articles = [];
  for (const name of names) {
    const source = await fs.readFile(path.join(contentDir, name), 'utf8');
    const parsed = parseFrontmatter(source);
    const rendered = markdownToHtml(parsed.body);
    articles.push({
      slug: parsed.data.slug || name.replace(/\.md$/, ''),
      title: parsed.data.title || name,
      description: parsed.data.description || '',
      category: parsed.data.category || '指南',
      date: parsed.data.date || '2026-10-22',
      updated: parsed.data.updated || parsed.data.date || '2026-10-22',
      readTime: parsed.data.readTime || '6 分钟',
      tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
      featured: parsed.data.featured === 'true',
      html: rendered.html,
      headings: rendered.headings
    });
  }
  return articles.sort((a, b) => b.date.localeCompare(a.date));
}

function activePath(current, target) {
  return current === target || (target !== '/' && current.startsWith(target));
}

function header(currentPath) {
  const nav = navItems.map((item) => {
    const current = activePath(currentPath, item[1]) ? ' aria-current="page"' : '';
    return '<a href="' + item[1] + '"' + current + '>' + escapeHtml(item[0]) + '</a>';
  }).join('');
  return [
    '<a class="skip-link" href="#main">跳到正文</a>',
    '<header class="site-header">',
    '<div class="header-inner">',
    '<a class="brand" href="/" aria-label="' + escapeHtml(config.siteName) + '首页">',
    '<span class="brand-mark">LL</span>',
    '<span>' + escapeHtml(config.siteName) + '<small>' + escapeHtml(config.shortName) + '</small></span>',
    '</a>',
    '<button class="menu-toggle" type="button" data-menu aria-expanded="false" aria-label="打开导航">菜单</button>',
    '<nav class="site-nav" data-nav aria-label="主导航">' + nav + '<a class="header-cta" href="' + config.brand.url + '">' + escapeHtml(config.brand.name) + '</a></nav>',
    '</div>',
    '</header>'
  ].join('');
}

function footer() {
  return [
    '<footer class="site-footer">',
    '<div class="container">',
    '<div class="footer-grid">',
    '<div><h3>' + escapeHtml(config.siteName) + '</h3><p>机场选择、线路原理、客户端配置与网络排障知识库。内容用于技术研究与合规网络访问，请遵守所在地法律法规及服务条款。</p></div>',
    '<div><h3>内容入口</h3><div class="footer-links"><a href="/guides/">选择指南</a><a href="/clients/">客户端</a><a href="/network/">故障排查</a><a href="/topics/">专题索引</a></div></div>',
    '<div><h3>站点</h3><div class="footer-links"><a href="/ai-tools/">AI 工具</a><a href="/brand/">品牌专区</a><a href="/articles/">全部文章</a><a href="' + config.social.github + '" target="_blank" rel="noopener">GitHub 仓库</a></div></div>',
    '</div>',
    '<div class="footer-bottom"><span>© 2026 ' + escapeHtml(config.siteName) + '</span><span>独立编辑 · 不复制第三方品牌推荐</span></div>',
    '</div>',
    '</footer>'
  ].join('');
}

function jsonLd(data) {
  return '<script type="application/ld+json">' + JSON.stringify(data).replaceAll('<', '\\u003c') + '</script>';
}

function relativizeRootUrls(html, currentPath) {
  const depth = currentPath.split('/').filter(Boolean).length;
  const prefix = depth ? '../'.repeat(depth) : './';
  return html.replace(/\b(href|src)="\/([^\"]*)"/g, (match, attribute, target) => {
    return attribute + '="' + prefix + target + '"';
  });
}

function layout(options) {
  const title = options.title === config.siteName ? options.title : options.title + '｜' + config.siteName;
  const description = options.description || config.description;
  const canonical = config.baseUrl + options.path;
  const html = [
    '<!doctype html><html lang="zh-CN"><head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + escapeHtml(title) + '</title>',
    '<meta name="description" content="' + escapeHtml(description) + '">',
    '<meta name="robots" content="index,follow,max-image-preview:large">',
    '<link rel="canonical" href="' + canonical + '">',
    '<link rel="alternate" type="application/rss+xml" title="RSS" href="/rss.xml">',
    '<meta property="og:type" content="' + (options.type || 'website') + '">',
    '<meta property="og:title" content="' + escapeHtml(title) + '">',
    '<meta property="og:description" content="' + escapeHtml(description) + '">',
    '<meta property="og:url" content="' + canonical + '">',
    '<meta property="og:site_name" content="' + escapeHtml(config.siteName) + '">',
    '<meta name="theme-color" content="#07110f">',
    '<link rel="stylesheet" href="/assets/styles.css">',
    options.schema ? jsonLd(options.schema) : '',
    '</head><body>',
    header(options.path),
    '<main id="main">' + options.content + '</main>',
    footer(),
    '<script src="/assets/app.js" defer></script>',
    '</body></html>'
  ].join('');
  return relativizeRootUrls(html, options.path);
}

function articleCard(article, index = 0) {
  const tags = article.tags.slice(0, 3).map((tag) => '<span class="tag">' + escapeHtml(tag) + '</span>').join('');
  return [
    '<article class="article-card' + (index === 0 ? ' featured' : '') + '" data-article-card>',
    '<div class="article-meta"><span>' + escapeHtml(article.category) + '</span><span>' + escapeHtml(article.readTime) + '</span></div>',
    '<h3><a href="/articles/' + article.slug + '/">' + escapeHtml(article.title) + '</a></h3>',
    '<p>' + escapeHtml(article.description) + '</p>',
    '<div class="tag-row">' + tags + '</div>',
    '<a class="text-link" href="/articles/' + article.slug + '/">阅读全文 →</a>',
    '</article>'
  ].join('');
}

function brandBand() {
  return [
    '<div class="brand-band">',
    '<p class="eyebrow">' + escapeHtml(config.brand.eyebrow) + '</p>',
    '<h2>' + escapeHtml(config.brand.title) + '</h2>',
    '<p>' + escapeHtml(config.brand.description) + '</p>',
    '<a class="btn" href="' + config.brand.url + '">进入 ' + escapeHtml(config.brand.name) + ' 专区</a>',
    '</div>'
  ].join('');
}

function homePage(articles) {
  const cards = articles.slice(0, 6).map(articleCard).join('');
  const topics = keywordGroups.slice(0, 6).map((group) => {
    const keywords = group.keywords.slice(0, 7).map((keyword) => '<span>' + escapeHtml(keyword) + '</span>').join('');
    return '<article class="topic-card"><h3>' + escapeHtml(group.title) + '</h3><p>' + escapeHtml(group.description) + '</p><div class="keyword-cloud">' + keywords + '</div><p><a class="text-link" href="' + group.href + '">查看专题 →</a></p></article>';
  }).join('');
  const content = [
    '<section class="hero"><div class="container hero-inner">',
    '<div><p class="eyebrow">NETWORK FIELD NOTES / 2026</p><h1><span>把线路问题，</span><span>拆成<em>可以验证</em></span><span>的答案</span></h1><p class="hero-copy">不堆砌品牌，不复制榜单。这里从线路、倍率、IP、客户端和真实场景出发，建立一套能长期更新的机场选择与排障知识库。</p><div class="hero-actions"><a class="btn btn-primary" href="/guides/">开始选择</a><a class="btn btn-ghost" href="/network/">解决连接问题</a></div><div class="hero-note"><span>第三方品牌零植入</span><span>关键词专题化</span><span>文章持续更新</span></div></div>',
    '<div class="signal-board" aria-label="线路示意图"><div class="signal-top"><span>ROUTE MONITOR</span><span class="signal-live">KNOWLEDGE ONLINE</span></div><div class="signal-map"><i class="orbit"></i><i class="orbit"></i><i class="orbit"></i><i class="line line-1"></i><i class="line line-2"></i><i class="line line-3"></i><i class="line line-4"></i><span class="node node-core" data-ms="本地">YOU</span><span class="node node-hk" data-ms="低延迟">HK</span><span class="node node-jp" data-ms="游戏 / AI">JP</span><span class="node node-sg" data-ms="跨境办公">SG</span><span class="node node-us" data-ms="流媒体">US</span></div></div>',
    '</div></section>',
    '<section class="section"><div class="container"><div class="section-head"><div><p class="eyebrow">DECISION PATH</p><h2 class="section-title">四步找到适合自己的方案</h2></div><a class="text-link" href="/guides/">查看完整选择指南 →</a></div><div class="route-grid">',
    '<a class="route-card" href="/guides/#needs"><span class="route-no">01 / NEED</span><h3>先定使用场景</h3><p>AI、流媒体、外贸、游戏和远程办公对线路的要求完全不同。</p></a>',
    '<a class="route-card" href="/articles/iplc-vs-transit/"><span class="route-no">02 / ROUTE</span><h3>再看线路质量</h3><p>直连、中转、BGP 与 IPLC 的差异，不能只看宣传名词。</p></a>',
    '<a class="route-card" href="/articles/node-multiplier/"><span class="route-no">03 / COST</span><h3>算清真实成本</h3><p>价格、流量、倍率、设备数和重置规则共同决定使用成本。</p></a>',
    '<a class="route-card" href="/clients/"><span class="route-no">04 / CLIENT</span><h3>匹配你的设备</h3><p>Windows、Mac、Android 与 iOS 选择不同的客户端与订阅格式。</p></a>',
    '</div></div></section>',
    '<section class="section" style="background:rgba(255,255,255,.018)"><div class="container"><div class="section-head"><div><p class="eyebrow">EDITORIAL</p><h2 class="section-title">从问题出发的深度文章</h2></div><a class="text-link" href="/articles/">全部文章 →</a></div><div class="article-grid">' + cards + '</div></div></section>',
    '<section class="section"><div class="container"><div class="section-head"><div><p class="eyebrow">TOPIC MAP</p><h2 class="section-title">关键词不是堆砌，而是内容地图</h2><p class="section-lead">用户给出的全部关键词已按搜索意图拆成九组专题，每个词都有明确落点。</p></div></div><div class="topic-grid">' + topics + '</div><p style="margin-top:1.5rem"><a class="btn btn-ghost" href="/topics/">查看全部关键词专题</a></p></div></section>',
    '<section class="section-sm"><div class="container">' + brandBand() + '</div></section>'
  ].join('');
  return layout({
    title: config.siteName,
    description: config.description,
    path: '/',
    content,
    schema: { '@context': 'https://schema.org', '@type': 'WebSite', name: config.siteName, url: config.baseUrl, description: config.description }
  });
}

function standardHero(eyebrow, title, description) {
  return '<section class="page-hero"><div class="container"><p class="eyebrow">' + escapeHtml(eyebrow) + '</p><h1>' + escapeHtml(title) + '</h1><p>' + escapeHtml(description) + '</p></div></section>';
}

function articlesPage(articles) {
  const cards = articles.map(articleCard).join('');
  const content = standardHero('ALL ARTICLES', '从选择到排障，建立自己的判断框架', '文章围绕线路、客户端、订阅、IP、倍率、晚高峰和使用场景持续更新。') + '<section class="section-sm"><div class="container"><div class="search-wrap"><input class="search-input" data-article-search type="search" placeholder="搜索文章、场景或关键词…" aria-label="搜索文章"></div><div class="article-grid">' + cards + '</div></div></section>';
  return layout({ title: '全部文章', description: '机场选择、线路、客户端与网络排障文章合集。', path: '/articles/', content });
}

function guidesPage() {
  const groups = keywordGroups.filter((group) => ['choose', 'scenarios', 'price', 'compare'].includes(group.id));
  const blocks = groups.map((group) => '<article class="topic-card" id="' + group.id + '"><h3>' + escapeHtml(group.title) + '</h3><p>' + escapeHtml(group.description) + '</p><div class="keyword-cloud">' + group.keywords.map((keyword) => '<a href="/topics/#' + group.id + '">' + escapeHtml(keyword) + '</a>').join('') + '</div></article>').join('');
  const content = standardHero('CHOOSING GUIDE', '机场怎么选：先做需求题，再看价格表', '适合新手的选择框架。把“稳定、高速、便宜”拆成可测试的线路、时段、IP、设备和流量指标。') + '<section class="section"><div class="container"><div class="topic-grid">' + blocks + '</div><div class="section-sm" id="needs"><div class="notice">建议先买月付或试用，分别在工作日、周末和晚高峰测试自己的常用网站。不要只用测速数字替代真实体验。</div></div>' + brandBand() + '</div></section>';
  return layout({ title: '机场选择指南', description: '机场怎么选、机场避坑、预算套餐与使用场景选择指南。', path: '/guides/', content });
}

function clientsPage() {
  const rows = clientMatrix.map((row) => '<tr><td><strong>' + escapeHtml(row[0]) + '</strong></td><td>' + escapeHtml(row[1]) + '</td><td>' + escapeHtml(row[2]) + '</td></tr>').join('');
  const group = keywordGroups.find((item) => item.id === 'protocols');
  const content = standardHero('CLIENT MATRIX', '一个订阅，如何在四类设备上正确导入', '按操作系统和订阅格式选择客户端。页面不提供来历不明的安装包，只讲配置与排障。') + '<section class="section"><div class="container"><table class="matrix"><thead><tr><th>系统</th><th>常见客户端</th><th>检查重点</th></tr></thead><tbody>' + rows + '</tbody></table><div class="section-sm"><h2>客户端与协议关键词</h2><div class="keyword-cloud">' + group.keywords.map((keyword) => '<a href="/articles/subscription-import/">' + escapeHtml(keyword) + '</a>').join('') + '</div></div><div class="notice">Clash for Windows 已停止维护。内容中保留该关键词用于解释迁移路径，实际使用时应优先选择仍在维护且来源可信的客户端。</div></div></section>';
  return layout({ title: '机场客户端指南', description: 'Windows、Mac、Android、iOS 机场客户端与订阅导入指南。', path: '/clients/', content });
}

function networkPage() {
  const group = keywordGroups.find((item) => item.id === 'troubleshooting');
  const cards = group.keywords.map((keyword, index) => '<a class="route-card" href="/articles/' + (index < 2 ? 'subscription-import' : 'peak-hour-slow') + '/"><span class="route-no">CHECK ' + String(index + 1).padStart(2, '0') + '</span><h3>' + escapeHtml(keyword) + '</h3><p>按本地网络、系统代理、订阅、节点、DNS 与目标网站逐层检查。</p></a>').join('');
  const content = standardHero('TROUBLESHOOTING', '不要反复重装：按层级定位连接问题', '从“完全无法连接”到“只有某个网站打不开”，不同现象对应不同检查顺序。') + '<section class="section"><div class="container"><div class="route-grid">' + cards + '</div></div></section>';
  return layout({ title: '机场故障排查', description: '订阅失败、节点不显示、速度慢、连接超时与客户端配置错误排查。', path: '/network/', content });
}

function regionsPage() {
  const group = keywordGroups.find((item) => item.id === 'regions');
  const cards = regionCards.map((region) => '<article class="region-card"><h3>' + escapeHtml(region[0]) + '</h3><p>' + escapeHtml(region[1]) + '</p></article>').join('');
  const content = standardHero('REGION NOTES', '节点地区不是越多越好，匹配任务才重要', '地理距离决定基础延迟，线路与回程决定波动，IP 属性决定内容解锁和账号风控。') + '<section class="section"><div class="container"><div class="region-grid">' + cards + '</div><div class="section-sm"><h2>地区与专项线路索引</h2><div class="keyword-cloud">' + group.keywords.map((keyword) => '<a href="/topics/#regions">' + escapeHtml(keyword) + '</a>').join('') + '</div></div></div></section>';
  return layout({ title: '机场地区与节点指南', description: '香港、日本、新加坡、美国及其他地区节点选择指南。', path: '/regions/', content });
}

function topicsPage() {
  const groups = keywordGroups.map((group) => '<section class="topic-card" id="' + group.id + '"><h3>' + escapeHtml(group.title) + '</h3><p>' + escapeHtml(group.description) + '</p><div class="keyword-cloud">' + group.keywords.map((keyword) => '<a href="' + group.href + '">' + escapeHtml(keyword) + '</a>').join('') + '</div></section>').join('');
  const count = keywordGroups.reduce((total, group) => total + group.keywords.length, 0);
  const content = standardHero('TOPIC INDEX / ' + count + ' TERMS', '全部关键词，按搜索意图组织成内容专题', '每个关键词都指向相关的指南、文章或排障页面。后续更新内容时，可以继续在对应专题下扩展。') + '<section class="section"><div class="container"><div class="topic-grid">' + groups + '</div></div></section>';
  return layout({ title: '机场关键词专题索引', description: '机场推荐、客户端、线路、地区、价格和故障排查关键词专题索引。', path: '/topics/', content, schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: '机场关键词专题索引', url: config.baseUrl + '/topics/' } });
}

function aiToolsPage() {
  const total = aiGroups.reduce((sum, group) => sum + group.tools.length, 0);
  const filters = ['<button class="filter-btn active" data-filter="all">全部 ' + total + '</button>'].concat(aiGroups.map((group) => '<button class="filter-btn" data-filter="' + group.id + '">' + escapeHtml(group.title) + '</button>')).join('');
  const sections = aiGroups.map((group) => {
    const cards = group.tools.map((tool) => '<a class="tool-card" data-tool-card data-group="' + group.id + '" href="' + tool[1] + '" target="_blank" rel="noopener"><h3>' + escapeHtml(tool[0]) + '</h3><p>' + escapeHtml(tool[2]) + '</p><span class="text-link">打开官网 ↗</span></a>').join('');
    return '<section class="tool-section" data-tool-section><h2>' + escapeHtml(group.title) + '<small>' + group.tools.length + ' TOOLS</small></h2><div class="tool-grid">' + cards + '</div></section>';
  }).join('');
  const content = standardHero('AI TOOL DIRECTORY', '按任务找到 AI 工具，所有入口直接可点', '收录对话、研究、编程、办公、设计、视频、音频与自动化工具的官方入口。使用前请核对地区、费用和隐私条款。') + '<div class="filter-bar"><div class="container filter-inner">' + filters + '</div></div><section class="section-sm"><div class="container"><div class="search-wrap"><input class="search-input" data-tool-search type="search" placeholder="搜索工具或用途，例如：编程、论文、视频…" aria-label="搜索 AI 工具"></div>' + sections + '<div class="empty-state" data-empty>没有找到匹配的工具。</div></div></section>';
  return layout({ title: 'AI 工具导航', description: '可直接打开的 AI 工具官网导航，覆盖对话、研究、编程、办公、图片、视频和自动化。', path: '/ai-tools/', content, schema: { '@context': 'https://schema.org', '@type': 'ItemList', numberOfItems: total, name: 'AI 工具导航' } });
}

function brandPage() {
  const content = standardHero(config.brand.eyebrow, config.brand.name + ' 品牌专区', '这里预留给你自己的品牌，不包含参考站或任何第三方机场的推荐信息。') + '<section class="section"><div class="container"><div class="brand-band"><p class="eyebrow">CONFIGURATION READY</p><h2>品牌信息只需改一个配置文件</h2><p>编辑 site.config.mjs 中的 brand.name、brand.url、brand.title 和 brand.description，即可统一替换首页、导航栏、页脚及所有推广入口。正式发布前，请补充真实可验证的套餐、线路、退款和支持信息。</p><a class="btn" href="/guides/">查看内容结构</a></div></div></section>';
  return layout({ title: config.brand.name + ' 品牌专区', description: '自有品牌推广专区配置页面。', path: '/brand/', content, noindex: true });
}

function articlePage(article) {
  const toc = article.headings.filter((heading) => heading.level === 2).map((heading) => '<a href="#' + heading.id + '">' + escapeHtml(heading.text) + '</a>').join('');
  const tags = article.tags.map((tag) => '<span class="tag">' + escapeHtml(tag) + '</span>').join('');
  const content = [
    '<header class="article-header"><div class="container"><div class="crumbs"><a href="/">首页</a> / <a href="/articles/">文章</a> / ' + escapeHtml(article.category) + '</div><div class="tag-row">' + tags + '</div><h1>' + escapeHtml(article.title) + '</h1><p class="article-deck">' + escapeHtml(article.description) + '</p><div class="article-byline"><span>更新 ' + escapeHtml(article.updated) + '</span><span>' + escapeHtml(article.readTime) + '</span><span>' + escapeHtml(config.author) + '</span></div></div></header>',
    '<div class="container article-layout"><article class="prose">' + article.html + '<div class="section-sm">' + brandBand() + '</div></article><aside class="article-aside"><strong>文章目录</strong><nav class="toc">' + toc + '</nav></aside></div>'
  ].join('');
  return layout({
    title: article.title,
    description: article.description,
    path: '/articles/' + article.slug + '/',
    content,
    type: 'article',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      datePublished: article.date,
      dateModified: article.updated,
      author: { '@type': 'Organization', name: config.author },
      publisher: { '@type': 'Organization', name: config.siteName },
      mainEntityOfPage: config.baseUrl + '/articles/' + article.slug + '/'
    }
  });
}

async function writePage(relativePath, html) {
  const target = path.join(outDir, relativePath, 'index.html');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, html, 'utf8');
}

function xmlEscape(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

async function build() {
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(path.join(outDir, 'assets'), { recursive: true });
  await fs.copyFile(path.join(root, 'src', 'styles.css'), path.join(outDir, 'assets', 'styles.css'));
  await fs.copyFile(path.join(root, 'src', 'app.js'), path.join(outDir, 'assets', 'app.js'));

  const articles = await readArticles();
  await writePage('', homePage(articles));
  await writePage('articles', articlesPage(articles));
  await writePage('guides', guidesPage());
  await writePage('clients', clientsPage());
  await writePage('network', networkPage());
  await writePage('regions', regionsPage());
  await writePage('topics', topicsPage());
  await writePage('ai-tools', aiToolsPage());
  await writePage('brand', brandPage());
  for (const article of articles) await writePage(path.join('articles', article.slug), articlePage(article));

  const fixedPaths = ['/', '/articles/', '/guides/', '/clients/', '/network/', '/regions/', '/topics/', '/ai-tools/', '/brand/'];
  const urls = fixedPaths.concat(articles.map((article) => '/articles/' + article.slug + '/'));
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map((url) => '  <url><loc>' + xmlEscape(config.baseUrl + url) + '</loc><lastmod>2026-10-22</lastmod></url>').join('\n') + '\n</urlset>\n';
  await fs.writeFile(path.join(outDir, 'sitemap.xml'), sitemap, 'utf8');
  await fs.writeFile(path.join(outDir, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + config.baseUrl + '/sitemap.xml\n', 'utf8');
  await fs.writeFile(path.join(outDir, 'CNAME'), new URL(config.baseUrl).hostname + '\n', 'utf8');

  const rssItems = articles.slice(0, 20).map((article) => '<item><title>' + xmlEscape(article.title) + '</title><link>' + config.baseUrl + '/articles/' + article.slug + '/</link><guid>' + config.baseUrl + '/articles/' + article.slug + '/</guid><pubDate>' + new Date(article.date + 'T08:00:00+08:00').toUTCString() + '</pubDate><description>' + xmlEscape(article.description) + '</description></item>').join('');
  const rss = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>' + xmlEscape(config.siteName) + '</title><link>' + config.baseUrl + '</link><description>' + xmlEscape(config.description) + '</description><language>zh-cn</language>' + rssItems + '</channel></rss>';
  await fs.writeFile(path.join(outDir, 'rss.xml'), rss, 'utf8');
  console.log('Built ' + urls.length + ' pages and ' + articles.length + ' articles into dist/.');
}

await build();
