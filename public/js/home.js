/* ============================================================
   home.js  |  JDCOEM Student Portal Dashboard
   PLACE IN: public/js/home.js
   ============================================================ */

const API_BASE = window.location.origin + window.location.pathname.split('/').slice(0, -2).join('/') + '/api';

/* ── DOC-TYPE → PAGE MAP ── */
var DOC_PAGES = {
    admission:   'admission.html',
    idcard:      'idcard.html',
    bonafide:    'bonafide.html',
    feereceipt:  'feereceipt.html',
    hallticket:  'hallticket.html',
    marksheet:   'marksheet.html',
    provisional: 'provisional.html',
    degree:      'degree.html',
    leaving:     'leaving.html',
    migration:   'migration.html',
    character:   'character.html',
    noc:         'noc.html',
    transcript:  'transcript.html'
};

/* ============================================================
   HELPERS
   ============================================================ */
function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(d) {
    if (!d) return '--';
    try { return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }
    catch(e) { return d; }
}

function emptyRow(msg) {
    return '<tr><td colspan="5" style="text-align:center;color:#888;padding:24px;">' + msg + '</td></tr>';
}

/* ============================================================
   RENDER USER INFO INTO HEADER + HERO
   ============================================================ */
function renderUser(u) {
    var name     = u.name || u.full_name || u.bt_id || 'Student';
    var btid     = u.bt_id || u.btid || u.student_id || u.email || '--';
    var branch   = u.branch || u.department || 'N/A';
    var year     = u.year_semester || u.year || u.current_year || 'N/A';
    var first    = name.split(' ')[0];
    var initials = name.split(' ').filter(Boolean).map(function(n){ return n[0]; }).join('').substring(0,2).toUpperCase();

    setEl('userName',     name);
    setEl('userId',       btid);
    setEl('userInitials', initials);
    setEl('heroName',     first);
    setEl('heroBranch',   branch);
    setEl('heroYear',     year);
    setEl('heroId',       btid);

    /* Update all avatar chips */
    document.querySelectorAll('.user-avatar').forEach(function(a) { 
        a.textContent = initials; 
    });
}

/* ============================================================
   INIT: Auth guard + load fresh user from backend
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {

    /* Step 1: Render from localStorage immediately (no flicker) */
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

    /* Step 2: Refresh from backend session */
    secureFetch(API_BASE + '/auth/me', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (res.success && res.user) {
                /* Update localStorage with fresh data */
                var merged = Object.assign(JSON.parse(localStorage.getItem('user') || '{}'), res.user);
                localStorage.setItem('user', JSON.stringify(merged));
                renderUser(merged);
            } else if (!res.success) {
                /* Session expired — redirect to login */
                localStorage.clear();
                window.location.href = 'login.html';
            }
        })
        .catch(function() {
            /* Network error — continue with cached data */
        });

    /* Step 3: Load dynamic data */
    loadApplications();
    loadNotifications();
});

/* ============================================================
   LOGOUT — calls backend then clears localStorage
   ============================================================ */
function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    secureFetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'include' })
        .catch(function(){})
        .finally(function() {
            localStorage.clear();
            window.location.href = 'login.html';
        });
}

/* ============================================================
   LOAD APPLICATIONS → Status Table + Hero Stats
   ============================================================ */
