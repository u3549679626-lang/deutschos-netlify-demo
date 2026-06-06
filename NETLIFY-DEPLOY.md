# DeutschOS 交互 Demo：Netlify 部署说明

本包已改造为 Netlify 可部署结构：

- 前端：`frontend/`，Vite 构建，发布目录 `frontend/dist`
- API：`netlify/functions/api.mjs`
- 路由：`/api/*` 自动转发到 Netlify Function
- 配置：`netlify.toml`

## 方法一：Netlify 网页端拖拽部署

1. 解压本 ZIP。
2. 打开 Netlify：<https://app.netlify.com/drop>
3. 如仅拖拽静态 `frontend/dist`，只能预览前端，API 不会生效。
4. 推荐使用方法二，通过 Git 部署整个项目根目录。

## 方法二：GitHub + Netlify 推荐部署

1. 新建 GitHub 仓库。
2. 上传本项目根目录内容，即包含：
   - `frontend/`
   - `netlify/`
   - `netlify.toml`
   - `README.md`
3. 在 Netlify 选择 Add new site → Import an existing project。
4. 选择该 GitHub 仓库。
5. Netlify 会自动读取 `netlify.toml`：
   - Base directory: 留空或项目根目录
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
   - Functions directory: `netlify/functions`
6. 部署完成后打开 Netlify 分配的 `https://xxx.netlify.app`。
7. 点击“一键运行完整 Demo”，应能生成完整交互结果。

## 方法三：Netlify CLI

```bash
npm install -g netlify-cli
cd deutschos-mvp
netlify deploy --build
netlify deploy --prod --build
```

## 部署后可验证接口

```text
https://你的站点.netlify.app/api/health
```

应返回：

```json
{"ok":true,"service":"deutschos-netlify-api","version":"0.3.0-netlify"}
```

## 注意

- Netlify Demo 的 API 是 Serverless Function 版本，已支持一键 Demo、政策雷达、效率报告、文书草稿、AI 问答占位等交互。
- 官网深度浏览器截图和长期定时任务属于增强能力，正式商用版建议接入独立后端、浏览器自动化服务和数据库。
