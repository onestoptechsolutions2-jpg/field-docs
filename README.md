# Nanosoft Field Docs
1. `cp .env.example .env` and edit (admin login, secret, SMTP).
2. `docker compose up -d --build` → http://localhost:3090
3. Log in as admin → **Team**: add technicians and at least one **Supervisor**.
Flow: pick a job (survey / install / maintenance / work ticket / handover) → guided wizard → sign → escalate (optional) → send to client (email / WhatsApp / link) → client comments & signs online → document locks.
Roles: technician sees own jobs; supervisor & admin see all. Escalations appear in the supervisor's queue (and by email if SMTP is set).
Excel: "Export to Excel" on the dashboard (respects filters) and on Escalations. Sheets: Documents, Work Done, Equipment.
Backup: `docker compose exec db pg_dump -U fd fd > backup.sql`