function loadApplications() {
    var tbody = document.getElementById('statusTableBody');
    if (tbody) tbody.innerHTML = emptyRow('Loading applications...');

    secureFetch(API_BASE + '/application/my', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(json) {
            var apps = [];
            if (json.success && Array.isArray(json.data)) {
                apps = json.data;
            } else if (Array.isArray(json)) {
                apps = json;
            } else if (json.data && Array.isArray(json.data)) {
                apps = json.data;
            }

            /* Hero stats */
            var active  = apps.filter(function(a){
                var s = (a.status||'').toLowerCase();
                return s === 'pending' || s === 'clerk_approved' || s === 'hod_approved';
            }).length;
            var readyDL = apps.filter(function(a){
                var s = (a.status||'').toLowerCase();
                return s === 'approved' || s === 'principal_approved' || s === 'issued';
            }).length;

            var statNums = document.querySelectorAll('.hero-stat-num');
            if (statNums[0]) statNums[0].textContent = active;
            if (statNums[1]) statNums[1].textContent = readyDL;

            /* Sidebar "My Applications" badge */
            document.querySelectorAll('.nav-badge').forEach(function(b) {
                var link = b.closest('a');
                if (link && (link.href.includes('dashboard') || link.href.includes('applications'))) {
                    b.textContent = apps.length;
                    b.style.display = apps.length > 0 ? 'inline' : 'none';
                }
            });

            /* Status table */
            if (!tbody) return;
            if (apps.length === 0) {
                tbody.innerHTML = emptyRow('No applications yet. Click "Apply for Document" to get started.');
                return;
            }

            tbody.innerHTML = apps.slice(0, 5).map(function(app) {
                var docType = app.certificate_type || app.document_type || app.doc_type || app.type || '--';
                /* Capitalize first letter */
                docType = docType.charAt(0).toUpperCase() + docType.slice(1) + ' Certificate';
                return '<tr>' +
                    '<td>' + esc(app.application_number || ('APP-' + app.id)) + '</td>' +
                    '<td>' + esc(docType) + '</td>' +
                    '<td>' + formatDate(app.created_at || app.submitted_at) + '</td>' +
                    '<td>' + statusPill(app.status) + '</td>' +
                    '<td>' + actionBtn(app) + '</td>' +
                '</tr>';
            }).join('');
        })
        .catch(function(e) {
            console.error('loadApplications:', e);
            if (tbody) tbody.innerHTML = emptyRow('Failed to load applications. Check your connection.');
        });
}

function statusPill(s) {
    var map = {
        'pending':            '<span class="status-pill s-pending">⏳ Pending at Clerk</span>',
        'clerk_approved':     '<span class="status-pill s-verified">📋 Clerk Verified</span>',
        'hod_approved':       '<span class="status-pill s-verified">🏫 HOD Approved</span>',
        'principal_approved': '<span class="status-pill s-approved">👔 Principal Approved</span>',
        'approved':           '<span class="status-pill s-approved">✅ Ready to Download</span>',
        'rejected':           '<span class="status-pill s-rejected">❌ Rejected</span>',
        'clerk_rejected':     '<span class="status-pill s-rejected">❌ Rejected by Clerk</span>',
        'hod_rejected':       '<span class="status-pill s-rejected">❌ Rejected by HOD</span>'
    };
    return map[(s||'').toLowerCase()] || '<span class="status-pill">' + esc(s || 'Unknown') + '</span>';
}

function actionBtn(app) {
    var s = (app.status||'').toLowerCase();
    if (s === 'approved' || s === 'principal_approved' || s === 'issued')
        return '<button class="action-btn" onclick="downloadDoc(\'' + esc(app.application_number || app.id) + '\')">⬇ Download</button>';
    if (s === 'rejected' || s === 'clerk_rejected' || s === 'hod_rejected')
        return '<button class="action-btn" onclick="viewApp(\'' + app.id + '\')">👁 View Reason</button>';
    return '<button class="action-btn" onclick="viewApp(\'' + app.id + '\')">📍 Track</button>';
}

function downloadDoc(appNumber) {
    window.open(API_BASE + '/documents/download?application_number=' + encodeURIComponent(appNumber), '_blank');
}

function viewApp(id) {
    window.location.href = 'track-status.html?application_id=' + id;
}

/* ============================================================
   LOAD NOTIFICATIONS
   ============================================================ */
