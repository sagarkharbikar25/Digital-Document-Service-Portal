/* ================================================
   dashboard.js  —  My Applications Page
   JDCOEM Digital Document Services Portal
   Connected to GET /api/application/my
   ================================================ */

const API_BASE = window.location.origin + window.location.pathname.split('/').slice(0, -2).join('/') + '/api';

var allApps    = [];
var filtered   = [];
var currentApp = null;

/* ── DOC ICONS ─────────────────────────────────── */
var DOC_ICONS = {
    bonafide:'📜', character:'⭐', tc:'🚪', leaving:'🚪',
    transcript:'📋', noc:'✅', migration:'🔀', provisional:'🏅',
    degree:'🎓', hallticket:'🎟️', marksheet:'📊',
    feereceipt:'🧾', admission:'📩', idcard:'🪪'
};
function getIcon(type) {
    if (!type) return '📄';
    var t = type.toLowerCase().replace(/\s+/g,'');
    return DOC_ICONS[t] || DOC_ICONS[Object.keys(DOC_ICONS).find(function(k){ return t.includes(k); })] || '📄';
}

/* ── STATUS PILL ────────────────────────────────── */
function pill(status) {
    var map = {
        'pending':            '<span class="sp sp-pending">🟡 Pending</span>',
        'verified':           '<span class="sp sp-verified">🔵 Verified</span>',
        'clerk_approved':     '<span class="sp sp-verified">🔵 Verified</span>',
        'hod_approved':       '<span class="sp sp-processing">🟣 Processing</span>',
        'processing':         '<span class="sp sp-processing">🟣 Processing</span>',
        'approved':           '<span class="sp sp-approved">🟢 Approved</span>',
        'rejected':           '<span class="sp sp-rejected">🔴 Rejected</span>',
        'rejected_hod':       '<span class="sp sp-rejected">🔴 Rejected</span>',
        'rejected_principal': '<span class="sp sp-rejected">🔴 Rejected</span>',
    };
    var key = (status || '').toLowerCase();
    return map[key] || '<span class="sp sp-pending">' + status + '</span>';
}

/* ── FRIENDLY STATUS LABEL ──────────────────────── */
function statusLabel(status) {
    var map = {
        'pending':            'Pending',
        'clerk_approved':     'Verified',
        'hod_approved':       'Processing',
        'approved':           'Approved',
        'rejected':           'Rejected',
        'rejected_hod':       'Rejected',
        'rejected_principal': 'Rejected',
    };
    return map[(status||'').toLowerCase()] || status || 'Pending';
}

/* ── BUILD TIMELINE FROM API STATUS ────────────── */
function buildTimeline(app) {
    var status     = (app.status || '').toLowerCase();
    var created    = formatDate(app.created_at);
    var clerkAt    = app.clerk_approved_at  ? formatDate(app.clerk_approved_at)  : null;
    var hodAt      = app.hod_approved_at    ? formatDate(app.hod_approved_at)    : null;
    var approvedAt = app.approved_at        ? formatDate(app.approved_at)        : null;
    var isRejected = status.includes('rejected');

    var steps = [
        { l: 'Application Submitted',   d: created    || 'Submitted',          t: 'done' },
        { l: 'Received by Clerk',        d: created    || 'Received',           t: 'done' },
        { l: 'Verified by Clerk',        d: clerkAt    || 'Awaiting clerk',     t: clerkAt    ? 'done' : (isRejected && !clerkAt    ? 'err' : 'active') },
        { l: 'Approved by HOD',          d: hodAt      || 'Pending HOD',        t: hodAt      ? 'done' : (isRejected && clerkAt && !hodAt ? 'err' : 'todo') },
        { l: 'Approved by Principal',    d: approvedAt || 'Pending Principal',  t: approvedAt ? 'done' : 'todo' },
        { l: 'Document Ready',           d: approvedAt ? 'Ready to download' : 'Pending', t: approvedAt ? 'done' : 'todo' },
    ];

    if (isRejected) {
        if (!clerkAt)      { steps[2].t = 'err'; steps[2].d = 'Rejected by Clerk';     }
        else if (!hodAt)   { steps[3].t = 'err'; steps[3].d = 'Rejected by HOD';       }
        else               { steps[4].t = 'err'; steps[4].d = 'Rejected by Principal'; }
    }

    return steps;
}

