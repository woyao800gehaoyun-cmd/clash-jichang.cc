# 链路研究所

一个不依赖第三方框架的静态内容站，面向长期更新机场选择、线路知识、客户端教程、故障排查与 AI 工具导航。

## 本地使用

1. 运行 npm run build 生成 dist 目录。
2. 运行 npm run check 检查全部关键词是否已经出现在生成页面中。
3. 运行 npm run dev，然后打开 http://127.0.0.1:4173。

## 更新品牌

编辑 `site.config.mjs` 中的 brand 配置可统一更新全站推荐入口。当前机场推荐页收录光年梯与极连云，并在外部链接旁披露邀请码推广关系。

## 新增文章

在 content/articles 目录复制任意 Markdown 文件，修改顶部信息和正文，再运行 npm run build。构建脚本会自动生成文章页、文章列表、RSS 和站点地图。

## 部署

dist 是纯静态输出，可部署到 GitHub Pages、Cloudflare Pages、Vercel、Netlify 或任意支持静态文件的服务器。构建命令为 npm run build，输出目录为 dist。

Cloudflare Pages 使用 Git 仓库部署时，请将根目录留空，构建命令设为 `npm run build`，输出目录设为 `dist`。仓库根目录保留 `_redirects` 作为兼容规则：如果 Cloudflare 没有执行构建而直接上传仓库根目录，访问请求会临时重写到 `dist/`，避免首页 404。
