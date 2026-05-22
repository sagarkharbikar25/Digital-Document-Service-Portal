/* ============================================================
   principal.js — Principal Dashboard
   public/admin-portal/principal.js
   ============================================================ */

window.BASE_URL = window.BASE_URL || window.location.origin + window.location.pathname.split('/public/')[0];
var API_BASE = window.BASE_URL + '/public/index.php/api';

var EMAIL_ROLE_MAP = {
  'saar@jdcoem.ac.in': 'clerk',
  'skhod@jdcoem.ac.in': 'hod',
  'sagar@jdcoem.ac.in': 'principal'
};

var session = null;
var currentAppId = null;
var priRemarks = '';
var ALL_APPS = [];

function correctRoleForEmail(email) {
  return EMAIL_ROLE_MAP[(email || '').toLowerCase().trim()] || null;
}

/* ══════════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', function () {

  var raw = localStorage.getItem('admin_user_principal');
  if (!raw) { return redirectLogin(); }
  try { session = JSON.parse(raw); } catch (e) { return redirectLogin(); }
  if (!session || !session.email) { return redirectLogin(); }

  var correctRole = correctRoleForEmail(session.email);
  if (correctRole) {
    session.role = correctRole;
  }
  localStorage.setItem('admin_user_principal', JSON.stringify(session));

  var role = (session.role || '').toLowerCase().trim();

  if (role === 'clerk') { window.location.replace('clerk.html'); return; }
  if (role === 'hod') { window.location.replace('hod.html'); return; }
  if (role !== 'principal' && role !== 'admin') { return redirectLogin(); }

  var name = session.name || session.email;
  var ini = initials(name);
  set('hdr-av', ini);
  set('hdr-nm', name);
  set('hdr-sub', session.email || '');
  set('sb-role-name', name);
  set('sb-role-email', session.email || '');
  set('sig-display', ini);
  set('sig-name-disp', name);
  set('sig-date-disp', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));

  ['modalDetail', 'modalSign', 'modalRejectConfirm'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function (e) { if (e.target === el) closeModal(id); });
  });

  ensureSession(function (ok) {
    if (!ok) {
      toast('❌ Session error. Please login again.', 'err');
      setTimeout(function () { logout(); }, 2000);
      return;
    }
    startKeepAlive();
    loadApps();
  });

  showSection('pending', document.querySelector('.nav-link.active'));
});

function redirectLogin() {
  localStorage.removeItem('admin_user_principal');
  window.location.replace('index.html');
}

/* ══════════════════════════════════════════════════════════════
   SESSION
══════════════════════════════════════════════════════════════ */
function ensureSession(done) {
  secureFetch(API_BASE + '/debug/session', { credentials: 'include' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.user_id) { done(true); }
      else { silentReLogin(done); }
    })
    .catch(function () { silentReLogin(done); });
}

function silentReLogin(done) {
  var raw = localStorage.getItem('admin_creds_principal');
  if (!raw) { done(false); return; }
  var creds;
  try { creds = JSON.parse(raw); } catch (e) { done(false); return; }
  if (!creds || !creds.email || !creds.password) { done(false); return; }

  secureFetch(API_BASE + '/auth/login', {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: creds.email, password: creds.password })
  })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (res.status === 'success') {
        if (res.user) {
          var savedEmail = (session && session.email) ? session.email : '';
          session = Object.assign(session || {}, res.user);
          if (savedEmail) session.email = savedEmail;
        }
        var savedEmail2 = (session && session.email) ? session.email : '';
        var correctRole = correctRoleForEmail(savedEmail2);
        if (correctRole) session.role = correctRole;
        localStorage.setItem('admin_user_principal', JSON.stringify(session));
        done(true);
      } else { done(false); }
    })
    .catch(function () { done(false); });
}

