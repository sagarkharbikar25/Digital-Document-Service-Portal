/* ================================================
   documents.js — Available Documents Page
   JDCOEM Digital Document Services Portal
   Connected to Backend API
   ================================================ */

const API_BASE = window.location.origin + window.location.pathname.split('/').slice(0, -2).join('/') + '/api';

/* ── DOCUMENT PAGE ROUTING MAP ── */
var DOC_PAGES = {
  admission: 'admission.html',
  idcard: 'idcard.html',
  bonafide: 'bonafide.html',
  feereceipt: 'feereceipt.html',
  hallticket: 'hallticket.html',
  marksheet: 'marksheet.html',
  provisional: 'provisional.html',
  degree: 'degree.html',
  leaving: 'leaving.html',
  migration: 'migration.html',
  character: 'character.html',
  noc: 'noc.html',
  transcript: 'transcript.html',
};

/* ── HELPERS & NOTIFICATIONS ── */
function safeSet(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function formatDate(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  var now = new Date();
  var diff = (now - d) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function loadNotifications() {
  fetch(API_BASE + '/notifications/unread-count', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
      if (!res.success) return;
      const count = (res.data && res.data.unread_count) || res.count || 0;

      // Update Bell Badge
      var bellBadge = document.querySelector('.notif-badge');
      if (bellBadge) {
        bellBadge.textContent = count > 0 ? count : '';
        bellBadge.style.display = count > 0 ? 'block' : 'none';
      }

      // Update Sidebar Badge
      var sideBadge = document.getElementById('sideNotifBadge');
      if (sideBadge) {
        sideBadge.textContent = count > 0 ? count : '';
        sideBadge.style.display = count > 0 ? 'block' : 'none';
      }
    });

  fetch(API_BASE + '/notifications/my', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
      var list = document.getElementById('notifList');
      if (!list) return;
      const data = res.data || (Array.isArray(res) ? res : []);
      if (data.length === 0) {
        list.innerHTML = '<div style="padding:24px;text-align:center;color:#9ca3af;font-size:12px;">No new notifications</div>';
        return;
      }

      var html = '';
      data.slice(0, 5).forEach(n => {
        var icon = n.type === 'status' ? '⚡' : '📅';
        html += `
            <div class="nd-item" onclick="markRead(${n.id})">
                <div class="nd-icon">${icon}</div>
                <div class="nd-text">
                    <div class="nd-title">${esc(n.title || n.message)}</div>
                    <div class="nd-desc">${esc(n.description || n.body || '')}</div>
                    <div class="nd-time">${formatDate(n.created_at)}</div>
                </div>
            </div>`;
      });
      list.innerHTML = html;
    });
}

function toggleNotif() {
  var d = document.getElementById('notifDropdown');
  if (d) d.classList.toggle('open');
}

function clearNotifs() {
  fetch(API_BASE + '/notifications/mark-all-read', { method: 'POST', credentials: 'include' })
    .then(() => loadNotifications());
}

function markRead(id) {
  fetch(API_BASE + '/notifications/read', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notification_id: parseInt(id, 10) })
  }).then(() => {
    loadNotifications();
  });
}

function renderUser(u) {
  var name = u.name || u.full_name || u.bt_id || 'Student';
  var btid = u.bt_id || u.btid || u.student_id || u.email || '--';
  var initials = name.split(' ').filter(Boolean).map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();

  safeSet('userInitials', initials);
  safeSet('userName', name);
  safeSet('userId', btid);
}

/* ── NAVIGATE TO APPLICATION FORM ── */
function applyFor(type) {
  localStorage.setItem('selectedDocument', type);
  window.location.href = DOC_PAGES[type] || 'apply-document.html';
}

