/* ================================================
   download.js  —  Downloads Page
   Connected to Backend API
   Shows ALL principal-approved documents
   JDCOEM Digital Document Services Portal
   ================================================

   FIXES APPLIED:
   1. safeSet() was undefined → defined as alias for setEl()
   2. downloadViaApi() used wrong endpoint /documents/download
      → fixed to /certificate/download?application_id={numericId}
   3. handleView() / handlePrint() fallbacks used wrong endpoint
      → fixed to /certificate/download?application_id={numericId}
   4. loadNotifications() called /notifications/unread (404)
      → fixed to /notifications/unread-count + /notifications/my
   5. clearNotifs() called /notifications/mark-all-read (no route)
      → now fetches all unread IDs and marks each one individually
   6. markRead(id) called /notifications/mark-read/{id} (no route)
      → fixed to POST /notifications/read with {notification_id: id}
   7. BASE_URL was never defined → ReferenceError on download/view/print
      → derived from window.location same way as API_BASE
   8. loadNotifications() used `items` before assignment
      → fixed to read from res.data properly
   ================================================ */

/* ── BASE URLs ──────────────────────────────────── */
/* Use global root from security.js or derive it */
const PROJECT_ROOT = window.BASE_URL || window.location.origin + window.location.pathname.split('/public/')[0];
const BASE_URL = PROJECT_ROOT + '/public';
const API_BASE = BASE_URL + '/index.php/api';

var APPROVED_DOCS = [];
var selectedDocIndex = 0;

/* ── DOC ICONS & COLORS ─────────────────────────── */
var DOC_META = {
    bonafide: { icon: '📜', bg: '#d1fae5' },
    character: { icon: '⭐', bg: '#fef9c3' },
    tc: { icon: '🚪', bg: '#fee2e2' },
    leaving: { icon: '🚪', bg: '#fee2e2' },
    transcript: { icon: '📋', bg: '#dbeafe' },
    noc: { icon: '✅', bg: '#d1fae5' },
    migration: { icon: '🔀', bg: '#ede9fe' },
    provisional: { icon: '🏅', bg: '#fef3c7' },
    degree: { icon: '🎓', bg: '#fef3c7' },
    hallticket: { icon: '🎟️', bg: '#fce7f3' },
    marksheet: { icon: '📊', bg: '#e0f2fe' },
    idcard: { icon: '🪪', bg: '#e0f2fe' },
    admission: { icon: '📩', bg: '#fff7ed' }
};

function getDocMeta(type) {
    if (!type) return { icon: '📄', bg: '#dbeafe' };
    var t = (type || '').toLowerCase().replace(/[\s\-_]/g, '');
    return DOC_META[t]
        || DOC_META[Object.keys(DOC_META).find(function (k) { return t.includes(k); })]
        || { icon: '📄', bg: '#dbeafe' };
}

