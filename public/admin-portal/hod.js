/* ============================================================
   hod.js — HOD Dashboard
   public/admin-portal/hod.js
   ============================================================ */

window.BASE_URL = window.BASE_URL || window.location.origin + window.location.pathname.split('/public/')[0];
var API          = window.BASE_URL + '/public/index.php/api';
var session      = null;
var currentAppId = null;
var hodRemarks   = '';
var ALL_APPS     = [];

/* ── INFER DEPARTMENT FROM EMAIL ──────────────────────────── */
function getAdminDept(email) {
  if (!email) return null;
  var prefix = email.split('@')[0].toLowerCase();
  var allowed = ['it', 'cs', 'me', 'ce', 'ee', 'etc', 'civil', 'bca', 'mca'];
  for (var i = 0; i < allowed.length; i++) {
    if (prefix.indexOf(allowed[i]) === 0) {
      var dept = allowed[i];
      var rest = prefix.substring(dept.length);
      if (rest === 'clerk' || rest === 'hod') {
        return dept.toUpperCase();
      }
    }
  }
  return null;
}

var EMAIL_ROLE_MAP = {
  'saar@jdcoem.ac.in':  'clerk',
  'skhod@jdcoem.ac.in': 'hod',
  'sagar@jdcoem.ac.in': 'principal'
};

function correctRoleForEmail(email) {
  return EMAIL_ROLE_MAP[(email || '').toLowerCase().trim()] || null;
}

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', function () {

  /* FIX 1: read from role-specific key admin_user_hod */
  var raw = localStorage.getItem('admin_user_hod');
  if (!raw) { window.location.replace('index.html'); return; }
  try { session = JSON.parse(raw); } catch(e) { window.location.replace('index.html'); return; }
  if (!session || !session.email) { window.location.replace('index.html'); return; }

  /* FIX 2: ALWAYS correct the role from EMAIL_ROLE_MAP BEFORE any redirect check */
  var correctRole = correctRoleForEmail(session.email);
  if (correctRole) session.role = correctRole;
  /* FIX 3: save back to role-specific key */
  localStorage.setItem('admin_user_hod', JSON.stringify(session));

  var role = (session.role || '').toLowerCase().trim();

  if (role === 'clerk')                   { window.location.replace('clerk.html');     return; }
  if (role === 'principal')               { window.location.replace('principal.html'); return; }
  if (role !== 'hod' && role !== 'admin') { window.location.replace('index.html');     return; }

  var name = session.name || session.email.split('@')[0];
  var ini  = name.split(' ').filter(Boolean).map(function(n){ return n[0]; }).join('').substring(0,2).toUpperCase();
  set('hdr-av',        ini);
  set('hdr-nm',        name);
  set('hdr-sub',       session.email);
  set('sb-role-name',  name);
  set('sb-role-email', session.email);
  set('sig-display',   ini);
  set('sig-name-disp', name);
  set('sig-date-disp', new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}));

  ['modalDetail','modalSign','modalRejectConfirm'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function(e){ if(e.target===el) closeModal(id); });
  });

  ensureSession(function(ok) {
    if (!ok) {
      toast('❌ Session error. Please login again.', 'err');
      setTimeout(function(){ logout(); }, 2000);
      return;
    }
    startKeepAlive();
    loadAll();
  });

  showSection('pending');
});

/* ══════════════════════════════════════════════════════════
   SESSION
══════════════════════════════════════════════════════════ */
function ensureSession(done) {
  secureFetch(API + '/debug/session', { credentials: 'include' })
  .then(function(r){ return r.json(); })
  .then(function(d){
    if (d.user_id) { done(true); }
    else { silentReLogin(done); }
  })
  .catch(function(){ silentReLogin(done); });
}

function startKeepAlive() {
  setInterval(function() {
    secureFetch(API + '/debug/session', { credentials: 'include' })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if (!d.user_id) {
        silentReLogin(function(ok){
          if (!ok) { toast('⚠️ Session expired. Please login again.', 'warn'); }
        });
      }
    })
    .catch(function(){});
  }, 4 * 60 * 1000);
}