function startKeepAlive() {
  setInterval(function () {
    secureFetch(API_BASE + '/debug/session', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.user_id) {
          silentReLogin(function (ok) {
            if (!ok) toast('⚠️ Session expired. Please login again.', 'warn');
          });
        }
      })
      .catch(function () { });
  }, 4 * 60 * 1000);
}

/* ══════════════════════════════════════════════════════════════
   LOAD
══════════════════════════════════════════════════════════════ */
function loadApps() {
  loading('table-pending');

  secureFetch(API_BASE + '/application/all', { credentials: 'include' })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (res.success && Array.isArray(res.data)) {
        ALL_APPS = res.data.map(normalize);
      } else if (res.message === 'Not logged in') {
        silentReLogin(function (ok) {
          if (ok) loadApps();
          else toast('❌ Session expired. Please login again.', 'err');
        });
        return;
      } else {
        ALL_APPS = [];
      }
    })
    .catch(function (err) {
      console.error('[principal.js] load error:', err);
      toast('❌ Could not connect to server.', 'err');
      ALL_APPS = [];
    })
    .finally(function () {
      refreshStats();
      renderTable('pending');
    });
}

/* ══════════════════════════════════════════════════════════════
   NORMALIZE
   — FIX: added all rejected_* and *_rejected variants
     so they don't fall through to 'pending_clerk' default
══════════════════════════════════════════════════════════════ */
function normalize(a) {
  var raw = (a.status || '').toLowerCase().trim();
  var SM = {
    'pending': 'pending_clerk',
    'pending_clerk': 'pending_clerk',
    'clerk_approved': 'pending_hod',
    'pending_hod': 'pending_hod',
    'hod_approved': 'pending_principal',
    'pending_principal': 'pending_principal',
    'approved': 'approved',
    'principal_approved': 'approved',
    'rejected': 'rejected',
    'rejected_clerk': 'rejected',
    'clerk_rejected': 'rejected',
    'rejected_hod': 'rejected',
    'hod_rejected': 'rejected',
    'rejected_principal': 'rejected',
    'principal_rejected': 'rejected'
  };
  var LM = {
    'pending_clerk': 'Pending at Clerk',
    'pending_hod': 'Pending at HOD',
    'pending_principal': 'Awaiting Principal',
    'approved': 'Fully Approved',
    'rejected': 'Rejected'
  };
  var s = SM[raw] || 'pending_clerk';
  return {
    id: a.id,
    appNumber: a.application_number || ('APP-' + pad(a.id)),
    studentName: a.student_name || a.full_name || a.name || 'Unknown Student',
    studentEmail: a.student_email || a.email || '—',
    studentId: a.bt_id || '',
    dept: a.department || a.branch || 'N/A',
    year: a.year || '',
    docType: (a.certificate_type || a.document_type || a.adm_type || '').toLowerCase(),
    docTitle: docTitle(a.certificate_type || a.document_type || a.adm_type || ''),
    purpose: a.purpose || '',
    status: s,
    statusLabel: LM[s] || s,
    submittedAt: a.created_at || '',
    clerkRemarks: a.clerk_remarks || '',
    hodRemarks: a.hod_remarks || '',
    files: a.documents || []
  };
}

function docTitle(t) {
  var m = {
    bonafide: 'Bonafide Certificate', character: 'Character Certificate', transcript: 'Official Transcript',
    noc: 'No Objection Certificate', leaving: 'Transfer Certificate', tc: 'Transfer Certificate',
    provisional: 'Provisional Certificate', marksheet: 'Mark Sheet', degree: 'Degree Certificate',
    migration: 'Migration Certificate', admission: 'Admission Letter', idcard: 'ID Card',
    hallticket: 'Hall Ticket', feereceipt: 'Fee Receipt'
  };
  var k = (t || '').toLowerCase();
  return m[k] || (t ? t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, ' ') : 'Document');
}

