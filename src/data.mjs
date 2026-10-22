export const navItems = [
  ['首页', '/'],
  ['机场推荐', '/brands/'],
  ['科学上网知识库', '/articles/'],
  ['专题目录', '/topics/'],
  ['横向对比', '/compare/'],
  ['问题库', '/questions/'],
  ['🤖 AI 工具', '/ai-tools/'],
  ['关于本站', '/about/']
];

export const keywordGroups = [
  {
    id: 'choose',
    title: '选择、推荐与品牌核验',
    description: '从需求、预算、稳定性与风险角度建立选择框架。',
    href: '/guides/',
    keywords: ['机场', '机场推荐', '机场排行', '机场测评', '机场怎么样', '机场导航', '机场大全', '机场合集', '机场官网', '机场备用网址', '机场入口', '好用机场', '稳定机场', '不掉线机场', '高速机场', '低延迟机场', '游戏机场', '晚高峰不卡机场', '高峰期稳定机场', '机场推荐新手', '小白机场推荐', '老牌机场推荐', '稳定老牌机场', '机场怎么选', '机场避坑', '机场选择指南', '机场跑路怎么判断', '机场是否靠谱']
  },
  {
    id: 'subscription',
    title: '订阅、节点与网络加速',
    description: '认识订阅地址、节点展示、更新机制与基础排查。',
    href: '/articles/subscription-import/',
    keywords: ['机场订阅', '订阅链接', '订阅地址', '机场节点', '节点机场', '节点推荐', '机场加速', '网络加速']
  },
  {
    id: 'scenarios',
    title: '流媒体、AI 与工作场景',
    description: '按应用场景判断地区、IP 类型与线路要求。',
    href: '/guides/#scenarios',
    keywords: ['流媒体机场', '解锁流媒体机场', 'ChatGPT 机场', 'AI 机场', 'OpenAI 机场', '外贸机场', '跨境电商机场', '出海机场', '直播机场', 'TikTok 机场', 'YouTube 机场', '办公机场', '远程办公机场', '学术机场']
  },
  {
    id: 'price',
    title: '价格、套餐与流量',
    description: '把月付、年付、折扣与真实流量成本放到同一张表里比较。',
    href: '/guides/#budget',
    keywords: ['便宜机场', '平价机场', '高性价比机场', '机场月付', '机场季付', '机场年付', '机场优惠', '机场折扣', '机场优惠码', '机场试用', '机场免费试用', '机场体验', '机场套餐', '机场价格', '机场多少钱', '机场流量包', '流量重置包', '流量不够怎么办']
  },
  {
    id: 'network',
    title: '线路、IP、倍率与审计',
    description: '解释专线、中转、直连、IP 属性、节点倍率和审计规则。',
    href: '/articles/iplc-vs-transit/',
    keywords: ['IPLC 机场', '专线机场', '内网专线机场', '中转机场', 'BGP 机场', '直连机场', '原生 IP 机场', '家宽 IP 机场', '住宅 IP 机场', '节点倍率', '倍率说明', '倍率怎么算', '机场审计', '无审计机场', '日志审计']
  },
  {
    id: 'protocols',
    title: '协议、客户端与设备',
    description: '覆盖主流系统、客户端、协议与设备数量限制。',
    href: '/clients/',
    keywords: ['SS 机场', 'SSR 机场', 'V2Ray 机场', 'Trojan 机场', 'Clash 机场', 'V2RayN 机场', 'Shadowrocket 机场', '多设备机场', '不限设备机场', '设备数限制', 'Windows 机场', '机场 Windows 客户端', 'Mac 机场', '机场 Mac 客户端', 'Android 机场', '机场安卓客户端', 'iOS 机场', '机场 iPhone 客户端', 'Clash for Windows 机场', 'Clash Verge 机场', 'Clash Meta 机场', 'Quantumult X 机场', 'Stash 机场', 'v2rayN 机场', 'v2rayNG 机场', 'sing-box 机场']
  },
  {
    id: 'regions',
    title: '地区节点与专项线路',
    description: '按地理距离、回程、内容版权与账号风控选择地区。',
    href: '/regions/',
    keywords: ['香港机场', '香港节点机场', '台湾机场', '日本机场', '新加坡机场', '韩国机场', '美国机场', '英国机场', '德国机场', '法国机场', '马来西亚机场', '泰国机场', '越南机场', '菲律宾机场', '香港 IPLC 机场', '日本原生 IP 机场', '新加坡专线机场', '香港低延迟机场', '日本游戏机场', '美国流媒体机场']
  },
  {
    id: 'compare',
    title: '概念对比与自建方案',
    description: '先分清服务形态，再决定购买订阅还是自己维护。',
    href: '/guides/#compare',
    keywords: ['机场和 VPN 区别', '机场 vs VPN', '机场和 VPS 区别', '机场 vs 自建']
  },
  {
    id: 'troubleshooting',
    title: '连接、订阅与客户端排障',
    description: '按本地网络、客户端、订阅、节点和目标网站逐层定位。',
    href: '/network/',
    keywords: ['机场连上了但打不开网页', '机场订阅失败', '更新订阅失败', '机场节点少', '节点不显示', '机场速度慢', '延迟高怎么办', '机场无法连接', '连接超时', '机场被墙了怎么办', '机场失效', 'Clash 导入订阅失败', 'Clash 配置错误', 'iOS 小火箭订阅失败', '安卓无法导入订阅']
  }
];

