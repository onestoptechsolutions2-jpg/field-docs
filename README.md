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

## Control tower (work orders)
Everything starts with a **Work Order** (`WO-2026-000184`) created from a **service workflow** (CCTV, Biometric, Access Control, Network, Hardware, Preventive/Break-fix Maintenance, User Support, Biometric Enrolment, Software Development/Enhancement/Bug/System Implementation, Training, Consultancy). Each workflow is a set of dependent **tasks**; a task only becomes ready when the tasks it depends on are done.
- **Why not complete?** — every work order states who owns the next action, what it waits for, since when, and what is blocked.
- **Clocks** are automatic (state changes are timestamped): planned vs actual, active work, assignment/acceptance latency, waiting by party (client, supplier, …), overdue. Deadlines use the working calendar (Admin → Calendar); waiting is raw elapsed time.
- **Evidence gates**: tasks can require an attachment/external reference, a completed field document, a client-signed document, or a ticked checklist before they can be completed.
- **Field documents** (site report, work ticket, handover) are started from a task, pre-filled from the work order, and count as evidence. Client signing, escalation, alerts and Excel export work as before.
- **Admin**: Workflows (edit templates), Calendar (hours, days, holidays), Products, Team (each person belongs to a department).
- Alerts also fire when a task is due within 1 hour and when it becomes overdue.

## Sub-tasks, supervisors, client approvals, Gantt, schedules, email alerts
- **Sub-tasks**: any task can hold assignable sub-tasks. A sub-task can wait on another ("Frontend after Backend"), its assignee can update it even from another team, and the parent task cannot be completed while any are open. Workflow templates can create them with `sub=Backend~Frontend`.
- **Supervisor per task**: pick one when creating a work order (applied to every task) or change it per task. Supervisors get rejection and overdue alerts for their tasks and see them under "Supervising".
- **Client approval pages**: on any task, "Request client approval…" creates a private link (email / WhatsApp / copy). The client sees only the documents you choose, then approves with a signature, requests changes, or declines, with a comment. An approval counts as evidence and completes a waiting approval task automatically.
- **Gantt chart** on every work order: planned baseline vs actual (active, waiting on client/supplier, waiting internally, not started), weekends and holidays shaded, today line, deadline markers.
- **Scheduled jobs** (Schedules, supervisors and admins): weekly to yearly. A work order is generated automatically on the due date (checked hourly), keeping the original day of month. "Run now" and "Run everything due" are available.
- **Email alerts**: every alert that is pushed to devices is also emailed when SMTP is configured. Each person can switch email alerts off from the top menu.