/* ══════════════════════════════════════════════════════════════
   STATS
══════════════════════════════════════════════════════════════ */
function refreshStats() {
  var scope = ALL_APPS.filter(function (a) { return a.status !== 'pending_clerk' && a.status !== 'pending_hod'; });
  var pending = scope.filter(function (a) { return a.status === 'pending_principal'; }).length;
  var approved = scope.filter(function (a) { return a.status === 'approved'; }).length;
  var rejected = scope.filter(function (a) { return a.status === 'rejected'; }).length;
  var total = scope.length;

  set('stat-total', total); set('sc-total', total);
  set('stat-pending', pending); set('sc-pending', pending);
  set('stat-approved', approved); set('sc-approved', approved);
  set('stat-rejected', rejected); set('sc-rejected', rejected);
  set('sb-pending-count', pending > 0 ? String(pending) : '');
}

/* ══════════════════════════════════════════════════════════════
   SECTION
══════════════════════════════════════════════════════════════ */
function showSection(name, el) {
  ['pending', 'all', 'approved', 'rejected', 'stats'].forEach(function (s) {
    var e = document.getElementById('section-' + s);
    if (e) e.style.display = (s === name) ? '' : 'none';
  });
  document.querySelectorAll('.nav-link').forEach(function (l) { l.classList.remove('active'); });
  if (el && el.classList) el.classList.add('active');
  renderTable(name);
}

/* ══════════════════════════════════════════════════════════════
   TABLE
══════════════════════════════════════════════════════════════ */
function renderTable(type) {
  var el = document.getElementById('table-' + type);
  if (!el) return;

  var apps = ALL_APPS.slice();
  if (type === 'pending') apps = apps.filter(function (a) { return a.status === 'pending_principal'; });
  if (type === 'approved') apps = apps.filter(function (a) { return a.status === 'approved'; });
  if (type === 'rejected') apps = apps.filter(function (a) { return a.status === 'rejected'; });
  if (type === 'all') apps = apps.filter(function (a) { return a.status !== 'pending_clerk' && a.status !== 'pending_hod'; });

  var q = (val('search-' + type) || '').toLowerCase().trim();
  if (q) apps = apps.filter(function (a) {
    return (a.studentName + a.appNumber + a.docTitle + a.studentEmail).toLowerCase().indexOf(q) > -1;
  });

  if (!apps.length) {
    var msgs = {
      pending: 'No applications awaiting Principal approval. 🎉',
      approved: 'No approved applications yet.',
      rejected: 'No rejected applications.',
      all: 'No applications found.'
    };
    el.innerHTML =
      '<div class="empty-state"><div class="empty-ico">📭</div>' +
      '<h3>Nothing Here</h3><p>' + (msgs[type] || 'No results.') + '</p></div>';
    return;
  }

  var rows = apps.map(function (a) {
    return '<tr>' +
      '<td><strong style="font-family:monospace;font-size:12px;">' + esc(a.appNumber) + '</strong></td>' +
      '<td>' +
      '<div style="font-weight:600;">' + esc(a.studentName) + '</div>' +
      '<div style="font-size:11px;color:var(--text-3);">' + esc(a.studentEmail) + '</div>' +
      (a.dept ? '<div style="font-size:11px;color:var(--text-3);">' + esc(a.dept) + (a.year ? ' · Yr ' + esc(a.year) : '') + '</div>' : '') +
      '</td>' +
      '<td style="font-size:12.5px;">' + esc(a.dept) + '</td>' +
      '<td><div style="font-weight:600;">' + dicon(a.docType) + ' ' + esc(a.docTitle) + '</div>' +
      (a.purpose ? '<div style="font-size:11px;color:var(--text-3);">' + esc(a.purpose.substring(0, 50)) + '</div>' : '') +
      '</td>' +
      '<td style="font-size:12px;">' + fdate(a.submittedAt) + '</td>' +
      '<td><span class="badge ' + bclass(a.status) + '">' + esc(a.statusLabel) + '</span></td>' +
      '<td><button class="btn btn-primary btn-sm" onclick="openDetail(' + a.id + ')">' + (a.status === 'pending_principal' ? '📂 Review' : '👁 View') + '</button></td>' +
      '</tr>';
  }).join('');

  el.innerHTML =
    '<table class="app-table"><thead><tr>' +
    '<th>App ID</th><th>Student</th><th>Department</th><th>Document</th><th>Submitted</th><th>Status</th><th>Action</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table>';
}