/* ── FORMAT DATE ────────────────────────────────── */
function fmtDate(dt) {
    if (!dt) return '—';
    try { return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch (e) { return dt; }
}
function fmtDateTime(dt) {
    if (!dt) return '—';
    try { return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return dt; }
}

/* ── RENDER USER INFO ───────────────────────────── */
function renderUser(u) {
    var name = u.name || u.full_name || u.bt_id || u.btid || 'Student';
    var btid = u.bt_id || u.btid || u.student_id || u.email || '--';
    var initials = name.split(' ').filter(Boolean).map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();

    safeSet('userName', name);
    safeSet('userId', btid);
    safeSet('userInitials', initials);

    // Also update student strip if it exists (specific to download page)
    safeSet('stuName', name);
    safeSet('stuBtid', btid);

    /* Also update any avatar elements */
    var avatars = document.querySelectorAll('.user-avatar, .stu-avatar, #stuAv');
    avatars.forEach(function (a) { a.textContent = initials; });
}

/* ── BUILD HISTORY FROM API ─────────────────────── */
function buildHistory(a) {
    var h = [];
    if (a.created_at) h.push({ event: 'Application Submitted', date: fmtDateTime(a.created_at), color: '#6366f1', badge: 'Submitted' });
    if (a.clerk_approved_at) h.push({ event: 'Clerk Verification Complete', date: fmtDateTime(a.clerk_approved_at), color: '#0d6efd', badge: 'Verified' });
    if (a.hod_approved_at) h.push({ event: 'HOD Approved', date: fmtDateTime(a.hod_approved_at), color: '#7c3aed', badge: 'HOD OK' });
    if (a.approved_at) h.push({ event: 'Document Issued by Principal', date: fmtDateTime(a.approved_at), color: '#16a34a', badge: 'Issued' });
    return h;
}

/* ── HELPERS ────────────────────────────────────── */

/**
 * setEl — set textContent of element by ID
 */
function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

/**
 * FIX 1: safeSet was called throughout but never defined.
 * Now defined as a safe alias for setEl().
 */
function safeSet(id, val) {
    setEl(id, val);
}

function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ── GET DOCUMENT TYPE NAME ─────────────────────── */
function resolveDocType(a) {
    var raw = a.certificate_type_name || a.document_type_name || a.doc_type_name || null;
    if (raw) return raw;
    var code = a.certificate_type || a.document_type || a.doc_type || a.type || '';
    if (!code) return 'Document';
    var pretty = code.charAt(0).toUpperCase() + code.slice(1).replace(/[_\-]/g, ' ');
    if (!/certificate|transcript|card|sheet|ticket|letter/i.test(pretty)) pretty += ' Certificate';
    return pretty;
}

/* ════════════════════════════════════════════════
   INIT
   Flow on every page load / refresh:
     1. Read user from localStorage — if missing → login
     2. Call loadDocuments() directly (no /auth/me needed)
     3. If /application/my returns session expired →
        try silent re-login using stored user_creds
     4. If re-login fails → show retry banner (NO redirect)
     5. Only redirect to login on explicit logout
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
    const raw = localStorage.getItem('user');
    if (!raw) { window.location.href = 'login.html'; return; }

    try {
        const u = JSON.parse(raw);
        renderUser(u);
    } catch (e) {
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
        })
        .catch(() => { });

    loadNotifications();
    startKeepAlive();
    loadDocuments();

    /* Global click listener for dropdowns */
    document.addEventListener('click', function (e) {
        const notifDropdown = document.getElementById('notifDropdown');
        const notifBtn = document.querySelector('.notif-btn');
        if (notifDropdown && notifBtn && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
            notifDropdown.classList.remove('open');
        }
    });
});


/* ── KEEP SESSION ALIVE (ping every 4 min) ──────── */
function startKeepAlive() {
    setInterval(function () {
        secureFetch(API_BASE + '/debug/session', { credentials: 'include' })
            .then(function (r) {
                if (!r.ok) return null;
                return r.json();
            })
            .then(function (d) {
                if (!d) return;
                if (!d.user_id) {
                    attemptReLoginDl().then(function (ok) {
                        if (!ok) showRetryBanner();
                    });
                }
            })
            .catch(function () { });
    }, 4 * 60 * 1000);
}

/* ════════════════════════════════════════════════
   NOTIFICATIONS
   FIX 5: /notifications/unread  → /notifications/unread-count
           Response shape: {success, data: {unread_count: N}}
   FIX 6: markRead() POST body   → {notification_id: id}
   FIX 7: clearNotifs() → mark each unread individually
════════════════════════════════════════════════ */
function toggleNotif() {
    var d = document.getElementById('notifDropdown');
    if (d) d.classList.toggle('open');
}

/**
 * FIX 5: Load notifications using correct endpoints.
 *   - Unread count: GET /notifications/unread-count → {success, data:{unread_count}}
 *   - List:         GET /notifications/my            → {success, data:[...]}
 */
function loadNotifications() {
    secureFetch(API_BASE + '/notifications/unread-count', { credentials: 'include' })
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

    secureFetch(API_BASE + '/notifications/my', { credentials: 'include' })
        .then(r => r.json())
        .then(res => {
            const list = document.getElementById('notifList');
            if (!list) return;

            /* FIX 8: `items` was used before being assigned — caused ReferenceError.
               Now correctly read from res.data with a safe fallback to []. */
            var items = (res && res.success && Array.isArray(res.data)) ? res.data : [];
            items = items.slice(0, 5);

            var html = '';
            items.forEach(function (n) {
                var icon = n.type === 'status' ? '⚡' : '📅';
                html += '<div class="nd-item" onclick="markRead(' + n.id + ')" style="cursor:pointer;">'
                    + '<div class="nd-icon">' + icon + '</div>'
                    + '<div class="nd-text">'
                    + '<div class="nd-title">' + esc(n.title || 'Notification') + '</div>'
                    + '<div class="nd-desc">' + esc(n.message || '') + '</div>'
                    + '<div class="nd-time">' + fmtDate(n.created_at) + '</div>'
                    + '</div>'
                    + '</div>';
            });
            list.innerHTML = html || '<div style="color:var(--g400,#9ca3af);font-size:13px;padding:12px;">No notifications.</div>';
        })
        .catch(function () { });
}