function silentReLogin(done) {
  /* FIX 4: read from role-specific key admin_creds_hod */
  var raw = localStorage.getItem('admin_creds_hod');
  if (!raw) { done(false); return; }
  var creds;
  try { creds = JSON.parse(raw); } catch(e) { done(false); return; }
  if (!creds || !creds.email || !creds.password) { done(false); return; }

  secureFetch(API + '/auth/login', {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify({ email: creds.email, password: creds.password })
  })
  .then(function(r){ return r.json(); })
  .then(function(res){
    if (res.status === 'success') {
      if (res.user) {
        var savedEmail = (session && session.email) ? session.email : '';
        session = Object.assign(session || {}, res.user);
        if (savedEmail) session.email = savedEmail;
        var correctRole = correctRoleForEmail(savedEmail.toLowerCase().trim());
        if (correctRole) session.role = correctRole;
        /* FIX 5: save back to role-specific key */
        localStorage.setItem('admin_user_hod', JSON.stringify(session));
      }
      done(true);
    } else {
      console.error('Silent re-login failed:', res.message);
      done(false);
    }
  })
  .catch(function(err){
    console.error('Silent re-login error:', err);
    done(false);
  });
}

/* ══════════════════════════════════════════════════════════
   LOAD
══════════════════════════════════════════════════════════ */
function loadAll() {
  loading('table-pending');

  secureFetch(API + '/application/all', { credentials: 'include' })
  .then(function(r){ return r.json(); })
  .then(function(res){
    if (res.success && Array.isArray(res.data)) {
      ALL_APPS = res.data.map(norm);
    } else if (res.message === 'Not logged in') {
      silentReLogin(function(ok){
        if (ok) loadAll();
        else toast('❌ Session expired. Please login again.', 'err');
      });
      return;
    } else {
      ALL_APPS = [];
    }
  })
  .catch(function(err){
    console.error('[hod.js] load error:', err);
    toast('❌ Could not connect to server.', 'err');
    ALL_APPS = [];
  })
  /* FIX 6: use .finally() like clerk.js so stats+render always run
     even when fetch or JSON parse throws */
  .finally(function(){
    stats();
    renderTable('pending');
  });
}

/* ══════════════════════════════════════════════════════════
   NORMALIZE
══════════════════════════════════════════════════════════ */
function norm(a) {
  var s = (a.status || 'pending').toLowerCase().trim();
  var map = {
    'pending':            'pending_clerk',
    'pending_clerk':      'pending_clerk',
    'clerk_approved':     'pending_hod',
    'pending_hod':        'pending_hod',
    'hod_approved':       'approved_hod',
    'pending_principal':  'approved_hod',
    'approved':           'approved_final',
    'principal_approved': 'approved_final',
    /* FIX 7: rejected variants were wrongly mapped to 'approved_final' */
    'rejected':           'rejected',
    'clerk_rejected':     'rejected',
    'hod_rejected':       'rejected',
    'principal_rejected': 'rejected'
  };
  var lbl = {
    'pending_clerk':  'Pending at Clerk',
    'pending_hod':    'Awaiting HOD Review',
    'approved_hod':   'Forwarded to Principal',
    'approved_final': 'Fully Approved',
    'rejected':       'Rejected'
  };
  var st = map[s] || 'pending_clerk';
  return {
    id:       a.id,
    appNo:    a.application_number || ('APP-' + String(a.id).padStart(6,'0')),
    name:     a.student_name  || a.full_name || a.name || 'Unknown Student',
    email:    a.student_email || a.email || '—',
    btid:     a.bt_id  || '',
    dept:     a.department || a.branch || 'N/A',
    year:     a.year   || '',
    dtype:    (a.certificate_type || a.document_type || a.adm_type || '').toLowerCase(),
    dtitle:   docTitle(a.certificate_type || a.document_type || a.adm_type || ''),
    purpose:  a.purpose || '',
    status:   st,
    label:    lbl[st] || st,
    date:     a.created_at || '',
    cremarks: a.clerk_remarks || '',
    hremarks: a.hod_remarks  || '',
    files:    a.documents || []
  };
}

