// Finance Dashboard — shared utilities. Loaded by every page.

// ─── Formatters ─────────────────────────────────────────────
const fmtMoney = (n) => "$" + (Number(n) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtSigned = (n, type) => (type === "expense" ? "−" : "+") + fmtMoney(n);
const fmtDate = (s, opts = { month: "short", day: "numeric" }) => s ? new Date(s).toLocaleDateString("en-US", opts) : "—";
const initials = (name) => (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const avatarColor = (id) => "c-" + (((id || "").charCodeAt(0) || 0) % 4 + 1);
const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ─── API client ─────────────────────────────────────────────
const api = {
  async _req(method, path, body) {
    const res = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },
  dashboard: () => api._req("GET", "/api/dashboard"),
  contacts: {
    list: (status) => api._req("GET", "/api/contacts" + (status ? `?status=${encodeURIComponent(status)}` : "")),
    create: (data) => api._req("POST", "/api/contacts", data),
    update: (id, data) => api._req("PUT", `/api/contacts/${id}`, data),
    remove: (id) => api._req("DELETE", `/api/contacts/${id}`),
  },
  transactions: {
    list: () => api._req("GET", "/api/transactions"),
    create: (data) => api._req("POST", "/api/transactions", data),
    update: (id, data) => api._req("PUT", `/api/transactions/${id}`, data),
    remove: (id) => api._req("DELETE", `/api/transactions/${id}`),
  },
};

// ─── Theme ──────────────────────────────────────────────────
function getTheme() {
  return localStorage.getItem("tally-theme") || "light";
}
function setTheme(theme) {
  localStorage.setItem("tally-theme", theme);
  document.documentElement.setAttribute("data-theme", theme === "cappuccino" ? "cappuccino" : "");
  // Update any toggle buttons on the page
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.textContent = theme === "cappuccino" ? "☀ Seaside" : "☕ Latte";
  });
}
function toggleTheme() {
  setTheme(getTheme() === "cappuccino" ? "light" : "cappuccino");
}
// Apply on every page-load before paint
setTheme(getTheme());

// ─── Sidebar ────────────────────────────────────────────────
function renderSidebar(activePage) {
  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "◐", href: "dashboard.html" },
    { id: "contacts", label: "Contacts", icon: "✿", href: "contacts.html" },
    { id: "transactions", label: "Transactions", icon: "↔", href: "transactions.html" },
    { id: "settings", label: "Settings", icon: "❋", href: "settings.html" },
  ];
  const theme = getTheme();
  return `
    <aside class="sidebar">
      <a href="dashboard.html" class="brand" style="text-decoration:none">
        <div class="brand-mark">F</div>
        <div>
          <div class="brand-name">Finance Dashboard</div>
        </div>
      </a>
      ${NAV.map(n => `
        <a href="${n.href}" class="nav-item ${n.id === activePage ? "active" : ""}">
          <span class="icon">${n.icon}</span>${n.label}
        </a>
      `).join("")}
      <div class="side-bottom">
        <div class="side-stat" id="side-stat">
          <div class="side-stat-label">This week</div>
          <div class="side-stat-value">—</div>
          <div class="side-stat-note">loading…</div>
        </div>
        <div class="side-btn-row">
          <button class="side-btn" data-theme-toggle onclick="toggleTheme()">${theme === "cappuccino" ? "☀ Seaside" : "☕ Latte"}</button>
        </div>
        <button class="side-user" onclick="alert('Sign-out is UI-only — no auth wired yet.')">
          Sign out · Sam Rivera
        </button>
      </div>
    </aside>
  `;
}

// ─── Modal helpers ──────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }

