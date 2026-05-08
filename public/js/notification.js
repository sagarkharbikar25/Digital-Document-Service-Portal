/* ============================================================
   JDCOEM – Student Portal
   notifications.js  |  Backend Connected
   ============================================================ */

const API_BASE = window.location.origin + window.location.pathname.split('/').slice(0, -2).join('/') + '/api';

/* ── STATE ── */
var ALL_NOTIFS   = [];
var activeFilter = 'all';
var activeSearch = '';

var DATE_GROUPS = ['today', 'yesterday', 'older'];
var DATE_LABELS = { today: 'Today', yesterday: 'Yesterday', older: 'Earlier' };

/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */
function renderUser(u) {
    const name = u.name || u.full_name || u.bt_id || 'Student';
    const btid = u.bt_id || u.btid || u.student_id || '--';
    const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();

    safeSet('userInitials', initials);
    safeSet('userName',     name);
    safeSet('userId',       btid);

    /* Also update any avatar elements */
    var avatars = document.querySelectorAll('.user-avatar');
    avatars.forEach(function(a) { a.textContent = initials; });
}

/* ════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', function () {
    var raw = localStorage.getItem('user');
    if (!raw) { window.location.href = 'login.html'; return; }

    try {
        var u = JSON.parse(raw);
        renderUser(u);
    } catch(e) {
        localStorage.clear();
        window.location.href = 'login.html';
        return;
    }

    /* Refresh from backend session for up-to-date BTID */
    fetch(API_BASE + '/auth/me', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (res.success && res.user) {
                var merged = Object.assign(JSON.parse(localStorage.getItem('user') || '{}'), res.user);
                localStorage.setItem('user', JSON.stringify(merged));
                renderUser(merged);
            }
        })
        .catch(function(){});

    /* ── Restore notification settings ── */
    var settings = JSON.parse(localStorage.getItem('notifSettings') || '{}');
    if (document.getElementById('tog-email')) document.getElementById('tog-email').checked    = settings.email    !== false;
    if (document.getElementById('tog-portal')) document.getElementById('tog-portal').checked   = !!settings.portal;
    if (document.getElementById('tog-doconly')) document.getElementById('tog-doconly').checked  = !!settings.doconly;
    if (document.getElementById('tog-sms')) document.getElementById('tog-sms').checked      = settings.sms     !== false;
    if (document.getElementById('tog-announce')) document.getElementById('tog-announce').checked = settings.announce !== false;

    /* ── Load dynamic data ── */
    loadNotifications();
    loadHeaderNotifications();
    loadSidebarCount();
});

/* ── STANDARD NOTIFICATIONS ──────────────────────── */
function toggleNotif() {
  var d = document.getElementById('notifDropdown');
  if (d) d.classList.toggle('open');
}
window.addEventListener('click', function(e) {
  var d = document.getElementById('notifDropdown');
  var b = document.querySelector('.notif-btn');
  if (d && b && !d.contains(e.target) && !b.contains(e.target)) {
    d.classList.remove('open');
  }
});

  function loadHeaderNotifications() {
    fetch(API_BASE + '/notifications/unread-count', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        if (!res.success) return;
        const count = (res.data && res.data.unread_count) || res.count || 0;
        
        // Header Bell Badge
        const bellBadge = document.querySelector('.notif-badge');
        if (bellBadge) {
            bellBadge.textContent = count > 0 ? count : '';
            bellBadge.style.display = count > 0 ? 'block' : 'none';
        }
        
        // Sidebar Badge
        const sideBadge = document.getElementById('sideNotifBadge');
        if (sideBadge) {
            sideBadge.textContent = count > 0 ? count : '';
            sideBadge.style.display = count > 0 ? 'block' : 'none';
        }

        // Also update big unread counter on this page if it exists
        var statUnread = document.getElementById('statUnread');
        if (statUnread) statUnread.textContent = count;
    });

    fetch(API_BASE + '/notifications/my', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        const list = document.getElementById('notifList');
        if (!list) return;
        const data = res.data || (Array.isArray(res) ? res : []);
        if (data.length === 0) {
            list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--g400);font-size:12px;">No new notifications</div>';
            return;
        }

        let html = '';
        data.slice(0, 5).forEach(n => {
            const icon = n.type === 'status' ? '⚡' : '📅';
            html += `
            <div class="nd-item" onclick="markRead(${n.id})">
                <div class="nd-icon">${icon}</div>
                <div class="nd-text">
                    <div class="nd-title">${esc(n.title || n.message)}</div>
                    <div class="nd-desc">${esc(n.description || n.body || '')}</div>
                    <div class="nd-time">${classifyDate(n.created_at)}</div>
                </div>
            </div>`;
        });
        list.innerHTML = html;
    });
}