export const aiGroups = [
  {
    id: 'chat',
    title: '对话与通用助手',
    tools: [
      ['ChatGPT', 'https://chatgpt.com/', '写作、分析、编程与多模态助手'],
      ['Claude', 'https://claude.ai/', '长文理解、写作与代码协作'],
      ['Gemini', 'https://gemini.google.com/', 'Google 生态与多模态助手'],
      ['Microsoft Copilot', 'https://copilot.microsoft.com/', '微软生态通用助手'],
      ['Grok', 'https://grok.com/', '实时信息与通用对话'],
      ['DeepSeek', 'https://chat.deepseek.com/', '中文推理与代码助手'],
      ['Kimi', 'https://www.kimi.com/', '中文长文与资料整理'],
      ['通义千问 Qwen', 'https://www.qwen.ai/', '通用对话与模型体验'],
      ['豆包', 'https://www.doubao.com/', '中文对话与内容创作'],
      ['腾讯元宝', 'https://yuanbao.tencent.com/', '中文搜索与内容助手'],
      ['Poe', 'https://poe.com/', '集中体验多种模型']
    ]
  },
  {
    id: 'research',
    title: '搜索与研究',
    tools: [
      ['Perplexity', 'https://www.perplexity.ai/', '带来源的 AI 搜索'],
      ['NotebookLM', 'https://notebooklm.google.com/', '基于资料的研究与笔记'],
      ['Semantic Scholar', 'https://www.semanticscholar.org/', '学术论文检索'],
      ['Elicit', 'https://elicit.com/', '论文梳理与研究流程'],
      ['Consensus', 'https://consensus.app/', '从研究论文中寻找答案'],
      ['SciSpace', 'https://scispace.com/', '论文阅读与解释'],
      ['ResearchRabbit', 'https://www.researchrabbit.ai/', '发现论文关联网络']
    ]
  },
  {
    id: 'code',
    title: '编程与建站',
    tools: [
      ['GitHub Copilot', 'https://github.com/features/copilot', 'IDE 编程助手'],
      ['Cursor', 'https://cursor.com/', 'AI 原生代码编辑器'],
      ['OpenAI Codex', 'https://openai.com/codex/', '云端软件工程智能体'],
      ['Claude Code', 'https://code.claude.com/docs/en/overview', '终端编程智能体'],
      ['Gemini CLI', 'https://github.com/google-gemini/gemini-cli', '开源终端智能体'],
      ['Replit Agent', 'https://replit.com/ai', '从想法到应用'],
      ['v0', 'https://v0.app/', '生成前端界面与应用'],
      ['Bolt', 'https://bolt.new/', '浏览器内生成全栈应用'],
      ['Lovable', 'https://lovable.dev/', '自然语言生成产品原型']
    ]
  },
  {
    id: 'office',
    title: '写作与办公',
    tools: [
      ['Notion AI', 'https://www.notion.com/product/ai', '笔记、文档与知识库'],
      ['Grammarly', 'https://www.grammarly.com/', '英文写作校对'],
      ['QuillBot', 'https://quillbot.com/', '改写、总结与语法'],
      ['Gamma', 'https://gamma.app/', '快速生成演示与网页'],
      ['Canva Magic Studio', 'https://www.canva.com/magic/', '设计与内容生成'],
      ['Microsoft 365 Copilot', 'https://www.microsoft.com/microsoft-365/copilot/', 'Office 办公助手']
    ]
  },
  {
    id: 'image',
    title: '图片与设计',
    tools: [
      ['Midjourney', 'https://www.midjourney.com/', '高质量图像生成'],
      ['Adobe Firefly', 'https://www.adobe.com/products/firefly.html', 'Adobe 生成式创意工具'],
      ['Ideogram', 'https://ideogram.ai/', '文字表现出色的图像生成'],
      ['Leonardo AI', 'https://leonardo.ai/', '设计资产与图像生成'],
      ['Recraft', 'https://www.recraft.ai/', '品牌图形与矢量设计'],
      ['Krea', 'https://www.krea.ai/', '实时图像生成与增强'],
      ['Figma', 'https://www.figma.com/', '协作式产品设计平台']
    ]
  },
  {
    id: 'media',
    title: '视频与音频',
    tools: [
      ['Runway', 'https://runwayml.com/', 'AI 视频创作'],
      ['Pika', 'https://pika.art/', '文本与图片生成视频'],
      ['Luma Dream Machine', 'https://lumalabs.ai/dream-machine', '视频生成与创意镜头'],
      ['可灵 Kling', 'https://kling.ai/', 'AI 视频与图片生成'],
      ['HeyGen', 'https://www.heygen.com/', '数字人与视频翻译'],
      ['ElevenLabs', 'https://elevenlabs.io/', '语音生成与配音'],
      ['Suno', 'https://suno.com/', 'AI 音乐生成'],
      ['Adobe Podcast', 'https://podcast.adobe.com/', '语音增强与播客工具']
    ]
  },
  {
    id: 'automation',
    title: '自动化与模型平台',
    tools: [
      ['Zapier AI', 'https://zapier.com/ai', '跨应用自动化'],
      ['Make', 'https://www.make.com/', '可视化工作流自动化'],
      ['n8n', 'https://n8n.io/', '可自托管工作流自动化'],
      ['Dify', 'https://dify.ai/', '生成式 AI 应用平台'],
      ['Coze', 'https://www.coze.com/', '智能体开发平台'],
      ['Hugging Face', 'https://huggingface.co/', '模型、数据集与应用社区'],
      ['Ollama', 'https://ollama.com/', '本地运行大语言模型'],
      ['OpenRouter', 'https://openrouter.ai/', '统一模型 API 平台']
    ]
  }
];