/* ── INIT ── */
window.addEventListener('DOMContentLoaded', function () {

  /* ── 1. Auth guard — check localStorage first ── */
  var raw = localStorage.getItem('user');
  if (!raw) { window.location.href = 'login.html'; return; }

  var u = JSON.parse(raw);

  /* ── 2. Fill header immediately from localStorage (no flicker) ── */
  renderUser(u);
  loadNotifications();

  /* ── 3. Verify session is still valid with backend ── */
  fetch(API_BASE + '/auth/me', { credentials: 'include' })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (!res.success && !res.user) {
        /* Session expired — clear and redirect */
        localStorage.clear();
        window.location.href = 'login.html';
        return;
      }
      /* Update localStorage with fresh data from server */
      if (res.user) {
        var merged = Object.assign(JSON.parse(localStorage.getItem('user') || '{}'), res.user);
        localStorage.setItem('user', JSON.stringify(merged));
        renderUser(merged);
      }
    })
    .catch(function () {
      /* Network error — keep showing localStorage data, don't redirect */
    });

  /* ── 4. Load real application count for sidebar badge ── */
  fetch(API_BASE + '/application/my', { credentials: 'include' })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (res.success && res.data) {
        var sideAppBadge = document.getElementById('sideAppBadge');
        if (sideAppBadge) {
          sideAppBadge.textContent = res.data.length;
          sideAppBadge.style.display = res.data.length > 0 ? 'block' : 'none';
        }
      }
    })
    .catch(function () { }); /* silent fail */

  /* ── 5. Add global click listener for dropdowns ── */
  document.addEventListener('click', function (e) {
    var notifDropdown = document.getElementById('notifDropdown');
    var notifBtn = document.querySelector('.notif-btn');
    if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
      notifDropdown.classList.remove('open');
    }
  });

  /* ── 5. Staggered card entrance animation ── */
  document.querySelectorAll('.doc-card').forEach(function (card, i) {
    card.style.animationDelay = (i * 0.05) + 's';
  });
});

/* ── ACTIVE FILTER STATE ── */
var activeFilter = 'all';

/* ── SET CATEGORY FILTER ── */
function setFilter(btn, filter) {
  activeFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(function (b) {
    b.classList.remove('active');
  });
  btn.classList.add('active');
  filterCards();
}

/* ── FILTER / SEARCH CARDS ── */
function filterCards() {
  var query = document.getElementById('searchInput').value.toLowerCase().trim();
  var cards = document.querySelectorAll('.doc-card');

  var visible = 0;
  var academicVisible = 0;
  var conductVisible = 0;

  cards.forEach(function (card) {
    var cat = card.dataset.cat;
    var fee = card.dataset.fee;
    var keywords = card.dataset.keywords || '';
    var title = card.querySelector('.card-title').textContent.toLowerCase();
    var desc = card.querySelector('.card-desc').textContent.toLowerCase();

    var matchSearch = !query
      || title.includes(query)
      || desc.includes(query)
      || keywords.includes(query);

    var matchFilter = activeFilter === 'all'
      || (activeFilter === 'academic' && cat === 'academic')
      || (activeFilter === 'conduct' && cat === 'conduct')
      || (activeFilter === 'free' && fee === 'free');

    var show = matchSearch && matchFilter;
    card.style.display = show ? '' : 'none';

    if (show) {
      visible++;
      if (cat === 'academic') academicVisible++;
      if (cat === 'conduct') conductVisible++;
    }
  });

  /* Update counts */
  document.getElementById('visibleCount').textContent = visible;
  document.getElementById('count-academic').textContent = academicVisible + ' document' + (academicVisible !== 1 ? 's' : '');
  document.getElementById('count-conduct').textContent = conductVisible + ' document' + (conductVisible !== 1 ? 's' : '');

  /* Show/hide category sections based on results */
  document.getElementById('cat-academic').style.display = academicVisible > 0 ? '' : 'none';
  document.getElementById('cat-conduct').style.display = conductVisible > 0 ? '' : 'none';

  /* Toggle empty state */
  document.getElementById('emptyState').classList.toggle('show', visible === 0);
}

/* ── LOGOUT (connected to backend) ── */
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    fetch(API_BASE + '/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).finally(function () {
      localStorage.clear();
      window.location.href = 'login.html';
    });
  }
}