function markRead(id) {
    fetch(API_BASE + '/notifications/read', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: id })
    }).then(() => {
        loadHeaderNotifications();
        loadNotifications(); // Reload main page list
    });
}

function clearNotifs() {
  fetch(API_BASE + '/notifications/mark-all-read', { method: 'POST', credentials: 'include' })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      loadHeaderNotifications();
      loadNotifications();
    }
  });
}

function safeSet(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ══════════════════════════════════════════════════════════════
   LOAD NOTIFICATIONS FROM BACKEND
══════════════════════════════════════════════════════════════ */
function loadNotifications() {
  document.getElementById('notifList').innerHTML =
    '<div style="text-align:center;padding:48px 0;color:#6b7280;font-size:14px;">⏳ Loading notifications…</div>';

  fetch(API_BASE + '/notifications/my', { credentials: 'include' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (res) {
      ALL_NOTIFS = (res.success && Array.isArray(res.data) && res.data.length)
        ? res.data.map(normalizeNotif)
        : [];
      onLoaded();
    })
    .catch(function (err) {
      console.error('Notifications load error:', err);
      ALL_NOTIFS = [];
      onLoaded();
    });
}

function onLoaded() {
  renderPriorityStrip();
  updateCounts();
  renderNotifs();
  loadHeaderNotifications();
}

/* ══════════════════════════════════════════════════════════════
   LOAD UNREAD COUNT (bell + sidebar chip)
══════════════════════════════════════════════════════════════ */
function loadUnreadBadge() {
  fetch(API_BASE + '/notifications/unread-count', { credentials: 'include' })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (res.success && res.data) {
        var cnt = res.data.unread_count || 0;
        var bell = document.querySelector('.notif-badge');
        var side = document.getElementById('sideNotifBadge');
        if (bell) { bell.textContent = cnt > 0 ? cnt : ''; bell.style.display = cnt > 0 ? 'block' : 'none'; }
        if (side) { side.textContent = cnt > 0 ? cnt : ''; side.style.display = cnt > 0 ? 'block' : 'none'; }
        
        // Also update big unread counter on this page if it exists
        var statUnread = document.getElementById('statUnread');
        if (statUnread) statUnread.textContent = cnt;
      }
    })
    .catch(function () {});
}

/* ══════════════════════════════════════════════════════════════
   LOAD APPLICATION COUNT (sidebar My Applications chip)
══════════════════════════════════════════════════════════════ */
function loadSidebarCount() {
  fetch(API_BASE + '/application/my', { credentials: 'include' })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (res.success && Array.isArray(res.data)) {
        const sideApp = document.getElementById('sideAppBadge');
        if (sideApp) {
          sideApp.textContent = res.data.length;
          sideApp.style.display = res.data.length > 0 ? 'block' : 'none';
        }
      }
    })
    .catch(function () {});
}

/* ══════════════════════════════════════════════════════════════
   BACKEND: MARK ONE AS READ
══════════════════════════════════════════════════════════════ */
function apiMarkRead(notifId) {
  fetch(API_BASE + '/notifications/read', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notification_id: parseInt(notifId, 10) })
  }).catch(function (err) { console.error('apiMarkRead failed:', err); });
}

