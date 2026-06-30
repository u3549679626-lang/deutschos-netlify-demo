# DeutschOS API Key Readiness

本文件用于在 Vercel 中接入真实 API Key。请不要把真实密钥写入仓库；所有真实值都应配置在：

`Vercel Project → Settings → Environment Variables`

## 1. 当前 Demo 状态

当前 Demo 可以在没有真实 DeepSeek Key 的情况下运行：

- 前端门户使用静态/确定性 Demo 数据展示申请者、顾问、管理员三端；
- 服务端 `/api/demo/run`、`/api/analysis/run` 通过 `server/demo-core.mjs` 生成确定性分析结果；
- 服务端 `/api/ai/health` 检查 DeepSeek 是否已配置；
- 服务端 `/api/ai/advice`、`/api/materials/draft`、`/api/chat` 统一通过服务端 DeepSeek 代理调用模型；
- 未配置 `DEEPSEEK_API_KEY` 时，接口返回演示 fallback，不影响 Demo 主流程。

## 2. 已在代码中实际使用的密钥/环境变量

| 用途 | 变量名 | 可见范围 | 当前状态 | 下一步 |
|---|---|---|---|---|
| Supabase URL | `VITE_SUPABASE_URL` | 前端可见 | 前端登录逻辑读取 | 在 Vercel 配置真实值 |
| Supabase anon key | `VITE_SUPABASE_ANON_KEY` | 前端可见 | 前端登录逻辑读取 | 在 Vercel 配置真实值 |
| Supabase URL | `SUPABASE_URL` | 服务端 | 服务端 auth/sync 读取 | 在 Vercel 配置真实值 |
| Supabase anon key | `SUPABASE_ANON_KEY` | 服务端 | 服务端 auth/sync 读取 | 在 Vercel 配置真实值 |
| Supabase service role | `SUPABASE_SERVICE_ROLE_KEY` | 服务端 | 后续服务端管理任务预留，禁止前端暴露 | 仅生产服务端配置 |
| DeepSeek API Key | `DEEPSEEK_API_KEY` | 服务端 | AI 建议/文书/问答统一读取 | 在 Vercel 配置真实值 |
| DeepSeek Base URL | `DEEPSEEK_BASE_URL` | 服务端 | 可选，默认 `https://api.deepseek.com` | 通常无需配置 |
| DeepSeek 模型 | `DEEPSEEK_MODEL` | 服务端 | 可选，默认 `deepseek-chat` | 可按需改为授权模型 |

## 3. DeepSeek 接入范围

当前所有需要大模型能力的地方已统一指向 DeepSeek 服务端代理：

| 接口 | 用途 | 未配置 Key 时 |
|---|---|---|
| `/api/ai/health` | 检查 DeepSeek 配置状态 | 返回 `configured: false` |
| `/api/ai/advice` | 申请方案 AI 建议 | 返回本地专家 fallback |
| `/api/materials/draft` | 文书/课程匹配说明初稿 | 返回演示 fallback 文书 |
| `/api/chat` | AI 顾问问答 | 返回演示 fallback 回复 |
| `/api/demo/run` | 端到端 Demo 分析 | 内部合并 DeepSeek 建议或 fallback |

## 4. Vercel 中配置 DeepSeek

在 `Vercel Project → Settings → Environment Variables` 中增加以下服务端变量，不要使用 `VITE_` 前缀：

```env
DEEPSEEK_API_KEY=<你的 DeepSeek API Key>
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

保存后重新部署 Production。

## 5. 验收方式

部署后访问：

```text
https://deutschos-netlify-demo.vercel.app/api/ai/health
```

期望看到：

```json
{
  "provider": "deepseek",
  "configured": true,
  "model": "deepseek-chat"
}
```

然后通过页面生成方案、文书初稿或 AI 顾问问答，接口应返回：

```json
{
  "mode": "ai-env-proxy",
  "provider": "deepseek-server-proxy"
}
```

如果仍显示 fallback，通常表示环境变量没有配置到当前 Production 环境，或配置后未重新部署。

## 6. 安全边界

- `VITE_*` 会进入浏览器 bundle，只能放公开 anon key 或非敏感配置；
- `SERVICE_ROLE_KEY`、`DEEPSEEK_API_KEY`、SMTP 密码、App Secret 必须只放服务端环境变量；
- 不要在 README、截图、聊天记录、Git 提交中出现真实 Key；
- 接入前先确认 Vercel 的 Production / Preview / Development 环境变量是否分别配置。

## 7. 未来模块可能需要的 Key

| 模块 | 可能变量 | 是否当前必须 | 备注 |
|---|---|---|---|
| 官网实时核验 / 搜索 | `SEARCH_API_KEY`, `CRAWLER_API_KEY` | 否 | 当前 Demo 仍是静态核验结果，未来接真实官网抓取再启用 |
| 政策雷达通知 | `LARK_APP_ID`, `LARK_APP_SECRET` | 否 | 未来飞书/企业微信通知用 |
| 邮件通知 | `EMAIL_SMTP_*` | 否 | 未来 deadline 邮件提醒用 |
| 文件存储 | Supabase Storage 相关变量 | 否 | 如上传成绩单要持久化才需要 |
