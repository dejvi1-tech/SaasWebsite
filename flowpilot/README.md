# FlowPilot — Premium SaaS Dashboard

> Eine vollständige, produktionsreife SaaS-Dashboard-Anwendung mit React, Next.js 16, TypeScript, Tailwind CSS, Supabase und zweisprachiger Unterstützung (Deutsch / Englisch).

![FlowPilot Screenshot](public/screenshot-placeholder.png)

---

## Tech Stack

| Technologie | Beschreibung |
|-------------|--------------|
| **Next.js 16** | Full-Stack Framework mit App Router & Server Actions |
| **TypeScript** | Strenge Typisierung im gesamten Projekt |
| **Tailwind CSS** | Utility-first CSS mit custom Design-System |
| **Supabase** | PostgreSQL, Auth, Storage, Realtime |
| **React Hook Form + Zod** | Formularvalidierung |
| **TanStack Table** | Leistungsstarke Datentabellen |
| **Recharts** | Analytik-Charts |
| **Zustand** | Client-State-Management |
| **Sonner** | Toast-Benachrichtigungen |
| **next-themes** | Dark/Light Mode |
| **Lucide React** | Icons |

---

## Features

### Authentifizierung
- E-Mail + Passwort (Supabase Auth)
- Geschützte Routen über Middleware
- Rollenbasierte Zugriffssteuerung (Admin / Manager / Member)
- Passwort vergessen / zurücksetzen

### Dashboard-Module
- **Übersicht**: KPI-Karten, Umsatz-Charts, Nutzerwachstum, Abonnement-Verteilung, Aktivitätsprotokoll
- **Kunden**: Tabelle mit Suche, Filter, Paginierung, CRUD-Dialoge, Detailseite
- **Abonnements**: Plan-Übersicht, Status-Management, Plan-Karten
- **Rechnungen**: Rechnungstabelle, Status-Badges, PDF-Download-UI
- **Team**: Mitgliederverwaltung, Rollen, Einladungs-Dialog
- **Analytik**: Revenue-Charts, User-Growth, Traffic-Quellen, Conversion-Funnel
- **Aufgaben**: Kanban-Board mit 4 Spalten, Prioritäten, Fälligkeitsdaten
- **Support-Tickets**: Ticket-Liste, Status-Filter, Prioritäts-Badges
- **Einstellungen**: Profil, Unternehmen, Benachrichtigungen, Sicherheit, Sprache, Design

### UI/UX
- Vollständig responsives Layout (Mobile + Desktop)
- Dark Mode & Light Mode
- Sprach-Switcher: 🇩🇪 Deutsch (Standard) / 🇬🇧 Englisch
- Zusammenklappbare Sidebar
- Breadcrumb-Navigation
- Loading States & Skeleton Loader
- Toast-Benachrichtigungen
- Premium-Design (inspired by Linear, Vercel, Stripe)

---

## Projektstruktur

```
flowpilot/
├── messages/
│   ├── de.json             # Deutsche Übersetzungen (Standard)
│   └── en.json             # Englische Übersetzungen
├── src/
│   ├── app/
│   │   ├── (auth)/         # Auth-Seiten (login, signup, forgot-password)
│   │   ├── (dashboard)/    # Geschützte Dashboard-Seiten
│   │   │   └── dashboard/
│   │   │       ├── page.tsx
│   │   │       ├── customers/
│   │   │       ├── subscriptions/
│   │   │       ├── invoices/
│   │   │       ├── team/
│   │   │       ├── analytics/
│   │   │       ├── tasks/
│   │   │       ├── tickets/
│   │   │       └── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx        # Root → redirect to /dashboard
│   ├── components/
│   │   ├── ui/             # shadcn-style UI-Komponenten
│   │   ├── layout/         # Sidebar, Header, Breadcrumb, Shell
│   │   ├── auth/           # Login, Signup, ForgotPassword Forms
│   │   ├── dashboard/      # KPI Cards, Charts, Activity Feed
│   │   ├── customers/      # Customer Table, Detail, Dialog
│   │   ├── subscriptions/  # Subscriptions Page
│   │   ├── invoices/       # Invoices Page
│   │   ├── team/           # Team Management
│   │   ├── analytics/      # Analytics Charts
│   │   ├── tasks/          # Kanban Board
│   │   ├── tickets/        # Support Tickets
│   │   ├── settings/       # Settings Tabs
│   │   └── providers/      # Theme Provider
│   ├── hooks/
│   │   └── use-translation.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts   # Browser Client
│   │   │   ├── server.ts   # Server Client
│   │   │   └── middleware.ts
│   │   ├── i18n.ts         # i18n System
│   │   └── utils.ts        # Utility-Funktionen
│   ├── stores/
│   │   └── language-store.ts  # Zustand: Sprach-Persistierung
│   ├── types/
│   │   ├── database.ts     # Supabase-Typen
│   │   └── index.ts
│   └── middleware.ts       # Route-Schutz
├── supabase/
│   ├── schema.sql          # Datenbankschema
│   ├── rls.sql             # Row Level Security Policies
│   └── seed.sql            # Seed-Daten für Demo
├── .env.example
└── .env.local
```

