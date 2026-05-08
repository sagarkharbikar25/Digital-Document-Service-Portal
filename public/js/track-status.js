/* ============================================================
   track-status.js  |  JDCOEM Portal
   Connected to Backend API
   ============================================================ */

const API_BASE = window.location.origin + window.location.pathname.split('/').slice(0, -2).join('/') + '/api';

var activeApp = null;
var allMyApps = [];

/* ── DOC ICONS ─────────────────────────────────── */
var DOC_ICONS = {
    bonafide:'📜', character:'⭐', tc:'🚪', leaving:'🚪',
    transcript:'📋', noc:'✅', migration:'🔀', provisional:'🏅',
    degree:'🎓', hallticket:'🎟️', marksheet:'📊',
    feereceipt:'🧾', admission:'📩', idcard:'🪪'
};
function getDocIcon(type) {
    if (!type) return '📄';
    var t = (type||'').toLowerCase().replace(/\s+/g,'');
    return DOC_ICONS[t] || DOC_ICONS[Object.keys(DOC_ICONS).find(function(k){ return t.includes(k); })] || '📄';
}

/* ── STATUS PILL ────────────────────────────────── */
function statusPill(s) {
    var map = {
        'pending':        '<span class="sp sp-pending">🟡 Pending</span>',
        'clerk_approved': '<span class="sp sp-verified">🔵 Verified</span>',
        'hod_approved':   '<span class="sp sp-processing">🟣 Processing</span>',
        'approved':       '<span class="sp sp-approved">🟢 Approved</span>',
        'rejected':       '<span class="sp sp-rejected">🔴 Rejected</span>',
    };
    return map[(s||'').toLowerCase()] || '<span class="sp sp-pending">'+(s||'Pending')+'</span>';
}

function friendlyStatus(s) {
    var map = {
        'pending':'Pending','clerk_approved':'Verified',
        'hod_approved':'Processing','approved':'Approved','rejected':'Rejected'
    };
    return map[(s||'').toLowerCase()] || s || 'Pending';
}

function currentAuthority(s) {
    var map = {
        'pending':        'Clerk / Admin Section',
        'clerk_approved': 'HOD Office',
        'hod_approved':   'Principal Office',
        'approved':       'Principal Office',
        'rejected':       'Admin Section',
    };
    return map[(s||'').toLowerCase()] || 'Admin Section';
}

/* ── FORMAT DATE ────────────────────────────────── */
function fmtDate(dt) {
    if (!dt) return '—';
    try {
        return new Date(dt).toLocaleDateString('en-IN', {
            day:'2-digit', month:'short', year:'numeric',
            hour:'2-digit', minute:'2-digit'
        });
    } catch(e) { return dt; }
}

/* ── RENDER USER INFO ───────────────────────────── */
function renderUser(u) {
    var name     = u.name || u.full_name || u.bt_id || u.btid || 'Student';
    var btid     = u.bt_id || u.btid || u.student_id || u.email || '--';
    var initials = name.split(' ').filter(Boolean).map(function(n){ return n[0]; }).join('').substring(0,2).toUpperCase();

    safeSet('userName',     name);
    safeSet('userId',       btid);
    safeSet('userInitials', initials);

    /* Also update any avatar elements */
    var avatars = document.querySelectorAll('.user-avatar, .stu-avatar');
    avatars.forEach(function(a) { a.textContent = initials; });
}

