import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import config from '../site.config.mjs';
import { navItems, keywordGroups, aiGroups, clientMatrix, regionCards } from '../src/data.mjs';

const root = process.cwd();
const outDir = path.join(root, 'dist');
const contentDir = path.join(root, 'content', 'articles');
const airportPicks = [
  {
    name: '光年梯',
    slug: 'guangnianti-review',
    url: 'https://gnt001.gntvipaff.cc/#/?code=FRrxGbbY',
    badge: '推荐 01',
    summary: '适合希望先从简洁入口了解套餐，再自行测试 Clash 订阅、晚高峰和常用场景的用户。',
    suitable: 'Clash 新手、日常网页、AI 与流媒体候选',
    verify: '套餐流量、节点地区、倍率、设备数与退款规则',
    tags: ['光年梯', 'Clash 梯子推荐', '机场测评']
  },
  {
    name: '极连云',
    slug: 'jilianyun-review',
    url: 'https://haozevpn.jlyvipaff.com/#/?code=KUKfOY13',
    badge: '推荐 02',
    summary: '适合重视多平台使用体验，并愿意在购买前核对客户端兼容、常用地区和高峰期表现的用户。',
    suitable: 'Windows、Mac、Android 与 iOS 多端候选',
    verify: '订阅格式、同时在线限制、线路说明与售后渠道',
    tags: ['极连云', '机场推荐', 'Clash 机场']
  }
];

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
  result = result.replace(/\[(.+?)\]\((.+?)\)/g, (_, label, href) => {
    const external = /^https?:\/\//i.test(href);
    return '<a href="' + href + '"' + (external ? ' target="_blank" rel="sponsored noopener noreferrer"' : '') + '>' + label + '</a>';
  });
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
    if (key === 'tags' && typeof value === 'string') {
      value = value.split(',').map((item) => item.trim()).filter(Boolean);
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
    '<span class="brand-mark">◎</span>',
    '<span>' + escapeHtml(config.siteName) + '<small>' + escapeHtml(config.shortName) + '</small></span>',
    '</a>',
    '<button class="menu-toggle" type="button" data-menu aria-expanded="false" aria-label="打开导航">菜单</button>',
    '<nav class="site-nav" data-nav aria-label="主导航"><div class="nav-main">' + nav + '</div><div class="nav-actions"><a class="nav-chip chip-blue" href="/shared-id/">共享 ID ●</a><a class="nav-chip chip-red" href="/risk/">跑路预警 ●</a><button class="nav-chip theme-toggle" type="button" data-theme-toggle aria-pressed="false">🌞 浅色</button></div></nav>',
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
    '<div><h3>内容入口</h3><div class="footer-links"><a href="/brands/">机场推荐</a><a href="/articles/">科学上网知识库</a><a href="/topics/">专题目录</a><a href="/compare/">横向对比</a></div></div>',
    '<div><h3>站点服务</h3><div class="footer-links"><a href="/questions/">问题库</a><a href="/ai-tools/">AI 工具</a><a href="/risk/">跑路预警</a><a href="/about/">关于本站</a></div></div>',
    '</div>',
    '<div class="footer-bottom"><span>© 2026 ' + escapeHtml(config.siteName) + '</span><span>推广链接含邀请码 · 购买前请核验实时信息</span></div>',
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
    const hashAt = target.indexOf('#');
    const queryAt = target.indexOf('?');
    const cutAt = [hashAt, queryAt].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? target.length;
    let pathname = target.slice(0, cutAt);
    const suffix = target.slice(cutAt);
    if (!pathname) pathname = 'index.html';
    else if (pathname.endsWith('/')) pathname += 'index.html';
    return attribute + '="' + prefix + pathname + suffix + '"';
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
    '<meta name="theme-color" content="#7657ff">',
    '<script>try{document.documentElement.dataset.theme=localStorage.getItem("site-theme")||"light"}catch(e){document.documentElement.dataset.theme="light"}</script>',
    '<link rel="stylesheet" href="/assets/styles.css">',
    options.schema ? jsonLd(options.schema) : '',
    '</head><body' + (options.bodyClass ? ' class="' + escapeHtml(options.bodyClass) + '"' : '') + '>',
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

function airportRecommendationCard(item, index) {
  const tags = item.tags.map((tag) => '<span class="tag">' + escapeHtml(tag) + '</span>').join('');
  return [
    '<article class="airport-card">',
    '<div class="airport-card-top"><span class="airport-rank">0' + (index + 1) + '</span><span class="profile-status' + (index ? ' status-blue' : '') + '">' + escapeHtml(item.badge) + '</span></div>',
    '<h2>' + escapeHtml(item.name) + '</h2>',
    '<p class="airport-summary">' + escapeHtml(item.summary) + '</p>',
    '<dl class="airport-facts"><div><dt>适合人群</dt><dd>' + escapeHtml(item.suitable) + '</dd></div><div><dt>购买前核对</dt><dd>' + escapeHtml(item.verify) + '</dd></div></dl>',
    '<div class="tag-row">' + tags + '</div>',
    '<div class="airport-card-actions"><a class="btn btn-primary" href="' + item.url + '" target="_blank" rel="sponsored noopener noreferrer">访问官网 ↗</a><a class="btn btn-ghost" href="/articles/' + item.slug + '/">阅读测评</a></div>',
    '<p class="airport-link-note">外部链接含邀请码；打开后可能先进入线路检测页。</p>',
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
  const latestCards = articles.slice(0, 6).map(articleCard).join('');
  const quickLinks = [
    ['机场推荐与测评', '光年梯、极连云测评与官网入口', '/brands/', '推荐'],
    ['IPLC 与专线', '直连、中转、BGP 和专线怎么比较', '/articles/iplc-vs-transit/', '线路'],
    ['订阅与客户端', 'Clash、小火箭与各平台导入指南', '/clients/', '配置'],
    ['地区节点选择', '香港、日本、新加坡与美国节点用途', '/regions/', '地区'],
    ['连接故障排查', '订阅失败、延迟高与网页打不开', '/questions/', '排障'],
    ['AI 工具目录', '对话、研究、办公与创作官方入口', '/ai-tools/', '工具']
  ].map((item) => '<a class="home-quick-card" href="' + item[2] + '"><span>' + item[3] + '</span><h3>' + item[0] + '</h3><p>' + item[1] + '</p><b>查看专题 →</b></a>').join('');
  const heroKeywords = [
    ['机场推荐', '/brands/'], ['机场排行', '/brands/'], ['机场测评', '/brands/'], ['IPLC 机场', '/articles/iplc-vs-transit/'],
    ['专线机场', '/articles/iplc-vs-transit/'], ['低延迟机场', '/guides/'], ['Clash 机场', '/clients/'], ['Shadowrocket 机场', '/clients/'],
    ['机场订阅', '/articles/subscription-import/'], ['节点倍率', '/articles/node-multiplier/'], ['原生 IP 机场', '/articles/native-residential-ip/'], ['ChatGPT 机场', '/guides/#scenarios'],
    ['AI 机场', '/guides/#scenarios'], ['流媒体机场', '/guides/#scenarios'], ['香港机场', '/regions/'], ['日本机场', '/regions/'],
    ['新加坡机场', '/regions/'], ['晚高峰不卡机场', '/articles/peak-hour-slow/'], ['机场优惠码', '/guides/#budget'], ['机场无法连接', '/questions/']
  ].map((item) => '<a href="' + item[1] + '">' + item[0] + '</a>').join('');
  const keywordSections = [
    ['选择与口碑', '/guides/', ['机场', '机场推荐', '机场排行', '机场测评', '机场怎么样', '机场导航', '机场大全', '好用机场', '稳定机场', '小白机场推荐']],
    ['线路与价格', '/articles/iplc-vs-transit/', ['IPLC 机场', '专线机场', '中转机场', 'BGP 机场', '直连机场', '原生 IP 机场', '住宅 IP 机场', '节点倍率', '机场价格', '高性价比机场']],
    ['客户端与订阅', '/clients/', ['Clash 机场', 'Shadowrocket 机场', 'v2rayN 机场', 'sing-box 机场', 'Windows 机场', 'Mac 机场', 'Android 机场', 'iOS 机场', '机场订阅', '订阅链接']],
    ['使用场景', '/guides/#scenarios', ['ChatGPT 机场', 'AI 机场', 'OpenAI 机场', '流媒体机场', 'TikTok 机场', 'YouTube 机场', '游戏机场', '办公机场', '跨境电商机场', '学术机场']],
    ['地区与排障', '/questions/', ['香港机场', '日本机场', '新加坡机场', '美国机场', '香港低延迟机场', '日本游戏机场', '机场无法连接', '更新订阅失败', '延迟高怎么办', 'Clash 导入订阅失败']]
  ].map((section) => '<article class="home-keyword-group"><h3><a href="' + section[1] + '">' + section[0] + ' <span>→</span></a></h3><div class="keyword-cloud">' + section[2].map((keyword) => '<a href="' + section[1] + '">' + keyword + '</a>').join('') + '</div></article>').join('');
  const content = [
    '<section class="classic-home-hero"><div class="container classic-home-grid">',
    '<figure class="network-globe"><img src="/assets/network-globe.svg" width="720" height="560" alt="全球线路与节点连接示意图"><figcaption>全球线路示意 · 非实时测速数据</figcaption></figure>',
    '<div class="classic-home-copy"><p class="eyebrow">2026 机场知识与客户端指南</p><h1>机场选择、配置与排障的长期更新指南</h1><p>持续更新机场推荐、线路原理、节点倍率、Clash 配置、流媒体与 AI 场景。推荐页现已加入光年梯与极连云，并提供独立测评和购买前核验清单。</p><div class="hero-actions"><a class="btn btn-primary" href="/brands/">查看机场推荐</a><a class="btn btn-ghost" href="/articles/">进入科学上网知识库</a></div><div class="classic-home-keywords"><span>热门关键词</span>' + heroKeywords + '<a class="more" href="/topics/">全部 148 个词 →</a></div></div>',
    '</div></section>',
    '<section class="home-quick-section"><div class="container"><div class="section-head"><div><p class="eyebrow">快速开始</p><h2 class="section-title">按你现在的问题进入</h2></div><a class="text-link" href="/topics/">浏览完整专题目录 →</a></div><div class="home-quick-grid">' + quickLinks + '</div></div></section>',
    '<section class="section home-latest"><div class="container"><div class="section-head"><div><p class="eyebrow">最近更新</p><h2 class="section-title">围绕真实问题持续补充</h2><p class="section-lead">从新手选择到订阅导入，从线路差异到晚高峰排查，每篇知识内容都保留清晰入口。</p></div><a class="text-link" href="/articles/">进入知识库 →</a></div><div class="article-grid">' + latestCards + '</div></div></section>',
    '<section class="section home-keywords"><div class="container"><div class="section-head"><div><p class="eyebrow">常用检索</p><h2 class="section-title">机场关键词与问题入口</h2><p class="section-lead">常见搜索词按主题分组，点击即可进入对应指南，不用在一长串词里寻找答案。</p></div><a class="text-link" href="/topics/">查看全部 148 个词 →</a></div><div class="home-keyword-grid">' + keywordSections + '</div></div></section>',
    '<section class="section-sm"><div class="container">' + brandBand() + '</div></section>'
  ].join('');
  return layout({
    title: config.siteName,
    description: config.description,
    path: '/',
    content,
    bodyClass: 'home-classic',
    schema: { '@context': 'https://schema.org', '@type': 'WebSite', name: config.siteName, url: config.baseUrl, description: config.description }
  });
}

function standardHero(eyebrow, title, description) {
  return '<section class="page-hero"><div class="container"><p class="eyebrow">' + escapeHtml(eyebrow) + '</p><h1>' + escapeHtml(title) + '</h1><p>' + escapeHtml(description) + '</p></div></section>';
}

function articlesPage(articles) {
  const articleMap = new Map(articles.map((article) => [article.slug, article]));
  const groups = [
    { id: 'getting-started', title: '入门与选购', description: '机场怎么选、套餐怎么比较，以及新手需要先核对什么。', slugs: ['2026-airport-guide', 'how-to-choose-airport'] },
    { id: 'airport-reviews', title: '机场测评与推荐', description: '光年梯、极连云等机场入口、适用场景和购买前检查。', slugs: ['guangnianti-review', 'jilianyun-review'] },
    { id: 'network-cost', title: '线路、IP 与流量成本', description: '理解 IPLC、中转、节点倍率、原生 IP 与住宅 IP。', slugs: ['iplc-vs-transit', 'node-multiplier', 'native-residential-ip'] },
    { id: 'clients-troubleshooting', title: '客户端、订阅与故障排查', description: '处理订阅导入、节点异常、晚高峰和连接速度问题。', slugs: ['subscription-import', 'peak-hour-slow'] }
  ];
  const sidebar = groups.map((group) => '<a href="#' + group.id + '"><span>' + escapeHtml(group.title) + '</span><b>' + group.slugs.length + '</b></a>').join('');
  const tableRows = groups.map((group) => '<tr><td><strong>' + escapeHtml(group.title) + '</strong></td><td>' + escapeHtml(group.description) + '</td><td><a class="text-link" href="#' + group.id + '">查看 ' + group.slugs.length + ' 篇 →</a></td></tr>').join('');
  const sections = groups.map((group) => {
    const entries = group.slugs.map((slug) => articleMap.get(slug)).filter(Boolean).map((article) => '<a class="knowledge-entry" data-article-card href="/articles/' + article.slug + '/"><div class="knowledge-entry-meta"><span>' + escapeHtml(article.category) + '</span><span>' + escapeHtml(article.readTime) + '</span></div><div><h3>' + escapeHtml(article.title) + '</h3><p>' + escapeHtml(article.description) + '</p></div><b aria-hidden="true">→</b></a>').join('');
    return '<section class="knowledge-section" id="' + group.id + '"><div class="knowledge-section-head"><div><h2>' + escapeHtml(group.title) + '</h2><p>' + escapeHtml(group.description) + '</p></div><span>' + group.slugs.length + ' 篇</span></div><div class="knowledge-list">' + entries + '</div></section>';
  }).join('');
  const content = '<section class="knowledge-hero"><div class="knowledge-container"><div class="crumbs"><a href="/">首页</a> / 科学上网知识库</div><p class="eyebrow">PROXY KNOWLEDGE BASE</p><h1>科学上网知识库：机场、线路、客户端与排障指南</h1><p>从机场选择和订阅导入，到线路原理、节点倍率、IP 类型与晚高峰排查，按问题分类查找答案。</p></div></section><section class="knowledge-body"><div class="knowledge-container knowledge-layout"><aside class="knowledge-sidebar"><strong>知识库分类</strong><nav>' + sidebar + '</nav><a class="knowledge-side-link" href="/topics/">查看 148 个关键词 →</a></aside><div class="knowledge-main"><div class="search-wrap knowledge-search"><input class="search-input" data-article-search type="search" placeholder="搜索知识、场景或关键词…" aria-label="搜索科学上网知识库"></div><section class="knowledge-overview"><div class="knowledge-section-head"><div><p class="eyebrow">START HERE</p><h2>知识库分类导航</h2></div></div><table class="matrix knowledge-table"><thead><tr><th>分类</th><th>适合解决的问题</th><th>入口</th></tr></thead><tbody>' + tableRows + '</tbody></table></section>' + sections + '</div></div></section>';
  return layout({ title: '科学上网知识库', description: '机场选择、线路协议、客户端订阅、IP 类型、流量倍率与网络故障排查知识库。', path: '/articles/', content, schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: '科学上网知识库', url: config.baseUrl + '/articles/' } });
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
  const content = standardHero('AIRPORT PICKS', '机场推荐入口已经迁移', '光年梯与极连云的官网入口、购买前检查项和独立测评现已集中到机场推荐页。') + '<section class="section"><div class="container"><div class="brand-band"><p class="eyebrow">NEW RECOMMENDATION PAGE</p><h2>进入 Clash 梯子推荐专题</h2><p>先阅读测评和风险提示，再根据自己的设备、地区与使用时段进行短周期测试。</p><a class="btn" href="/brands/">查看机场推荐</a></div></div></section>';
  return layout({ title: '机场推荐入口', description: '光年梯与极连云机场推荐入口。', path: '/brand/', content, noindex: true });
}

function brandsPage() {
  const cards = airportPicks.map(airportRecommendationCard).join('');
  const content = '<section class="recommend-page-hero"><div class="recommend-container"><div class="crumbs"><a href="/">首页</a> / 机场推荐</div><p class="eyebrow">CLASH AIRPORT PICKS</p><h1>Clash 梯子推荐：光年梯与极连云</h1><p>两项机场推荐均提供官网入口与独立测评。请先核对套餐、设备限制和退款规则，并优先短周期测试。</p></div></section>' + '<section class="recommend-page-body"><div class="recommend-container"><div class="affiliate-disclosure"><strong>推广说明</strong><span>本页外部链接包含邀请码，站点可能因此获得推广收益，但不会提高你的购买价格。服务信息可能变化，请以官网实时页面为准。</span></div><div class="airport-recommend-grid">' + cards + '</div><div class="recommend-method"><p class="eyebrow">HOW WE REVIEW</p><h2>推荐前先检查这三件事</h2><div class="topic-grid"><article class="topic-card"><span class="profile-status">01</span><h3>先买短周期</h3><p>先确认订阅能导入自己的客户端，再测试常用时间段，避免只因年付折扣做决定。</p></article><article class="topic-card"><span class="profile-status status-blue">02</span><h3>测试真实场景</h3><p>网页、视频、AI、办公和游戏的要求不同，不用单次测速替代连续使用体验。</p></article><article class="topic-card"><span class="profile-status status-yellow">03</span><h3>核对限制</h3><p>重点确认流量、倍率、设备数、重置日期、工单渠道和退款条件。</p></article></div></div></div></section>';
  return layout({ title: 'Clash 梯子推荐', description: '光年梯与极连云机场推荐、官网入口与独立测评。', path: '/brands/', content, schema: { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Clash 梯子推荐', numberOfItems: airportPicks.length, itemListElement: airportPicks.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: config.baseUrl + '/articles/' + item.slug + '/' })) } });
}

function comparePage() {
  const rows = [
    ['线路类型', '直连 / 中转 / BGP / IPLC', '说明入口、跨境段、出口和备用线路'],
    ['套餐成本', '月付 / 季付 / 年付', '同时计算流量、倍率、设备数和重置规则'],
    ['节点地区', '香港 / 日本 / 新加坡 / 美国等', '按真实使用场景判断，不追求数量'],
    ['IP 属性', '机房 / 原生 / 家宽 / 住宅', '区分账号风控、内容解锁与线路速度'],
    ['客户端', 'Windows / Mac / Android / iOS', '确认订阅格式和内核兼容性'],
    ['服务风险', '公告 / 工单 / 退款 / 运营时间', '保留更新时间和可验证来源']
  ].map((row) => '<tr><td><strong>' + row[0] + '</strong></td><td>' + row[1] + '</td><td>' + row[2] + '</td></tr>').join('');
  const content = standardHero('COMPARE LAB', '横向对比：不只比价格，更要比真实使用成本', '把品牌放进同一套指标里比较，避免不同套餐口径、倍率和线路名称造成误判。') + '<section class="section"><div class="container"><table class="matrix compare-table"><thead><tr><th>对比项目</th><th>常见选项</th><th>核验方法</th></tr></thead><tbody>' + rows + '</tbody></table><div class="section-sm">' + brandBand() + '</div></div></section>';
  return layout({ title: '机场横向对比', description: '机场线路、套餐、节点、IP、客户端和风险横向对比。', path: '/compare/', content });
}

function questionsPage() {
  const troubleshooting = keywordGroups.find((item) => item.id === 'troubleshooting');
  const subscription = keywordGroups.find((item) => item.id === 'subscription');
  const items = troubleshooting.keywords.concat(subscription.keywords).map((keyword, index) => '<a class="route-card question-card" href="/articles/' + (index % 2 ? 'subscription-import' : 'peak-hour-slow') + '/"><span class="route-no">Q' + String(index + 1).padStart(2, '0') + '</span><h3>' + escapeHtml(keyword) + '</h3><p>查看现象、原因和逐层检查顺序。</p></a>').join('');
  const content = standardHero('QUESTION DESK', '问题库：先找现象，再按顺序排查', '覆盖订阅失败、节点不显示、速度慢、连接超时、网页打不开和客户端配置错误。') + '<section class="section"><div class="container"><div class="route-grid">' + items + '</div></div></section>';
  return layout({ title: '机场问题库', description: '机场订阅、节点、连接、速度和客户端问题排查知识库。', path: '/questions/', content });
}

function aboutPage() {
  const content = standardHero('ABOUT THIS SITE', '关于本站：让每个结论都有更新时间和判断标准', '这是一个可持续维护的机场知识门户，内容围绕选择、线路、客户端、故障和场景展开。') + '<section class="section"><div class="container"><div class="topic-grid"><article class="topic-card"><span class="profile-status">01</span><h3>明确披露推广链接</h3><p>机场推荐页会标注邀请码与推广关系，服务价格、线路和套餐变化以官网实时信息为准。</p></article><article class="topic-card"><span class="profile-status status-blue">02</span><h3>关键词对应内容</h3><p>全部关键词按搜索意图分组，指向文章、专题、客户端或问题库。</p></article><article class="topic-card"><span class="profile-status status-yellow">03</span><h3>持续更新而非一次性页面</h3><p>文章使用独立内容文件，新增或修改后会自动更新列表、RSS 和站点地图。</p></article></div></div></section>';
  return layout({ title: '关于本站', description: 'clash梯子推荐的内容原则、更新方式和品牌政策。', path: '/about/', content });
}

function sharedIdPage() {
  const content = standardHero('ACCOUNT SAFETY', '共享 ID：安全提示与官方账号入口', '本站不公开、收集或分发他人的账号密码。共享账号容易造成设备锁定、隐私泄露和支付风险。') + '<section class="section"><div class="narrow prose"><h2>为什么不直接提供共享账号</h2><p>在设备设置中登录陌生 Apple ID、Google 账号或其他共享账号，可能同步照片、通讯录、定位和购买记录，甚至触发激活锁。更安全的方式是通过官方页面注册自己的账号。</p><h2>安全使用原则</h2><ul><li>不要在系统 iCloud 设置中登录陌生账号。</li><li>不要向任何人提供验证码、恢复密钥或付款信息。</li><li>下载客户端时优先使用项目官网或官方应用商店。</li><li>发现设备锁定提示时立即停止操作并联系官方支持。</li></ul><p><a class="btn btn-primary" href="https://account.apple.com/" target="_blank" rel="noopener">打开 Apple 官方账号页面 ↗</a></p></div></section>';
  return layout({ title: '共享 ID 安全指南', description: '共享 ID 风险提示与官方账号入口。', path: '/shared-id/', content });
}

function riskPage() {
  const signals = ['官网、备用网址和客服同时失联', '长期大额折扣并强推年付', '线路持续缩水且没有公告', '工单长时间不回复或退款规则突然变化', '频繁更换域名、收款主体或品牌名称', '测速与宣传差距显著且拒绝说明'];
  const cards = signals.map((signal, index) => '<article class="route-card risk-card"><span class="route-no">RISK ' + String(index + 1).padStart(2, '0') + '</span><h3>' + escapeHtml(signal) + '</h3><p>单个信号不能直接下结论，应结合时间、公告、用户反馈和可验证证据判断。</p></article>').join('');
  const content = standardHero('RISK WATCH', '跑路预警：记录信号，不制造未经核实的结论', '提供风险检查清单和更新时间。当前不发布没有证据支持的品牌指控。') + '<section class="section"><div class="container"><div class="notice">当前状态：暂无已核验的品牌预警记录。后续记录必须包含日期、来源和处理结果。</div><div class="route-grid risk-grid">' + cards + '</div></div></section>';
  return layout({ title: '机场跑路预警', description: '机场跑路风险信号、品牌核验与预警记录。', path: '/risk/', content });
}

function articlePage(article) {
  const toc = article.headings.filter((heading) => heading.level === 2).map((heading) => '<a href="#' + heading.id + '">' + escapeHtml(heading.text) + '</a>').join('');
  const tags = article.tags.map((tag) => '<span class="tag">' + escapeHtml(tag) + '</span>').join('');
  const content = [
    '<header class="article-header"><div class="container"><div class="crumbs"><a href="/">首页</a> / <a href="/articles/">科学上网知识库</a> / ' + escapeHtml(article.category) + '</div><div class="tag-row">' + tags + '</div><h1>' + escapeHtml(article.title) + '</h1><p class="article-deck">' + escapeHtml(article.description) + '</p><div class="article-byline"><span>更新 ' + escapeHtml(article.updated) + '</span><span>' + escapeHtml(article.readTime) + '</span><span>' + escapeHtml(config.author) + '</span></div></div></header>',
    '<div class="container article-layout"><article class="prose">' + article.html + '<div class="section-sm">' + brandBand() + '</div></article><aside class="article-aside"><strong>本页目录</strong><nav class="toc">' + toc + '</nav></aside></div>'
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
  await fs.copyFile(path.join(root, 'src', 'network-globe.svg'), path.join(outDir, 'assets', 'network-globe.svg'));

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
  await writePage('brands', brandsPage());
  await writePage('compare', comparePage());
  await writePage('questions', questionsPage());
  await writePage('about', aboutPage());
  await writePage('shared-id', sharedIdPage());
  await writePage('risk', riskPage());
  for (const article of articles) await writePage(path.join('articles', article.slug), articlePage(article));

  const fixedPaths = ['/', '/articles/', '/guides/', '/clients/', '/network/', '/regions/', '/topics/', '/ai-tools/', '/brand/', '/brands/', '/compare/', '/questions/', '/about/', '/shared-id/', '/risk/'];
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
