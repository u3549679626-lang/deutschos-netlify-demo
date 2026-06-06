# Netlify 构建失败修复版：根目录部署

你之前报错的原因是 Netlify 执行 `cd frontend`，但 GitHub 仓库根目录没有 `frontend` 文件夹。

本包已把前端项目提升到仓库根目录，Netlify 配置应改为：

```text
Base directory: 留空
Build command: npm install && npm run build
Publish directory: dist
Functions directory: netlify/functions
```

同时请在 Netlify UI 里清除旧配置：

- 不要再使用 `cd frontend && npm install && npm run build`
- 不要再使用 `frontend/dist`

部署后测试：

```text
https://你的站点.netlify.app/api/health
```

页面测试：点击「一键运行完整 Demo」。