// Add-contact modal: returns markup. Inject once into each page.
function modalAddContact() {
  return `
    <div id="modal-add-contact" class="modal-backdrop hidden" onclick="if(event.target===this)closeModal('modal-add-contact')">
      <div class="modal">
        <div class="modal-eyebrow">NEW PERSON</div>
        <h2 class="modal-title">Add a contact</h2>
        <form id="form-add-contact" onsubmit="return submitAddContact(event)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <label class="field" style="grid-column:span 2"><span class="field-label">Name</span><input class="input" name="name" required placeholder="Full name" /></label>
            <label class="field"><span class="field-label">Email</span><input class="input" type="email" name="email" placeholder="hello@…" /></label>
            <label class="field"><span class="field-label">Phone</span><input class="input" name="phone" placeholder="(555) 555-0000" /></label>
            <label class="field"><span class="field-label">Company</span><input class="input" name="company" placeholder="Where they work" /></label>
            <label class="field"><span class="field-label">Status</span>
              <select class="select" name="status"><option>Lead</option><option>Contacted</option><option>Customer</option></select>
            </label>
            <label class="field" style="grid-column:span 2"><span class="field-label">Follow-up date</span><input class="input" type="date" name="followUpDate" /></label>
            <label class="field" style="grid-column:span 2"><span class="field-label">Notes</span><textarea class="textarea" name="notes" placeholder="What's the context? Where did you meet?"></textarea></label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" onclick="closeModal('modal-add-contact')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save contact</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
async function submitAddContact(e) {
  e.preventDefault();
  const f = e.target;
  const data = Object.fromEntries(new FormData(f).entries());
  try {
    await api.contacts.create(data);
    location.reload();
  } catch (err) {
    alert("Could not save: " + err.message);
  }
  return false;
}

// Add/Edit transaction modal — same form, switches mode based on hidden id field.
function modalAddTransaction(contacts = []) {
  const contactOpts = contacts.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  return `
    <div id="modal-add-tx" class="modal-backdrop hidden" onclick="if(event.target===this)closeModal('modal-add-tx')">
      <div class="modal" style="width:560px">
        <div class="modal-eyebrow" id="tx-modal-eyebrow">NEW ENTRY</div>
        <h2 class="modal-title" id="tx-modal-title">Log a transaction</h2>
        <form id="form-add-tx" onsubmit="return submitAddTransaction(event)">
          <input type="hidden" name="_id" value="" id="tx-edit-id" />
          <div class="pill-group" style="width:100%;margin-bottom:18px">
            <button type="button" class="pill active" data-type="income" onclick="setTxType('income')" style="flex:1">Income</button>
            <button type="button" class="pill" data-type="expense" onclick="setTxType('expense')" style="flex:1">Expense</button>
          </div>
          <input type="hidden" name="type" value="income" id="tx-type-input" />
          <div style="background:var(--surface-alt);border-radius:16px;padding:20px;margin-bottom:18px;text-align:center">
            <div class="field-label" style="margin-bottom:6px">AMOUNT</div>
            <div style="display:inline-flex;align-items:baseline;gap:4px">
              <span style="font-family:var(--font-display);font-size:28px;color:var(--ink-soft)">$</span>
              <input name="amount" required type="number" step="0.01" placeholder="0" style="background:transparent;border:none;outline:none;font-family:var(--font-display);font-size:52px;color:var(--olive);width:200px;text-align:center" id="tx-amount-input" />
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <label class="field"><span class="field-label">Date</span><input class="input" type="date" name="date" required value="${new Date().toISOString().slice(0,10)}" /></label>
            <label class="field"><span class="field-label">Category</span>
              <select class="select" name="category" required>
                <option>Project</option><option>Retainer</option><option>Consulting</option><option>Wholesale</option><option>Software</option><option>Contractor</option><option>Office</option><option>Travel</option>
              </select>
            </label>
            <label class="field" style="grid-column:span 2"><span class="field-label">Description</span><input class="input" name="description" required placeholder="e.g. Northwind — May order" /></label>
            <label class="field"><span class="field-label">Payment method</span>
              <select class="select" name="paymentMethod" required>
                <option>Bank Transfer</option><option>Stripe</option><option>Card</option><option>Wise</option><option>Cash</option><option>Check</option>
              </select>
            </label>
            <label class="field"><span class="field-label">Linked contact</span>
              <select class="select" name="contactId"><option value="">None</option>${contactOpts}</select>
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" id="tx-delete-btn" onclick="deleteTxFromModal()" style="display:none;color:var(--danger);border-color:var(--danger);margin-right:auto">Delete</button>
            <button type="button" class="btn btn-ghost" onclick="closeModal('modal-add-tx')">Cancel</button>
            <button type="submit" class="btn btn-primary" id="tx-submit-btn">Save transaction</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
function setTxType(type) {
  document.getElementById("tx-type-input").value = type;
  document.querySelectorAll("[data-type]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === type);
  });
  const amt = document.getElementById("tx-amount-input");
  if (amt) amt.style.color = type === "income" ? "var(--olive)" : "var(--primary)";
}