/**
 * FIX 6: markRead — POST /notifications/read with {notification_id: id}
 * Old: /notifications/mark-read/${id}  (no such route)
 */
function markRead(id) {
    secureFetch(API_BASE + '/notifications/read', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: id })
    })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (res) {
            if (res && res.success) loadNotifications();
        })
        .catch(function () { });
}

/**
 * FIX 7: clearNotifs — no bulk endpoint exists.
 * Strategy: fetch all notifications, mark each unread one as read.
 * Old: /notifications/mark-all-read  (no such route → 404)
 */
function clearNotifs() {
    secureFetch(API_BASE + '/notifications/my', { credentials: 'include' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (res) {
            if (!res || !res.success || !Array.isArray(res.data)) return;

            var unread = res.data.filter(function (n) { return !n.is_read; });
            if (unread.length === 0) { loadNotifications(); return; }

            /* Fire mark-read for each unread notification */
            var promises = unread.map(function (n) {
                return secureFetch(API_BASE + '/notifications/read', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notification_id: n.id })
                }).catch(function () { });
            });

            Promise.all(promises).then(function () {
                loadNotifications();
            });
        })
        .catch(function () { loadNotifications(); });
}


/* ── LOAD FROM BACKEND ───────────────────────────
   Goes straight to /application/my — no /auth/me.
   On session expiry: silent re-login → retry once.
   On failure: show retry banner, never auto-redirect.
─────────────────────────────────────────────── */
function loadDocuments() {
    secureFetch(API_BASE + '/application/my?_t=' + Date.now(), { credentials: 'include', cache: 'no-store' })
        .then(function (r) {
            var httpStatus = r.status;
            return r.json().then(function (res) { return { httpStatus: httpStatus, res: res }; });
        })
        .then(function (obj) {
            var res = obj.res;
            var httpStatus = obj.httpStatus;

            var msg = (res && res.message ? res.message : '').toLowerCase();
            var isNotLoggedIn =
                httpStatus === 401 ||
                (res && res.success === false &&
                    (msg.includes('not logged in') ||
                        msg.includes('unauthorized') ||
                        msg.includes('unauthenticated')));

            if (!isNotLoggedIn) {
                return processDocuments(res);
            }

            console.warn('[Downloads] Session expired — attempting silent re-login…');
            return attemptReLoginDl(true).then(function (ok) {
                if (!ok) {
                    var ls = document.getElementById('loadingState');
                    if (ls) ls.style.display = 'none';
                    APPROVED_DOCS = [];
                    renderPage(false);
                    showRetryBanner();
                    return;
                }
                secureFetch(API_BASE + '/application/my?_t=' + Date.now(), { credentials: 'include', cache: 'no-store' })
                    .then(function (r2) { return r2.json(); })
                    .then(function (res2) { return processDocuments(res2); })
                    .catch(function (err) {
                        console.error('[Downloads] Retry after re-login failed:', err);
                        var ls = document.getElementById('loadingState');
                        if (ls) ls.style.display = 'none';
                        APPROVED_DOCS = [];
                        renderPage(false);
                        showRetryBanner();
                    });
            });
        })
        .catch(function (err) {
            console.error('[Downloads] Fetch error:', err);
            var ls = document.getElementById('loadingState');
            if (ls) ls.style.display = 'none';
            renderPage(false);
            if (APPROVED_DOCS.length === 0) showRetryBanner();
        });
}

