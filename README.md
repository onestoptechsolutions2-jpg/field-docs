# Nanosoft Field Docs
1. `cp .env.example .env` and edit (admin login, secret, SMTP).
2. `docker compose up -d --build` → http://localhost:3090
3. Log in as admin → **Team**: add technicians and at least one **Supervisor**.
Flow: pick a job (survey / install / maintenance / work ticket / handover) → guided wizard → sign → escalate (optional) → send to client (email / WhatsApp / link) → client comments & signs online → document locks.
Roles: technician sees own jobs; supervisor & admin see all. Escalations appear in the supervisor's queue (and by email if SMTP is set).
Excel: "Export to Excel" on the dashboard (respects filters) and on Escalations. Sheets: Documents, Work Done, Equipment.
Backup: `docker compose exec db pg_dump -U fd fd > backup.sql`
Clients: pick an existing client in the wizard or add a new one inline; their email/phone prefill the send-to-client step.

## App install, alerts & reports
- **Install as an app:** open the site in Chrome/Edge/Safari → "Install app" button (or Share → Add to Home Screen on iPhone).
- **Device alerts:** tap 🔔 Enable alerts once per device. Needs **HTTPS** (put Caddy/nginx in front). Alerts: client opened, client signed, escalation raised, escalation acknowledged/resolved, monthly report ready. Keys are generated automatically.
- **Monthly report:** Reports page (per month) → Print/PDF or Export to Excel. On the 1st of each month (after 07:00 Africa/Nairobi) admins & supervisors get the previous month's summary by push and email (email needs SMTP).

## Managing systems / products
Admin → **Products**: add, rename, hide/show or delete the systems shown in the wizard's "System / product" list. Reports break down work by system.