/* ══════════════════════════════════════════════════════════════
   DETAIL MODAL
   — FIX: action-area + remarks reset BEFORE openModal (same
     pattern as clerk.js) so state is never stale
   — FIX: confirm buttons reset on EVERY openDetail call so
     "Processing…" stuck state is cleared reliably
══════════════════════════════════════════════════════════════ */
function openDetail(appId) {
  var app = ALL_APPS.find(function (a) { return a.id === appId; });
  if (!app) return;
  currentAppId = appId;
  priRemarks = '';

  set('modal-app-id', app.appNumber);
  var se = document.getElementById('modal-app-status');
  if (se) se.innerHTML = '<span class="badge ' + bclass(app.status) + '">' + esc(app.statusLabel) + '</span>';

  /* FIX: reset action area and remarks before opening */
  var aa = document.getElementById('pri-action-area');
  if (aa) aa.style.display = (app.status === 'pending_principal') ? '' : 'none';

  var re = document.getElementById('pri-remarks');
  if (re) { re.value = ''; re.style.borderColor = ''; }

  /* FIX: use text-based button reset (same as hod.js) instead of :last-child selector */
  document.querySelectorAll('#modalSign .btn, #modalRejectConfirm .btn').forEach(function (b) {
    if (b.disabled || b.textContent.indexOf('Processing') > -1) {
      b.disabled = false;
      b.textContent = b.textContent.indexOf('Reject') > -1 ? '❌ Confirm Reject' : '✅ Confirm & Approve';
    }
  });

  var de = document.getElementById('modal-app-detail');
  if (de) de.innerHTML = '<div style="text-align:center;padding:30px;color:#6b7280;">⏳ Loading…</div>';

  openModal('modalDetail');

  secureFetch(API_BASE + '/application/view?application_id=' + appId, { credentials: 'include' })
    .then(function (r) {
      if (!r.ok) { throw new Error('HTTP ' + r.status); }
      return r.json();
    })
    .then(function (res) {
      if (res.success && res.data) {
        var d = res.data;
        app.studentName = d.student_name || d.name || app.studentName;
        app.studentEmail = d.student_email || d.email || app.studentEmail;
        app.studentId = d.bt_id || app.studentId;
        app.dept = d.department || d.branch || app.dept;
        app.year = d.year || app.year;
        app.purpose = d.purpose || app.purpose;
        app.clerkRemarks = d.clerk_remarks || app.clerkRemarks;
        app.hodRemarks = d.hod_remarks || app.hodRemarks;
        if (d.certificate_type || d.document_type || d.adm_type) {
          app.docType = (d.certificate_type || d.document_type || d.adm_type || app.docType).toLowerCase();
          app.docTitle = docTitle(app.docType);
        }
        if (Array.isArray(d.documents) && d.documents.length > 0) {
          app.files = d.documents;
        }
      } else if (res.message === 'Not logged in') {
        silentReLogin(function (ok) {
          if (ok) openDetail(appId);
          else toast('❌ Session expired. Please login again.', 'err');
        });
        return;
      }
      if (de) de.innerHTML = buildDetail(app);
    })
    .catch(function (err) {
      console.error('[principal.js] openDetail fetch error:', err);
      if (de) de.innerHTML = buildDetail(app);
    });
}

