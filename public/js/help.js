const API_BASE = window.location.origin + '/api';

// ── INIT ──

/* ── RENDER USER INFO ───────────────────────────── */
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
    
    // Pre-fill ticket form with current user info
    const inpName = document.getElementById('inp-name');
    const inpBtid = document.getElementById('inp-btid');
    const inpMail = document.getElementById('inp-email');
    if (inpName) inpName.value = name;
    if (inpBtid) inpBtid.value = btid;
    if (inpMail) inpMail.value = u.email || '--';
}

/* ════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', function () {
    const raw = localStorage.getItem('user');
    if (!raw) { window.location.href = 'login.html'; return; }

    const u = JSON.parse(raw);
    renderUser(u);
    loadNotifications();

    fetch(API_BASE + '/auth/me', { credentials: 'include' })
        .then(r => r.json())
        .then(res => {
            if (!res.success && !res.user) {
                localStorage.clear();
                window.location.href = 'login.html';
                return;
            }
            if (res.user) {
                var merged = Object.assign(JSON.parse(localStorage.getItem('user') || '{}'), res.user);
                localStorage.setItem('user', JSON.stringify(merged));
                renderUser(merged);
            }
        })
        .catch(() => { });

    // Load sidebar counts
    fetch(API_BASE + '/application/my', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        const apps = res.data || (Array.isArray(res) ? res : []);
        const chip = document.getElementById('sideAppBadge');
        if (chip) {
            chip.textContent = apps.length;
            chip.style.display = apps.length > 0 ? 'block' : 'none';
        }
    });

    // Global click listener for dropdowns
    document.addEventListener('click', function(e) {
        const notifDropdown = document.getElementById('notifDropdown');
        const notifBtn = document.querySelector('.notif-btn');
        if (notifDropdown && !notifDropdown.contains(e.target) && (!notifBtn || !notifBtn.contains(e.target))) {
            notifDropdown.classList.remove('open');
        }
    });

  // Dynamic office open/closed status (Mon–Sat, 10:00–16:00)
  var now  = new Date();
  var day  = now.getDay();   // 0 = Sunday
  var hr   = now.getHours();
  var open = day >= 1 && day <= 6 && hr >= 10 && hr < 16;
  var osEl = document.querySelector('.office-status');

  if (osEl && !open) {
    var dot = osEl.querySelector('.os-dot');
    var txt = osEl.querySelector('.os-text');
    if (dot) dot.style.background  = '#e67e00';
    if (dot) dot.style.animation   = 'none';
    if (txt) txt.style.color       = '#e67e00';
    if (txt) txt.textContent       = 'Office Currently Closed';
    osEl.style.background = '#fffbf0';
    osEl.style.borderColor = '#fcd34d';
  }

  // Attach live validation listeners
  ['f-name', 'f-btid', 'f-email', 'f-cat', 'f-desc'].forEach(function (id) {
    var fieldId = 'inp-' + id.replace('f-', '');
    var inp = document.getElementById(fieldId);
    if (inp) inp.addEventListener('input', function () { clearErr(id); });
  });
});

/* ── NOTIFICATIONS ──────────────────────────────── */
function loadNotifications() {
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
                    <div class="nd-time">${formatDate(n.created_at)}</div>
                </div>
            </div>`;
        });
        list.innerHTML = html;
    });
}

function clearNotifs() {
    const BASE_URL = window.location.origin + window.location.pathname.split('/public/')[0];
    const API_BASE = BASE_URL + '/public/index.php/api';
    fetch(API_BASE + '/notifications/mark-all-read', { method: 'POST', credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        if (res.success) loadNotifications();
    });
}

function markRead(id) {
    fetch(API_BASE + '/notifications/read', { 
        method: 'POST', 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: id })
    })
    .then(r => r.json())
    .then(res => {
        if (res.success) loadNotifications();
    });
}

// Standard fmtDate kept for backward compatibility if needed, but using formatDate
function fmtDate(ds) { return formatDate(ds); }


function safeSet(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

// ── FAQ TOGGLE ──
function toggleFaq(qEl) {
  var item   = qEl.closest('.faq-item');
  var ans    = item.querySelector('.faq-a');
  var isOpen = qEl.classList.contains('open');

  // Close all open items first
  document.querySelectorAll('.faq-q.open').forEach(function (q) {
    q.classList.remove('open');
    q.closest('.faq-item').querySelector('.faq-a').classList.remove('open');
  });

  // Toggle clicked item
  if (!isOpen) {
    qEl.classList.add('open');
    ans.classList.add('open');
  }
}

// ── TICKET FORM ──
function updateCharCount() {
  var val = document.getElementById('inp-desc').value;
  document.getElementById('charCount').textContent = val.length;
}

function clearErr(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove('err');
}

function setErr(id, show) {
  var el = document.getElementById(id);
  if (el) el.classList.toggle('err', show);
}

function submitTicket() {
  var name  = document.getElementById('inp-name').value.trim();
  var btid  = document.getElementById('inp-btid').value.trim();
  var email = document.getElementById('inp-email').value.trim();
  var cat   = document.getElementById('inp-cat').value;
  var desc  = document.getElementById('inp-desc').value.trim();
  var valid = true;

  function check(id, condition) {
    if (condition) { setErr(id, true); valid = false; }
    else setErr(id, false);
  }

  check('f-name',  !name);
  check('f-btid',  !btid);
  check('f-email', !email || !email.includes('@'));
  check('f-cat',   !cat);
  check('f-desc',  desc.length < 20);

  if (!valid) { showToast('⚠ Please fill in all required fields.'); return; }

  // Submit via API
  var btn = document.querySelector('.tkt-submit') || document.querySelector('button[onclick="submitTicket()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

  fetch(API_BASE + '/application/create', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      admType: 'support_ticket',
      purpose: '[' + cat + '] ' + desc
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Ticket'; }
    if (res.success) {
      var tid = res.application_number || ('TKT-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000));
      var tIdEl = document.getElementById('ticketId');
      if (tIdEl) tIdEl.textContent = tid;
      
      var tbody = document.getElementById('ticketFormBody');
      if (tbody) tbody.style.display = 'none';
      
      var tsucc = document.getElementById('ticketSuccess');
      if (tsucc) tsucc.classList.add('show');
      
      showToast('✅ Ticket ' + tid + ' submitted!');
    } else {
      showToast('❌ Error: ' + (res.message || 'Submission failed'));
    }
  })
  .catch(function(err) {
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Ticket'; }
    showToast('❌ Network error. Please try again.');
  });
}

function resetForm() {
  ['inp-name', 'inp-btid', 'inp-email', 'inp-cat', 'inp-appid', 'inp-desc'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['f-name', 'f-btid', 'f-email', 'f-cat', 'f-desc'].forEach(function (id) {
    clearErr(id);
  });
  document.getElementById('charCount').textContent = '0';
}

function newTicket() {
  document.getElementById('ticketSuccess').classList.remove('show');
  document.getElementById('ticketFormBody').style.display = '';
  resetForm();

  // Re-fill form from saved user
  var u = JSON.parse(localStorage.getItem('user') || '{}');
  if (u.name)  document.getElementById('inp-name').value  = u.name;
  if (u.btid)  document.getElementById('inp-btid').value  = u.btid;
  if (u.email) document.getElementById('inp-email').value = u.email;
}

// ── SCROLL HELPER ──
function smoothScroll(selector) {
  var el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── TOAST ──
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(function () { t.classList.remove('show'); }, 3200);
}

// ── LOGOUT ──
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    fetch(API_BASE + '/auth/logout', { method:'POST', credentials:'include' })
    .finally(function(){
        localStorage.clear();
        window.location.href = 'login.html';
    });
  }
}