# DeutschOS MVP v0.3｜德国硕士申请 Agent 操作系统交互 Demo

这是一个可本地启动、可点击操作的实际产品 Demo，不是静态展示页。

## 1. Demo 能实现什么

当前版本支持德国硕士申请初版闭环：

1. 申请者背景建档：院校、专业、目标方向、跨专业、均分、语言、APS、经历素材。
2. 官网核验入口：可输入 3–5 个官方项目 URL，调用后端抓取并结构化输出。
3. 德国修正巴伐利亚公式成绩换算：根据均分、满分、及格分自动换算德国制参考成绩。
4. NC / 竞争力判断：基于核验字段、课程匹配、语言与 APS 状态输出竞争力分档；未确认信息标注「待人工核验」。
5. 课程匹配诊断：输出匹配分数、已满足模块、缺口模块、补强材料和申请建议。
6. 多校申请作战看板：展示梯度、申请路径、deadline、阻塞项、下一步与优先级。
7. 政策雷达：生成追踪任务配置，并完成首次基线运行记录；长期定时需部署到服务器或办公小浣熊定时任务模块。
8. 文书生成：生成 Motivation Letter、课程匹配说明等草稿；严格提示不得编造经历。
9. 效率与质量对照报告：输出传统流程 vs 系统流程耗时、效率提升和可溯源质量指标。
10. 附件导出：前端支持下载当前 Demo 结果 JSON，交付包同时包含 PPTX、报告、Skill 包、MVP 工程包等。

## 2. 快速启动

### 2.1 Netlify 公网部署

本版本已内置 Netlify 部署配置：

- `netlify.toml`
- `netlify/functions/api.mjs`
- `netlify/functions/demo-core.mjs`

部署到 Netlify 后，前端会调用相对路径 `/api/...`，再由 Netlify Redirect 转发到 Functions。详见 `NETLIFY-DEPLOY.md`。

### 2.2 本地启动

> 需要 Node.js 18+。如果在办公小浣熊环境中运行，可使用系统已配置的 Node。

```bash
cd output/deutschos-mvp
npm install
npm run install:all
npm run dev
```

然后打开：

- 前端：http://localhost:5173
- 后端健康检查：http://localhost:8787/health

如果前端需要指定后端地址，可在 `frontend/.env` 中设置：

```bash
VITE_API_BASE=http://localhost:8787
```

## 3. 评委/用户如何体验

推荐体验路径：

1. 打开前端首页。
2. 在左侧修改申请者资料。
3. 点击顶部「一键运行完整 Demo」。
4. 依次查看：
   - 总览
   - 官网核验
   - 成绩/NC
   - 课程匹配
   - 作战看板
   - 政策雷达
   - 效率报告
   - 文书
5. 在右侧 AI 申请助手中追问下一步行动。
6. 点击「下载结果 JSON」保存当前交互结果。

## 4. 关于官网实时核验

本 Demo 提供两种模式：

- 演示种子模式：点击「一键运行完整 Demo」，使用内置 3 个德国公立大学项目作为演示数据，并明确标注待人工核验字段。
- 实时 URL 模式：在「官网核验」页输入官方 URL，点击「抓取并结构化核验」，后端会尝试抓取网页文本并整理为核验对象。

正式申请中，deadline、APS、VPD、NC、语言要求、申请路径等必须以目标学校官网、uni-assist、DAAD 或官方申请平台页面为准，并保存截图。

## 5. 技术结构

```text
deutschos-mvp/
├─ frontend/              React + Vite 交互式工作台
│  └─ src/main.jsx        主产品界面
├─ backend/               Express API 服务
│  ├─ src/server.js       API 入口
│  └─ src/services/
│     ├─ crawler.js       官网抓取与结构化入口
│     ├─ ai.js            AI 申请分析/文书/问答
│     ├─ demo.js          一键 Demo、匹配、政策雷达、效率报告
│     ├─ tasks.js         任务看板生成
│     └─ storage.js       申请者档案保存入口
└─ package.json           根级启动脚本
```

## 6. 环境变量

复制 `.env.example` 为 `.env`，按需配置：

- `OPENAI_API_KEY`：可选；配置后可接入真实 AI 模型。
- `OPENAI_BASE_URL`：可选。
- `OPENAI_MODEL`：可选。
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`：可选；配置后可保存用户档案。

未配置 AI Key 时，系统仍可使用内置 Demo 逻辑跑通完整流程。

## 7. 版本说明

- v0.3.0：升级为可交互实际产品 Demo，新增一键完整流程、政策雷达首次运行、效率报告、JSON 导出、模块化工作台。
- v0.2.0：基础 MVP 工程与展示能力。

## 8. 提交建议

比赛/平台提交时，建议上传：

1. `deutschos-mvp-v0.3-interactive-demo.zip`：实际产品 Demo 工程包。
2. `initial-submission-package.zip`：作品简介、PPTX、报告、Skill 包等附件总包。
3. `germany-master-application-os-competition-deck.pptx`：路演展示 PPT。

如果平台要求公网 Web 链接，需要将本项目部署到 Vercel / Netlify / Railway / Render / 自有服务器。当前交付为本地可运行产品包。


## API Key 接入准备

当前仓库不提交任何真实密钥。下一步接入 Supabase / DeepSeek / 搜索爬虫 / 通知等服务前，请先查看：

```text
API-KEY-READINESS.md
SUPABASE-AUTH-RBAC-SETUP.md
.env.example
```

推荐在 Vercel 中配置路径：

```text
Project Settings → Environment Variables
```

注意：`SUPABASE_SERVICE_ROLE_KEY`、`DEEPSEEK_API_KEY`、`OPENAI_API_KEY`、通知密钥等只能放在服务端环境变量，禁止写入前端代码或提交到 GitHub。