/* ══════════════════════════════════════════════════════════
   STATS
══════════════════════════════════════════════════════════ */
function stats() {
  var apps = ALL_APPS.slice();
  var adminDept = getAdminDept(session ? session.email : '');
  if (adminDept) {
    apps = apps.filter(function(a) { 
      var aDept = (a.dept || '').toUpperCase();
      return aDept === adminDept || aDept === 'ALL'; 
    });
  }

  var scope    = apps.filter(function(a){ return a.status !== 'pending_clerk'; });
  var pending  = scope.filter(function(a){ return a.status === 'pending_hod'; }).length;
  var approved = scope.filter(function(a){ return a.status === 'approved_hod' || a.status === 'approved_final'; }).length;
  var rejected = scope.filter(function(a){ return a.status === 'rejected'; }).length;
  var total    = scope.length;
  set('stat-total',    total);    set('sc-total',    total);
  set('stat-pending',  pending);  set('sc-pending',  pending);
  set('stat-approved', approved); set('sc-approved', approved);
  set('stat-rejected', rejected); set('sc-rejected', rejected);
  set('sb-pending-count', pending > 0 ? String(pending) : '');
}

/* ══════════════════════════════════════════════════════════
   SECTION SWITCHER
══════════════════════════════════════════════════════════ */
function showSection(name, btn) {
  ['pending','all','approved','rejected','stats'].forEach(function(s){
    var el = document.getElementById('section-' + s);
    if (el) el.style.display = s === name ? '' : 'none';
  });
  document.querySelectorAll('.nav-link').forEach(function(l){ l.classList.remove('active'); });
  if (btn) { btn.classList.add('active'); }
  else {
    document.querySelectorAll('.nav-link').forEach(function(l){
      if ((l.getAttribute('onclick')||'').indexOf("'"+name+"'") > -1) l.classList.add('active');
    });
  }
  renderTable(name);
}

/* ══════════════════════════════════════════════════════════
   TABLE RENDERER
══════════════════════════════════════════════════════════ */
function renderTable(type) {
  var el = document.getElementById('table-' + type);
  if (!el) return;

  var apps = ALL_APPS.slice();
  
  var adminDept = getAdminDept(session ? session.email : '');
  if (adminDept) {
    apps = apps.filter(function(a) { 
      var aDept = (a.dept || '').toUpperCase();
      return aDept === adminDept || aDept === 'ALL'; 
    });
  }

  if (type === 'pending')  apps = apps.filter(function(a){ return a.status === 'pending_hod'; });
  if (type === 'approved') apps = apps.filter(function(a){ return a.status === 'approved_hod' || a.status === 'approved_final'; });
  if (type === 'rejected') apps = apps.filter(function(a){ return a.status === 'rejected'; });
  if (type === 'all')      apps = apps.filter(function(a){ return a.status !== 'pending_clerk'; });

  var q = (val('search-' + type) || '').toLowerCase();
  if (q) apps = apps.filter(function(a){
    return (a.name + a.appNo + a.dtitle + a.email + a.btid).toLowerCase().indexOf(q) > -1;
  });

  if (!apps.length) {
    var msgs = { pending:'No applications awaiting HOD review. All caught up! 🎉', approved:'No approved applications yet.', rejected:'No rejected applications.', all:'No applications found.', stats:'' };
    el.innerHTML = '<div class="empty-state"><div class="empty-ico">📭</div><h3>Nothing Here</h3><p>' + (msgs[type] || 'No results.') + '</p></div>';
    return;
  }

  el.innerHTML =
    '<table class="app-table"><thead><tr>' +
    '<th>App ID</th><th>Student</th><th>Department</th>' +
    '<th>Document</th><th>Submitted</th><th>Status</th><th>Action</th>' +
    '</tr></thead><tbody>' +
    apps.map(function(a){
      return '<tr>' +
        '<td><strong style="font-family:monospace;font-size:12px;">' + esc(a.appNo) + '</strong></td>' +
        '<td>' +
          '<div style="font-weight:600;">' + esc(a.name) + '</div>' +
          '<div style="font-size:11px;color:var(--text-3);">' + esc(a.email) + '</div>' +
          (a.btid ? '<div style="font-size:11px;color:var(--text-3);">' + esc(a.btid) + '</div>' : '') +
        '</td>' +
        '<td style="font-size:12.5px;">' + esc(a.dept) + (a.year ? ' · Yr ' + esc(a.year) : '') + '</td>' +
        '<td>' +
          '<div style="font-weight:600;">' + dIcon(a.dtype) + ' ' + esc(a.dtitle) + '</div>' +
          (a.purpose ? '<div style="font-size:11px;color:var(--text-3);">' + esc(a.purpose.substring(0,50)) + '</div>' : '') +
        '</td>' +
        '<td style="font-size:12px;">' + fmtDate(a.date) + '</td>' +
        '<td><span class="badge ' + badge(a.status) + '">' + esc(a.label) + '</span></td>' +
        '<td><button class="btn btn-primary btn-sm" onclick="openDetail(' + a.id + ')">' +
          (a.status === 'pending_hod' ? '📂 Review' : '👁 View') +
        '</button></td>' +
      '</tr>';
    }).join('') +
    '</tbody></table>';
}