/* ══════════════════════════════════════════════════════════════
   NORMALIZE: backend object → UI object
══════════════════════════════════════════════════════════════ */
function normalizeNotif(n) {
  var msg       = (n.message || n.title || '').trim();
  var cat       = detectCategory(msg);
  var isRead    = n.is_read === true || n.is_read === 1 || n.read === true;
  var isApprv   = /approved/i.test(msg);
  var isReject  = /reject/i.test(msg);
  var appId     = extractAppId(msg);

  var iconMap = {
    approved: { icon: '✅', bg: '#d1e7dd', clr: '#198754' },
    rejected: { icon: '🔴', bg: '#f8d7da', clr: '#dc3545' },
    document: { icon: '📄', bg: '#dbeafe', clr: '#0d6efd' },
    academic: { icon: '🎓', bg: '#ede9fe', clr: '#7c3aed' },
    office:   { icon: '🏢', bg: '#fff3cd', clr: '#e67e00' },
    alert:    { icon: '⚠️', bg: '#fde8ea', clr: '#e11d48' }
  };
  var iconKey = isApprv ? 'approved' : isReject ? 'rejected' : cat;
  var ico     = iconMap[iconKey] || iconMap.document;

  /* Build action buttons */
  var actions = [];
  if (isApprv) {
    if (appId) actions.push({ lbl: '⬇️ Download', cls: 'na-success', fn: 'goDownload' });
    actions.push({ lbl: 'Track Status', cls: 'na-secondary', fn: 'goTrack' });
  } else if (isReject) {
    actions.push({ lbl: '🔄 Re-Apply', cls: 'na-primary', fn: 'goDocuments' });
    actions.push({ lbl: 'Track Status', cls: 'na-secondary', fn: 'goTrack' });
  } else if (appId) {
    actions.push({ lbl: '📍 Track Status', cls: 'na-primary', fn: 'goTrack' });
  } else {
    actions.push({ lbl: 'View Notice', cls: 'na-secondary', fn: 'noAction' });
  }

  return {
    id:        String(n.id),
    cat:       cat,
    important: isReject || cat === 'alert' || !!n.important,
    read:      isRead,
    icon:      ico.icon,
    iconBg:    ico.bg,
    iconClr:   ico.clr,
    title:     n.title || extractTitle(msg),
    msg:       msg,
    appId:     appId,
    time:      formatTime(n.created_at),
    date:      classifyDate(n.created_at),
    actions:   actions
  };
}

function detectCategory(text) {
  if (/urgent|deadline|action needed|required/i.test(text))                    return 'alert';
  if (/exam|result|hall ticket|semester|assessment|mark|schedule/i.test(text)) return 'academic';
  if (/office|closed|holiday|hours/i.test(text))                               return 'office';
  return 'document';
}

function extractAppId(text) {
  var m = text.match(/APP-\d{4}-\d+/i);
  return m ? m[0].toUpperCase() : null;
}

function extractTitle(msg) {
  var s = msg.split(/[.!\n]/)[0].trim();
  return s.length > 65 ? s.substring(0, 62) + '…' : s;
}

function classifyDate(dateStr) {
  if (!dateStr) return 'older';
  var d    = new Date(dateStr);
  var diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  return 'older';
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  var diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  var t    = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (diff === 0) return 'Today · ' + t;
  if (diff === 1) return 'Yesterday · ' + t;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' · ' + t;
}

/* ══════════════════════════════════════════════════════════════
   PRIORITY STRIP  (top 3 unread urgent/document)
══════════════════════════════════════════════════════════════ */
function renderPriorityStrip() {
  var strip = document.getElementById('priorityStrip');
  if (!strip) return;

  var priority = ALL_NOTIFS
    .filter(function (n) { return !n.read && (n.important || n.cat === 'alert' || n.cat === 'document'); })
    .slice(0, 3);

  if (!priority.length) {
    var wrapper = strip.closest('.fu');
    if (wrapper) wrapper.style.display = 'none';
    return;
  }

  var clsMap = { alert: 'pc-urgent', academic: 'pc-exam', office: 'pc-office', document: 'pc-office' };
  var lblMap = { alert: '⚠️ Alert', academic: '🎓 Academic', office: '🏢 Office Notice', document: '📄 Document Update' };

  strip.innerHTML = priority.map(function (p) {
    var cls   = (p.important || p.cat === 'alert') ? 'pc-urgent' : (clsMap[p.cat] || 'pc-office');
    var badge = (p.important || p.cat === 'alert') ? 'Action Needed' : 'New';
    var short = p.msg.length > 110 ? p.msg.substring(0, 107) + '…' : p.msg;
    return (
      '<div class="priority-card ' + cls + '" onclick="handleAction(event,\'goTrack\',\'' + p.id + '\')">' +
        '<div class="pc-label"><div class="pc-imp-dot"></div>' + (lblMap[p.cat] || '📄 Document') + '</div>' +
        '<div class="pc-badge">' + badge + '</div>' +
        '<div class="pc-title">' + escHtml(p.title) + '</div>' +
        '<div class="pc-msg">'   + escHtml(short)   + '</div>' +
        '<div class="pc-date">🕐 ' + p.time          + '</div>' +
      '</div>'
    );
  }).join('');
}