/* ══════════════════════════════════════════════════════════════
   RESOLVE FILE URL
══════════════════════════════════════════════════════════════ */
function resolveFileUrl(f, appDocType) {
  var filePath = '';
  if (typeof f === 'string') {
    filePath = f;
  } else {
    filePath = f.file_name || f.filename || f.original_name || f.name || '';
  }
  if (filePath.indexOf('/') > -1) {
    return '../storage_proxy.php?file=' + encodeURIComponent(filePath);
  }
  var folder = (appDocType || 'bonafide').toLowerCase();
  return '../storage_proxy.php?file=' + encodeURIComponent(folder + '/' + filePath);
}

/* ══════════════════════════════════════════════════════════════
   BUILD DETAIL
   — FIX: onerror handler on img tags (matched to hod.js)
══════════════════════════════════════════════════════════════ */
function buildDetail(app) {
  var h =
    '<div class="detail-grid">' +
    df('Student Name', app.studentName) +
    df('Student Email', app.studentEmail || '—') +
    df('Student ID', app.studentId || '—') +
    df('Department', app.dept) +
    df('Year', app.year || '—') +
    df('Document', dicon(app.docType) + ' ' + app.docTitle) +
    df('App Number', app.appNumber) +
    df('Purpose', app.purpose || '—') +
    df('Submitted', fdate(app.submittedAt)) +
    '</div>';

  if (app.clerkRemarks) {
    h += '<div class="section-divider" style="margin-top:16px;">Clerk Remarks</div>' +
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:13px;">' + esc(app.clerkRemarks) + '</div>';
  }
  if (app.hodRemarks) {
    h += '<div class="section-divider" style="margin-top:12px;">HOD Remarks</div>' +
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:13px;">' + esc(app.hodRemarks) + '</div>';
  }

  h += '<div class="section-divider" style="margin-top:16px;">📎 Student Uploaded Documents</div>';

  if (!app.files || !app.files.length) {
    h += '<div style="padding:24px;text-align:center;background:var(--surface);border:1px dashed var(--border);border-radius:8px;color:var(--text-3);">📂 No documents uploaded with this application.</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:10px;">';
    app.files.forEach(function (f, i) {
      var filePath = (typeof f === 'string') ? f : (f.file_name || f.filename || f.original_name || f.name || ('Document ' + (i + 1)));
      var fname = filePath.split('/').pop();
      var furl = resolveFileUrl(f, app.docType);
      var ext = (fname.split('.').pop() || '').toLowerCase();
      var icons = { pdf: '📄', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️' };
      var ico = icons[ext] || '📎';
      var isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].indexOf(ext) > -1;
      var isPdf = ext === 'pdf';

      h += '<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--surface);">' +
        '<span style="font-size:13px;font-weight:600;">' + ico + ' ' + esc(fname) + '</span>' +
        '<div style="display:flex;gap:8px;">' +
        '<a href="' + esc(furl) + '" target="_blank" style="font-size:12px;padding:5px 14px;background:var(--info-bg);color:var(--info);border:1px solid var(--info);border-radius:6px;text-decoration:none;font-weight:600;">' + (isImg ? '🖼️ View' : '👁 Open') + '</a>' +
        '<a href="' + esc(furl) + '" download="' + esc(fname) + '" style="font-size:12px;padding:5px 14px;background:var(--ok-bg);color:var(--ok);border:1px solid var(--ok);border-radius:6px;text-decoration:none;font-weight:600;">⬇ Download</a>' +
        '</div></div>';
      if (isImg) {
        h += '<div style="padding:10px;background:#fff;text-align:center;">' +
          '<img src="' + esc(furl) + '" style="max-width:100%;max-height:350px;border-radius:6px;" ' +
          'onerror="this.parentElement.innerHTML=\'<div style=padding:16px;color:#888>⚠️ Image could not load</div>\'">' +
          '</div>';
      }
      if (isPdf) {
        h += '<div style="padding:10px;background:#fff;">' +
          '<iframe src="' + esc(furl) + '" style="width:100%;height:420px;border:none;border-radius:6px;"></iframe>' +
          '</div>';
      }
      h += '</div>';
    });
    h += '</div>';
  }
  return h;
}

