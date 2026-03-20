-- ============================================================
-- FlowPilot — Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table organization_members enable row level security;
alter table customers enable row level security;
alter table subscriptions enable row level security;
alter table invoices enable row level security;
alter table tasks enable row level security;
alter table tickets enable row level security;
alter table ticket_comments enable row level security;
alter table activity_logs enable row level security;
alter table notifications enable row level security;
alter table settings enable row level security;

-- ============================================================
-- Helper function: get current user's organization_id
-- ============================================================
create or replace function auth.current_org_id()
returns uuid as $$
  select organization_id from profiles where id = auth.uid();
$$ language sql stable security definer;

-- ============================================================
-- PROFILES — users can read/update their own profile
-- ============================================================
create policy "Users can view their own profile"
  on profiles for select
  using (id = auth.uid());

create policy "Users can update their own profile"
  on profiles for update
  using (id = auth.uid());

-- Admins and managers can view org members' profiles
create policy "Org members can view org profiles"
  on profiles for select
  using (
    organization_id = auth.current_org_id()
  );

-- ============================================================
-- ORGANIZATIONS — members can read, admins can update
-- ============================================================
create policy "Org members can view their organization"
  on organizations for select
  using (id = auth.current_org_id());

create policy "Admins can update their organization"
  on organizations for update
  using (
    id = auth.current_org_id()
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
create policy "Members can view their org members"
  on organization_members for select
  using (organization_id = auth.current_org_id());

create policy "Admins can manage org members"
  on organization_members for all
  using (
    organization_id = auth.current_org_id()
    and exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- ============================================================
-- CUSTOMERS — org-scoped access
-- ============================================================
create policy "Org members can view customers"
  on customers for select
  using (organization_id = auth.current_org_id());

create policy "Org members can insert customers"
  on customers for insert
  with check (organization_id = auth.current_org_id());

create policy "Org members can update customers"
  on customers for update
  using (organization_id = auth.current_org_id());

create policy "Admins/managers can delete customers"
  on customers for delete
  using (
    organization_id = auth.current_org_id()
    and exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create policy "Org members can view subscriptions"
  on subscriptions for select
  using (organization_id = auth.current_org_id());

create policy "Org members can manage subscriptions"
  on subscriptions for all
  using (organization_id = auth.current_org_id());

-- ============================================================
-- INVOICES
-- ============================================================
create policy "Org members can view invoices"
  on invoices for select
  using (organization_id = auth.current_org_id());

create policy "Org members can manage invoices"
  on invoices for all
  using (organization_id = auth.current_org_id());

-- ============================================================
-- TASKS
-- ============================================================
create policy "Org members can view tasks"
  on tasks for select
  using (organization_id = auth.current_org_id());

create policy "Org members can manage tasks"
  on tasks for all
  using (organization_id = auth.current_org_id());

-- ============================================================
-- TICKETS
-- ============================================================
create policy "Org members can view tickets"
  on tickets for select
  using (organization_id = auth.current_org_id());

create policy "Org members can manage tickets"
  on tickets for all
  using (organization_id = auth.current_org_id());

-- ============================================================
-- TICKET COMMENTS
-- ============================================================
create policy "Org members can view ticket comments"
  on ticket_comments for select
  using (
    exists (
      select 1 from tickets
      where id = ticket_comments.ticket_id
      and organization_id = auth.current_org_id()
    )
  );

create policy "Org members can insert comments"
  on ticket_comments for insert
  with check (author_id = auth.uid());

-- ============================================================
-- ACTIVITY LOGS — read only for org members
-- ============================================================
create policy "Org members can view activity logs"
  on activity_logs for select
  using (organization_id = auth.current_org_id());

-- ============================================================
-- NOTIFICATIONS — users see their own
-- ============================================================
create policy "Users can view their notifications"
  on notifications for select
  using (user_id = auth.uid());

create policy "Users can update their notifications"
  on notifications for update
  using (user_id = auth.uid());

-- ============================================================
-- SETTINGS
-- ============================================================
create policy "Org members can view settings"
  on settings for select
  using (organization_id = auth.current_org_id());

create policy "Admins can manage settings"
  on settings for all
  using (
    organization_id = auth.current_org_id()
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