// Reset the modal to "add" mode (called whenever the add button is clicked).
function resetTxModal() {
  const f = document.getElementById("form-add-tx");
  if (!f) return;
  f.reset();
  document.getElementById("tx-edit-id").value = "";
  document.getElementById("tx-modal-eyebrow").textContent = "NEW ENTRY";
  document.getElementById("tx-modal-title").textContent = "Log a transaction";
  document.getElementById("tx-submit-btn").textContent = "Save transaction";
  document.getElementById("tx-delete-btn").style.display = "none";
  // Default date to today
  const dateInput = f.querySelector("[name=date]");
  if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
  setTxType("income");
}

// Pre-fill the modal with an existing transaction and switch it to "edit" mode.
function openEditTx(tx) {
  const f = document.getElementById("form-add-tx");
  if (!f) return;
  document.getElementById("tx-edit-id").value = tx.id;
  document.getElementById("tx-modal-eyebrow").textContent = "EDIT ENTRY";
  document.getElementById("tx-modal-title").textContent = "Edit transaction";
  document.getElementById("tx-submit-btn").textContent = "Save changes";
  document.getElementById("tx-delete-btn").style.display = "inline-flex";
  setTxType(tx.type || "income");
  f.querySelector("[name=amount]").value = tx.amount ?? "";
  f.querySelector("[name=date]").value = tx.date ?? "";
  f.querySelector("[name=category]").value = tx.category ?? "";
  f.querySelector("[name=description]").value = tx.description ?? "";
  f.querySelector("[name=paymentMethod]").value = tx.paymentMethod ?? "";
  f.querySelector("[name=contactId]").value = tx.contactId ?? "";
  openModal("modal-add-tx");
}

// Open the modal in "add" mode (resets first so edit-state never leaks).
function openAddTx() {
  resetTxModal();
  openModal("modal-add-tx");
}

async function deleteTxFromModal() {
  const id = document.getElementById("tx-edit-id").value;
  if (!id) return;
  if (!confirm("Delete this transaction? This can't be undone.")) return;
  try {
    await api.transactions.remove(id);
    location.reload();
  } catch (err) {
    alert("Could not delete: " + err.message);
  }
}

async function submitAddTransaction(e) {
  e.preventDefault();
  const f = e.target;
  const data = Object.fromEntries(new FormData(f).entries());
  const editId = data._id;
  delete data._id;
  data.amount = Number(data.amount);
  try {
    if (editId) {
      await api.transactions.update(editId, data);
    } else {
      await api.transactions.create(data);
    }
    location.reload();
  } catch (err) {
    alert("Could not save: " + err.message);
  }
  return false;
}

// ─── Boot ───────────────────────────────────────────────────
// Each page calls bootPage(activeId) — it renders the sidebar and
// fetches the small "this week" stat for the bottom of the sidebar.
async function bootPage(activeId) {
  // Demo banner
  const banner = document.createElement("div");
  banner.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:9999;background:var(--primary);color:#fff;text-align:center;padding:8px 16px;font-size:13px;font-family:var(--font-body)";
  banner.textContent = "👀 Demo mode — data is read-only. Changes won't be saved.";
  document.body.prepend(banner);
  document.body.style.paddingTop = "36px";

  document.getElementById("sidebar-slot").innerHTML = renderSidebar(activeId);
  // Pull a tiny stat so the sidebar feels alive
  try {
    const tx = await api.transactions.list();
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const recent = tx.filter(t => new Date(t.date) >= weekAgo);
    const income = recent.filter(t => t.type === "income").reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const deposits = recent.filter(t => t.type === "income").length;
    const el = document.getElementById("side-stat");
    if (el) {
      el.innerHTML = `
        <div class="side-stat-label">This week</div>
        <div class="side-stat-value">+${fmtMoney(income)}</div>
        <div class="side-stat-note">across ${deposits} deposit${deposits === 1 ? "" : "s"}</div>
      `;
    }
  } catch (e) { /* sidebar stays as placeholder */ }
}

// ─── Error renderer ─────────────────────────────────────────
function renderApiError(target, err) {
  target.innerHTML = `<div class="error">
    Couldn't load data: ${escapeHtml(err.message)}.
    Check that Flask is running and Firestore is reachable.
  </div>`;
}
