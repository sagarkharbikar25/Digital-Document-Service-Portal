'use strict';
/* ============================================================
   JDCOEM Admin Portal — db.js
   Utility helpers shared across admin pages.
   NOTE: Authentication is handled by the PHP backend.
         This file only provides UI/storage utilities.
   ============================================================ */

const DB_KEY = 'jdc_admin_registry'; /* used by setup.html display only */

/* ── PASSWORD STRENGTH ──────────────────────────────────── */
function pwStrength(pw) {
  if (!pw)          return { pct: 0,  color: '#e5e7eb', label: 'Min. 6 characters' };
  if (pw.length < 4) return { pct: 15, color: '#ef4444', label: 'Too short' };

  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { pct: 25,  color: '#ef4444', label: 'Weak' };
  if (score === 2) return { pct: 50,  color: '#f97316', label: 'Fair' };
  if (score === 3) return { pct: 72,  color: '#eab308', label: 'Good' };
  if (score === 4) return { pct: 88,  color: '#22c55e', label: 'Strong' };
  return              { pct: 100, color: '#16a34a', label: 'Very Strong' };
}

/* ── SETUP.HTML HELPERS (localStorage display only) ─────── */

/**
 * getAdminUsers — returns accounts stored by setup.html (display only).
 * Real auth uses backend. This list is for the setup UI to show who was registered.
 */
function getAdminUsers() {
  try { return JSON.parse(localStorage.getItem(DB_KEY) || '[]'); }
  catch(e) { return []; }
}

function hasAdminUsers() {
  return getAdminUsers().length > 0;
}

/**
 * createAdminUser — called from setup.html to register an admin via backend.
 * Makes a real API call to POST /api/admin/users/create.
 * Returns { ok: false, error: '...' } synchronously if validation fails,
 * otherwise returns { ok: true, async: true } and handles async internally.
 */
function createAdminUser(data, onSuccess, onError) {
  const { email, password, name, designation, dept, role } = data;

  /* Basic validation */
  const existing = getAdminUsers();
  if (existing.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: 'An account with this email already exists.' };
  }
  if (!['clerk', 'hod', 'principal'].includes(role)) {
    return { ok: false, error: 'Invalid role selected.' };
  }

  /* Call real backend */
  const BASE_URL = window.location.origin + window.location.pathname.split('/public/')[0];
  const API = BASE_URL + '/public/index.php/api';

  fetch(API + '/admin/users/create', {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, designation, department: dept, role })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success || res.status === 'success') {
      /* Also save to localStorage for setup UI display */
      const reg = getAdminUsers();
      reg.push({
        id:          res.user?.id || res.id || Date.now().toString(36),
        name,
        email,
        role,
        designation,
        department:  dept
      });
      localStorage.setItem(DB_KEY, JSON.stringify(reg));
      if (onSuccess) onSuccess(res);
    } else {
      if (onError) onError(res.message || 'Failed to create account.');
    }
  })
  .catch(err => {
    console.error('[Setup] createAdminUser error:', err);
    if (onError) onError('Network error. Check that XAMPP is running.');
  });

  return { ok: true, async: true };
}

/**
 * deleteAdminUser — removes from backend + localStorage display list.
 */
function deleteAdminUser(id, onSuccess, onError) {
  const BASE_URL = window.location.origin + window.location.pathname.split('/public/')[0];
  const API = BASE_URL + '/public/index.php/api';

  fetch(API + '/admin/users/delete', {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify({ id })
  })
  .then(r => r.json())
  .then(res => {
    /* Remove from localStorage display list regardless */
    const reg = getAdminUsers().filter(u => u.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(reg));
    if (onSuccess) onSuccess();
  })
  .catch(err => {
    console.error('[Setup] deleteAdminUser error:', err);
    /* Still remove from display list */
    const reg = getAdminUsers().filter(u => u.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(reg));
    if (onSuccess) onSuccess();
  });
}

/* ── TOAST (used by setup.html) ─────────────────────────── */
function showToast(msg, type) {
  let wrap = document.getElementById('_tw');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = '_tw';
    wrap.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  const colors = { ok: '#0a7c4e', err: '#b91c1c', warn: '#b45309' };
  t.style.cssText = `background:${colors[type]||'#06122a'};color:#fff;border-radius:10px;padding:12px 18px;font-size:13px;font-weight:500;box-shadow:0 8px 32px rgba(0,0,0,.25);max-width:300px;font-family:'Sora',sans-serif;`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3200);
}

/* ── LEGACY STUBS (kept for compatibility) ────────────────
   These were used by the old mock-auth flow. Now they are
   no-ops or redirect to backend functions. ─────────────── */

/** @deprecated Use real backend login instead */
function loginAdmin(email, pw) {
  console.warn('[db.js] loginAdmin() is deprecated. Real auth handled by login.js → backend.');
  return null;
}

/** @deprecated */
function getSession() {
  const raw = localStorage.getItem('admin_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch(e) { return null; }
}