function df(l, v) {
  return '<div class="detail-field"><div class="detail-lbl">' + esc(l) + '</div><div class="detail-val">' + (v || '—') + '</div></div>';
}

/* ══════════════════════════════════════════════════════════════
   ACTIONS
   — FIX: button reset uses querySelectorAll + text matching
     (same as hod.js) instead of fragile :last-child selector
══════════════════════════════════════════════════════════════ */
function priAction(type) {
  var r = (val('pri-remarks') || '').trim();
  if (!r) {
    toast('⚠️ Remarks are mandatory.', 'warn');
    var e = document.getElementById('pri-remarks');
    if (e) { e.focus(); e.style.borderColor = 'var(--err)'; }
    return;
  }
  priRemarks = r;
  if (type === 'approve') {
    var name = session.name || session.email;
    set('sig-display', initials(name));
    set('sig-name-disp', name);
    set('sig-date-disp', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    /* FIX: text-based button reset */
    document.querySelectorAll('#modalSign .btn').forEach(function (b) {
      if (b.textContent.indexOf('Confirm') > -1 || b.textContent.indexOf('Processing') > -1) {
        b.disabled = false; b.textContent = '✅ Confirm & Approve';
      }
    });
    closeModal('modalDetail');
    openModal('modalSign');
  } else {
    /* FIX: text-based button reset */
    document.querySelectorAll('#modalRejectConfirm .btn').forEach(function (b) {
      if (b.textContent.indexOf('Confirm') > -1 || b.textContent.indexOf('Processing') > -1) {
        b.disabled = false; b.textContent = '❌ Confirm Reject';
      }
    });
    closeModal('modalDetail');
    openModal('modalRejectConfirm');
  }
}

function executePrincipalApprove() {
  if (!currentAppId) return;
  var app = ALL_APPS.find(function (a) { return a.id === currentAppId; });

  /* FIX: use text-based button selection instead of :last-child */
  var btns = document.querySelectorAll('#modalSign .btn');
  btns.forEach(function (b) {
    if (b.textContent.indexOf('Confirm') > -1 || b.textContent.indexOf('Approve') > -1) {
      b.disabled = true; b.textContent = '⏳ Processing…';
    }
  });

  function doApprove() {
    secureFetch(API_BASE + '/application/principal-approve', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: currentAppId, remarks: priRemarks })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success || res.status === 'success') {
          if (app) { app.status = 'approved'; app.statusLabel = 'Fully Approved'; }
          closeModal('modalSign');
          refreshStats();
          ['pending', 'approved', 'rejected', 'all'].forEach(renderTable);
          toast('✅ ' + (app ? app.appNumber : '') + ' approved! Certificate issued.', 'ok');
          currentAppId = null; priRemarks = '';
        } else if (res.message === 'Not logged in') {
          silentReLogin(function (ok) {
            if (ok) doApprove();
            else toast('❌ Session expired.', 'err');
          });
        } else {
          toast('❌ ' + (res.message || 'Action failed.'), 'err');
          btns.forEach(function (b) { b.disabled = false; b.textContent = '✅ Confirm & Approve'; });
        }
      })
      .catch(function (err) {
        console.error('[principal.js] approve error:', err);
        toast('❌ Network error.', 'err');
        btns.forEach(function (b) { b.disabled = false; b.textContent = '✅ Confirm & Approve'; });
      });
  }
  doApprove();
}

