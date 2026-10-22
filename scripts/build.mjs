import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import config from '../site.config.mjs';
import { indexNowKey } from '../indexnow.config.mjs';
import { navItems, keywordGroups, aiGroups, clientMatrix, regionCards } from '../src/data.mjs';

const root = process.cwd();
const outDir = path.join(root, 'dist');
const contentDir = path.join(root, 'content', 'articles');
const airportPicks = [
  {
    name: '光年梯',
    slug: 'guangnianti-review',
    url: 'https://gnt001.gntvipaff.cc/#/?code=FRrxGbbY',
    coupon: 'GNT80',
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
    coupon: 'JLY888',
    badge: '推荐 02',
    summary: '适合重视多平台使用体验，并愿意在购买前核对客户端兼容、常用地区和高峰期表现的用户。',
    suitable: 'Windows、Mac、Android 与 iOS 多端候选',
    verify: '订阅格式、同时在线限制、线路说明与售后渠道',
    tags: ['极连云', '机场推荐', 'Clash 机场']
  },
  {
    name: '快狸机场',
    slug: 'kuaili-review',
    url: 'https://kaelthw.kuailiaff.com/#/?code=rnTebHGr',
    coupon: 'kl888',
    badge: '推荐 03',
    summary: '适合想先从短周期套餐开始，再验证 Clash 订阅、常用地区和多设备体验的用户。',
    suitable: 'Clash 用户、日常网页、视频与 AI 工具候选',
    verify: '优惠码生效、流量周期、节点倍率与设备数',
    tags: ['快狸机场', 'Clash 机场', '机场优惠码']
  },
  {
    name: '可信云机场',
    slug: 'kexinyun-review',
    url: 'https://xiaoyu33.kosingaff.com/#/?code=MuizUDqY',
    coupon: 'kxy80',
    badge: '推荐 04',
    summary: '适合关注套餐成本、客户端兼容性与常用线路表现，并愿意自行完成高峰期测试的用户。',
    suitable: '预算敏感用户、多端设备与日常使用候选',
    verify: '折扣后价格、套餐限制、订阅格式与退款规则',
    tags: ['可信云机场', '平价机场', '机场测评']
  },
  {
    name: '速界机场',
    slug: 'sujie-review',
    url: 'https://lqy001.speedworldaff.com/#/register?code=p3EKNmlp',
    coupon: 'sujie888',
    badge: '推荐 05',
    summary: '适合把连接速度、延迟和晚高峰稳定性作为重点，并愿意用真实任务连续测试的用户。',
    suitable: '网页、视频、远程办公与低延迟需求候选',
    verify: '节点路由、晚高峰波动、倍率与备用线路',
    tags: ['速界机场', '高速机场', '低延迟机场']
  },
  {
    name: '边缘节点机场',
    slug: 'bianyuanjiedian-review',
    url: 'https://cristyc.edgenovaaff.cc/#/register?code=WWiIvxL9',
    coupon: 'xk808',
    badge: '推荐 06',
    summary: '适合希望比较不同地区节点、路由和备用方案，并重视多场景可用性的用户。',
    suitable: '多地区节点、流媒体、AI 与跨境使用候选',
    verify: '节点地区、IP 属性、目标网站可用性与备用节点',
    tags: ['边缘节点机场', '节点机场', '机场推荐']
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

const keywordArticlePlans = {
  choose: {
    category: '选择与品牌核验',
    guideTitle: (keyword) => /怎么|如何|是否|指南|避坑/.test(keyword) ? keyword + '：从需求到试用的完整判断方法' : keyword + '怎么判断？从需求到试用的完整选择方法',
    checklistTitle: (keyword) => keyword + '核对清单：购买前需要确认的 8 个问题',
    guideDescription: (keyword) => '拆解“' + keyword + '”背后的需求、品牌核验指标、短周期试用方法与风险判断。',
    checklistDescription: (keyword) => '提供“' + keyword + '”购买前核对清单，覆盖入口、套餐、线路、售后与付款风险。',
    guideIntro: '这类搜索通常同时包含“是否适合自己”和“宣传是否可信”两个问题。不要先看口号，应先把需求、预算、设备和常用时段写清楚。',
    guideChecks: ['明确常用设备、地区和目标网站', '分别记录白天与晚高峰的实际体验', '核对设备数、倍率、退款和工单规则', '先用月付或试用验证，再决定是否延长周期'],
    checklistFocus: '运营时间、公告连续性、入口稳定性、售后响应与付款风险'
  },
  subscription: {
    category: '订阅与节点',
    guideTitle: (keyword) => keyword + '使用指南：链接、节点与更新机制一次讲清',
    checklistTitle: (keyword) => keyword + '出问题怎么办？导入、更新与连接排查清单',
    guideDescription: (keyword) => '说明“' + keyword + '”的链接、节点、客户端解析与订阅更新机制。',
    checklistDescription: (keyword) => '排查“' + keyword + '”的格式、缓存、节点分组、系统代理与连接异常。',
    guideIntro: '订阅负责把服务器信息交给客户端，节点负责实际承载连接，两者不是同一个概念。判断问题时要把链接、客户端解析、节点状态和本地网络分开。',
    guideChecks: ['确认链接完整且没有多余空格', '核对客户端支持的订阅格式与内核版本', '更新后检查节点数量、分组和更新时间', '在可信设备中保存订阅，不公开分享完整地址'],
    checklistFocus: '订阅有效期、导入格式、更新缓存、节点分组与系统代理'
  },
  scenarios: {
    category: '使用场景',
    guideTitle: (keyword) => keyword + '怎么选？按线路、地区与 IP 类型匹配场景',
    checklistTitle: (keyword) => keyword + '可用性检查：速度正常却打不开时怎么处理',
    guideDescription: (keyword) => '分析“' + keyword + '”需要的地区、线路、IP 属性与连续稳定性。',
    checklistDescription: (keyword) => '检查“' + keyword + '”的地区、DNS、账号条件、IP 属性与目标服务限制。',
    guideIntro: '网页、AI、流媒体、直播与跨境办公对线路的要求不同。速度只是基础，目标地区、IP 属性、账号风控和连续稳定性同样重要。',
    guideChecks: ['确认目标服务支持的地区与账号条件', '使用实际账号测试登录、播放或提交任务', '比较常用时间段的连续稳定性而非单次峰值', '准备备用地区与备用节点，避免单点依赖'],
    checklistFocus: '目标地区、IP 属性、DNS、账号地区、版权限制与连续连接'
  },
  price: {
    category: '价格与套餐',
    guideTitle: (keyword) => keyword + '：套餐、流量与倍率成本指南',
    checklistTitle: (keyword) => keyword + '购买清单：低价、折扣与长期套餐的风险点',
    guideDescription: (keyword) => '计算“' + keyword + '”的套餐周期、流量、节点倍率与真实使用成本。',
    checklistDescription: (keyword) => '核对“' + keyword + '”的续费价格、流量重置、设备数、折扣与退款条件。',
    guideIntro: '标价不能代表真实成本。比较套餐时还要计算流量、节点倍率、重置日期、设备数和实际可用线路，避免只看月均价格。',
    guideChecks: ['把月付价格换算成每 GB 可用流量成本', '确认高倍率节点会如何扣减流量', '核对流量重置日期与未用流量是否结转', '长期套餐只在短周期验证后再考虑'],
    checklistFocus: '付款周期、倍率、流量重置、设备限制、续费价格与退款条件'
  },
  network: {
    category: '线路与网络',
    guideTitle: (keyword) => keyword + '：线路、IP、倍率与审计选择指南',
    checklistTitle: (keyword) => keyword + '核验清单：宣传名词如何转成可测试指标',
    guideDescription: (keyword) => '解释“' + keyword + '”涉及的接入、跨境段、出口、IP、倍率与审计规则。',
    checklistDescription: (keyword) => '把“' + keyword + '”的线路宣传转成延迟、丢包、回程、倍率和备用线路检查项。',
    guideIntro: '线路名称不能单独证明质量。入口、跨境段、出口、回程、IP 属性和拥塞控制共同决定体验，需要把宣传术语转成可观察的结果。',
    guideChecks: ['确认线路名称对应的实际接入和出口说明', '在相同设备与网络下比较延迟、丢包和波动', '区分原生、家宽、住宅与普通机房 IP 的用途', '理解倍率、审计和可接受使用规则'],
    checklistFocus: '接入方式、跨境段、出口地区、IP 属性、倍率、日志与备用线路'
  },
  protocols: {
    category: '协议与客户端',
    guideTitle: (keyword) => keyword + '配置指南：客户端、协议与多设备怎么匹配',
    checklistTitle: (keyword) => keyword + '故障排查：导入失败、无节点与设备限制',
    guideDescription: (keyword) => '说明“' + keyword + '”与客户端、协议、订阅格式、系统权限和多设备规则的关系。',
    checklistDescription: (keyword) => '排查“' + keyword + '”的版本来源、内核兼容、系统代理、权限与设备限制。',
    guideIntro: '客户端、协议和订阅格式必须互相兼容。安装成功不等于配置正确，还要检查内核、系统代理、VPN 权限、后台运行和设备数量限制。',
    guideChecks: ['只从项目官网或可信应用商店获取客户端', '核对订阅格式与客户端内核是否兼容', '检查系统代理、VPN 权限和后台运行限制', '多设备使用前确认同时在线规则'],
    checklistFocus: '版本来源、内核兼容、系统权限、代理模式、设备数与订阅更新'
  },
  regions: {
    category: '地区与节点',
    guideTitle: (keyword) => keyword + '选择指南：延迟、回程、IP 与场景怎么平衡',
    checklistTitle: (keyword) => keyword + '测试清单：如何判断节点是否真的适合你',
    guideDescription: (keyword) => '从物理距离、回程、晚高峰、IP 属性和目标服务分析“' + keyword + '”。',
    checklistDescription: (keyword) => '测试“' + keyword + '”的延迟、波动、入口运营商、内容可用性与备用节点。',
    guideIntro: '节点地区越多不代表越好。物理距离影响基础延迟，线路与回程影响波动，IP 属性和目标服务规则决定实际可用性。',
    guideChecks: ['优先测试地理位置较近且路由稳定的地区', '用自己的运营商网络观察晚高峰波动', '验证目标网站、流媒体或账号服务是否可用', '至少准备一个不同地区的备用节点'],
    checklistFocus: '物理距离、入口运营商、回程、晚高峰、IP 属性与目标服务地区'
  },
  compare: {
    category: '方案对比',
    guideTitle: (keyword) => keyword + '完整对比：成本、维护与适用人群',
    checklistTitle: (keyword) => keyword + '怎么选？用 6 个问题确定更合适的方案',
    guideDescription: (keyword) => '对比“' + keyword + '”涉及的成本、维护、隐私、设备数量与故障责任。',
    checklistDescription: (keyword) => '用价格、维护、隐私、迁移和长期可控性判断“' + keyword + '”。',
    guideIntro: '不同网络方案解决的问题、维护成本和责任边界并不相同。比较时应统一需求和时间周期，而不是只对照价格或某个速度数字。',
    guideChecks: ['比较初始费用与持续维护时间', '明确谁负责线路、客户端和故障处理', '评估设备数量、共享需求与技术能力', '考虑备用方案、迁移成本和合规要求'],
    checklistFocus: '价格、维护、隐私、设备、故障责任、迁移与长期可控性'
  },
  troubleshooting: {
    category: '故障排查',
    guideTitle: (keyword) => keyword.endsWith('怎么办') ? keyword + '：从本地网络到节点的逐层排查' : keyword + '怎么办？从本地网络到节点的逐层排查',
    checklistTitle: (keyword) => keyword + '快速修复清单：现象、原因与验证步骤',
    guideDescription: (keyword) => '针对“' + keyword + '”按本地网络、客户端、订阅、节点、DNS 和目标网站逐层排查。',
    checklistDescription: (keyword) => '整理“' + keyword + '”的快速验证步骤、常见原因与单变量排障方法。',
    guideIntro: '排障最重要的是一次只改变一个变量。先确认本地网络，再检查客户端、订阅、节点、DNS 和目标网站，避免反复重装却没有定位原因。',
    guideChecks: ['先确认普通网站和本地网络是否正常', '检查客户端日志、系统时间、代理模式和权限', '更新订阅并更换不同地区或不同线路节点', '区分全局故障、单站限制与账号问题'],
    checklistFocus: '本地网络、系统时间、客户端日志、订阅状态、节点、DNS 与目标网站'
  }
};

function keywordArticleSlug(groupId, keywordIndex, type) {
  return 'keyword-' + groupId + '-' + String(keywordIndex + 1).padStart(2, '0') + '-' + type;
}

function keywordArticlePath(groupId, keyword, type = 'guide') {
  const group = keywordGroups.find((item) => item.id === groupId);
  const index = group ? group.keywords.indexOf(keyword) : -1;
  if (index < 0) return '/articles/';
  return '/articles/' + keywordArticleSlug(groupId, index, type) + '/';
}

function removeMarkdownSections(markdown, headings) {
  let result = markdown;
  for (const heading of headings) {
    const marker = '\n## ' + heading + '\n';
    const start = result.indexOf(marker);
    if (start < 0) continue;
    const next = result.indexOf('\n## ', start + marker.length);
    result = result.slice(0, start) + (next < 0 ? '' : result.slice(next));
  }
  return result;
}

function buildKeywordGuideMarkdown({ group, plan, keyword, checklistSlug }) {
  const checks = plan.guideChecks.map((item) => '- **' + item + '**：围绕“' + keyword + '”记录真实结果，同时注明测试日期、设备、客户端、本地运营商、节点地区和测试时段。').join('\n');
  const markdown = [
    '> 本文解释“' + keyword + '”的判断方法，不承诺永久稳定、永久解锁或任何无法持续验证的结果。网络服务、套餐和目标平台规则都可能变化，请以实际测试与官网实时说明为准。',
    '',
    '## 先理解“' + keyword + '”在解决什么问题',
    '',
    plan.guideIntro + ' 搜索“' + keyword + '”时，建议先写下最重要的一个使用目标，再决定比较哪些指标。',
    '',
    '“' + keyword + '”不是一个可以只靠名称判断的固定产品参数。相同的宣传词，在不同服务商、不同线路和不同用户网络下，可能对应完全不同的体验。真正需要回答的是：它是否适合你的设备、所在地区、常用时段和目标网站，以及出现问题后是否有清楚的替代方案。',
    '',
    '开始比较前，可以把需求分成“必须满足”“最好具备”和“暂时不重要”三层。必须满足的项目只保留两到三项，例如工作日需要连续连接、某个客户端必须兼容、常用地区必须有备用节点。优先级越清楚，越不容易被节点数量、折扣倒计时或单次测速结果带偏。',
    '',
    '还要区分功能存在和功能可长期使用。页面写有某项功能，只能说明服务商声称提供；只有在你的账号、客户端、本地网络和真实任务中连续验证，才能说明它当前可用。判断“' + keyword + '”时，应把宣传页当作待验证清单，而不是最终结论。',
    '',
    '## 四个需要实际核对的核心指标',
    '',
    checks,
    '',
    '这四项最好在同一测试窗口内完成。比如先固定一台设备、一个客户端和一个本地网络，再依次更换节点或线路。若测试过程中同时切换 Wi-Fi、客户端、DNS 和节点，即使结果变好，也很难知道是哪一个变量起作用。',
    '',
    '指标也要和任务相匹配。网页浏览重视连接成功率和响应时间；长时间办公重视掉线、重连和上传稳定性；视频关注持续带宽和缓冲；游戏更在意延迟、抖动和丢包。不要用一个速度数字代替所有场景。',
    '',
    '## 测试前先建立自己的基线',
    '',
    '基线是没有切换服务或节点时，本地网络本身的表现。先记录普通网站能否打开、下载和上传是否正常、系统时间是否准确、当前 DNS 与客户端版本是什么。这样遇到“' + keyword + '”相关异常时，可以判断问题来自本地网络、客户端配置，还是远端节点。',
    '',
    '建议准备一张简单记录表，至少包含日期、测试时段、设备、系统版本、客户端版本、本地运营商、节点名称、节点地区、目标网站、连续使用时间和异常现象。没有这些条件，几天后很容易只记得“好像变慢了”，却无法比较变化。',
    '',
    '如果服务提供试用或月付，应先使用短周期。短周期的目的不是寻找一次最快的成绩，而是观察多个时段的稳定性、流量扣减是否符合说明、节点故障后是否有备用方案，以及售后信息是否清楚。',
    '',
    '## 一套可重复的七步测试方法',
    '',
    '1. **确定任务**：选择两到三个真实任务，例如打开常用网页、连续播放视频、登录 AI 工具、上传文件或保持远程会议，不要只运行测速工具。',
    '2. **固定环境**：使用日常设备、本地网络和客户端，关闭会干扰结果的下载、同步和系统更新。',
    '3. **测试多个时段**：至少覆盖白天、工作日晚高峰和周末。每个时段执行相同任务，观察结果是否一致。',
    '4. **一次更换一个变量**：先换节点，再考虑线路、客户端或 DNS。每次更换后重复同一任务并记录差异。',
    '5. **观察连续使用**：保持连接一段时间，记录掉线、重连、速度波动、页面失败和流量消耗，不要只看连接瞬间。',
    '6. **验证备用方案**：主动切换备用地区或备用线路，确认主节点不可用时能否快速恢复。',
    '7. **形成结论**：把“可用”“偶尔异常”“不适合”写成明确结论，并注明适用的设备、时段和任务范围。',
    '',
    '测试“' + keyword + '”时，连续性比峰值更有参考价值。某个节点偶尔出现很高速度，并不能证明晚高峰也稳定；某次目标网站无法打开，也不能立即证明整个服务失效。需要通过重复测试判断它是偶发波动、单个节点问题、目标网站限制，还是整体线路故障。',
    '',
    '## 三类常见使用场景怎么判断',
    '',
    '- **日常网页与移动设备**：关注连接速度、自动重连、电池消耗和不同网络之间切换是否顺畅。与“' + keyword + '”相关的功能如果需要频繁手动处理，长期使用成本会高于表面价格。',
    '- **办公、学习与跨境任务**：关注长连接、上传、视频会议、账号登录和多设备规则。重要任务应准备备用节点，不能只依赖单一地区或单一入口。',
    '- **流媒体、AI、直播或游戏**：除了速度，还要验证地区、IP 属性、DNS、账号规则、延迟和抖动。一个场景可用，不代表其他场景自动可用。',
    '',
    '场景测试应使用自己的账号和真实操作，但不要在来历不明的客户端或共享设备上输入重要密码。涉及支付、公司数据、客户资料或学术账号时，应优先遵守组织安全要求，并确认服务条款允许相应使用方式。',
    '',
    '## 如何阅读宣传、排行榜与测评',
    '',
    '宣传页适合确认套餐范围、线路名称、支持客户端和规则入口，测评适合学习测试方法，但二者都不能替代你的环境。涉及“' + keyword + '”的结论，应注明日期、设备、本地运营商、节点、测试时段和限制；缺少这些条件的速度或解锁结论，只能作为线索。',
    '',
    '阅读排行榜时先看评价标准是否透明。如果只有名次和购买按钮，没有说明样本、时间、失败记录和更新日期，就无法判断排序是否适合你。更可靠的做法是把榜单中的候选放进同一张自己的核对表，用相同任务和时段测试。',
    '',
    '对于“永久稳定”“所有平台解锁”“不限设备且完全不限速”等绝对表述，应保持谨慎。网络线路、目标平台规则和运营成本都会变化，负责任的说明通常会写出限制、更新时间和故障处理方式。',
    '',
    '## 常见误区与修正方法',
    '',
    '1. **只看节点数量**：节点多不等于可用节点多。应检查常用地区、备用线路和晚高峰表现。',
    '2. **只看最低价格**：低价可能伴随高倍率、较少流量、设备限制或较弱售后，需要计算真实成本。',
    '3. **把延迟当成速度**：低延迟有利于交互，但下载、视频和上传还受带宽、丢包与拥塞影响。',
    '4. **一次测试就下结论**：单次结果容易受本地网络、节点负载和目标网站影响，应跨时段重复。',
    '5. **遇到异常就重装**：反复重装会丢失日志和配置。应先保留现场，再按本地网络、客户端、订阅、节点和目标网站逐层检查。',
    '6. **先买长期套餐再测试**：折扣不能抵消不适用的风险。先月付或试用，验证后再决定周期。',
    '',
    '## 成本、维护与风险应该一起计算',
    '',
    '“' + keyword + '”的真实成本不只是付款金额，还包括流量倍率、设备数量、需要手动切换的次数、排障时间和备用方案成本。便宜但频繁中断的方案，可能比价格稍高但稳定的方案消耗更多时间。',
    '',
    '长期套餐应额外考虑运营变化。入口域名、线路供应、付款方式和目标平台规则都可能调整。即使短期测试良好，也建议保留配置备份、备用网址获取方式和替代服务清单，不要把重要任务绑定在单一入口上。',
    '',
    '如果页面信息缺少更新时间、退款条件、设备限制或流量规则，可以先向客服确认并保存答复。无法核实的重要信息不应靠猜测补齐，更不应因为倒计时或限量提示匆忙付款。',
    '',
    '## 用记录表形成自己的结论',
    '',
    '完成测试后，不要只写“好用”或“不好用”。更有效的结论是：“在某设备、某本地网络和某时段下，指定任务连续使用多久，出现过哪些问题，切换什么变量后恢复”。这样的记录能够帮助你下次复测，也能避免把偶发问题误判为长期质量。',
    '',
    '- 基本环境：设备、系统、客户端版本、本地运营商。',
    '- 测试条件：日期、时段、节点地区、线路名称、代理模式。',
    '- 真实任务：访问、播放、上传、登录、会议或游戏。',
    '- 观察结果：成功率、连续时间、延迟、波动、掉线和流量扣减。',
    '- 最终决定：继续试用、保留备用、短期续费或更换方案。',
    '',
    '## 关于“' + keyword + '”的常见问题',
    '',
    '### 是否应该直接选择年付',
    '',
    '不建议只因为折扣直接年付。先完成至少一个晚高峰和一个周末的真实场景测试，确认订阅、客户端、流量、设备数和售后规则都符合需求，再评估长期周期。',
    '',
    '### 测速很好为什么实际使用仍然卡',
    '',
    '测速服务器、目标网站和实际业务路径可能不同。还要检查丢包、抖动、DNS、IP 属性、目标平台限制和本地网络拥塞，不能只看峰值带宽。',
    '',
    '### 某个节点失败是否代表服务不可用',
    '',
    '不一定。先测试同地区其他节点、不同线路和不同目标网站。如果只有单节点失败，通常应先按节点故障处理；如果所有节点和目标都失败，再检查订阅、客户端与服务状态。',
    '',
    '### 多久应该重新评估一次',
    '',
    '当套餐、线路、客户端版本、本地运营商或主要使用场景变化时，都应重新评估。即使没有明显变化，也可以定期抽查晚高峰、备用节点和流量扣减是否仍符合预期。',
    '',
    '## 下一步建议',
    '',
    '继续阅读同主题的[' + keyword + '排查清单](/articles/' + checklistSlug + '/)，按照清单完成一次真实测试。也可以返回[' + group.title + '](' + group.href + ')查看同类问题，或浏览[科学上网知识库](/articles/)寻找客户端、线路和故障排查内容。'
  ].join('\n');
  return removeMarkdownSections(markdown, [
    '三类常见使用场景怎么判断',
    '如何阅读宣传、排行榜与测评',
    '成本、维护与风险应该一起计算',
    '关于“' + keyword + '”的常见问题'
  ]);
}

function buildKeywordChecklistMarkdown({ group, plan, keyword, guideSlug }) {
  const markdown = [
    '> 这份清单用于系统核对“' + keyword + '”。遇到异常时按顺序检查，每完成一步再观察结果；不要同时更换多个变量，也不要在排障前删除日志和原配置。',
    '',
    '## 开始检查前先保留现场',
    '',
    '先截图或记录错误提示、客户端日志、当前节点、代理模式、订阅更新时间和系统时间。很多问题在重启或重新导入后会暂时消失，如果没有保留现场，就很难判断真正原因。',
    '',
    '确认故障范围也很重要。分别测试普通网站、多个目标网站、同地区其他节点和不同本地网络，判断是全部连接失败、单个目标失败、单个节点异常，还是只有某台设备异常。范围越明确，后续步骤越少。',
    '',
    '与“' + keyword + '”有关的检查重点包括：' + plan.checklistFocus + '。把这些项目写进记录表，并注明哪些已经验证、哪些仍然只是服务商说明，避免把未验证信息当成事实。',
    '',
    '## 购买或使用前的八项检查',
    '',
    '- **需求是否明确**：写清常用设备、本地网络、目标地区、常用网站、每日使用时长和可接受预算。没有需求基线，就无法判断“' + keyword + '”是否适合。',
    '- **入口是否可信**：官网、备用网址、公告和订阅入口应能相互验证。不要从陌生群聊、搜索广告或转发截图直接输入账号和付款信息。',
    '- **套餐是否透明**：核对流量、倍率、设备数、重置日期、续费价格、自动续费和退款条件，确认展示价格是否包含全部限制。',
    '- **线路是否可说明**：了解入口、出口、地区、备用节点和高峰期处理方式。线路名称本身不能证明速度或稳定性。',
    '- **客户端是否兼容**：确认订阅格式、内核版本、操作系统和代理模式能够配合，优先从项目官网或可信应用商店安装。',
    '- **是否允许短期测试**：优先选择试用或月付，在自己的真实环境中测试，而不是只看演示视频或他人截图。',
    '- **售后边界是否清楚**：检查工单、公告、故障通知、退款范围和回复时效，保存与重要规则有关的页面或答复。',
    '- **风险信号是否可接受**：警惕绝对承诺、强推长期套餐、频繁更换品牌或入口、规则缺少日期、无法解释流量扣减等情况。',
    '',
    '完成八项检查后，可以把每项标记为“已验证”“仅有说明”“不符合”三种状态。核心需求中只要出现一个“不符合”，就不应因为低价、赠送流量或限时折扣忽略它。',
    '',
    '## 出现问题时的七步排查顺序',
    '',
    '1. **检查本地网络**：关闭代理后测试普通网站，确认 Wi-Fi、移动网络、路由器和运营商连接是否正常。必要时切换另一种本地网络做对照。',
    '2. **检查系统环境**：确认系统时间、VPN 权限、后台运行、电池优化、防火墙和安全软件没有阻止客户端。',
    '3. **检查客户端状态**：查看内核是否启动、代理模式是否正确、系统代理是否生效、日志中是否出现解析或连接错误。',
    '4. **检查订阅信息**：确认订阅没有过期、链接完整、更新时间正常，更新前先备份原配置，避免覆盖可用节点。',
    '5. **检查节点和线路**：测试同地区其他节点、不同地区和不同线路，区分单节点故障、地区故障与整体故障。',
    '6. **检查 DNS 与目标网站**：如果只有部分网站异常，比较域名解析、浏览器缓存、账号地区、IP 属性和目标服务规则。',
    '7. **查看服务公告并提交工单**：提供时间、设备、运营商、客户端、节点、错误信息和已完成步骤，减少来回询问。',
    '',
    '排查“' + keyword + '”时，每一步都要记录“操作前现象、改变了什么、操作后结果”。如果切换本地网络后恢复，重点应放在路由器、运营商或 DNS；如果所有本地网络都失败但更换节点后恢复，重点通常在节点或线路。',
    '',
    '## 对本类问题需要额外深挖什么',
    '',
    plan.guideIntro + ' 因此，除了通用排查，还要围绕“' + keyword + '”核对与类别直接相关的指标。',
    '',
    plan.guideChecks.map((item) => '- **' + item + '**：不要只确认“有没有”，还要记录在什么设备、节点、时段和任务中验证，以及失败时使用什么备用方案。').join('\n'),
    '',
    '如果服务商使用了专业术语，应要求它能对应到可观察结果。例如“稳定”要对应连续使用和掉线记录，“高速”要对应真实目标的持续传输，“低延迟”要同时观察抖动和丢包，“解锁”要注明地区、账号条件和测试日期。',
    '',
    '## 三种典型故障场景',
    '',
    '### 场景一：所有节点都无法连接',
    '',
    '先检查本地网络、系统时间、客户端内核和订阅状态，再查看服务公告。不要一开始就删除客户端。若另一台设备或另一种本地网络可以使用，说明问题更可能在当前设备、权限或网络环境。',
    '',
    '### 场景二：节点能连接但目标网站打不开',
    '',
    '分别测试多个普通网站与多个目标网站。如果只有一个目标异常，检查 DNS、浏览器缓存、账号地区、IP 属性和目标平台限制；如果同节点所有网站都异常，再更换节点和线路。',
    '',
    '### 场景三：白天正常，晚高峰明显变慢',
    '',
    '固定设备和任务，分别记录白天与晚高峰结果。比较同地区不同节点、不同线路和本地网络，观察延迟、丢包、持续带宽与掉线。若只在固定时段出现，通常需要重点关注拥塞和容量，而不是反复修改客户端。',
    '',
    '## 六个容易浪费时间的误区',
    '',
    '1. 一看到错误就重装，导致日志、订阅更新时间和原配置全部丢失。',
    '2. 同时更换节点、客户端、DNS 和本地网络，无法确定哪个操作有效。',
    '3. 只跑一次测速，不测试真实网站、上传、播放、登录或连续连接。',
    '4. 把单个节点故障扩大为整个服务失效，或把单站限制误判为线路故障。',
    '5. 只关注价格和节点数，忽略倍率、设备数、重置日、售后与备用线路。',
    '6. 故障刚恢复就停止检查，没有验证多个时段，也没有保留可用配置。',
    '',
    '## 恢复连接后还要做三次验证',
    '',
    '第一次验证原来的故障任务，确认不是只恢复了普通网页；第二次切换备用节点，确认主节点再次异常时有替代路径；第三次在另一个时段复测，确认恢复不是短暂现象。',
    '',
    '恢复后不要立刻清空日志。记录最终有效的操作，并将无效操作也保留下来。下次出现相似问题时，可以先执行最可能有效的步骤，避免重复试错。',
    '',
    '如果故障涉及账号、付款、隐私或公司数据，应优先停止敏感操作。连接恢复不代表账号风险已经解除，需要另外检查登录记录、授权设备、密码和服务条款。',
    '',
    '## 建议保存的排障记录模板',
    '',
    '- 日期与具体时间，是否处于晚高峰或周末。',
    '- 设备、操作系统、客户端和内核版本。',
    '- 本地运营商、Wi-Fi 或移动网络、是否更换过路由器。',
    '- 订阅更新时间、套餐状态、剩余流量和节点数量。',
    '- 节点名称、地区、线路类型、代理模式和 DNS 设置。',
    '- 目标网站、实际任务、错误提示和客户端日志摘要。',
    '- 已执行步骤、每一步结果、最终恢复方式和备用方案。',
    '',
    '记录中不要公开完整订阅链接、密码、验证码、付款信息或包含身份信息的日志。向客服提交问题时，只提供解决问题所需的最少信息，并对截图中的敏感字段进行遮挡。',
    '',
    '## 什么时候应该继续使用，什么时候应该更换',
    '',
    '偶发单节点故障且备用节点能快速恢复，通常可以继续观察；多个时段反复出现相同问题、主要任务长期无法完成、规则与流量扣减无法解释、售后没有有效回应时，应降低续费周期并准备替代方案。',
    '',
    '不要用已经支付的金额作为继续使用的唯一理由。决策应基于未来的可用性、排障时间和任务风险。对于重要办公或业务场景，备用方案的成本应提前计入，而不是等到故障发生后再临时寻找。',
    '',
    '如果“' + keyword + '”仍然无法通过重复测试得到稳定结论，可以保留短周期观察，但不宜增加长期投入。能够清楚解释限制、提供更新记录并支持可复现测试，比夸张宣传更值得参考。',
    '',
    '## 关于“' + keyword + '”的常见问题',
    '',
    '### 更新订阅会不会丢失原配置',
    '',
    '部分客户端更新订阅时会覆盖同名配置。操作前先导出或复制当前可用配置，记录策略组和自定义规则，确认新订阅可用后再删除备份。',
    '',
    '### 更换 DNS 能解决所有打不开的问题吗',
    '',
    '不能。DNS 只负责域名解析的一部分问题。节点不可达、IP 被限制、账号地区不符、代理模式错误或目标网站故障，都不是单纯更换 DNS 可以解决的。',
    '',
    '### 是否应该同时安装多个客户端',
    '',
    '排障时可以使用可信客户端做对照，但不建议让多个客户端同时接管系统代理或 VPN。应一次只运行一个，并记录版本与配置来源，避免端口和系统代理冲突。',
    '',
    '### 没有错误提示应该怎么查',
    '',
    '先从现象范围开始：哪些网站失败、哪些节点失败、哪些设备失败、从什么时候开始。再查看客户端连接日志、系统代理状态和订阅更新时间，通过对照测试逐步缩小范围。',
    '',
    '## 相关阅读',
    '',
    '先看[' + keyword + '完整指南](/articles/' + guideSlug + '/)，理解选择和测试标准；再到[' + group.title + '](' + group.href + ')查看同类关键词，或返回[专题目录](/topics/#' + group.id + ')继续查找相关指南。'
  ].join('\n');
  return removeMarkdownSections(markdown, [
    '三种典型故障场景',
    '恢复连接后还要做三次验证',
    '什么时候应该继续使用，什么时候应该更换',
    '关于“' + keyword + '”的常见问题'
  ]);
}

function generatedKeywordArticles() {
  return keywordGroups.flatMap((group) => {
      const plan = keywordArticlePlans[group.id];
    return group.keywords.flatMap((keyword, keywordIndex) => {
      const guideSlug = keywordArticleSlug(group.id, keywordIndex, 'guide');
      const checklistSlug = keywordArticleSlug(group.id, keywordIndex, 'checklist');
      const guideMarkdown = buildKeywordGuideMarkdown({ group, plan, keyword, checklistSlug });
      const checklistMarkdown = buildKeywordChecklistMarkdown({ group, plan, keyword, guideSlug });
      return [
        { slug: guideSlug, title: plan.guideTitle(keyword), description: plan.guideDescription(keyword), category: plan.category, date: '2026-10-01', updated: '2026-10-22', readTime: '11 分钟', tags: [keyword, group.title, '实用指南'], featured: false, generated: true, keyword, keywordGroupId: group.id, ...markdownToHtml(guideMarkdown) },
        { slug: checklistSlug, title: plan.checklistTitle(keyword), description: plan.checklistDescription(keyword), category: plan.category, date: '2026-09-30', updated: '2026-10-22', readTime: '10 分钟', tags: [keyword, group.title, '排查清单'], featured: false, generated: true, keyword, keywordGroupId: group.id, ...markdownToHtml(checklistMarkdown) }
      ];
    });
  });
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
    '<div class="airport-coupon"><span>优惠码</span><code>' + escapeHtml(item.coupon) + '</code><button type="button" data-copy-code="' + escapeHtml(item.coupon) + '" aria-label="复制' + escapeHtml(item.name) + '优惠码">复制</button></div>',
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
  const latestCards = articles.filter((article) => !article.generated).slice(0, 6).map(articleCard).join('');
  const quickLinks = [
    ['机场推荐与测评', '6 个机场的优惠码、独立测评与官网入口', '/brands/', '推荐'],
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
    '<div class="classic-home-copy"><p class="eyebrow">2026 机场知识与客户端指南</p><h1>机场选择、配置与排障的长期更新指南</h1><p>持续更新机场推荐、线路原理、节点倍率、Clash 配置、流媒体与 AI 场景。推荐页已收录 6 个机场的官网入口、优惠码、独立测评和购买前核验清单。</p><div class="hero-actions"><a class="btn btn-primary" href="/brands/">查看机场推荐</a><a class="btn btn-ghost" href="/articles/">进入科学上网知识库</a></div><div class="classic-home-keywords"><span>热门关键词</span>' + heroKeywords + '<a class="more" href="/topics/">全部 148 个词 →</a></div></div>',
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
  const editorialGroups = [
    { id: 'getting-started', title: '入门与选购', description: '机场怎么选、套餐怎么比较，以及新手需要先核对什么。', slugs: ['2026-airport-guide', 'how-to-choose-airport'] },
    { id: 'airport-reviews', title: '机场测评与推荐', description: '6 个机场的官网入口、优惠码、适用场景和购买前检查。', slugs: ['guangnianti-review', 'jilianyun-review', 'kuaili-review', 'kexinyun-review', 'sujie-review', 'bianyuanjiedian-review'] },
    { id: 'network-cost', title: '线路、IP 与流量成本', description: '理解 IPLC、中转、节点倍率、原生 IP 与住宅 IP。', slugs: ['iplc-vs-transit', 'node-multiplier', 'native-residential-ip'] },
    { id: 'clients-troubleshooting', title: '客户端、订阅与故障排查', description: '处理订阅导入、节点异常、晚高峰和连接速度问题。', slugs: ['subscription-import', 'peak-hour-slow'] }
  ].map((group) => ({ ...group, articles: group.slugs.map((slug) => articleMap.get(slug)).filter(Boolean) }));
  const generatedGroups = keywordGroups.map((group) => ({
    id: 'keyword-' + group.id,
    title: group.title,
    description: group.description + ' 每个关键词包含实用指南与排查清单。',
    articles: articles.filter((article) => article.generated && article.keywordGroupId === group.id)
  }));
  const groups = editorialGroups.concat(generatedGroups);
  const sidebar = groups.map((group) => '<a href="#' + group.id + '"><span>' + escapeHtml(group.title) + '</span><b>' + group.articles.length + '</b></a>').join('');
  const tableRows = groups.map((group) => '<tr><td><strong>' + escapeHtml(group.title) + '</strong></td><td>' + escapeHtml(group.description) + '</td><td><a class="text-link" href="#' + group.id + '">查看 ' + group.articles.length + ' 篇 →</a></td></tr>').join('');
  const sections = groups.map((group) => {
    const entries = group.articles.map((article) => '<a class="knowledge-entry" data-article-card href="/articles/' + article.slug + '/"><div class="knowledge-entry-meta"><span>' + escapeHtml(article.category) + '</span><span>' + escapeHtml(article.readTime) + '</span></div><div><h3>' + escapeHtml(article.title) + '</h3><p>' + escapeHtml(article.description) + '</p></div><b aria-hidden="true">→</b></a>').join('');
    return '<section class="knowledge-section" data-knowledge-section id="' + group.id + '"><div class="knowledge-section-head"><div><h2>' + escapeHtml(group.title) + '</h2><p>' + escapeHtml(group.description) + '</p></div><span>' + group.articles.length + ' 篇</span></div><div class="knowledge-list">' + entries + '</div></section>';
  }).join('');
  const content = '<section class="knowledge-hero"><div class="knowledge-container"><div class="crumbs"><a href="/">首页</a> / 科学上网知识库</div><p class="eyebrow">PROXY KNOWLEDGE BASE / ' + articles.length + ' ARTICLES</p><h1>科学上网知识库：机场、线路、客户端与排障指南</h1><p>148 个关键词均已扩展为实用指南与排查清单，并保留机场测评、线路原理和客户端教程等编辑精选内容。</p></div></section><section class="knowledge-body"><div class="knowledge-container knowledge-layout"><aside class="knowledge-sidebar"><strong>知识库分类</strong><nav>' + sidebar + '</nav><a class="knowledge-side-link" href="/topics/">查看 148 个关键词 →</a></aside><div class="knowledge-main"><div class="search-wrap knowledge-search"><input class="search-input" data-article-search type="search" placeholder="搜索知识、场景或关键词…" aria-label="搜索科学上网知识库"></div><div class="knowledge-empty" data-article-empty hidden>没有找到匹配的文章，请尝试更短的关键词。</div><section class="knowledge-overview"><div class="knowledge-section-head"><div><p class="eyebrow">START HERE</p><h2>知识库分类导航</h2></div></div><table class="matrix knowledge-table"><thead><tr><th>分类</th><th>适合解决的问题</th><th>入口</th></tr></thead><tbody>' + tableRows + '</tbody></table></section>' + sections + '</div></div></section>';
  return layout({ title: '科学上网知识库', description: '机场选择、线路协议、客户端订阅、IP 类型、流量倍率与网络故障排查知识库。', path: '/articles/', content, schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: '科学上网知识库', url: config.baseUrl + '/articles/' } });
}

function guidesPage() {
  const groups = keywordGroups.filter((group) => ['choose', 'scenarios', 'price', 'compare'].includes(group.id));
  const blocks = groups.map((group) => '<article class="topic-card" id="' + group.id + '"><h3>' + escapeHtml(group.title) + '</h3><p>' + escapeHtml(group.description) + '</p><div class="keyword-cloud">' + group.keywords.map((keyword) => '<a href="' + keywordArticlePath(group.id, keyword) + '">' + escapeHtml(keyword) + '</a>').join('') + '</div></article>').join('');
  const content = standardHero('CHOOSING GUIDE', '机场怎么选：先做需求题，再看价格表', '适合新手的选择框架。把“稳定、高速、便宜”拆成可测试的线路、时段、IP、设备和流量指标。') + '<section class="section"><div class="container"><div class="topic-grid">' + blocks + '</div><div class="section-sm" id="needs"><div class="notice">建议先买月付或试用，分别在工作日、周末和晚高峰测试自己的常用网站。不要只用测速数字替代真实体验。</div></div>' + brandBand() + '</div></section>';
  return layout({ title: '机场选择指南', description: '机场怎么选、机场避坑、预算套餐与使用场景选择指南。', path: '/guides/', content });
}

function clientsPage() {
  const rows = clientMatrix.map((row) => '<tr><td><strong>' + escapeHtml(row[0]) + '</strong></td><td>' + escapeHtml(row[1]) + '</td><td>' + escapeHtml(row[2]) + '</td></tr>').join('');
  const group = keywordGroups.find((item) => item.id === 'protocols');
  const content = standardHero('CLIENT MATRIX', '一个订阅，如何在四类设备上正确导入', '按操作系统和订阅格式选择客户端。页面不提供来历不明的安装包，只讲配置与排障。') + '<section class="section"><div class="container"><table class="matrix"><thead><tr><th>系统</th><th>常见客户端</th><th>检查重点</th></tr></thead><tbody>' + rows + '</tbody></table><div class="section-sm"><h2>客户端与协议关键词</h2><div class="keyword-cloud">' + group.keywords.map((keyword) => '<a href="' + keywordArticlePath(group.id, keyword) + '">' + escapeHtml(keyword) + '</a>').join('') + '</div></div><div class="notice">Clash for Windows 已停止维护。内容中保留该关键词用于解释迁移路径，实际使用时应优先选择仍在维护且来源可信的客户端。</div></div></section>';
  return layout({ title: '机场客户端指南', description: 'Windows、Mac、Android、iOS 机场客户端与订阅导入指南。', path: '/clients/', content });
}

function networkPage() {
  const group = keywordGroups.find((item) => item.id === 'troubleshooting');
  const cards = group.keywords.map((keyword, index) => '<a class="route-card" href="' + keywordArticlePath(group.id, keyword, 'checklist') + '"><span class="route-no">CHECK ' + String(index + 1).padStart(2, '0') + '</span><h3>' + escapeHtml(keyword) + '</h3><p>按本地网络、系统代理、订阅、节点、DNS 与目标网站逐层检查。</p></a>').join('');
  const content = standardHero('TROUBLESHOOTING', '不要反复重装：按层级定位连接问题', '从“完全无法连接”到“只有某个网站打不开”，不同现象对应不同检查顺序。') + '<section class="section"><div class="container"><div class="route-grid">' + cards + '</div></div></section>';
  return layout({ title: '机场故障排查', description: '订阅失败、节点不显示、速度慢、连接超时与客户端配置错误排查。', path: '/network/', content });
}

function regionsPage() {
  const group = keywordGroups.find((item) => item.id === 'regions');
  const cards = regionCards.map((region) => '<article class="region-card"><h3>' + escapeHtml(region[0]) + '</h3><p>' + escapeHtml(region[1]) + '</p></article>').join('');
  const content = standardHero('REGION NOTES', '节点地区不是越多越好，匹配任务才重要', '地理距离决定基础延迟，线路与回程决定波动，IP 属性决定内容解锁和账号风控。') + '<section class="section"><div class="container"><div class="region-grid">' + cards + '</div><div class="section-sm"><h2>地区与专项线路索引</h2><div class="keyword-cloud">' + group.keywords.map((keyword) => '<a href="' + keywordArticlePath(group.id, keyword) + '">' + escapeHtml(keyword) + '</a>').join('') + '</div></div></div></section>';
  return layout({ title: '机场地区与节点指南', description: '香港、日本、新加坡、美国及其他地区节点选择指南。', path: '/regions/', content });
}

function topicsPage() {
  const groups = keywordGroups.map((group) => '<section class="topic-card topic-index-card" id="' + group.id + '"><div class="topic-index-head"><div><h3>' + escapeHtml(group.title) + '</h3><p>' + escapeHtml(group.description) + '</p></div><span>' + group.keywords.length + ' 词 / ' + (group.keywords.length * 2) + ' 篇</span></div><div class="topic-keyword-list">' + group.keywords.map((keyword) => '<div class="topic-keyword-row"><a href="' + keywordArticlePath(group.id, keyword) + '"><strong>' + escapeHtml(keyword) + '</strong><span>实用指南 →</span></a><a href="' + keywordArticlePath(group.id, keyword, 'checklist') + '">排查清单</a></div>').join('') + '</div></section>').join('');
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
  const content = standardHero('AIRPORT PICKS', '机场推荐入口已经迁移', '6 个机场的官网入口、优惠码、购买前检查项和独立测评现已集中到机场推荐页。') + '<section class="section"><div class="container"><div class="brand-band"><p class="eyebrow">NEW RECOMMENDATION PAGE</p><h2>进入 Clash 梯子推荐专题</h2><p>先阅读测评和风险提示，再根据自己的设备、地区与使用时段进行短周期测试。</p><a class="btn" href="/brands/">查看机场推荐</a></div></div></section>';
  return layout({ title: '机场推荐入口', description: '6 个机场的优惠码、测评与官网入口。', path: '/brand/', content, noindex: true });
}

function brandsPage() {
  const cards = airportPicks.map(airportRecommendationCard).join('');
  const content = '<section class="recommend-page-hero"><div class="recommend-container"><div class="crumbs"><a href="/">首页</a> / 机场推荐</div><p class="eyebrow">CLASH AIRPORT PICKS</p><h1>Clash 梯子推荐：6 个机场测评与优惠码</h1><p>光年梯、极连云、快狸、可信云、速界和边缘节点均提供官网入口、优惠码与独立测评。请先核对套餐、设备限制和退款规则，并优先短周期测试。</p></div></section>' + '<section class="recommend-page-body"><div class="recommend-container"><div class="affiliate-disclosure"><strong>推广说明</strong><span>本页外部链接包含邀请码，站点可能因此获得推广收益，但不会提高你的购买价格。优惠是否适用及服务信息可能变化，请以官网实时结算页面为准。</span></div><div class="airport-recommend-grid">' + cards + '</div><div class="recommend-method"><p class="eyebrow">HOW WE REVIEW</p><h2>推荐前先检查这三件事</h2><div class="topic-grid"><article class="topic-card"><span class="profile-status">01</span><h3>先买短周期</h3><p>先确认订阅能导入自己的客户端，再测试常用时间段，避免只因年付折扣做决定。</p></article><article class="topic-card"><span class="profile-status status-blue">02</span><h3>测试真实场景</h3><p>网页、视频、AI、办公和游戏的要求不同，不用单次测速替代连续使用体验。</p></article><article class="topic-card"><span class="profile-status status-yellow">03</span><h3>核对限制</h3><p>重点确认流量、倍率、设备数、重置日期、工单渠道和退款条件。</p></article></div></div></div></section>';
  return layout({ title: 'Clash 梯子推荐', description: '6 个机场的优惠码、官网入口、适用场景与独立测评。', path: '/brands/', content, schema: { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Clash 梯子推荐', numberOfItems: airportPicks.length, itemListElement: airportPicks.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: config.baseUrl + '/articles/' + item.slug + '/' })) } });
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
  const questionKeywords = troubleshooting.keywords.map((keyword) => [troubleshooting.id, keyword]).concat(subscription.keywords.map((keyword) => [subscription.id, keyword]));
  const items = questionKeywords.map((item, index) => '<a class="route-card question-card" href="' + keywordArticlePath(item[0], item[1], 'checklist') + '"><span class="route-no">Q' + String(index + 1).padStart(2, '0') + '</span><h3>' + escapeHtml(item[1]) + '</h3><p>查看现象、原因和逐层检查顺序。</p></a>').join('');
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

  const editorialArticles = await readArticles();
  const articles = editorialArticles.concat(generatedKeywordArticles());
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
  await fs.writeFile(path.join(outDir, indexNowKey + '.txt'), indexNowKey + '\n', 'utf8');

  const rssItems = editorialArticles.slice(0, 20).map((article) => '<item><title>' + xmlEscape(article.title) + '</title><link>' + config.baseUrl + '/articles/' + article.slug + '/</link><guid>' + config.baseUrl + '/articles/' + article.slug + '/</guid><pubDate>' + new Date(article.date + 'T08:00:00+08:00').toUTCString() + '</pubDate><description>' + xmlEscape(article.description) + '</description></item>').join('');
  const rss = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>' + xmlEscape(config.siteName) + '</title><link>' + config.baseUrl + '</link><description>' + xmlEscape(config.description) + '</description><language>zh-cn</language>' + rssItems + '</channel></rss>';
  await fs.writeFile(path.join(outDir, 'rss.xml'), rss, 'utf8');
  console.log('Built ' + urls.length + ' pages and ' + articles.length + ' articles into dist/.');
}

await build();
