# DeutschOS 最终演示说明

## 正式访问地址

https://deutschos-agent-demo.vercel.app

> 旧地址 `deutschos-netlify-demo.vercel.app` 已不再作为演示入口使用。所有对外材料、PPT、截图说明和导师/评委链接请统一使用正式地址。

## 演示定位

DeutschOS 是面向德国硕士申请的 Agent 工作台，覆盖申请者建档、项目匹配、DeepSeek 建议、顾问复核、问题收件箱、风险监控与管理者质量驾驶舱。

## 推荐演示路径

1. 打开正式地址，进入登录门户。
2. 选择「申请者」演示账号，填写或使用默认信息生成申请方案。
3. 查看申请者端结果页：项目推荐、课程匹配、DeepSeek 状态卡、AI 官网核验提示、任务/风险提醒。
4. 退出并选择「顾问」演示账号，查看申请问题收件箱、回复工作区、课程匹配复核台和审核发布流程。
5. 退出并选择「管理员」演示账号，查看质量监控、效率指标、风险分布和三端闭环状态。
6. 如需证明 DeepSeek 已接入，可访问 `/api/ai/health`，确认 `configured: true`、`provider: deepseek`、`model: deepseek-chat`。

## DeepSeek 接入说明

- DeepSeek API Key 配置在 Vercel 环境变量 `DEEPSEEK_API_KEY` 中。
- 前端通过服务端安全代理调用，不在浏览器暴露 Key。
- 当前 AI 结果会保留官网核验提示：deadline、NC、语言、APS/VPD、课程学分和申请路径必须以学校官网或官方平台为准。

## 演示账号

- 申请者：页面内「申请者」演示账号按钮。
- 顾问：页面内「顾问」演示账号按钮。
- 管理员：页面内「管理员」演示账号按钮。

## 当前已知边界

- Demo 以演示闭环为目标，不等同于正式录取概率判断。
- 学校要求、NC、deadline、APS/VPD、uni-assist 路径仍需要官网最终核验。
- 当前演示账号为本地兜底账号；正式商用应接入完整 Auth、数据库和权限体系。
- 如现场网络或 Vercel 冷启动导致接口慢，可先展示已生成截图包和 `/api/ai/health` 返回结果。

## 现场检查清单

- 首页能打开，页面标题为 DeutschOS Agent Demo。
- 申请者端能生成结果。
- DeepSeek 状态卡可见。
- 顾问端问题收件箱回复区样式正常。
- 管理员端质量监控与效率指标可见。
- 控制台无新增关键 error。
