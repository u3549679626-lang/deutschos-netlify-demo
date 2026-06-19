-- DeutschOS Step 7 Supabase schema
-- 用法：在 Supabase SQL Editor 中执行。本脚本不包含任何密钥。

create extension if not exists pgcrypto;

create table if not exists public.applicants (
  id text primary key,
  email text unique,
  name text not null,
  profile jsonb not null default '{}'::jsonb,
  assigned_consultant text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_snapshots (
  id uuid primary key default gen_random_uuid(),
  applicant_id text not null references public.applicants(id) on delete cascade,
  payload jsonb not null,
  status text not null default 'draft' check (status in ('draft','reviewed','published','archived')),
  reviewer text,
  source_system text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.expert_outputs (
  id uuid primary key default gen_random_uuid(),
  applicant_id text not null references public.applicants(id) on delete cascade,
  snapshot_id uuid references public.portal_snapshots(id) on delete set null,
  expert text not null,
  output_type text,
  status text not null default 'pending_review',
  visible_to_applicant boolean not null default false,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  applicant_id text not null references public.applicants(id) on delete cascade,
  snapshot_id uuid references public.portal_snapshots(id) on delete set null,
  title text not null,
  period text,
  summary text not null,
  report jsonb not null default '{}'::jsonb,
  visible_to_applicant boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  applicant_id text not null references public.applicants(id) on delete cascade,
  snapshot_id uuid references public.portal_snapshots(id) on delete set null,
  title text not null,
  owner text,
  due text,
  priority text,
  status text,
  visible_to_applicant boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.risks (
  id uuid primary key default gen_random_uuid(),
  applicant_id text not null references public.applicants(id) on delete cascade,
  snapshot_id uuid references public.portal_snapshots(id) on delete set null,
  risk_type text not null,
  level text not null,
  description text not null,
  suggested_action text,
  visible_to_applicant boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_portal_snapshots_applicant_published on public.portal_snapshots(applicant_id, published_at desc);
create index if not exists idx_expert_outputs_applicant on public.expert_outputs(applicant_id, created_at desc);
create index if not exists idx_weekly_reports_applicant on public.weekly_reports(applicant_id, published_at desc);
create index if not exists idx_tasks_applicant on public.tasks(applicant_id, created_at desc);
create index if not exists idx_risks_applicant on public.risks(applicant_id, created_at desc);

-- RLS 建议：生产环境必须启用真实 Auth 后再开放客户端直连。
-- 当前 Demo 通过 Vercel Serverless API 使用 SUPABASE_SERVICE_ROLE_KEY 服务端访问，浏览器不直接持有 service role key。
alter table public.applicants enable row level security;
alter table public.portal_snapshots enable row level security;
alter table public.expert_outputs enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.tasks enable row level security;
alter table public.risks enable row level security;

-- 可选：如果未来接 Supabase Auth，可按 user_id/email 建更严格策略。
-- 本 Demo 阶段不创建 permissive public policy，避免误暴露申请者资料。