/* ══════════════════════════════════════════════════════════
   DETAIL MODAL
══════════════════════════════════════════════════════════ */
function openDetail(appId) {
  var app = ALL_APPS.find(function(a){ return a.id === appId; });
  if (!app) return;
  currentAppId = appId;

  set('modal-app-id', app.appNo);
  var sb = document.getElementById('modal-app-status');
  if (sb) sb.innerHTML = '<span class="badge ' + badge(app.status) + '">' + esc(app.label) + '</span>';

  var aa = document.getElementById('hod-action-area');
  if (aa) aa.style.display = (app.status === 'pending_hod') ? '' : 'none';

  var re = document.getElementById('hod-remarks');
  if (re) { re.value = ''; re.style.borderColor = ''; }

  var det = document.getElementById('modal-app-detail');
  if (det) det.innerHTML =
    '<div style="text-align:center;padding:40px;">' +
    '<div style="font-size:32px;">⏳</div>' +
    '<div style="color:#6b7280;margin-top:10px;">Loading details…</div>' +
    '</div>';

  openModal('modalDetail');

  fetch(API + '/application/view?application_id=' + appId, { credentials: 'include' })
  .then(function(r){
    if (!r.ok) { throw new Error('HTTP ' + r.status); }
    return r.json();
  })
  .then(function(res){
    if (res.success && res.data) {
      var d = res.data;
      app.name     = d.student_name  || d.name  || app.name;
      app.email    = d.student_email || d.email  || app.email;
      app.btid     = d.bt_id                     || app.btid;
      app.dept     = d.department || d.branch    || app.dept;
      app.year     = d.year                      || app.year;
      app.purpose  = d.purpose                   || app.purpose;
      app.cremarks = d.clerk_remarks             || app.cremarks;
      app.hremarks = d.hod_remarks               || app.hremarks;
      if (d.certificate_type || d.document_type || d.adm_type) {
        app.dtype  = (d.certificate_type || d.document_type || d.adm_type || app.dtype).toLowerCase();
        app.dtitle = docTitle(app.dtype);
      }
      if (Array.isArray(d.documents) && d.documents.length > 0) {
        app.files = d.documents;
      }
    } else if (res.message === 'Not logged in') {
      silentReLogin(function(ok){
        if (ok) openDetail(appId);
        else toast('❌ Session expired. Please login again.', 'err');
      });
      return;
    }
    if (det) det.innerHTML = buildDetail(app);
  })
  .catch(function(err){
    console.error('[hod.js] openDetail fetch error:', err);
    if (det) det.innerHTML = buildDetail(app);
  });
}