function executePrincipalReject() {
  if (!currentAppId) return;
  var app = ALL_APPS.find(function (a) { return a.id === currentAppId; });

  /* FIX: use text-based button selection instead of .btn-err class selector */
  var btns = document.querySelectorAll('#modalRejectConfirm .btn');
  btns.forEach(function (b) {
    if (b.textContent.indexOf('Confirm') > -1 || b.textContent.indexOf('Reject') > -1) {
      b.disabled = true; b.textContent = '⏳ Processing…';
    }
  });

  function doReject() {
    secureFetch(API_BASE + '/application/principal-reject', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: currentAppId, remarks: priRemarks })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success || res.status === 'success') {
          if (app) {
            app.status = 'rejected';
            /* FIX: use 'Rejected' to match LM map — was 'Rejected by Principal' */
            app.statusLabel = 'Rejected';
          }
          closeModal('modalRejectConfirm');
          refreshStats();
          ['pending', 'approved', 'rejected', 'all'].forEach(renderTable);
          toast('❌ ' + (app ? app.appNumber : '') + ' rejected.', 'err');
          currentAppId = null; priRemarks = '';
        } else if (res.message === 'Not logged in') {
          silentReLogin(function (ok) { if (ok) doReject(); else toast('❌ Session expired.', 'err'); });
        } else {
          toast('❌ ' + (res.message || 'Action failed.'), 'err');
          btns.forEach(function (b) { b.disabled = false; b.textContent = '❌ Confirm Reject'; });
        }
      })
      .catch(function (err) {
        console.error('[principal.js] reject error:', err);
        toast('❌ Network error.', 'err');
        btns.forEach(function (b) { b.disabled = false; b.textContent = '❌ Confirm Reject'; });
      });
  }
  doReject();
}

/* ══════════════════════════════════════════════════════════════
   LOGOUT
══════════════════════════════════════════════════════════════ */
function logout() {
  if (!confirm('Are you sure you want to logout?')) return;
  secureFetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'include' }).catch(function () { });
  localStorage.removeItem('admin_user_principal');
  localStorage.removeItem('admin_creds_principal');
  window.location.replace('index.html');
}

/* ══════════════════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════════════════ */
function openModal(id) { var e = document.getElementById(id); if (e) e.classList.add('show'); }
function closeModal(id) { var e = document.getElementById(id); if (e) e.classList.remove('show'); }
function set(id, v) { var e = document.getElementById(id); if (e) e.textContent = (v!==undefined && v!==null)?v:''; }
function val(id) { var e = document.getElementById(id); return e ? e.value : ''; }
function loading(id) { var e = document.getElementById(id); if (e) e.innerHTML = '<div style="text-align:center;padding:40px;color:#6b7280;">⏳ Loading…</div>'; }

var _tw = null;
function toast(msg, type) {
  if (!_tw) {
    _tw = document.createElement('div');
    _tw.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(_tw);
  }
  var t = document.createElement('div');
  var bg = { ok: '#16a34a', err: '#dc2626', warn: '#d97706' };
  t.style.cssText = 'background:' + (bg[type] || '#1e3a5f') + ';color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.2);max-width:380px;';
  t.textContent = msg;
  _tw.appendChild(t);
  setTimeout(function () {
    t.style.opacity = '0'; t.style.transition = 'opacity .3s';
    setTimeout(function () { if (t.parentNode) t.remove(); }, 320);
  }, 3500);
}

function esc(s) { return (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function fdate(d) { if (!d) return '—'; var dt = new Date(d); return isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function pad(n) { return String(n || '').padStart(6, '0'); }
function initials(n) { return (n || '?').split(' ').filter(Boolean).map(function (x) { return x[0]; }).join('').substring(0, 2).toUpperCase(); }
function dicon(t) { var m = { bonafide: '📜', character: '🎖️', transcript: '📊', noc: '📋', leaving: '🚪', tc: '🚪', provisional: '🏅', marksheet: '📝', degree: '🎓', migration: '📦', admission: '📩', idcard: '🪪', hallticket: '🎟️', feereceipt: '🧾' }; return m[(t || '').toLowerCase()] || '📄'; }
function bclass(s) { var m = { pending_clerk: 'badge-pending', pending_hod: 'badge-clerk', pending_principal: 'badge-hod', approved: 'badge-ok', rejected: 'badge-err' }; return m[s] || 'badge-pending'; }