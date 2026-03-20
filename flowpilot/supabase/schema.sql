-- ============================================================
-- FlowPilot — Supabase PostgreSQL Schema
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fast text search

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('admin', 'manager', 'member');
create type customer_status as enum ('active', 'inactive', 'churned', 'trial');
create type subscription_status as enum ('active', 'trialing', 'canceled', 'past_due', 'paused');
create type invoice_status as enum ('paid', 'pending', 'overdue', 'draft');
create type task_status as enum ('todo', 'in_progress', 'review', 'done');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type ticket_priority as enum ('low', 'medium', 'high', 'critical');

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  logo_url text,
  website text,
  industry text,
  size text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_organizations_slug on organizations(slug);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role user_role not null default 'member',
  organization_id uuid references organizations(id) on delete set null,
  language text not null default 'de',
  theme text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_organization_id on profiles(organization_id);
create index idx_profiles_email on profiles(email);

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
create table organization_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role user_role not null default 'member',
  invited_by uuid references profiles(id),
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique(organization_id, user_id)
);

create index idx_org_members_org on organization_members(organization_id);
create index idx_org_members_user on organization_members(user_id);

-- ============================================================
-- CUSTOMERS
-- ============================================================
create table customers (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text not null,
  company text,
  phone text,
  status customer_status not null default 'active',
  plan text,
  mrr numeric(10, 2) not null default 0,
  avatar_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customers_organization_id on customers(organization_id);
create index idx_customers_status on customers(status);
create index idx_customers_email on customers(email);
create index idx_customers_search on customers using gin((name || ' ' || email || ' ' || coalesce(company, '')) gin_trgm_ops);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  plan_name text not null,
  plan_price numeric(10, 2) not null,
  status subscription_status not null default 'active',
  trial_ends_at timestamptz,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subscriptions_org on subscriptions(organization_id);
create index idx_subscriptions_customer on subscriptions(customer_id);
create index idx_subscriptions_status on subscriptions(status);

-- ============================================================
-- INVOICES
-- ============================================================
create table invoices (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  invoice_number text not null unique,
  status invoice_status not null default 'draft',
  amount numeric(10, 2) not null,
  tax numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  due_date date not null,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_invoices_org on invoices(organization_id);
create index idx_invoices_customer on invoices(customer_id);
create index idx_invoices_status on invoices(status);
create index idx_invoices_due_date on invoices(due_date);

-- ============================================================
-- TASKS
-- ============================================================
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  status task_status not null default 'todo',
  priority task_priority not null default 'medium',
  assignee_id uuid references profiles(id) on delete set null,
  due_date date,
  position integer not null default 0,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_org on tasks(organization_id);
create index idx_tasks_status on tasks(status);
create index idx_tasks_assignee on tasks(assignee_id);

-- ============================================================
-- TICKETS
-- ============================================================
create table tickets (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  title text not null,
  description text not null,
  status ticket_status not null default 'open',
  priority ticket_priority not null default 'medium',
  assigned_to uuid references profiles(id) on delete set null,
  resolved_at timestamptz,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tickets_org on tickets(organization_id);
create index idx_tickets_status on tickets(status);
create index idx_tickets_customer on tickets(customer_id);
create index idx_tickets_assigned on tickets(assigned_to);

-- ============================================================
-- TICKET COMMENTS
-- ============================================================
create table ticket_comments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  author_id uuid not null references profiles(id),
  content text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_ticket_comments_ticket on ticket_comments(ticket_id);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_activity_logs_org on activity_logs(organization_id);
create index idx_activity_logs_created_at on activity_logs(created_at desc);
create index idx_activity_logs_entity on activity_logs(entity_type, entity_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id);
create index idx_notifications_unread on notifications(user_id, read) where read = false;

-- ============================================================
-- SETTINGS
-- ============================================================
create table settings (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, key)
);

create index idx_settings_org on settings(organization_id);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on profiles for each row execute procedure update_updated_at_column();
create trigger update_organizations_updated_at before update on organizations for each row execute procedure update_updated_at_column();
create trigger update_customers_updated_at before update on customers for each row execute procedure update_updated_at_column();
create trigger update_subscriptions_updated_at before update on subscriptions for each row execute procedure update_updated_at_column();
create trigger update_invoices_updated_at before update on invoices for each row execute procedure update_updated_at_column();
create trigger update_tasks_updated_at before update on tasks for each row execute procedure update_updated_at_column();
create trigger update_tickets_updated_at before update on tickets for each row execute procedure update_updated_at_column();
create trigger update_settings_updated_at before update on settings for each row execute procedure update_updated_at_column();

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
declare
  default_org_id uuid;
begin
  -- Create a default organization for new user
  insert into organizations (name, slug)
  values (
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)) || '''s Organization',
    lower(regexp_replace(
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      '[^a-z0-9]+', '-', 'g'
    )) || '-' || substring(new.id::text, 1, 8)
  )
  returning id into default_org_id;

  -- Create profile
  insert into profiles (id, email, full_name, role, organization_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'admin',
    default_org_id
  );

  -- Create org member record
  insert into organization_members (organization_id, user_id, role, joined_at)
  values (default_org_id, new.id, 'admin', now());

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
