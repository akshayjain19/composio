create extension if not exists pgcrypto;

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  official_website text,
  created_at timestamptz not null default now()
);

create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete restrict,
  schema_version integer not null check (schema_version > 0),
  guide_json jsonb not null check (jsonb_typeof(guide_json) = 'object'),
  research_status text not null check (research_status in ('complete', 'unsupported')),
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.research_runs (
  id uuid primary key default gen_random_uuid(),
  provider_input text not null,
  normalized_provider text,
  status text not null check (status in ('in_progress', 'complete', 'unsupported', 'ambiguous', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists guides_provider_generated_idx on public.guides(provider_id, generated_at desc);
create index if not exists guides_generated_idx on public.guides(generated_at desc);
create index if not exists research_runs_created_idx on public.research_runs(created_at desc);
create index if not exists research_runs_normalized_provider_idx on public.research_runs(normalized_provider, created_at desc);

alter table public.providers enable row level security;
alter table public.guides enable row level security;
alter table public.research_runs enable row level security;

-- Public reads are deliberately mediated by the server's least-privilege read-only key.
-- No anon/authenticated policies are defined; writes use the service-role credential server-side.
revoke all on public.providers, public.guides, public.research_runs from anon, authenticated;
grant select on public.providers, public.guides, public.research_runs to service_role;
grant insert, update on public.providers to service_role;
grant insert, update on public.guides to service_role;
grant insert, update on public.research_runs to service_role;