/* ══════════════════════════════════════════════════════════
   BUILD DETAIL
══════════════════════════════════════════════════════════ */
function buildDetail(app) {
  var html =
    '<div class="detail-grid">' +
      field('Student Name',  app.name) +
      field('Student Email', app.email  || '—') +
      field('Student ID',    app.btid   || '—') +
      field('Department',    app.dept) +
      field('Year',          app.year   || '—') +
      field('Document',      dIcon(app.dtype) + ' ' + app.dtitle) +
      field('App Number',    app.appNo) +
      field('Purpose',       app.purpose || '—') +
      field('Submitted',     fmtDate(app.date)) +
    '</div>';

  if (app.cremarks) {
    html +=
      '<div class="section-divider" style="margin-top:16px;">Clerk Remarks</div>' +
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:13px;">' +
      esc(app.cremarks) + '</div>';
  }

  if (app.hremarks && app.status !== 'pending_hod') {
    html +=
      '<div class="section-divider" style="margin-top:16px;">HOD Remarks</div>' +
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:13px;">' +
      esc(app.hremarks) + '</div>';
  }

  html += '<div class="section-divider" style="margin-top:16px;">📎 Student Uploaded Documents</div>';

  if (!app.files || app.files.length === 0) {
    html +=
      '<div style="padding:24px;text-align:center;background:var(--surface);' +
      'border:1px dashed var(--border);border-radius:8px;color:var(--text-3);">' +
      '📂 No documents uploaded with this application.</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:10px;">';

    app.files.forEach(function(f, i) {
      var fname = '';
      var furl  = '';

      if (typeof f === 'string') {
        fname = f.split('/').pop();
        furl  = '../storage_proxy.php?file=' + encodeURIComponent(f);
      } else {
        var filePath = f.file_name || f.filename || '';
        fname = filePath.split('/').pop() || f.original_name || f.name || ('Document ' + (i+1));

        if (filePath && filePath.indexOf('/') > -1) {
          furl = '../storage_proxy.php?file=' + encodeURIComponent(filePath);
        } else if (filePath) {
          var folder = app.dtype || 'bonafide';
          furl = '../storage_proxy.php?file=' + encodeURIComponent(folder + '/' + filePath);
        } else {
          var folder2 = app.dtype || 'bonafide';
          furl = '../storage_proxy.php?file=' + encodeURIComponent(folder2 + '/' + fname);
        }
      }

      var ext   = (fname.split('.').pop() || '').toLowerCase();
      var icons = { pdf:'📄', jpg:'🖼️', jpeg:'🖼️', png:'🖼️', gif:'🖼️' };
      var ico   = icons[ext] || '📎';
      var isImg = ['jpg','jpeg','png','gif','webp'].indexOf(ext) > -1;
      var isPdf = ext === 'pdf';

      html +=
        '<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--surface);">' +
            '<span style="font-size:13px;font-weight:600;">' + ico + ' ' + esc(fname) + '</span>' +
            '<div style="display:flex;gap:8px;">' +
              '<a href="' + esc(furl) + '" target="_blank" style="font-size:12px;padding:5px 14px;background:var(--info-bg);color:var(--info);border:1px solid var(--info);border-radius:6px;text-decoration:none;font-weight:600;">' +
              (isImg ? '🖼️ View' : '👁 Open') + '</a>' +
              '<a href="' + esc(furl) + '" download="' + esc(fname) + '" style="font-size:12px;padding:5px 14px;background:var(--ok-bg);color:var(--ok);border:1px solid var(--ok);border-radius:6px;text-decoration:none;font-weight:600;">⬇ Download</a>' +
            '</div>' +
          '</div>';

      if (isImg) {
        html +=
          '<div style="padding:10px;background:#fff;text-align:center;">' +
          '<img src="' + esc(furl) + '" style="max-width:100%;max-height:350px;border-radius:6px;" ' +
          'onerror="this.parentElement.innerHTML=\'<div style=padding:16px;color:#888>⚠️ Image could not load</div>\'">' +
          '</div>';
      }

      if (isPdf) {
        html +=
          '<div style="padding:10px;background:#fff;">' +
          '<iframe src="' + esc(furl) + '" style="width:100%;height:420px;border:none;border-radius:6px;"></iframe>' +
          '</div>';
      }

      html += '</div>';
    });

    html += '</div>';
  }

  return html;
}