---

## Lokale Entwicklung

### Voraussetzungen
- Node.js 20+
- npm / pnpm
- Supabase-Konto (kostenlos auf supabase.com)

### 1. Repository klonen und Abhängigkeiten installieren

```bash
git clone <repo-url>
cd flowpilot
npm install
```

### 2. Supabase-Projekt einrichten

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Öffne den SQL-Editor in deinem Supabase-Dashboard
3. Führe die SQL-Dateien in dieser Reihenfolge aus:
   ```sql
   -- 1. Schema
   \i supabase/schema.sql
   -- 2. RLS Policies
   \i supabase/rls.sql
   -- 3. Optional: Seed-Daten
   \i supabase/seed.sql
   ```

### 3. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env.local
```

Öffne `.env.local` und füge deine Supabase-Credentials ein:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key
```

Die Keys findest du in: Supabase Dashboard → Settings → API

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) — du wirst automatisch zur `/login`-Seite weitergeleitet.

### 5. Test-Account erstellen

Registriere dich über `/signup` oder nutze die Demo-Credentials:
- E-Mail: `admin@flowpilot.de`
- Passwort: `password123`

*(Wenn du den Seed ausgeführt hast und einen Nutzer angelegt hast)*

---

## Datenbankschema — Übersicht

```
organizations          ← Mandant/Tenant
    └── profiles       ← Nutzerprofile (extends auth.users)
    └── organization_members ← Rollenzuweisung
    └── customers      ← Kunden
        └── subscriptions ← Abonnements pro Kunde
        └── invoices   ← Rechnungen pro Kunde
    └── tasks          ← Aufgaben
    └── tickets        ← Support-Tickets
        └── ticket_comments ← Kommentare
    └── activity_logs  ← Audit-Log
    └── notifications  ← Nutzerbenachrichtigungen
    └── settings       ← Organisations-Einstellungen
```

Alle Tabellen sind durch **Row Level Security (RLS)** abgesichert:
- Nutzer können nur Daten ihrer eigenen Organisation lesen/schreiben
- Admins haben erweiterte Schreibrechte
- Automatische Profilerstellung bei Registrierung via Trigger

---

## i18n (Internationalisierung)

Alle UI-Texte sind in `messages/de.json` und `messages/en.json` gespeichert.

```typescript
// In jeder Client-Komponente:
const { t, language } = useTranslation();
// t("customers.title") → "Kunden" (DE) / "Customers" (EN)
```

Der Sprachswitcher in der Header-Leiste persistiert die Auswahl via `localStorage` (Zustand + `persist` Middleware).

**Standard: Deutsch 🇩🇪**

---

## Deployment

### Vercel (empfohlen)

```bash
npm install -g vercel
vercel
```

Füge die Umgebungsvariablen in Vercel → Settings → Environment Variables ein.

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

### Eigener Server

```bash
npm run build
npm start
```

---

## Supabase Storage (Avatare & Uploads)

Erstelle diese Storage Buckets in Supabase Dashboard → Storage:

```
avatars/      ← Nutzer-Avatare (public)
logos/        ← Unternehmenslogos (public)
attachments/  ← Ticket-Anhänge (private)
```

---

## Lizenz

MIT License — frei für kommerzielle und private Nutzung.

---

*Entwickelt mit ❤️ als Portfolio-Projekt für den deutschen Arbeitsmarkt.*
*Technologien: Next.js · TypeScript · Tailwind CSS · Supabase · Recharts*