/* ══════════════════════════════════════════════════════════════
   COUNT HELPERS
══════════════════════════════════════════════════════════════ */
function updateCounts() {
  var cats   = ['document', 'academic', 'office', 'alert'];
  var unread = ALL_NOTIFS.filter(function (n) { return !n.read; }).length;
  var total  = ALL_NOTIFS.length;

  setText('statUnread', unread);
  setText('statTotal',  total);
  setText('sideChip',   unread);
  setText('bellBadge',  unread);
  setText('tc-all',     total);

  cats.forEach(function (c) {
    setText('tc-' + c, ALL_NOTIFS.filter(function (n) { return n.cat === c; }).length);
  });
}

function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ══════════════════════════════════════════════════════════════
   RENDER LIST
══════════════════════════════════════════════════════════════ */
function renderNotifs() {
  var filtered = ALL_NOTIFS.filter(function (n) {
    var catOk = activeFilter === 'all' || n.cat === activeFilter;
    var q     = activeSearch.toLowerCase();
    var qOk   = !q ||
      n.title.toLowerCase().includes(q) ||
      n.msg.toLowerCase().includes(q) ||
      (n.appId && n.appId.toLowerCase().includes(q));
    return catOk && qOk;
  });

  setText('visCnt', filtered.length);
  setText('totCnt', ALL_NOTIFS.length);

  var list  = document.getElementById('notifList');
  var empty = document.getElementById('emptyState');

  if (!filtered.length) {
    list.innerHTML = '';
    if (empty) empty.classList.add('show');
    return;
  }
  if (empty) empty.classList.remove('show');

  var catBadgeMap = { document: 'nb-doc', academic: 'nb-academic', office: 'nb-office', alert: 'nb-alert' };
  var catLabelMap = { document: '📄 Document', academic: '🎓 Academic', office: '🏢 Office', alert: '⚠️ Alert' };

  var html = '';
  DATE_GROUPS.forEach(function (group) {
    var items = filtered.filter(function (n) { return n.date === group; });
    if (!items.length) return;

    html += '<div class="notif-date-group"><div class="ndg-label">' + DATE_LABELS[group] + '</div>';

    items.forEach(function (n) {
      var cb  = catBadgeMap[n.cat] || 'nb-doc';
      var cl  = catLabelMap[n.cat] || '📄';
      var btns = n.actions.map(function (a) {
        return '<button class="na-btn ' + a.cls + '" onclick="handleAction(event,\'' + a.fn + '\',\'' + n.id + '\')">' + a.lbl + '</button>';
      }).join('');

      html +=
        '<div class="notif-card ' + (n.read ? 'read' : 'unread') + (n.important ? ' important' : '') + '" ' +
            'id="nc-' + n.id + '" onclick="markRead(\'' + n.id + '\',event)">' +
          '<div class="unread-dot"></div>' +
          '<div class="notif-icon" style="background:' + n.iconBg + ';color:' + n.iconClr + '">' + n.icon + '</div>' +
          '<div class="notif-content">' +
            '<div class="notif-top">' +
              '<div class="notif-title">' + escHtml(n.title) + '</div>' +
              '<div class="notif-badges">' +
                (n.important ? '<span class="n-badge nb-important">⚡ Important</span>' : '') +
                '<span class="n-badge ' + cb + '">' + cl + '</span>' +
                '<span class="n-badge ' + (n.read ? 'nb-read' : 'nb-new') + '">' + (n.read ? 'Read' : 'New') + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="notif-msg">' + escHtml(n.msg) + '</div>' +
            (n.appId ? '<div class="notif-app-id">App: ' + n.appId + '</div>' : '') +
            '<div class="notif-footer">' +
              '<div class="notif-time">🕐 ' + n.time + '</div>' +
              '<div class="notif-actions">' + btns +
                '<button class="na-btn na-mark" onclick="dismissOne(event,\'' + n.id + '\')">✕</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    });

    html += '</div>';
  });

  list.innerHTML = html;
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ══════════════════════════════════════════════════════════════
   FILTER / SEARCH
══════════════════════════════════════════════════════════════ */
function setFilter(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.ftab').forEach(function (t) { t.classList.remove('active'); });
  btn.classList.add('active');
  renderNotifs();
}

function applyFilters() {
  activeSearch = (document.getElementById('searchInput').value || '').trim();
  renderNotifs();
}

/* ══════════════════════════════════════════════════════════════
   MARK READ
══════════════════════════════════════════════════════════════ */
function markRead(id, e) {
  var n = ALL_NOTIFS.find(function (x) { return x.id === id; });
  if (!n || n.read) return;
  n.read = true;

  var card = document.getElementById('nc-' + id);
  if (card) {
    card.classList.remove('unread');
    card.classList.add('read');
    var dot   = card.querySelector('.unread-dot');
    var badge = card.querySelector('.nb-new');
    if (dot)   dot.style.background = 'transparent';
    if (badge) { badge.className = 'n-badge nb-read'; badge.textContent = 'Read'; }
  }
  updateCounts();
  apiMarkRead(id);
}

function markAllRead() {
  var unread = ALL_NOTIFS.filter(function (n) { return !n.read; });
  if (!unread.length) { showToast('All already read!'); return; }
  unread.forEach(function (n) { n.read = true; apiMarkRead(n.id); });
  renderNotifs();
  updateCounts();
  showToast('✓ All notifications marked as read');
}

/* ══════════════════════════════════════════════════════════════
   DISMISS / CLEAR  (local only)
══════════════════════════════════════════════════════════════ */
function dismissOne(e, id) {
  e.stopPropagation();
  var n = ALL_NOTIFS.find(function (x) { return x.id === id; });
  if (n && !n.read) apiMarkRead(id);
  ALL_NOTIFS = ALL_NOTIFS.filter(function (x) { return x.id !== id; });
  updateCounts();
  renderNotifs();
}

function clearAll() {
  if (!confirm('Clear all notifications from view? They will reload on your next visit.')) return;
  ALL_NOTIFS.filter(function (n) { return !n.read; }).forEach(function (n) { apiMarkRead(n.id); });
  ALL_NOTIFS = [];
  updateCounts();
  renderNotifs();
  showToast('🗑 All notifications cleared');
}

/* ══════════════════════════════════════════════════════════════
   ACTION ROUTING
══════════════════════════════════════════════════════════════ */
function handleAction(e, fn, id) {
  e.stopPropagation();
  if (id) markRead(id, e);
  if      (fn === 'goDownload')  window.location.href = 'download.html';
  else if (fn === 'goApp')       window.location.href = 'dashboard.html';
  else if (fn === 'goTrack')     window.location.href = 'track-status.html';
  else if (fn === 'goDocuments') window.location.href = 'documents.html';
  else    showToast('📢 Notice opened');
}

/* ══════════════════════════════════════════════════════════════
   SETTINGS  (localStorage only)
══════════════════════════════════════════════════════════════ */
function saveSetting(key, val) {
  var s = JSON.parse(localStorage.getItem('notifSettings') || '{}');
  s[key] = val;
  localStorage.setItem('notifSettings', JSON.stringify(s));
  showToast(val ? '✅ Setting enabled' : '⭕ Setting disabled');
}

/* ══════════════════════════════════════════════════════════════
   TOAST & LOGOUT
══════════════════════════════════════════════════════════════ */
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(function () { t.classList.remove('show'); }, 3200);
}

function logout() {
  if (!confirm('Are you sure you want to logout?')) return;
  fetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'include' })
    .finally(function () {
      localStorage.clear();
      window.location.href = 'login.html';
    });
}