/* ── BUILD REMARKS FROM API ─────────────────────── */
function buildRemark(app) {
    var status = (app.status || '').toLowerCase();
    if (status === 'approved') {
        return {
            type: 'approve',
            title: 'Document Approved',
            msg: 'Your ' + (app.certificate_type_name || app.certificate_type || 'document') +
                 ' has been approved and is ready to download. Certificate No: ' +
                 (app.certificate_number || app.application_number || 'N/A')
        };
    }
    if (status.includes('rejected')) {
        return {
            type: 'reject',
            title: 'Application Rejected – Action Required',
            msg: app.rejection_reason || app.remarks || 'Your application was rejected. Please check the details and re-apply if needed.'
        };
    }
    if (status === 'clerk_approved' || status === 'hod_approved') {
        return {
            type: 'info',
            title: 'Application Under Process',
            msg: 'Your application is currently being reviewed. You will be notified via email once the next stage is complete.'
        };
    }
    return null;
}

/* ── FORMAT DATE ────────────────────────────────── */
function formatDate(dt) {
    if (!dt) return null;
    try {
        return new Date(dt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch(e) { return dt; }
}

/* ── TRANSFORM API RESPONSE → UI FORMAT ────────── */
function transformApp(a) {
    var typeName = a.certificate_type_name
        || (a.certificate_type
            ? a.certificate_type.charAt(0).toUpperCase() + a.certificate_type.slice(1) + ' Certificate'
            : 'Document');

    var files = [];
    if (a.documents && Array.isArray(a.documents)) {
        files = a.documents.map(function(d){ return d.file_name || d.original_name || d.name || 'Document'; });
    }
    if (!files.length) files = ['Supporting documents attached'];

    return {
        id:        a.application_number || a.id || ('APP-' + a.id),
        rawId:     a.id,
        docType:   typeName,
        docIco:    getIcon(a.certificate_type),
        date:      formatDate(a.created_at) || a.date || '–',
        proc:      a.processing_time || '3–5 Working Days',
        status:    statusLabel(a.status),
        rawStatus: a.status,
        purpose:   a.purpose || 'Not specified',
        files:     files,
        tl:        buildTimeline(a),
        remark:    buildRemark(a),
        certFile:  a.certificate_file || null,
        raw:       a
    };
}

/* ════════════════════════════════════════════════
   INIT
   FIX: Never redirect on session expiry.
   Strategy:
     1. Try /application/my directly (cookie may still be valid)
     2. If that fails → silent re-login using stored creds
     3. If re-login works → retry /application/my
     4. If no creds stored → show empty with retry button
     5. ONLY redirect to login.html if user explicitly logs out
════════════════════════════════════════════════ */
/* ── RENDER USER INFO ───────────────────────────── */
function renderUser(u) {
    var name     = u.name || u.full_name || u.bt_id || u.btid || 'Student';
    var btid     = u.bt_id || u.btid || u.student_id || u.email || '--';
    var initials = name.split(' ').filter(Boolean).map(function(n){ return n[0]; }).join('').substring(0,2).toUpperCase();

    safeSet('userName',     name);
    safeSet('userId',       btid);
    safeSet('userInitials', initials);

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

    /* Refresh session + sync */
    secureFetch(API_BASE + '/auth/me', { credentials: 'include' })
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
        /* Load actual data */
        showLoading();
        startKeepAlive();
        loadApplications();
        loadNotifications();
    })
    .catch(() => {
        showLoading();
        startKeepAlive();
        loadApplications();
        loadNotifications();
    });

    /* Global click listener for dropdowns */
    document.addEventListener('click', function(e) {
        const notifDropdown = document.getElementById('notifDropdown');
        const notifBtn = document.querySelector('.notif-btn');
        if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
            notifDropdown.classList.remove('open');
        }
    });
});

/* ── NOTIFICATIONS ──────────────────────────────── */
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