export const clientMatrix = [
  ['Windows', 'Clash Verge / Clash Meta / v2rayN', '优先核对内核版本、系统代理与订阅格式'],
  ['macOS', 'Clash Verge / Stash', '注意系统代理权限与 Apple Silicon 版本'],
  ['Android', 'v2rayNG / Clash Meta / sing-box', '检查后台运行、电池优化与 VPN 权限'],
  ['iOS', 'Shadowrocket / Quantumult X / Stash', '确认订阅类型、地区商店与系统 VPN 权限']
];

export const regionCards = [
  ['香港', '通常延迟较低，适合日常网页与办公；内容解锁取决于 IP 属性。'],
  ['台湾', '适合繁体中文内容与部分流媒体，需关注回程与晚高峰。'],
  ['日本', '适合游戏、AI 与日区内容；原生 IP 与普通机房 IP 的用途不同。'],
  ['新加坡', '东南亚业务和跨境办公常用，专线质量比节点数量更重要。'],
  ['美国', '适合美国流媒体、AI 服务与外贸场景，物理延迟通常更高。'],
  ['欧洲', '英国、德国、法国节点适合区域业务，先验证目标服务可用性。'],
  ['东南亚', '马来西亚、泰国、越南、菲律宾节点适合本地化运营与测试。']
];