/* ── Show a non-intrusive retry banner ──────────── */
function showRetryBanner() {
    if (document.getElementById('dlRetryBanner')) return;
    var target = document.getElementById('emptyState') || document.body;
    var banner = document.createElement('div');
    banner.id = 'dlRetryBanner';
    banner.style.cssText =
        'background:#fef3c7;border:1px solid #f59e0b;border-radius:10px;' +
        'padding:14px 18px;display:flex;align-items:center;gap:12px;' +
        'margin:12px 0;max-width:600px;';
    banner.innerHTML =
        '<span style="font-size:18px;">⚠️</span>' +
        '<span style="flex:1;font-size:13px;color:#92400e;">Session timed out. Please ' +
        '<a href="login.html" style="color:#b45309;font-weight:700;text-decoration:underline;">log in again</a>' +
        ' to see your documents.</span>' +
        '<button onclick="retryLoadDl()" style="background:#f59e0b;color:#fff;border:none;border-radius:6px;' +
        'padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;">🔄 Retry</button>';
    if (target.parentNode) {
        target.parentNode.insertBefore(banner, target);
    } else {
        document.body.prepend(banner);
    }
}

/* ── Retry button handler ───────────────────────── */
function retryLoadDl() {
    var banner = document.getElementById('dlRetryBanner');
    if (banner) banner.remove();
    var ls = document.getElementById('loadingState');
    if (ls) ls.style.display = '';
    loadDocuments();
}

/* ── Process API response → render docs ─────────── */
function processDocuments(res) {
    console.log('[Downloads] API response:', res);

    var all = [];
    if (Array.isArray(res)) all = res;
    else if (res && res.success && Array.isArray(res.data)) all = res.data;
    else if (res && res.data && Array.isArray(res.data)) all = res.data;
    else if (res && Array.isArray(res.applications)) all = res.applications;

    console.log('[Downloads] Total apps:', all.length,
        '| Statuses:', all.map(function (a) { return (a.application_number || a.id) + ':"' + a.status + '"'; }));

    // Debug: log all statuses in a single string for easy reading in some consoles
    var statusDump = all.map(function(a){ return a.status; }).join(', ');
    console.log('[Downloads] Raw status list: [' + statusDump + ']');

    setEl('sideAppBadge', all.length);
    var sideAppBadge = document.getElementById('sideAppBadge');
    if (sideAppBadge) sideAppBadge.style.display = all.length > 0 ? 'block' : 'none';

    var hasPending = all.some(function (a) {
        var s = (a.status || '').toLowerCase();
        return s === 'pending' || s === 'clerk_approved' || s === 'hod_approved';
    });

    /* Expanded status filter — catch all backend variants of "approved" */
    APPROVED_DOCS = all
        .filter(function (a) {
            var s = (a.status || '').toLowerCase().trim();
            return s === 'approved'
                || s === 'principal_approved'
                || s === 'issued'
                || s === 'completed';
        })
        .sort(function (a, b) {
            return new Date(b.approved_at || b.updated_at || 0)
                - new Date(a.approved_at || a.updated_at || 0);
        })
        .map(function (a) {
            var typeName = resolveDocType(a);
            var meta = getDocMeta(a.certificate_type || a.document_type || a.doc_type || a.type || '');
            return {
                id: a.application_number || ('APP-' + a.id),
                appId: a.id,                          /* ← numeric DB id, used for API calls */
                docType: typeName,
                docIco: meta.icon,
                icoBg: meta.bg,
                issueDate: fmtDate(a.approved_at || a.updated_at),
                certNumber: a.certificate_number || a.application_number,
                certificate_file: a.certificate_file || null,
                validity: '6 months from issue date',
                authority: 'Principal Office, JDCOEM',
                purpose: a.purpose || '—',
                downloadCount: 0,
                verificationId: 'JDCOEM-VER-' + (a.application_number || a.id).toString().replace(/[^A-Z0-9]/gi, '').toUpperCase(),
                history: buildHistory(a),
                raw: a
            };
        });

    console.log('[Downloads] Approved docs:', APPROVED_DOCS.length,
        APPROVED_DOCS.map(function (d) { return d.id + '(' + d.raw.status + ')'; }));

    var ls = document.getElementById('loadingState');
    if (ls) ls.style.display = 'none';

    selectedDocIndex = 0;
    renderPage(hasPending);
}