function loadNotifications() {
    // 1. Load Unread Count for badges
    secureFetch(API_BASE + '/notifications/unread-count', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        if (!res.success || !res.data) return;
        const count = res.data.unread_count || 0;
        
        const bellBadge = document.querySelector('.notif-badge');
        if (bellBadge) {
            bellBadge.textContent = count > 0 ? count : '';
            bellBadge.style.display = count > 0 ? 'block' : 'none';
        }
        const sideBadge = document.getElementById('sideNotifBadge');
        if (sideBadge) {
            sideBadge.textContent = count > 0 ? count : '';
            sideBadge.style.display = count > 0 ? 'block' : 'none';
        }
    });

    // 2. Load Notifications List
    secureFetch(API_BASE + '/notifications/my', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        if (!res.success) return;
        const list = document.getElementById('notifList');
        if (!list) return;
        
        if (!res.data || res.data.length === 0) {
            list.innerHTML = '<div style="padding:20px; text-align:center; color:#9ca3af; font-size:12px;">No new notifications</div>';
            return;
        }

        let html = '';
        res.data.slice(0, 5).forEach(n => {
            const icon = n.is_read ? '🔔' : '⚡';
            html += `
            <div class="nd-item" onclick="markRead(${n.id})" style="${n.is_read ? 'opacity:0.6;' : ''}">
                <div class="nd-icon">${icon}</div>
                <div class="nd-text">
                    <div class="nd-title">${esc(n.message.substring(0, 30))}${n.message.length > 30 ? '...' : ''}</div>
                    <div class="nd-desc">${esc(n.message)}</div>
                    <div class="nd-time">${formatDate(n.created_at)}</div>
                </div>
            </div>`;
        });
        list.innerHTML = html;
    });
}

function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}


function clearNotifs() {
    secureFetch(API_BASE + '/notifications/mark-all-read', { 
        method: 'POST', 
        credentials: 'include' 
    })
    .then(r => r.json())
    .then(res => {
        if (res.success) loadNotifications();
    });
}