/* ── BUILD TIMELINE STEPS ───────────────────────── */
function buildSteps(app) {
    var status     = (app.status||'').toLowerCase();
    var isRejected = status === 'rejected';
    var clerkAt    = app.clerk_approved_at  ? fmtDate(app.clerk_approved_at)  : null;
    var hodAt      = app.hod_approved_at    ? fmtDate(app.hod_approved_at)    : null;
    var approvedAt = app.approved_at        ? fmtDate(app.approved_at)        : null;

    return [
        {
            label:'Applied', sub:'Submitted online',
            status:'done', date:fmtDate(app.created_at),
            remark:'Application received by the portal.'
        },
        {
            label:'Clerk Verification',
            sub: clerkAt ? 'Documents verified' : (isRejected && !clerkAt ? 'Rejected by Clerk' : 'Under review'),
            status: clerkAt ? 'done' : (isRejected && !clerkAt ? 'error' : 'active'),
            date:  clerkAt || (isRejected && !clerkAt ? fmtDate(app.updated_at) : 'In progress…'),
            remark: clerkAt
                ? (app.clerk_remarks || 'All documents verified. Forwarded for HOD approval.')
                : (isRejected && !clerkAt ? (app.rejection_reason||'Rejected by clerk.') : 'Clerk is reviewing your uploaded documents.')
        },
        {
            label:'HOD Approval',
            sub: hodAt ? 'Approved by HOD' : (isRejected && clerkAt && !hodAt ? 'Rejected by HOD' : 'Pending HOD'),
            status: hodAt ? 'done' : (isRejected && clerkAt && !hodAt ? 'error' : (clerkAt ? 'active' : 'todo')),
            date:  hodAt || (isRejected && clerkAt && !hodAt ? fmtDate(app.updated_at) : (clerkAt ? 'In progress…' : 'Estimated: 1–2 days')),
            remark: hodAt
                ? (app.hod_remarks || 'Approved by HOD. Forwarded to Principal.')
                : (isRejected && clerkAt && !hodAt ? (app.rejection_reason||'Rejected by HOD.') : '')
        },
        {
            label:'Office Processing',
            sub: approvedAt ? 'Certificate generated' : (hodAt && !isRejected ? 'Being prepared' : 'Pending'),
            status: approvedAt ? 'done' : (isRejected && hodAt ? 'error' : (hodAt ? 'active' : 'todo')),
            date:  approvedAt || (hodAt && !isRejected ? 'In progress…' : '—'),
            remark: approvedAt ? 'Certificate digitally signed and issued.' : (hodAt && !isRejected ? 'Document is being prepared.' : '')
        },
        {
            label:'Document Issued',
            sub: approvedAt ? 'Ready for download' : 'Pending',
            status: approvedAt ? 'done' : 'todo',
            date:  approvedAt || 'Pending',
            remark: approvedAt
                ? ('Certificate No: ' + (app.certificate_number||app.application_number||'N/A') + '. Ready to download.')
                : ''
        }
    ];
}

/* ── BUILD REMARKS ──────────────────────────────── */
function buildRemarks(app) {
    var status  = (app.status||'').toLowerCase();
    var remarks = [];

    if (status === 'approved') {
        remarks.push({
            type:'approve', title:'Document Approved & Issued',
            msg: 'Your ' + (app.certificate_type||'document') + ' has been approved and is ready to download. ' +
                 'Certificate No: ' + (app.certificate_number||app.application_number||'N/A') + '. Valid for 6 months from date of issue.',
            by: 'Principal Office', date: fmtDate(app.approved_at)
        });
    } else if (status === 'rejected') {
        remarks.push({
            type:'reject', title:'Application Rejected – Correction Required',
            msg: app.rejection_reason || app.clerk_remarks || app.hod_remarks || 'Your application was rejected. Please check and re-apply.',
            by: currentAuthority(status), date: fmtDate(app.updated_at)
        });
        remarks.push({
            type:'warn', title:'How to Re-Apply',
            msg: 'Click "Re-upload Documents" below to resubmit your application with corrected documents.',
            by:'Portal', date:''
        });
    } else if (status === 'hod_approved') {
        remarks.push({
            type:'info', title:'Approved by HOD – Document Being Prepared',
            msg: (app.hod_remarks ? 'HOD Remarks: ' + app.hod_remarks + '. ' : '') +
                 'Your application is being processed by the Principal\'s office.',
            by:'HOD Office', date: fmtDate(app.hod_approved_at)
        });
    } else if (status === 'clerk_approved') {
        remarks.push({
            type:'info', title:'Verified by Clerk – Pending HOD Approval',
            msg: (app.clerk_remarks ? 'Clerk Remarks: ' + app.clerk_remarks + '. ' : '') +
                 'Your documents have been verified and forwarded to the HOD.',
            by:'Admin Section', date: fmtDate(app.clerk_approved_at)
        });
    } else {
        remarks.push({
            type:'info', title:'Application Received – Under Verification',
            msg: 'Your application is in the queue for review by the admin clerk. Estimated review time: 1–2 working days.',
            by:'Portal', date: fmtDate(app.created_at)
        });
    }
    return remarks;
}