/* ── Silent re-login using stored credentials ──────
   Reads localStorage key 'user_creds' = {email, password}
   Never auto-redirects — returns false so caller can show retry banner.
─────────────────────────────────────────────────── */
function attemptReLoginDl(redirectOnFail) {
    var creds = null;
    try { creds = JSON.parse(localStorage.getItem('user_creds') || 'null'); } catch (e) { }

    if (!creds || !creds.email || !creds.password) {
        console.warn('[Downloads] No stored creds — cannot silent re-login');
        return Promise.resolve(false);
    }

    return secureFetch(API_BASE + '/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: creds.email, password: creds.password })
    })
        .then(function (r) { return r.json(); })
        .then(function (res) {
            if (res.success || res.user || res.status === 'success') {
                console.log('[Downloads] ✅ Silent re-login OK');
                if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
                return true;
            }
            console.warn('[Downloads] Silent re-login rejected by server');
            return false;
        })
        .catch(function () {
            console.warn('[Downloads] Silent re-login network error');
            return false;
        });
}

/* ── RENDER PAGE ────────────────────────────────── */
function renderPage(hasPending) {
    setEl('statIssued', APPROVED_DOCS.length);
    setEl('statDownloads', APPROVED_DOCS.reduce(function (s, d) { return s + d.downloadCount; }, 0));

    if (APPROVED_DOCS.length === 0) {
        var es = document.getElementById('emptyState');
        if (es) es.style.display = '';

        var pn = document.getElementById('esPendingNote');
        if (pn && hasPending) pn.style.display = 'flex';

        ['stuStrip', 'docCardsSection', 'verifySection', 'historyCard'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        return;
    }

    var es = document.getElementById('emptyState');
    if (es) es.style.display = 'none';

    var ss = document.getElementById('stuStrip');
    if (ss) ss.style.display = 'flex';

    var first = APPROVED_DOCS[0];
    setEl('siDocName', first.docType);
    setEl('siApproved', first.issueDate);

    /* Populate branch/year if available (name/btid now handled by renderUser) */
    var u = {};
    try { u = JSON.parse(localStorage.getItem('user') || '{}'); } catch (e) { }
    setEl('stuBranch', u.branch || '—');
    setEl('stuYear', u.year || '—');

    var ds = document.getElementById('docCardsSection');
    if (ds) ds.style.display = '';
    renderDocCards();

    var vs = document.getElementById('verifySection');
    if (vs) vs.style.display = '';
    renderVerification(first);

    var hs = document.getElementById('historyCard');
    if (hs) hs.style.display = '';
    renderHistory(first.history);

    generateQR();
}

/* ── RENDER CARDS (ALL approved docs) ──────────── */
function renderDocCards() {
    setEl('issuedCount', APPROVED_DOCS.length + ' document' + (APPROVED_DOCS.length !== 1 ? 's' : ''));
    var list = document.getElementById('docCardsList');
    if (!list) return;

    list.innerHTML = APPROVED_DOCS.map(function (doc, i) {
        return '<div class="doc-card approved-card fu" style="animation-delay:' + (0.1 + i * 0.08) + 's;">'
            + '<div class="dc-header">'
            + '<div class="dc-icon-wrap" style="background:' + doc.icoBg + '">' + doc.docIco + '</div>'
            + '<div style="flex:1;min-width:0;">'
            + '<div class="dc-title">' + esc(doc.docType) + '</div>'
            + '<div class="dc-meta-row">'
            + '<span class="dc-tag dt-approved">✅ Issued</span>'
            + '<span class="dc-tag dt-authority">🏛 ' + esc(doc.authority) + '</span>'
            + '<span class="dc-tag dt-format">📄 PDF</span>'
            + '<span class="dc-tag dt-validity">⏳ Valid 6 months</span>'
            + '</div>'
            + '<div style="font-size:12px;color:var(--g400,#9ca3af);margin-top:4px;">'
            + 'App ID: <strong style="font-family:monospace;color:var(--navy,#0a1628);">' + esc(doc.id) + '</strong>'
            + ' &nbsp;·&nbsp; Cert: <strong style="font-family:monospace;color:var(--navy,#0a1628);">' + esc(doc.certNumber || 'N/A') + '</strong>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="dc-body">'
            + '<div class="dc-left">'
            + '<div class="dc-info-grid">'
            + '<div class="dc-info-field"><div class="dc-info-lbl">Issue Date</div><div class="dc-info-val">📅 ' + esc(doc.issueDate) + '</div></div>'
            + '<div class="dc-info-field"><div class="dc-info-lbl">Approved By</div><div class="dc-info-val">✅ Principal, JDCOEM</div></div>'
            + '<div class="dc-info-field"><div class="dc-info-lbl">Purpose</div><div class="dc-info-val" style="font-size:12.5px;">' + esc(doc.purpose) + '</div></div>'
            + '<div class="dc-info-field"><div class="dc-info-lbl">Downloads</div><div class="dc-info-val" id="dlCount-' + i + '">⬇️ 0 times</div></div>'
            + '</div>'
            + '</div>'
            + '<div class="dc-right">'
            + '<div class="preview-wrap">'
            + '<div class="preview-mock">'
            + '<div class="preview-doc-sheet">'
            + '<div class="pds-header"><div class="pds-college">JD College of Engg.<br>&amp; Management, Nagpur</div></div>'
            + '<div class="pds-title">' + esc(doc.docType) + '</div>'
            + '<div class="pds-line w80"></div><div class="pds-line w60"></div><div class="pds-line w70"></div><div class="pds-line" style="width:50%;"></div>'
            + '<div class="pds-seal">🏛</div>'
            + '</div>'
            + '<div class="preview-label">Preview</div>'
            + '</div>'
            + '</div>'
            + '<div class="dl-actions">'
            + '<button class="btn-dl-primary"   onclick="handleDownload(' + i + ')">⬇️ Download PDF</button>'
            + '<button class="btn-dl-secondary" onclick="handleView(' + i + ')">👁️ View Online</button>'
            + '<button class="btn-dl-secondary" onclick="handlePrint(' + i + ')">🖨️ Print</button>'
            + '<button class="btn-dl-secondary" onclick="selectDoc(' + i + ')" style="font-size:11px;">📋 View History</button>'
            + '<div class="dl-note">🔐 Digitally signed · Valid 6 months</div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';
    }).join('');
}

/* ── SELECT DOC → update history & verification ── */
function selectDoc(idx) {
    var doc = APPROVED_DOCS[idx];
    if (!doc) return;
    selectedDocIndex = idx;
    renderVerification(doc);
    renderHistory(doc.history);
    var hs = document.getElementById('historyCard');
    if (hs) hs.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('📋 Showing history for ' + doc.id);
}

/* ── RENDER VERIFICATION ────────────────────────── */
function renderVerification(doc) {
    setEl('verId', doc.verificationId);
    setEl('verSig', 'DS-SHA256-' + (doc.certNumber || doc.id).toString().replace(/[^A-Z0-9]/gi, '').substring(0, 8).toUpperCase() + '…');
}

/* ── RENDER HISTORY ─────────────────────────────── */
function renderHistory(history) {
    var hb = document.getElementById('historyBody');
    if (!hb) return;
    if (!history || history.length === 0) {
        hb.innerHTML = '<div style="color:var(--g400,#9ca3af);font-size:13px;padding:8px;">No history available.</div>';
        return;
    }
    hb.innerHTML = history.map(function (h) {
        return '<div class="hist-row">'
            + '<div class="hist-dot" style="background:' + h.color + ';"></div>'
            + '<div class="hist-event"><div class="hist-label">' + esc(h.event) + '</div><div class="hist-date">' + esc(h.date) + '</div></div>'
            + '<span class="hist-badge" style="background:' + h.color + '22;color:' + h.color + ';border:1px solid ' + h.color + '44;">' + esc(h.badge) + '</span>'
            + '</div>';
    }).join('');
}

/* ── DECORATIVE QR ──────────────────────────────── */
function generateQR() {
    var grid = document.getElementById('qrGrid');
    if (!grid) return;
    var p = [1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1];
    grid.innerHTML = p.map(function (b) {
        return '<div class="qr-cell" style="background:' + (b ? '#0a1628' : 'transparent') + ';"></div>';
    }).join('');
}

/* ════════════════════════════════════════════════
   DOWNLOAD / VIEW / PRINT
   
   Strategy — two-pass for each action:
   Pass 1: Try direct browser URL
     • STUDENTS path: BASE_URL/storage/uploads/{relPath}
       (storage/uploads/.htaccess has "Require all granted" ✅)
     • Generated path: BASE_URL/public/storage/generated/{filename}
   Pass 2: If HEAD check fails → API download via backend
     • FIX 2: Use /certificate/download?application_id={numericId}
       (was: /documents/download?application_number=... → wrong endpoint)
════════════════════════════════════════════════ */

/**
 * Build the direct web-accessible URL for a certificate file.
 * FIX 7: BASE_URL is now defined at top of file.
 * @param  {string} fname  value of certificate_file from DB
 * @return {string}        full URL
 */
function buildDirectUrl(fname) {
    if (!fname) return null;
    if (!fname.toLowerCase().endsWith('.pdf')) fname += '.pdf';

    /* STUDENTS-based path: stored as "STUDENTS/2024/CS/BT240076CS/issued/CERT-xxx.pdf"
       Maps to: http://localhost/college-portal/public/storage/uploads/STUDENTS/... */
    if (fname.indexOf('STUDENTS') > -1 || fname.indexOf('/') > -1) {
        return BASE_URL + '/storage/uploads/' + fname;
    }

    /* Legacy flat filename: stored as "certificate_1_12345.pdf"
       Lives in public/storage/generated/ */
    return BASE_URL + '/storage/generated/' + fname;
}

/**
 * Build the PHP API download URL for a certificate.
 * FIX 2: Was /documents/download?application_number=... (DocumentController, wrong params)
 *        Now: /certificate/download?application_id={numericId}  (CertificateController ✅)
 * @param  {object} doc  entry from APPROVED_DOCS
 * @return {string}  API URL
 */
function buildApiUrl(doc) {
    /* appId is the numeric a.id — what CertificateController::download() expects */
    if (doc.appId) {
        return API_BASE + '/certificate/download?application_id=' + doc.appId;
    }
    /* Fallback: try certificate_number if numeric id is somehow missing */
    if (doc.certNumber) {
        return API_BASE + '/certificate/download?certificate_number=' + encodeURIComponent(doc.certNumber);
    }
    return null;
}

/* ── DOWNLOAD ───────────────────────────────────── */
function handleDownload(idx) {
    var doc = APPROVED_DOCS[idx];
    if (!doc) return;
    showToast('⬇️ Preparing ' + doc.docType + '…');
    console.log('[Download] certificate_file:', doc.raw.certificate_file, '| appId:', doc.appId);

    var directUrl = doc.raw && doc.raw.certificate_file
        ? buildDirectUrl(doc.raw.certificate_file)
        : null;

    if (directUrl) {
        /* Try a HEAD request — if file is directly accessible, use it */
        secureFetch(directUrl, { method: 'HEAD' })
            .then(function (r) {
                if (r.ok) {
                    triggerDownload(directUrl, doc.id + '_' + doc.docType.replace(/[\s\/\\]/g, '_') + '.pdf');
                    afterDownload(idx, doc);
                } else {
                    /* Direct URL failed → fall back to API */
                    downloadViaApi(idx, doc);
                }
            })
            .catch(function () { downloadViaApi(idx, doc); });
    } else {
        downloadViaApi(idx, doc);
    }
}

/* ── FIX 2: Download via backend API ────────────── */
function downloadViaApi(idx, doc) {
    var apiUrl = buildApiUrl(doc);
    if (!apiUrl) {
        showToast('⚠️ No certificate available for download. Contact the office.');
        return;
    }
    console.log('[Download] Via API:', apiUrl);

    secureFetch(apiUrl, { credentials: 'include' })
        .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            var ct = r.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
                return r.json().then(function (d) { throw new Error(d.message || 'Download failed'); });
            }
            return r.blob();
        })
        .then(function (blob) {
            var objUrl = URL.createObjectURL(blob);
            triggerDownload(objUrl, doc.id + '_' + doc.docType.replace(/[\s\/\\]/g, '_') + '.pdf');
            afterDownload(idx, doc);
            showToast('✅ ' + doc.docType + ' downloaded successfully!');
        })
        .catch(function (err) {
            console.error('[Download] Error:', err);
            showToast('⚠️ ' + (err.message || 'Download failed. Please contact the office.'));
        });
}

