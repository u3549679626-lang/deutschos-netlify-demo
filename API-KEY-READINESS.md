# DeutschOS API Key Readiness

本文件用于下一步在 Vercel 中接入真实 API Key。请不要把真实密钥写入仓库；所有真实值都应配置在：

`Vercel Project → Settings → Environment Variables`

## 1. 当前 Demo 状态

当前 Demo 可以在没有真实 LLM Key 的情况下运行：

- 前端门户使用静态/确定性 Demo 数据展示申请者、顾问、管理员三端；
- 服务端 `/api/demo/run`、`/api/analysis/run` 通过 `server/demo-core.mjs` 生成确定性分析结果；
- Supabase Auth 若未创建演示账号，会返回 401，但前端有 fallback 演示模式。

## 2. 已在代码中实际使用的密钥/环境变量

| 用途 | 变量名 | 可见范围 | 当前状态 | 下一步 |
|---|---|---|---|---|
| Supabase URL | `VITE_SUPABASE_URL` | 前端可见 | 前端登录逻辑读取 | 在 Vercel 配置真实值 |
| Supabase anon key | `VITE_SUPABASE_ANON_KEY` | 前端可见 | 前端登录逻辑读取 | 在 Vercel 配置真实值 |
| Supabase URL | `SUPABASE_URL` | 服务端 | 服务端 auth/sync 读取 | 在 Vercel 配置真实值 |
| Supabase anon key | `SUPABASE_ANON_KEY` | 服务端 | 服务端 auth/sync 读取 | 在 Vercel 配置真实值 |
| Supabase service role | `SUPABASE_SERVICE_ROLE_KEY` | 服务端 | 后续服务端管理任务预留，禁止前端暴露 | 仅生产服务端配置 |

## 3. 下一步建议接入的 AI Key

建议先只接一个 LLM Provider，避免并行调试复杂化。

| 推荐优先级 | 用途 | 变量名 | 可见范围 | 说明 |
|---:|---|---|---|---|
| 1 | DeepSeek 文书/问答/课程解释 | `DEEPSEEK_API_KEY` | 服务端 | 推荐作为第一阶段成本可控模型 |
| 1 | DeepSeek API 地址 | `DEEPSEEK_BASE_URL` | 服务端 | 默认 `https://api.deepseek.com` |
| 1 | DeepSeek 模型名 | `DEEPSEEK_MODEL` | 服务端 | 默认 `deepseek-chat` |
| 2 | OpenAI-compatible 备用 | `OPENAI_API_KEY` | 服务端 | 可作为备用或迁移接口 |
| 2 | OpenAI-compatible 地址 | `OPENAI_BASE_URL` | 服务端 | 默认 `https://api.openai.com/v1` |
| 2 | OpenAI-compatible 模型 | `OPENAI_MODEL` | 服务端 | 视供应商而定 |

## 4. 未来模块可能需要的 Key

| 模块 | 可能变量 | 是否当前必须 | 备注 |
|---|---|---|---|
| 官网实时核验 / 搜索 | `SEARCH_API_KEY`, `CRAWLER_API_KEY` | 否 | 当前 Demo 仍是静态核验结果，未来接真实官网抓取再启用 |
| 政策雷达通知 | `LARK_APP_ID`, `LARK_APP_SECRET` | 否 | 未来飞书/企业微信通知用 |
| 邮件通知 | `EMAIL_SMTP_*` | 否 | 未来 deadline 邮件提醒用 |
| 文件存储 | Supabase Storage 相关变量 | 否 | 如上传成绩单要持久化才需要 |

## 5. 安全边界

- `VITE_*` 会进入浏览器 bundle，只能放公开 anon key 或非敏感配置；
- `SERVICE_ROLE_KEY`、LLM Key、SMTP 密码、App Secret 必须只放服务端环境变量；
- 不要在 README、截图、聊天记录、Git 提交中出现真实 Key；
- 接入前先确认 Vercel 的 Production / Preview / Development 环境变量是否分别配置。

## 6. 推荐接入顺序

1. 先补 Supabase 演示账号，消除 Auth 401；
2. 接入一个服务端 LLM Provider，例如 DeepSeek；
3. 增加 `/api/ai/*` 服务端代理接口，前端只调用本项目 API，不直接持有模型 Key；
4. 为政策雷达和官网核验再接搜索/抓取 Key；
5. 最后接通知类 Key，例如 Lark/SMTP。
