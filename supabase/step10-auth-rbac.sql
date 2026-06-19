-- DeutschOS Step 10 Auth & RBAC migration
-- Run this in Supabase SQL Editor after Step 7 schema.
-- This script does not contain secrets.

alter table public.applicants
  add column if not exists auth_user_id uuid,
  add column if not exists role_email text;

create unique index if not exists idx_applicants_auth_user_id
  on public.applicants(auth_user_id)
  where auth_user_id is not null;

create index if not exists idx_applicants_role_email
  on public.applicants(lower(coalesce(role_email, email)));

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null,
  role text not null check (role in ('student','consultant','admin')),
  applicant_id text references public.applicants(id) on delete set null,
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, role)
);

create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_email on public.user_roles(lower(email));
create index if not exists idx_user_roles_applicant on public.user_roles(applicant_id);

create table if not exists public.consultant_applicants (
  id uuid primary key default gen_random_uuid(),
  consultant_email text not null,
  consultant_user_id uuid,
  applicant_id text not null references public.applicants(id) on delete cascade,
  status text not null default 'active' check (status in ('active','paused','archived')),
  created_at timestamptz not null default now(),
  unique (consultant_email, applicant_id)
);

create index if not exists idx_consultant_applicants_email on public.consultant_applicants(lower(consultant_email));
create index if not exists idx_consultant_applicants_user on public.consultant_applicants(consultant_user_id);
create index if not exists idx_consultant_applicants_applicant on public.consultant_applicants(applicant_id);

insert into public.applicants (id, email, name, profile, assigned_consultant, role_email)
values (
  'app-001',
  'student@demo.com',
  'Demo Applicant',
  '{"targetDirection":"数据科学与人工智能","intake":"Winter Semester 2026"}'::jsonb,
  'consultant@demo.com',
  'student@demo.com'
)
on conflict (id) do update set
  email = excluded.email,
  name = excluded.name,
  assigned_consultant = excluded.assigned_consultant,
  role_email = excluded.role_email,
  updated_at = now();

insert into public.user_roles (email, role, applicant_id, display_name)
values
  ('student@demo.com', 'student', 'app-001', 'Demo Applicant'),
  ('consultant@demo.com', 'consultant', null, 'DeutschOS 顾问'),
  ('admin@demo.com', 'admin', null, '系统管理员')
on conflict (email, role) do update set
  applicant_id = excluded.applicant_id,
  display_name = excluded.display_name,
  is_active = true,
  updated_at = now();

insert into public.consultant_applicants (consultant_email, applicant_id, status)
values ('consultant@demo.com', 'app-001', 'active')
on conflict (consultant_email, applicant_id) do update set status = 'active';

alter table public.user_roles enable row level security;
alter table public.consultant_applicants enable row level security;

-- Do not create broad public policies in this demo. Access is mediated by Vercel Serverless API.