function field(l, v) {
  return '<div class="detail-field"><div class="detail-lbl">' + esc(l) + '</div><div class="detail-val">' + (v || '—') + '</div></div>';
}

/* ══════════════════════════════════════════════════════════
   HOD ACTIONS
══════════════════════════════════════════════════════════ */
function hodAction(type) {
  var remarks = (val('hod-remarks') || '').trim();
  if (!remarks) {
    toast('⚠️ Remarks are mandatory before taking action.', 'warn');
    var el = document.getElementById('hod-remarks');
    if (el) { el.focus(); el.style.borderColor = 'var(--err)'; }
    return;
  }
  hodRemarks = remarks;

  if (type === 'approve') {
    var name = session.name || session.email.split('@')[0];
    var ini  = name.split(' ').filter(Boolean).map(function(n){ return n[0]; }).join('').substring(0,2).toUpperCase();
    set('sig-display',   ini);
    set('sig-name-disp', name);
    set('sig-date-disp', new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}));
    document.querySelectorAll('#modalSign .btn').forEach(function(b){
      if (b.disabled || b.textContent.indexOf('Processing') > -1) {
        b.disabled = false; b.textContent = '✅ Confirm & Sign';
      }
    });
    closeModal('modalDetail');
    openModal('modalSign');
  } else {
    closeModal('modalDetail');
    openModal('modalRejectConfirm');
  }
}

function executeHODApprove() {
  if (!currentAppId) return;
  var app = ALL_APPS.find(function(a){ return a.id === currentAppId; });
  if (!app) return;

  var btns = document.querySelectorAll('#modalSign .btn');
  btns.forEach(function(b){ if (b.textContent.indexOf('Confirm') > -1) { b.disabled = true; b.textContent = '⏳ Processing…'; } });

  function doApprove() {
    secureFetch(API + '/application/hod-approve', {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ application_id: currentAppId, remarks: hodRemarks })
    })
    .then(function(r){ return r.json(); })
    .then(function(res){
      if (res.success || res.status === 'success') {
        app.status   = 'approved_hod';
        app.label    = 'Forwarded to Principal';
        app.hremarks = hodRemarks;
        closeModal('modalSign');
        stats();
        ['pending','approved','rejected','all'].forEach(renderTable);
        toast('✅ ' + app.appNo + ' signed & forwarded to Principal.', 'ok');
        currentAppId = null;
        hodRemarks   = '';
      } else if (res.message === 'Not logged in') {
        silentReLogin(function(ok){
          if (ok) doApprove();
          else toast('❌ Session expired. Please login again.', 'err');
        });
      } else {
        toast('❌ ' + (res.message || 'Action failed.'), 'err');
        btns.forEach(function(b){ b.disabled = false; b.textContent = '✅ Confirm & Sign'; });
      }
    })
    .catch(function(err){
      console.error('[hod.js] approve error:', err);
      toast('❌ Network error.', 'err');
      btns.forEach(function(b){ b.disabled = false; b.textContent = '✅ Confirm & Sign'; });
    });
  }

  doApprove();
}