function markRead(id) {
    secureFetch(API_BASE + '/notifications/read', { 
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

/* ── KEEP SESSION ALIVE (ping every 4 min) ──────── */
function startKeepAlive() {
    setInterval(function() {
        secureFetch(API_BASE + '/auth/keepalive', { credentials: 'include' })
        .then(function(r){ return r.json(); })
        .then(function(d){
            if (!d.success) {
                /* Session died — silently re-login in background */
                attemptReLogin(false);
            }
        })
        .catch(function(){});
    }, 4 * 60 * 1000);
}

/* ── SAFE SET HELPER ────────────────────────────── */
function safeSet(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ── SHOW LOADING SKELETON ──────────────────────── */
function showLoading() {
    var tb = document.getElementById('tbody');
    if (tb) tb.innerHTML =
        '<tr><td colspan="6" style="text-align:center;padding:40px;color:#9ca3af;">⏳ Loading your applications…</td></tr>';
    var es = document.getElementById('emptyState');
    if (es) es.classList.remove('show');
    var tw = document.getElementById('tableWrap');
    if (tw) tw.style.display = '';
}

/* ── LOAD APPLICATIONS FROM API ─────────────────
   FIX: never redirect — if session expired, do
   silent re-login then retry. Show data or empty
   state. Never show 0 due to a session failure.
─────────────────────────────────────────────── */
function loadApplications() {
    return secureFetch(API_BASE + '/application/my', { credentials: 'include' })
        .then(function(r){
            var httpStatus = r.status;
            return r.json().then(function(res){ return { httpStatus: httpStatus, res: res }; });
        })
        .then(function(obj){
            var res        = obj.res;
            var httpStatus = obj.httpStatus;

            var isNotLoggedIn =
                httpStatus === 401 ||
                (res && res.success === false &&
                    (res.message || '').toLowerCase().includes('not logged in'));

            if (!isNotLoggedIn) {
                /* ✅ Got a valid response — render it */
                return processApps(res);
            }

            /* ⚠️ Session expired — try silent re-login, then retry ONCE */
            console.warn('[Dashboard] Session expired — attempting silent re-login…');
            return attemptReLogin(true).then(function(ok){
                if (!ok) {
                    /* Re-login failed (no creds saved) — show whatever we have or empty */
                    processApps({ success: false, data: [] });
                    showRetryBanner();
                    return;
                }
                /* Re-login OK — retry fetching apps */
                return secureFetch(API_BASE + '/application/my', { credentials: 'include' })
                    .then(function(r2){ return r2.json(); })
                    .then(function(res2){ return processApps(res2); })
                    .catch(function(err){
                        console.error('[Dashboard] Retry after re-login failed:', err);
                        processApps({ success: false, data: [] });
                        showRetryBanner();
                    });
            });
        })
        .catch(function(err){
            /* Network error — try to show whatever apps are cached in memory */
            console.error('[Dashboard] loadApplications network error:', err);
            if (allApps.length > 0) {
                /* Already have data from before — just re-render */
                renderTable(filtered);
                updateSummary(allApps);
            } else {
                processApps({ success: false, data: [] });
                showRetryBanner();
            }
        });
}

/* ── Show a non-intrusive retry banner ──────────── */
function showRetryBanner() {
    var wrap = document.getElementById('remarksWrap');
    if (!wrap) return;
    /* Don't double-add */
    if (document.getElementById('retryBanner')) return;
    var banner = document.createElement('div');
    banner.id = 'retryBanner';
    banner.style.cssText =
        'background:#fef3c7;border:1px solid #f59e0b;border-radius:10px;' +
        'padding:14px 18px;display:flex;align-items:center;gap:12px;margin-bottom:12px;';
    banner.innerHTML =
        '<span style="font-size:18px;">⚠️</span>' +
        '<span style="flex:1;font-size:13px;color:#92400e;">Session timed out. Please ' +
        '<a href="login.html" style="color:#b45309;font-weight:700;text-decoration:underline;">log in again</a>' +
        ' to see your latest applications.</span>' +
        '<button onclick="retryLoad()" style="background:#f59e0b;color:#fff;border:none;border-radius:6px;' +
        'padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;">🔄 Retry</button>';
    wrap.parentNode.insertBefore(banner, wrap);
}

/* ── Retry button handler ───────────────────────── */
function retryLoad() {
    var banner = document.getElementById('retryBanner');
    if (banner) banner.remove();
    showLoading();
    loadApplications();
}

/* ── Process API response → render ─────────────── */
function processApps(res) {
    var raw = [];
    if (res && res.success && Array.isArray(res.data)) raw = res.data;
    else if (Array.isArray(res))                        raw = res;
    else if (res && Array.isArray(res.data))            raw = res.data;

    allApps  = raw.map(transformApp);
    filtered = allApps.slice();

    const sideAppBadge = document.getElementById('sideAppBadge');
    if (sideAppBadge) {
        sideAppBadge.textContent = allApps.length;
        sideAppBadge.style.display = allApps.length > 0 ? 'block' : 'none';
    }
    safeSet('totCnt',   allApps.length);

    renderTable(filtered);
    updateSummary(allApps);
    renderRemarks(allApps);
}

/* ── Silent re-login using stored credentials ──────
   FIX: redirectOnFail=false means we NEVER force a
   redirect — caller decides what to show instead.
─────────────────────────────────────────────────── */
function attemptReLogin(redirectOnFail) {
    var creds = null;
    try { creds = JSON.parse(localStorage.getItem('user_creds') || 'null'); } catch(e){}

    if (!creds || !creds.email || !creds.password) {
        console.warn('[Dashboard] No stored creds for silent re-login');
        return Promise.resolve(false);   /* ← never redirect here */
    }

    return secureFetch(API_BASE + '/auth/login', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ email: creds.email, password: creds.password })
    })
    .then(function(r){ return r.json(); })
    .then(function(res){
        if (res.success || res.user) {
            console.log('[Dashboard] ✅ Silent re-login OK');
            if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
            return true;
        }
        console.warn('[Dashboard] Silent re-login rejected by server');
        return false;
    })
    .catch(function(){
        console.warn('[Dashboard] Silent re-login network error');
        return false;
    });
}

/* ── RENDER TABLE ───────────────────────────────── */
function renderTable(apps) {
    var tbody = document.getElementById('tbody');
    var empty = document.getElementById('emptyState');
    var wrap  = document.getElementById('tableWrap');

    safeSet('visCnt', apps.length);

    if (apps.length === 0) {
        if (empty) empty.classList.add('show');
        if (wrap)  wrap.style.display = 'none';
        if (tbody) tbody.innerHTML = '';
        return;
    }

    if (empty) empty.classList.remove('show');
    if (wrap)  wrap.style.display = '';

    tbody.innerHTML = apps.map(function(app, i) {
        var isDl = (app.rawStatus || '').toLowerCase() === 'approved';
        return '<tr style="animation:fadeUp .3s ease ' + (i * 0.045) + 's both;">' +
            '<td><span class="app-id-badge">' + app.id + '</span></td>' +
            '<td><div class="doc-cell"><span class="doc-ico">' + app.docIco + '</span>' +
                '<span class="doc-name">' + app.docType + '</span></div></td>' +
            '<td><span class="date-text">📅 ' + app.date + '</span></td>' +
            '<td><span class="proc-text">⏱ ' + app.proc + '</span></td>' +
            '<td>' + pill(app.rawStatus) + '</td>' +
            '<td><div class="act-wrap">' +
                '<button class="act act-view"  onclick="openDetail(' + i + ')">🔍 View</button>' +
                '<button class="act act-track" onclick="window.location.href=\'track-status.html\'">📍 Track</button>' +
                '<button class="act act-dl" ' + (isDl ? '' : 'disabled') +
                    ' onclick="doDownload(event,' + i + ')">⬇️ Download</button>' +
            '</div></td>' +
        '</tr>';
    }).join('');
}

/* ── SUMMARY CARDS ──────────────────────────────── */
function updateSummary(apps) {
    var inProgress = ['pending','verified','clerk_approved','hod_approved','processing'];
    var total    = apps.length;
    var pending  = apps.filter(function(a){ return inProgress.includes((a.rawStatus||'').toLowerCase()); }).length;
    var approved = apps.filter(function(a){ return (a.rawStatus||'').toLowerCase() === 'approved'; }).length;
    var rejected = apps.filter(function(a){ return (a.rawStatus||'').toLowerCase().includes('rejected'); }).length;

    safeSet('sumTotal',    total);
    safeSet('sumPending',  pending);
    safeSet('sumApproved', approved);
    safeSet('sumRejected', rejected);
    safeSet('totCnt',      total);
    safeSet('pendCnt',     pending);
    safeSet('appCnt',      approved);
    safeSet('rejCnt',      rejected);
}

/* ── REMARKS SECTION ────────────────────────────── */
function renderRemarks(apps) {
    var wrap  = document.getElementById('remarksWrap');
    if (!wrap) return;

    var items = apps.filter(function(a){ return a.remark; });
    if (!items.length) { wrap.innerHTML = ''; return; }

    var cls = { reject:'rk-reject', approve:'rk-approve', info:'rk-info', warn:'rk-warn' };
    var ico = { reject:'❌', approve:'✅', info:'ℹ️', warn:'⚠️' };

    wrap.innerHTML =
        '<div style="font-family:Noto Serif,serif;font-size:15px;font-weight:700;color:var(--navy);margin-bottom:12px;">🔔 Notifications &amp; Remarks</div>' +
        '<div class="remarks-section">' +
        items.map(function(app){
            var r = app.remark;
            return '<div class="rk-card ' + (cls[r.type] || 'rk-info') + '">' +
                '<div class="rk-ico">' + (ico[r.type] || 'ℹ️') + '</div>' +
                '<div class="rk-body"><strong>' + app.id + ' · ' + r.title + '</strong><p>' + r.msg + '</p></div>' +
            '</div>';
        }).join('') +
        '</div>';
}

/* ── FILTERS ────────────────────────────────────── */
function applyFilters() {
    var q  = (document.getElementById('qSearch').value || '').toLowerCase().trim();
    var st = document.getElementById('fStatus').value;
    var tp = document.getElementById('fType').value;

    filtered = allApps.filter(function(a){
        var mq = !q  || a.id.toLowerCase().includes(q) || a.docType.toLowerCase().includes(q);
        var ms = !st || (a.rawStatus||'').toLowerCase() === st.toLowerCase()
                     || statusLabel(a.rawStatus).toLowerCase() === st.toLowerCase();
        var mt = !tp || a.docType === tp;
        return mq && ms && mt;
    });

    safeSet('visCnt', filtered.length);
    renderTable(filtered);
    updateSummary(filtered);
}

function clearFilters() {
    document.getElementById('qSearch').value = '';
    document.getElementById('fStatus').value = '';
    document.getElementById('fType').value   = '';
    filtered = allApps.slice();
    safeSet('visCnt', filtered.length);
    renderTable(filtered);
    updateSummary(allApps);
}

/* ── OPEN DETAIL MODAL ──────────────────────────── */
function openDetail(idx) {
    var app = filtered[idx];
    if (!app) return;
    currentApp = app;

    safeSet('mi-id',      app.id);
    safeSet('mi-type',    app.docIco + ' ' + app.docType);
    safeSet('mi-date',    app.date);
    safeSet('mi-proc',    app.proc);
    safeSet('mi-purpose', app.purpose || '–');

    var miStatus = document.getElementById('mi-status');
    if (miStatus) miStatus.innerHTML = pill(app.rawStatus);

    var miFiles = document.getElementById('mi-files');
    if (miFiles) {
        miFiles.innerHTML = (app.files || []).map(function(f){
            var ext = (f.split('.').pop() || '').toUpperCase();
            return '<div class="file-row">' +
                '<span class="file-ico">' + (ext === 'PDF' ? '📕' : '🖼️') + '</span>' +
                '<span class="file-name">' + f + '</span>' +
                '<span class="file-ext">' + (ext || 'FILE') + '</span>' +
            '</div>';
        }).join('') || '<div style="color:#9ca3af;font-size:13px;">No documents attached</div>';
    }

    var miTl = document.getElementById('mi-timeline');
    if (miTl) {
        miTl.innerHTML = (app.tl || []).map(function(t){
            var dc  = t.t === 'done' ? 'done' : t.t === 'active' ? 'active' : t.t === 'err' ? 'err' : '';
            var sym = t.t === 'done' ? '✓'    : t.t === 'err'    ? '✕'      : t.t === 'active' ? '●' : '○';
            return '<div class="tl-row">' +
                '<div class="tl-dot ' + dc + '">' + sym + '</div>' +
                '<div class="tl-cnt">' +
                    '<div class="tl-lbl' + (t.t === 'todo' ? ' muted' : '') + '">' + t.l + '</div>' +
                    '<div class="tl-date">' + t.d + '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    var rw = document.getElementById('mi-remarks-wrap');
    if (app.remark && rw) {
        var r    = app.remark;
        var cls2 = { reject:'rk-reject', approve:'rk-approve', info:'rk-info', warn:'rk-warn' };
        var ico2 = { reject:'❌', approve:'✅', info:'ℹ️', warn:'⚠️' };
        var miRk = document.getElementById('mi-remarks');
        if (miRk) {
            miRk.innerHTML =
                '<div class="rk-card ' + (cls2[r.type]||'rk-info') + '">' +
                    '<div class="rk-ico">' + (ico2[r.type]||'ℹ️') + '</div>' +
                    '<div class="rk-body"><strong>' + r.title + '</strong><p>' + r.msg + '</p></div>' +
                '</div>';
        }
        rw.style.display = '';
    } else if (rw) {
        rw.style.display = 'none';
    }

    var mDlBtn = document.getElementById('mDlBtn');
    if (mDlBtn) mDlBtn.disabled = (app.rawStatus||'').toLowerCase() !== 'approved';

    var overlay = document.getElementById('detailOverlay');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

/* ── CLOSE MODAL ────────────────────────────────── */
function closeModal() {
    var overlay = document.getElementById('detailOverlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    currentApp = null;
}
function handleOverlayClick(e) {
    if (e.target === document.getElementById('detailOverlay')) closeModal();
}

/* ── DOWNLOAD ───────────────────────────────────── */
function handleModalDownload() {
    if (!currentApp || (currentApp.rawStatus||'').toLowerCase() !== 'approved') return;
    downloadApp(currentApp);
}

function doDownload(e, idx) {
    e.stopPropagation();
    var app = filtered[idx];
    if (!app || (app.rawStatus||'').toLowerCase() !== 'approved') return;
    downloadApp(app);
}

function downloadApp(app) {
    toast('⬇️ Preparing download…');
    secureFetch(API_BASE + '/documents/download?application_number=' + app.id, {
        credentials: 'include'
    })
    .then(function(r){
        if (!r.ok) throw new Error('Download failed');
        return r.blob();
    })
    .then(function(blob){
        var url = URL.createObjectURL(blob);
        var a   = document.createElement('a');
        a.href  = url;
        a.download = app.id + '_' + app.docType.replace(/\s+/g,'_') + '.pdf';
        a.click();
        URL.revokeObjectURL(url);
        toast('✅ Download started!');
    })
    .catch(function(){
        toast('⚠️ Download not available yet. Please check back later.');
    });
}

/* ── TOAST ──────────────────────────────────────── */
function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(function(){ t.classList.remove('show'); }, 3000);
}

/* ── LOGOUT ─────────────────────────────────────── */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        secureFetch(API_BASE + '/auth/logout', { method:'POST', credentials:'include' })
        .finally(function(){
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}

// Global click listener for dropdowns
document.addEventListener('click', function(e) {
    const notifDropdown = document.getElementById('notifDropdown');
    const notifBtn = document.querySelector('.notif-btn');
    if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        notifDropdown.classList.remove('open');
    }
});