/* ── NOTIFICATIONS ── */
function loadNotifications() {
    fetch(API_BASE + '/notifications/unread-count', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        if (!res.success) return;
        const count = (res.data && res.data.unread_count) || res.count || 0;
        
        // Update Bell Badge
        const bellBadge = document.querySelector('.notif-badge');
        if (bellBadge) {
            bellBadge.textContent = count > 0 ? count : '';
            bellBadge.style.display = count > 0 ? 'block' : 'none';
        }
        
        // Update Sidebar Badge
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
            const icon = n.type === 'status' ? '🔔' : '📅';
            html += `
            <div class="nd-item" onclick="markRead(${n.id})">
                <div class="nd-icon">${icon}</div>
                <div class="nd-text">
                    <div class="nd-title">${esc(n.title || n.message)}</div>
                    <div class="nd-desc">${esc(n.description || n.body || '')}</div>
                    <div class="nd-time">${fmtDate(n.created_at)}</div>
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
    }).then(() => loadNotifications());
}

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
    fetch(API_BASE + '/notifications/unread-count', { credentials: 'include' })
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
    fetch(API_BASE + '/notifications/my', { credentials: 'include' })
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
                    <div class="nd-time">${fmtDate(n.created_at)}</div>
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

function safeSet(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}


function clearNotifs() {
    fetch(API_BASE + '/notifications/mark-all-read', { 
        method: 'POST', 
        credentials: 'include' 
    })
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


    /* Load my applications for quick-pick chips */
    fetch(API_BASE + '/application/my', { credentials: 'include' })
        .then(function(r){ return r.json(); })
        .then(function(res){
            var apps = [];
            if (res.success && Array.isArray(res.data)) apps = res.data;
            else if (Array.isArray(res)) apps = res;

            allMyApps = apps;
            buildQuickPicks(apps);

            var badge = document.getElementById('sideAppBadge');
            if (badge) {
                badge.textContent = apps.length;
                badge.style.display = apps.length > 0 ? 'block' : 'none';
            }

            /* Auto-load from URL param */
            autoLoad();
        })
        .catch(function(){ autoLoad(); });
});

function autoLoad() {
    var params = new URLSearchParams(window.location.search);
    var preId  = params.get('id') || params.get('application_id') || params.get('application_number') || localStorage.getItem('trackAppId');
    if (preId) {
        var inp = document.getElementById('lookupInput');
        if (inp) inp.value = preId;
        fetchFreshAndLoad(preId);
    }
}

/* ── BUILD QUICK-PICK CHIPS ─────────────────────── */
function buildQuickPicks(apps) {
    var qp = document.getElementById('quickPicks');
    if (!qp) return;
    qp.innerHTML = '';
    apps.slice(0,8).forEach(function(app) {
        var icon  = getDocIcon(app.certificate_type);
        var appNo = app.application_number || ('APP-' + app.id);
        var chip  = document.createElement('button');
        chip.style.cssText = 'background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;color:rgba(255,255,255,.8);cursor:pointer;font-family:DM Sans,sans-serif;transition:all .2s;white-space:nowrap;';
        chip.textContent    = icon + ' ' + appNo;
        chip.onmouseover    = function(){ this.style.background='rgba(255,255,255,.25)'; this.style.color='#fff'; };
        chip.onmouseout     = function(){ this.style.background='rgba(255,255,255,.12)'; this.style.color='rgba(255,255,255,.8)'; };
        chip.onclick = function() {
            var inp = document.getElementById('lookupInput');
            if (inp) inp.value = appNo;
            fetchFreshAndLoad(appNo);
        };
        qp.appendChild(chip);
    });
}

/* ── LOOKUP INPUT ───────────────────────────────── */
function onLookupInput() {
    var v = document.getElementById('lookupInput').value.trim();
    if (!v) hideAll();
}

function handleLookup() {
    var v = document.getElementById('lookupInput').value.trim();
    if (!v) { showToast('⚠️ Please enter an Application ID'); return; }
    fetchFreshAndLoad(v);
}

/* ════════════════════════════════════════════════
   FETCH FRESH FROM BACKEND — 3 fallback strategies
════════════════════════════════════════════════ */
function fetchFreshAndLoad(appId) {
    showToast('🔍 Loading latest status…');
    var appIdClean = (appId || '').trim();

    /* Strategy 1: /api/application/status?application_number=APP-XXX */
    fetch(API_BASE + '/application/status?application_number=' + encodeURIComponent(appIdClean), {
        credentials: 'include'
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
        if (res.success && res.data) {
            loadAppData(res.data);
            return;
        }
        /* Strategy 2: search in allMyApps cached list */
        tryFromCache(appIdClean);
    })
    .catch(function() {
        /* Strategy 2 fallback */
        tryFromCache(appIdClean);
    });
}

function tryFromCache(appIdClean) {
    /* Search in already-loaded allMyApps */
    var found = allMyApps.find(function(a) {
        return (a.application_number || '').toLowerCase() === appIdClean.toLowerCase()
            || String(a.id) === appIdClean;
    });

    if (found) {
        /* Re-fetch this specific app fresh via /application/my and filter */
        fetch(API_BASE + '/application/my', { credentials: 'include' })
            .then(function(r) { return r.json(); })
            .then(function(res) {
                var apps = [];
                if (res.success && Array.isArray(res.data)) apps = res.data;
                else if (Array.isArray(res)) apps = res;

                var fresh = apps.find(function(a) {
                    return (a.application_number || '').toLowerCase() === appIdClean.toLowerCase()
                        || String(a.id) === appIdClean;
                });

                if (fresh) {
                    loadAppData(fresh);
                } else {
                    loadAppData(found); /* use cached version */
                }
            })
            .catch(function() {
                loadAppData(found);
            });
        return;
    }

    /* Strategy 3: try /application/view?application_id=numeric */
    var numId = appIdClean.replace(/\D/g, '');
    if (numId) {
        fetch(API_BASE + '/application/view?application_id=' + numId, { credentials: 'include' })
            .then(function(r) { return r.json(); })
            .then(function(res) {
                if (res.success && res.data) {
                    loadAppData(res.data);
                } else {
                    showToast('⚠️ Application not found. Please check the ID.');
                    hideAll();
                }
            })
            .catch(function() {
                showToast('⚠️ Could not reach server. Please check your connection.');
                hideAll();
            });
    } else {
        showToast('⚠️ Application not found. Please check the ID.');
        hideAll();
    }
}

/* ── LOAD & RENDER APP DATA ─────────────────────── */
function loadAppData(app) {
    activeApp = app;

    var appNo    = app.application_number || ('APP-' + app.id);
    var certType = app.certificate_type || app.doc_type || 'document';
    var typeName = certType.charAt(0).toUpperCase() + certType.slice(1) + ' Certificate';
    var icon     = getDocIcon(certType);
    var status   = (app.status || 'pending').toLowerCase();
    var friendly = friendlyStatus(status);
    var updatedAt= fmtDate(app.updated_at || app.clerk_approved_at || app.created_at);

    localStorage.setItem('trackAppId', appNo);
    showAll();

    var els = {
        idDocIcon: icon,
        idDocName: typeName,
        idAppCode: appNo,
        idDate:    fmtDate(app.created_at),
        idProc:    app.processing_time || '3–5 Working Days',
        idUpdated: updatedAt,
        ssUpdated:    updatedAt,
        ssAuthority:  currentAuthority(status)
    };

    Object.keys(els).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.textContent = els[id];
    });

    var idStatus = document.getElementById('idStatus');
    if (idStatus) idStatus.innerHTML = statusPill(status);

    var ssCur = document.getElementById('ssCurStatus');
    if (ssCur) ssCur.innerHTML = statusPill(status);

    var steps = buildSteps(app);
    renderProgressSteps(steps);
    renderRemarks(buildRemarks(app));
    renderFiles(buildFiles(app));
    renderActions(friendly, app);
    renderAlert(status);

    setTimeout(function(){
        var el = document.getElementById('identityCard');
        if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 100);
}

/* ── RENDER PROGRESS STEPS ──────────────────────── */
function renderProgressSteps(steps) {
    var ICONS     = ['📝','🧾','👨‍🏫','🏢','📄'];
    var doneCount = steps.filter(function(s){ return s.status==='done'; }).length;
    var fillPct   = steps.length > 1 ? Math.min(100, (doneCount / (steps.length-1)) * 100) : 0;

    var progEl = document.getElementById('progSteps');
    if (!progEl) return;
    progEl.innerHTML = '<div class="prog-fill" id="progFill" style="width:0%;transition:width 1s ease;"></div>';

    steps.forEach(function(step, i) {
        var sc  = step.status === 'done' ? 'done' : step.status === 'active' ? 'active' : step.status === 'error' ? 'error' : 'todo';
        var div = document.createElement('div');
        div.className = 'prog-step';
        div.innerHTML =
            '<div class="ps-dot '+sc+'"><span class="ps-icon">'+ICONS[i]+'</span></div>'+
            '<div class="ps-label">'+
                '<div class="ps-name '+sc+'">'+step.label+'</div>'+
                '<div class="ps-sub '+sc+'">'+step.sub+'</div>'+
            '</div>';
        progEl.appendChild(div);
    });

    setTimeout(function(){
        var fill = document.getElementById('progFill');
        if (fill) fill.style.width = fillPct + '%';
    }, 150);

    /* Vertical mobile timeline */
    var vertEl = document.getElementById('timelineVert');
    if (!vertEl) return;
    vertEl.innerHTML = steps.map(function(step, i){
        var dc  = step.status==='done'?'done':step.status==='active'?'active':step.status==='error'?'error':'';
        var sym = step.status==='done'?'✓':step.status==='error'?'✕':step.status==='active'?'●':String(i+1);
        var cls = step.status==='done'?'done':step.status==='active'?'active':step.status==='error'?'error':'todo';
        return '<div class="tv-row '+(step.status==='done'?'done':'')+'">'+
            '<div class="tv-dot '+dc+'">'+sym+'</div>'+
            '<div class="tv-cnt">'+
                '<div class="tv-name '+cls+'">'+ICONS[i]+' '+step.label+'</div>'+
                '<div class="tv-sub '+(step.status==='active'?'active':'')+'">'+step.date+'</div>'+
                (step.remark?'<div class="tv-remark">'+step.remark+'</div>':'')+
            '</div>'+
        '</div>';
    }).join('');
}

/* ── RENDER REMARKS ─────────────────────────────── */
function renderRemarks(remarks) {
    var cls   = { reject:'rk-reject', approve:'rk-approve', info:'rk-info', warn:'rk-warn' };
    var icons = { reject:'❌', approve:'✅', info:'ℹ️', warn:'⚠️' };
    var rb = document.getElementById('remarksBody');
    if (!rb) return;
    rb.innerHTML = (remarks||[]).map(function(r){
        return '<div class="rk-item '+(cls[r.type]||'rk-info')+'">'+
            '<div class="rk-ico">'+(icons[r.type]||'ℹ️')+'</div>'+
            '<div class="rk-content">'+
                '<strong>'+r.title+'</strong>'+
                '<p>'+r.msg+'</p>'+
                (r.by||r.date?'<div class="rk-meta">— '+(r.by||'')+(r.date&&r.by?' · ':'')+r.date+'</div>':'')+
            '</div>'+
        '</div>';
    }).join('');
}

/* ── BUILD FILES ────────────────────────────────── */
function buildFiles(app) {
    if (!app || !Array.isArray(app.documents)) return [];
    return app.documents.map(function(d) {
        var fname = d.file_name || d.filename || d.file_path || 'Document';
        var ext = fname.split('.').pop().toUpperCase();
        var type = ext === 'PDF' ? 'PDF' : 'IMG';
        var s = (app.status || '').toLowerCase();
        
        var fStat = 'pend';
        if (s === 'rejected') fStat = 'rej';
        else if (s === 'approved' || s === 'hod_approved' || s === 'clerk_approved' || app.clerk_approved_at) fStat = 'ok';

        return {
            name: fname.split('/').pop(),
            type: type,
            size: 'N/A',
            status: fStat
        };
    });
}

/* ── RENDER FILES ───────────────────────────────── */
function renderFiles(files) {
    var ext2ico  = { PDF:'📕', IMG:'🖼️' };
    var badgeCls = { ok:'fb-ok', pend:'fb-pend', rej:'fb-rej' };
    var badgeTxt = { ok:'✓ Verified', pend:'⏳ Pending', rej:'✕ Rejected' };
    var fb = document.getElementById('filesBody');
    if (!fb) return;
    fb.innerHTML = (files||[]).map(function(f){
        return '<div class="file-row">'+
            '<div class="file-ico">'+(ext2ico[f.type]||'📄')+'</div>'+
            '<div class="file-info">'+
                '<div class="file-name">'+f.name+'</div>'+
                '<div class="file-meta">'+f.type+' &nbsp;·&nbsp; '+f.size+'</div>'+
            '</div>'+
            '<span class="file-badge '+(badgeCls[f.status]||'fb-pend')+'">'+(badgeTxt[f.status]||'⏳ Pending')+'</span>'+
        '</div>';
    }).join('') || '<div style="color:#9ca3af;font-size:13px;">No documents attached</div>';
}

/* ── RENDER ACTIONS ─────────────────────────────── */
function renderActions(friendly, app) {
    var row = document.getElementById('actionsRow');
    if (!row) return;
    var btns = '';
    if (friendly === 'Approved') {
        btns += '<button class="btn-success" onclick="downloadDoc()">⬇️ Download Certificate</button>';
    }
    if (friendly === 'Rejected') {
        btns += '<button class="btn-warn" onclick="window.location.href=\'documents.html\'">🔄 Re-upload Documents</button>';
    }
    btns += '<button class="btn-outline" onclick="window.location.href=\'dashboard.html\'">📂 My Applications</button>';
    btns += '<button class="btn-outline" onclick="showToast(\'📞 Call office: 9011010038\')">📞 Contact Office</button>';
    row.innerHTML = btns;
}

/* ── DOWNLOAD DOCUMENT ──────────────────────────── */
function downloadDoc() {
    if (!activeApp) return;
    var appNo = activeApp.application_number || ('APP-' + activeApp.id);

    /* Direct file URL if certificate_file exists in DB */
    if (activeApp.certificate_file) {
        var fname = activeApp.certificate_file;
        if (!fname.toLowerCase().endsWith('.pdf')) fname += '.pdf';
        const BASE_URL = window.location.origin + window.location.pathname.split('/public/')[0];
        var url = BASE_URL + '/storage/certificates/' + fname;
        var a   = document.createElement('a');
        a.href  = url;
        a.target = '_blank';
        a.download = appNo + '_certificate.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('✅ Download started!');
        return;
    }

    /* API fallback */
    showToast('⬇️ Preparing download…');
    fetch(API_BASE + '/documents/download?application_number=' + encodeURIComponent(appNo), {
        credentials: 'include'
    })
    .then(function(r){
        if (!r.ok) throw new Error('Not available');
        return r.blob();
    })
    .then(function(blob){
        var url = URL.createObjectURL(blob);
        var a   = document.createElement('a');
        a.href  = url;
        a.download = appNo + '_certificate.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('✅ Download started!');
    })
    .catch(function(){
        showToast('⚠️ Certificate not ready yet. Please try again later.');
    });
}

/* ── ALERT BANNER ───────────────────────────────── */
function renderAlert(status) {
    var banner = document.getElementById('alertBanner');
    if (!banner) return;
    var map = {
        'pending':        { cls:'ab-pending',  ico:'⏳', title:'Application Under Verification',         msg:'Your application is in the queue. The admin clerk will review it within 1–2 working days.' },
        'clerk_approved': { cls:'ab-info',     ico:'🔵', title:'Verified – Pending HOD Approval',         msg:'Your documents have been verified by the clerk and forwarded to the HOD for approval.' },
        'hod_approved':   { cls:'ab-info',     ico:'🟣', title:'Document is Being Prepared',              msg:'Your application has been approved by HOD and is being processed by the Principal\'s office.' },
        'approved':       { cls:'ab-approved', ico:'✅', title:'Document Approved & Ready to Download!',  msg:'Congratulations! Your document has been issued. Click "Download Certificate" to get your document.' },
        'rejected':       { cls:'ab-rejected', ico:'❌', title:'Application Rejected – Action Needed',    msg:'Your application was rejected. Please read the remarks below, correct the issue, and re-apply.' },
    };
    var cfg = map[status] || map['pending'];
    banner.className = 'alert-banner ' + cfg.cls + ' fu';
    var abIcon  = document.getElementById('abIcon');
    var abTitle = document.getElementById('abTitle');
    var abMsg   = document.getElementById('abMsg');
    if (abIcon)  abIcon.textContent  = cfg.ico;
    if (abTitle) abTitle.textContent = cfg.title;
    if (abMsg)   abMsg.textContent   = cfg.msg;
    banner.style.display = 'flex';
}

/* ── SHOW / HIDE ────────────────────────────────── */
function showAll() {
    ['alertBanner','identityCard','trackerCard','statusSummaryCard','remarksCard','filesCard','actionsCard'].forEach(function(id){
        var el = document.getElementById(id);
        if (el) el.style.display = id==='alertBanner' ? 'flex' : 'block';
    });
}
function hideAll() {
    ['identityCard','trackerCard','statusSummaryCard','remarksCard','filesCard','actionsCard'].forEach(function(id){
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    var ab = document.getElementById('alertBanner');
    if (ab) ab.style.display = 'none';
}

/* ── TOAST ──────────────────────────────────────── */
function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(function(){ t.classList.remove('show'); }, 3200);
}

/* ── LOGOUT ─────────────────────────────────────── */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch(API_BASE + '/auth/logout', { method:'POST', credentials:'include' })
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