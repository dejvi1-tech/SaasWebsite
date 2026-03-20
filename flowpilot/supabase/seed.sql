-- ============================================================
-- FlowPilot — Sample Seed Data
-- Run AFTER schema.sql and rls.sql
-- NOTE: Replace org_id and user_id with real values
-- ============================================================

-- Demo organization (replace UUIDs as needed)
insert into organizations (id, name, slug, website, industry, size) values
  ('00000000-0000-0000-0000-000000000001', 'FlowPilot Demo', 'flowpilot-demo', 'https://flowpilot.de', 'Software / SaaS', '10-50');

-- Demo customers
insert into customers (id, organization_id, name, email, company, status, plan, mrr) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Klaus Weber', 'k.weber@techvision.de', 'TechVision GmbH', 'active', 'Enterprise', 1299.00),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Sarah Müller', 's.mueller@dataflow.ch', 'DataFlow AG', 'active', 'Professional', 799.00),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Jan Bauer', 'jan@startuphub.de', 'StartupHub Berlin', 'trial', 'Starter', 299.00),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Diana Koch', 'd.koch@medicosoft.de', 'MedicoSoft', 'inactive', 'Starter', 0.00),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Felix Braun', 'felix@cloudpeak.de', 'CloudPeak AG', 'active', 'Enterprise', 1299.00),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Lisa Fischer', 'lisa@brightanalytics.de', 'Bright Analytics', 'active', 'Professional', 799.00),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Tom Hoffmann', 'tom@digitalworks.de', 'Digital Works', 'churned', 'Starter', 0.00),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Nina Schulz', 'nina@solutions.de', 'Solutions GmbH', 'active', 'Professional', 799.00);

-- Demo subscriptions
insert into subscriptions (organization_id, customer_id, plan_name, plan_price, status, current_period_start, current_period_end) values
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Enterprise', 1299.00, 'active', '2026-03-01', '2026-04-01'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Professional', 799.00, 'active', '2026-03-01', '2026-04-01'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Starter', 299.00, 'trialing', '2026-03-10', '2026-03-24'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Enterprise', 1299.00, 'active', '2026-03-01', '2026-04-01'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'Professional', 799.00, 'active', '2026-03-01', '2026-04-01'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Starter', 299.00, 'canceled', '2025-12-01', '2026-01-01');

-- Demo invoices
insert into invoices (organization_id, customer_id, invoice_number, status, amount, tax, total, due_date, paid_at) values
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'INV-2026-001', 'paid', 1299.00, 246.81, 1545.81, '2026-02-28', '2026-02-25'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'INV-2026-002', 'paid', 799.00, 151.81, 950.81, '2026-02-28', '2026-02-20'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'INV-2026-003', 'pending', 299.00, 56.81, 355.81, '2026-03-31', null),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'INV-2026-004', 'overdue', 799.00, 151.81, 950.81, '2026-02-15', null),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'INV-2026-005', 'draft', 1299.00, 246.81, 1545.81, '2026-04-01', null);

-- Demo tasks
insert into tasks (organization_id, title, description, status, priority, due_date, position, created_by) values
  ('00000000-0000-0000-0000-000000000001', 'API-Dokumentation aktualisieren', 'Alle REST-Endpoints dokumentieren', 'todo', 'medium', '2026-03-28', 0, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', 'Dashboard-Performance optimieren', 'Core Web Vitals verbessern', 'in_progress', 'high', '2026-03-25', 0, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', 'Security-Audit Q1', 'OWASP Top 10 prüfen', 'review', 'high', '2026-03-20', 0, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', 'Onboarding-Flow überarbeiten', 'UX-Test durchgeführt, Änderungen umsetzen', 'done', 'medium', '2026-03-15', 0, '00000000-0000-0000-0000-000000000001');

-- Demo support tickets
insert into tickets (organization_id, customer_id, title, description, status, priority, created_by) values
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Kann nicht einloggen', '2FA funktioniert nicht nach dem Update', 'open', 'high', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'PDF-Export fehlt', 'Rechnungs-PDF wird nicht generiert', 'in_progress', 'medium', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'API-Frage', 'Rate Limits der REST API', 'resolved', 'low', '00000000-0000-0000-0000-000000000001');

-- Demo activity logs
insert into activity_logs (organization_id, user_id, action, entity_type, entity_id, metadata) values
  ('00000000-0000-0000-0000-000000000001', null, 'customer_created', 'customer', '10000000-0000-0000-0000-000000000001', '{"name": "Klaus Weber"}'),
  ('00000000-0000-0000-0000-000000000001', null, 'invoice_paid', 'invoice', null, '{"number": "INV-2026-001", "amount": "€1.546"}'),
  ('00000000-0000-0000-0000-000000000001', null, 'subscription_created', 'subscription', null, '{"plan": "Enterprise", "customer": "TechVision GmbH"}'),
  ('00000000-0000-0000-0000-000000000001', null, 'ticket_created', 'ticket', null, '{"title": "Kann nicht einloggen"}');