function executeHODReject() {
  if (!currentAppId) return;
  var app = ALL_APPS.find(function(a){ return a.id === currentAppId; });
  if (!app) return;

  var btns = document.querySelectorAll('#modalRejectConfirm .btn');
  btns.forEach(function(b){ if (b.textContent.indexOf('Confirm') > -1) { b.disabled = true; b.textContent = '⏳ Processing…'; } });

  function doReject() {
    fetch(API + '/application/hod-reject', {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ application_id: currentAppId, remarks: hodRemarks })
    })
    .then(function(r){ return r.json(); })
    .then(function(res){
      if (res.success || res.status === 'success') {
        app.status   = 'rejected';
        app.label    = 'Rejected by HOD';
        app.hremarks = hodRemarks;
        closeModal('modalRejectConfirm');
        stats();
        ['pending','approved','rejected','all'].forEach(renderTable);
        toast('❌ ' + app.appNo + ' rejected. Student notified.', 'err');
        currentAppId = null;
        hodRemarks   = '';
      } else if (res.message === 'Not logged in') {
        silentReLogin(function(ok){
          if (ok) doReject();
          else toast('❌ Session expired. Please login again.', 'err');
        });
      } else {
        toast('❌ ' + (res.message || 'Action failed.'), 'err');
        btns.forEach(function(b){ b.disabled = false; b.textContent = '❌ Confirm Reject'; });
      }
    })
    .catch(function(err){
      console.error('[hod.js] reject error:', err);
      toast('❌ Network error.', 'err');
      btns.forEach(function(b){ b.disabled = false; b.textContent = '❌ Confirm Reject'; });
    });
  }

  doReject();
}

/* ══════════════════════════════════════════════════════════
   LOGOUT
══════════════════════════════════════════════════════════ */
function logout() {
  if (!confirm('Logout?')) return;
  fetch(API + '/auth/logout', { method: 'POST', credentials: 'include' }).catch(function(){});
  /* FIX 8: remove role-specific keys */
  localStorage.removeItem('admin_user_hod');
  localStorage.removeItem('admin_creds_hod');
  window.location.replace('index.html');
}

/* ══════════════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════════════ */
function openModal(id)  { var e = document.getElementById(id); if(e) e.classList.add('show'); }
function closeModal(id) { var e = document.getElementById(id); if(e) e.classList.remove('show'); }
function set(id, v)     { var e = document.getElementById(id); if(e) e.textContent = (v!==undefined && v!==null)?v:''; }
function val(id)        { var e = document.getElementById(id); return e ? e.value : ''; }
function loading(id)    { var e = document.getElementById(id); if(e) e.innerHTML = '<div style="text-align:center;padding:50px;color:#6b7280;">⏳ Loading…</div>'; }

var _tw = null;
function toast(msg, type) {
  if (!_tw) {
    _tw = document.createElement('div');
    _tw.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(_tw);
  }
  var t  = document.createElement('div');
  var bg = { ok:'#16a34a', err:'#dc2626', warn:'#d97706' };
  t.style.cssText = 'background:' + (bg[type] || '#1e3a5f') + ';color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.2);max-width:380px;';
  t.textContent = msg;
  _tw.appendChild(t);
  setTimeout(function(){
    t.style.opacity = '0';
    t.style.transition = 'opacity .3s';
    setTimeout(function(){ if(t.parentNode) t.remove(); }, 320);
  }, 3500);
}

function esc(s)     { return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmtDate(d) { if(!d) return '—'; var dt = new Date(d); return isNaN(dt) ? d : dt.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
function dIcon(t)   { var m={bonafide:'📜',character:'🎖️',transcript:'📊',noc:'📋',leaving:'🚪',tc:'🚪',provisional:'🏅',marksheet:'📝',degree:'🎓',migration:'📦',admission:'📩',idcard:'🪪',hallticket:'🎟️',feereceipt:'🧾'}; return m[(t||'').toLowerCase()]||'📄'; }
function docTitle(t){ var m={bonafide:'Bonafide Certificate',character:'Character Certificate',transcript:'Official Transcript',noc:'No Objection Certificate',leaving:'Transfer Certificate',tc:'Transfer Certificate',provisional:'Provisional Certificate',marksheet:'Mark Sheet',degree:'Degree Certificate',migration:'Migration Certificate',admission:'Admission Letter',idcard:'ID Card',hallticket:'Hall Ticket',feereceipt:'Fee Receipt'}; return m[(t||'').toLowerCase()]||(t?t.charAt(0).toUpperCase()+t.slice(1).replace(/_/g,' '):'Document'); }
function badge(s)   { var m={pending_clerk:'badge-pending',pending_hod:'badge-clerk',approved_hod:'badge-hod',approved_final:'badge-ok',rejected:'badge-err'}; return m[s]||'badge-pending'; }