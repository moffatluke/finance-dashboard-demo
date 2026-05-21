# Tally — frontend (Hearth)

## What's here

```
frontend/
  index.html          → redirects to /dashboard.html
  dashboard.html      → cash flow chart, pipeline, follow-ups, recent activity
  contacts.html       → list + filters + search + grid
  contact.html        → single contact detail (uses ?id= in URL)
  transactions.html   → table + filters + totals + add-modal
  settings.html       → workspace, theme toggle (Seaside ↔ Cappuccino), exports
  app.js              → shared: API client, sidebar render, theme, modals, formatters
  styles.css          → all visual styles; tokens via CSS custom properties
```


## Run

```bash
python app.py
```

Then open <http://127.0.0.1:5000/>. You'll land on the dashboard.

The first load talks to your live `/api/contacts`, `/api/transactions`, and
(optionally) `/api/dashboard` endpoints. If Firestore isn't reachable, each
page shows a friendly error banner instead of crashing.

## How it talks to the backend

`app.js` exposes a tiny `api` object that wraps your existing routes:

```js
await api.dashboard();                 // GET  /api/dashboard
await api.contacts.list();             // GET  /api/contacts
await api.contacts.list("Lead");       // GET  /api/contacts?status=Lead
await api.contacts.create(data);       // POST /api/contacts
await api.contacts.update(id, data);   // PUT  /api/contacts/<id>
await api.contacts.remove(id);         // DEL  /api/contacts/<id>
await api.transactions.list();         // GET  /api/transactions
await api.transactions.create(data);   // POST /api/transactions
// …and update/remove
```

Modal save handlers call these and then `location.reload()` to refresh the view.

## Things deliberately not built (yet)

- **Edit-contact form** — the Edit button on a contact detail page just alerts.
  Backend already supports `PUT /api/contacts/<id>`; reuse the add-contact
  modal pre-filled with the contact's data.
- **Login / auth** — the backend has no auth yet, so there's no login screen.
  The sidebar "Sign out" is a placeholder.
- **Editing/deleting transactions from the list** — only delete-contact is
  wired. Add a row-action menu on `transactions.html` when needed.