function afterDownload(idx, doc) {
    doc.downloadCount++;
    setEl('dlCount-' + idx, '⬇️ ' + doc.downloadCount + ' time' + (doc.downloadCount !== 1 ? 's' : ''));
    setEl('statDownloads', APPROVED_DOCS.reduce(function (s, d) { return s + d.downloadCount; }, 0));
    showToast('✅ ' + doc.docType + ' downloaded!');
}

function triggerDownload(url, filename) {
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { if (url.startsWith('blob:')) URL.revokeObjectURL(url); }, 2000);
}

/* ── FIX 3: View Online ─────────────────────────── */
function handleView(idx) {
    var doc = APPROVED_DOCS[idx];
    if (!doc) return;
    showToast('👁️ Opening ' + doc.docType + ' in new tab…');

    var directUrl = doc.raw && doc.raw.certificate_file
        ? buildDirectUrl(doc.raw.certificate_file)
        : null;

    if (directUrl) {
        /* Try HEAD — open directly if accessible */
        secureFetch(directUrl, { method: 'HEAD' })
            .then(function (r) {
                if (r.ok) {
                    window.open(directUrl, '_blank');
                } else {
                    /* FIX 3: was /documents/download?application_number= → wrong */
                    var apiUrl = buildApiUrl(doc);
                    if (apiUrl) window.open(apiUrl + '&_token=' + Date.now(), '_blank');
                    else showToast('⚠️ Cannot view certificate. Contact the office.');
                }
            })
            .catch(function () {
                var apiUrl = buildApiUrl(doc);
                if (apiUrl) window.open(apiUrl + '&_token=' + Date.now(), '_blank');
                else showToast('⚠️ Cannot view certificate. Contact the office.');
            });
    } else {
        /* No certificate_file in DB → use API directly */
        var apiUrl = buildApiUrl(doc);
        if (apiUrl) {
            window.open(apiUrl + '&_token=' + Date.now(), '_blank');
        } else {
            showToast('⚠️ Certificate not yet generated. Please wait for processing.');
        }
    }
}

