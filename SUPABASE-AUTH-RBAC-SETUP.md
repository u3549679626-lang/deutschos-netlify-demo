# DeutschOS Supabase Auth / RBAC 接入操作手册

本文件用于完成 DeutschOS Vercel Demo 的第 1 步：接入真实 Supabase Auth 与角色权限映射，消除线上演示账号登录时的 `401 unauthorized`。

> 安全原则：不要把真实 Supabase Key 写入仓库。本文件只记录配置位置、变量名和操作步骤。

## 1. 当前代码依赖

当前登录链路依赖以下文件：

- `api/index.js`：Vercel 单函数入口，暴露 `/api/auth/status`、`/api/auth/login`、`/api/auth/logout`。
- `server/auth-store.mjs`：登录校验、Supabase 用户查询、RBAC 角色解析。
- `supabase/schema.sql`：基础业务表。
- `supabase/step10-auth-rbac.sql`：Auth/RBAC 增量表和演示映射数据。

当前服务端需要的 Supabase 环境变量：

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

当前前端需要的 Supabase 环境变量：

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## 2. 需要创建的演示账号

请在 Supabase Dashboard 中创建以下 Auth 用户，密码建议统一设为 `demo123`（仅 Demo 使用，正式环境请改强密码）：

| 角色 | Email | 密码 | 用途 |
|---|---|---|---|
| 申请者 | `student@demo.com` | `demo123` | 进入申请者门户 |
| 顾问 | `consultant@demo.com` | `demo123` | 进入顾问工作台 |
| 管理员 | `admin@demo.com` | `demo123` | 进入管理员后台 |

创建位置：

```text
Supabase Dashboard → Authentication → Users → Add user
```

建议关闭邮箱确认限制，或在创建时直接勾选/设置为已确认，避免 Demo 登录被邮件验证拦截。

## 3. 执行数据库 SQL

### 3.1 基础表

如果你的 Supabase 项目是全新项目，先执行：

```text
supabase/schema.sql
```

如果已有旧表，请先备份并检查是否已存在同名表。

### 3.2 Auth/RBAC 增量表

然后执行：

```text
supabase/step10-auth-rbac.sql
```

该脚本会：

1. 给 `applicants` 补充登录映射字段；
2. 创建 `user_roles` 表；
3. 创建 `consultant_applicants` 表；
4. 插入三类演示角色；
5. 建立顾问与申请者的示例关联；
6. 开启相关表的 RLS。

执行位置：

```text
Supabase Dashboard → SQL Editor → New query → Run
```

## 4. 关键表结构核对

### 4.1 `user_roles`

服务端 `server/auth-store.mjs` 会根据 Auth 用户邮箱或 `auth_user_id` 查询角色。

至少应包含：

| 字段 | 说明 |
|---|---|
| `id` | 主键 |
| `auth_user_id` | Supabase Auth 用户 ID，可为空但建议后续回填 |
| `email` | 登录邮箱，需与 Auth 用户邮箱一致 |
| `role` | `student` / `consultant` / `admin` |
| `applicant_id` | 申请者角色关联的 applicant id |
| `display_name` | 页面显示名 |
| `is_active` | 是否启用 |

### 4.2 `consultant_applicants`

顾问端会读取顾问可访问的申请者列表。

至少应包含：

| 字段 | 说明 |
|---|---|
| `consultant_email` | 顾问邮箱 |
| `applicant_id` | 关联申请者 ID |
| `relationship` | 关系说明 |
| `is_active` | 是否启用 |

### 4.3 `applicants`

申请者门户需要基础申请者信息。

建议确认至少包含：

| 字段 | 说明 |
|---|---|
| `id` | 申请者 ID |
| `name` | 申请者姓名 |
| `email` / `role_email` | 登录/展示邮箱 |
| `auth_user_id` | Auth 用户 ID，可后续回填 |
| `target_major` | 目标方向 |
| `average_score` | 原始均分 |

## 5. 回填 Auth User ID（推荐）

创建 Auth 用户后，建议把 Supabase Authentication Users 中的用户 ID 回填到表里：

```sql
update user_roles
set auth_user_id = '<student auth user id>'
where email = 'student@demo.com';

update user_roles
set auth_user_id = '<consultant auth user id>'
where email = 'consultant@demo.com';

update user_roles
set auth_user_id = '<admin auth user id>'
where email = 'admin@demo.com';

update applicants
set auth_user_id = '<student auth user id>'
where role_email = 'student@demo.com' or email = 'student@demo.com';
```

如果暂时不回填，当前代码仍可优先按 email 做角色解析；但正式演示建议回填，减少歧义。

## 6. Vercel 环境变量配置

进入：

```text
Vercel Project → Settings → Environment Variables
```

添加以下变量，并应用到 Production / Preview / Development（至少 Production 必填）：

```env
SUPABASE_URL=https://你的项目.ref.supabase.co
SUPABASE_ANON_KEY=你的 anon public key
SUPABASE_SERVICE_ROLE_KEY=你的 service_role key
VITE_SUPABASE_URL=https://你的项目.ref.supabase.co
VITE_SUPABASE_ANON_KEY=你的 anon public key
```

配置后必须重新部署：

```text
Vercel Project → Deployments → Redeploy
```

## 7. 验收步骤

重新部署后访问：

```text
https://deutschos-netlify-demo.vercel.app/
```

依次点击三类账号登录：

1. 申请者：应进入申请者门户，不再依赖 `client-demo-fallback`。
2. 顾问：应进入顾问工作台，并可看到申请者列表/问题收件箱。
3. 管理员：应进入管理员后台，不白屏。

API 验收：

```bash
curl https://deutschos-netlify-demo.vercel.app/api/health
```

预期：`ok: true`。

浏览器控制台验收：

- 不应出现 `PrivacyCommercialBlock is not defined`；
- 不应出现 `/api/auth/login 401`；
- 如仍出现 401，优先检查 Auth 用户是否存在、密码是否正确、Vercel 环境变量是否配置到 Production。

## 8. 常见问题

### Q1：仍然 401 怎么办？

按顺序检查：

1. Supabase Authentication 中是否真的创建了对应邮箱用户；
2. 密码是否与 Demo 页面一致；
3. 用户是否已确认邮箱；
4. Vercel 是否配置了 `SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`；
5. 配置环境变量后是否重新部署；
6. `user_roles.email` 是否与 Auth 用户 email 完全一致。

### Q2：登录成功但角色不对怎么办？

检查 `user_roles`：

```sql
select email, role, applicant_id, is_active
from user_roles
where email in ('student@demo.com', 'consultant@demo.com', 'admin@demo.com');
```

### Q3：顾问端没有申请者怎么办？

检查 `consultant_applicants`：

```sql
select *
from consultant_applicants
where consultant_email = 'consultant@demo.com'
  and is_active = true;
```

## 9. 当前结论

代码侧已经准备好真实 Supabase Auth / RBAC 接入。下一步需要你在 Supabase 和 Vercel 后台完成：

1. 创建三个演示 Auth 用户；
2. 执行 SQL 初始化/增量脚本；
3. 配置 Vercel 环境变量；
4. 重新部署并复验。
