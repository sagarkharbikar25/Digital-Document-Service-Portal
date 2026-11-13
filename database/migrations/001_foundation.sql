-- V2 foundation migration for Supabase PostgreSQL.
-- Supabase Auth owns auth.users. Application tables reference it by UUID.

create extension if not exists pgcrypto;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'student' check (role in ('student', 'clerk', 'hod', 'principal', 'admin')),
  department_id uuid references public.departments(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  bt_id text not null unique,
  phone text,
  program text,
  academic_year text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text not null,
  turnaround_days integer not null default 5 check (turnaround_days > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  reference_no text not null unique,
  student_id uuid not null references public.students(user_id),
  document_type_id uuid not null references public.document_types(id),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'clerk_approved', 'hod_approved', 'approved', 'issued', 'correction_requested', 'rejected', 'cancelled', 'expired', 'revoked')),
  purpose text,
  round integer not null default 1 check (round > 0),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_id uuid references auth.users(id),
  remarks text,
  created_at timestamptz not null default now()
);

create table if not exists public.file_metadata (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  storage_key text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  sha256 text,
  scan_status text not null default 'pending' check (scan_status in ('pending', 'clean', 'infected', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  file_id uuid not null references public.file_metadata(id),
  requirement_code text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id),
  certificate_number text not null unique,
  file_id uuid references public.file_metadata(id),
  pdf_sha256 text not null,
  status text not null default 'active' check (status in ('active', 'revoked', 'superseded', 'expired')),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoke_reason text
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  object_type text not null,
  object_id uuid,
  before_data jsonb,
  after_data jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.health_check (
  id integer primary key default 1,
  checked_at timestamptz not null default now()
);

create index if not exists applications_student_status_idx on public.applications(student_id, status);
create index if not exists applications_status_idx on public.applications(status);
create index if not exists status_history_application_idx on public.application_status_history(application_id, created_at);
create index if not exists notifications_user_read_idx on public.notifications(user_id, read_at);
create index if not exists audit_logs_object_idx on public.audit_logs(object_type, object_id, created_at);

insert into public.health_check (id) values (1) on conflict (id) do nothing;

insert into public.document_types (code, name, category, turnaround_days) values
  ('bonafide', 'Bonafide Certificate', 'Academic records', 3),
  ('character', 'Character Certificate', 'Academic records', 5),
  ('transcript', 'Transcript', 'Academic records', 7),
  ('noc', 'No Objection Certificate', 'Student services', 4),
  ('migration', 'Migration Certificate', 'Student services', 7),
  ('provisional', 'Provisional Certificate', 'Academic records', 5)
on conflict (code) do nothing;