/* ── FIX 4: Print ───────────────────────────────── */
function handlePrint(idx) {
    var doc = APPROVED_DOCS[idx];
    if (!doc) return;
    showToast('🖨️ Opening print dialog…');

    var directUrl = doc.raw && doc.raw.certificate_file
        ? buildDirectUrl(doc.raw.certificate_file)
        : null;

    var openAndPrint = function (url) {
        var win = window.open(url, '_blank');
        if (win) {
            win.addEventListener('load', function () {
                try { win.print(); } catch (e) { }
            });
        }
    };

    if (directUrl) {
        secureFetch(directUrl, { method: 'HEAD' })
            .then(function (r) {
                if (r.ok) {
                    openAndPrint(directUrl);
                } else {
                    /* FIX 4: was /documents/download?application_number= → wrong */
                    var apiUrl = buildApiUrl(doc);
                    if (apiUrl) openAndPrint(apiUrl + '&_token=' + Date.now());
                    else showToast('⚠️ Cannot print certificate. Contact the office.');
                }
            })
            .catch(function () {
                var apiUrl = buildApiUrl(doc);
                if (apiUrl) openAndPrint(apiUrl + '&_token=' + Date.now());
                else showToast('⚠️ Cannot print certificate. Contact the office.');
            });
    } else {
        var apiUrl = buildApiUrl(doc);
        if (apiUrl) {
            openAndPrint(apiUrl + '&_token=' + Date.now());
        } else {
            showToast('⚠️ Certificate not yet generated. Please wait for processing.');
        }
    }
}

/* ── TOAST ──────────────────────────────────────── */
function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(function () { t.classList.remove('show'); }, 3200);
}

/* ── LOGOUT ─────────────────────────────────────── */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        secureFetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'include' })
            .finally(function () {
                localStorage.clear();
                window.location.href = 'login.html';
            });
    }
}

/* ── Global click listener for dropdowns ─────────── */
document.addEventListener('click', function (e) {
    var notifDropdown = document.getElementById('notifDropdown');
    var notifBtn = document.querySelector('.notif-btn');
    if (notifDropdown && notifBtn && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        notifDropdown.classList.remove('open');
    }
});