function loadNotifications() {
    /* Unread count */
    secureFetch(API_BASE + '/notifications/unread-count', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (res.success) {
                var count = (res.data && res.data.unread_count) || res.count || 0;
                var bell = document.querySelector('.notif-badge');
                if (bell) {
                    bell.textContent = count > 0 ? count : '';
                    bell.style.display = count > 0 ? 'block' : 'none';
                }
                var side = document.getElementById('sideNotifBadge');
                if (side) {
                    side.textContent = count > 0 ? count : '';
                    side.style.display = count > 0 ? 'block' : 'none';
                }
            }
        })
        .catch(function(){});

    /* Notification list */
    secureFetch(API_BASE + '/notifications/my', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(json) {
            var notifs = [];
            if (json.success && Array.isArray(json.data)) notifs = json.data;
            else if (Array.isArray(json)) notifs = json;

            var typeIcons = { update:'📋', approved:'✅', rejected:'❌', info:'ℹ️', reminder:'⏰' };

            /* Header dropdown */
            var dropdown = document.getElementById('notifDropdown');
            if (dropdown) {
                var hdr = dropdown.querySelector('.nd-header');
                var hdrHtml = hdr ? hdr.outerHTML : '<div class="nd-header">Notifications <span class="nd-clear" onclick="clearNotifs()">Mark all read</span></div>';
                dropdown.innerHTML = notifs.length === 0
                    ? hdrHtml + '<div class="nd-item" style="text-align:center;color:#888;padding:20px;">No notifications yet.</div>'
                    : hdrHtml + notifs.slice(0,5).map(function(n) {
                        return '<div class="nd-item" onclick="markRead(' + n.id + ')" style="cursor:pointer;">' +
                            '<div class="nd-icon">' + (n.icon || typeIcons[n.type] || '🔔') + '</div>' +
                            '<div class="nd-text">' +
                                '<div class="nd-title">' + esc(n.title || n.message || '') + '</div>' +
                                '<div class="nd-desc">'  + esc(n.description || n.body || '') + '</div>' +
                                '<div class="nd-time">'  + formatDate(n.created_at) + '</div>' +
                            '</div></div>';
                    }).join('');
            }

            /* Announcements panel */
            var panel = document.querySelector('.notif-panel');
            if (panel && notifs.length > 0) {
                var phdr = panel.querySelector('.notif-panel-header');
                var phdrHtml = phdr ? phdr.outerHTML : '<div class="notif-panel-header"><h3>🔔 Announcements</h3><a href="notification.html" class="view-all-link" style="font-size:13px;">See all</a></div>';
                var dots = ['nd-info','nd-success','nd-warn','nd-info'];
                panel.innerHTML = phdrHtml + notifs.slice(0,4).map(function(n,i) {
                    return '<div class="notif-item" onclick="markRead(' + n.id + ')" style="cursor:pointer;">' +
                        '<span class="notif-dot ' + dots[i % dots.length] + '"></span>' +
                        '<div class="notif-body">' +
                            '<div class="notif-title">' + esc(n.title || n.message || '') + '</div>' +
                            '<div class="notif-time">📅 ' + formatDate(n.created_at) + '</div>' +
                        '</div></div>';
                }).join('');
            }
        })
        .catch(function(e) { console.error('loadNotifications:', e); });
}

function markRead(notifId) {
    secureFetch(API_BASE + '/notifications/read', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({ notification_id: notifId })
    })
    .then(function() { loadNotifications(); })
    .catch(function(){});
}

function clearNotifs() {
    secureFetch(API_BASE + '/notifications/read-all', { method: 'POST', credentials: 'include' })
        .catch(function(){})
        .finally(function() {
            var dropdown = document.getElementById('notifDropdown');
            if (dropdown) dropdown.classList.remove('open');
            var bell = document.querySelector('.notif-badge');
            if (bell) { bell.textContent = ''; bell.style.display = 'none'; }
            loadNotifications();
        });
}

/* ============================================================
   NOTIFICATION BELL TOGGLE
   ============================================================ */
function toggleNotif() {
    var d = document.getElementById('notifDropdown');
    if (d) d.classList.toggle('open');
}

document.addEventListener('click', function(e) {
    var d = document.getElementById('notifDropdown');
    if (d && !e.target.closest('.notif-btn') && !e.target.closest('.notif-dropdown'))
        d.classList.remove('open');
});

/* ============================================================
   APPLY FOR DOCUMENT
   ============================================================ */
function applyFor(type) {
    localStorage.setItem('selectedDocument', type);
    window.location.href = DOC_PAGES[type] || 'documents.html';
}