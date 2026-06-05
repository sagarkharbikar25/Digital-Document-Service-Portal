/* ============================================================
   clerk.js — Clerk Dashboard
   public/admin-portal/clerk.js
   ============================================================ */

window.BASE_URL = window.BASE_URL || window.location.origin + window.location.pathname.split('/public/')[0];
var API   = window.BASE_URL + '/public/index.php/api';
var FILES = window.BASE_URL + '/storage/uploads/bonafide/';

/* EMAIL_ROLE_MAP: single source of truth for role per email.
   Used in silentReLogin to prevent server response from
   overwriting the correct role in localStorage. */
var EMAIL_ROLE_MAP = {
  'saar@jdcoem.ac.in':  'clerk',
  'skhod@jdcoem.ac.in': 'hod',
  'sagar@jdcoem.ac.in': 'principal'
};

var session      = null;
var currentAppId = null;
var ALL_APPS     = [];

/* ── INFER DEPARTMENT FROM EMAIL ──────────────────────────── */
function getAdminDept(email) {
  var e = (email || '').toLowerCase().trim();
  var globalAdmins = ['saar@jdcoem.ac.in', 'skhod@jdcoem.ac.in', 'sagar@jdcoem.ac.in'];
  if (e && globalAdmins.indexOf(e) > -1) {
    return null;
  }

  if (session && session.department) {
    return session.department.toUpperCase();
  }
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

/* ── INIT ─────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', function () {
  /* FIX: read from role-specific key admin_user_clerk */
  var raw = localStorage.getItem('admin_user_clerk');
  if (!raw) { window.location.replace('index.html'); return; }
  try { session = JSON.parse(raw); } catch(e) { window.location.replace('index.html'); return; }
  if (!session || !session.email) { window.location.replace('index.html'); return; }

  /* ALWAYS correct the role from EMAIL_ROLE_MAP first,
     BEFORE any redirect check. */
  var correctRole = EMAIL_ROLE_MAP[(session.email || '').toLowerCase().trim()];
  if (correctRole) session.role = correctRole;
  /* FIX: save back to role-specific key */
  localStorage.setItem('admin_user_clerk', JSON.stringify(session));

  var role = (session.role || '').toLowerCase().trim();

  if (role === 'hod')                       { window.location.replace('hod.html');       return; }
  if (role === 'principal')                  { window.location.replace('principal.html'); return; }
  if (role !== 'clerk' && role !== 'admin') { window.location.replace('index.html');     return; }

  var name = session.name || session.email.split('@')[0];
  var ini  = name.split(' ').filter(Boolean).map(function(n){ return n[0]; }).join('').substring(0,2).toUpperCase();
  set('hdr-av',        ini);
  set('hdr-nm',        name);
  set('hdr-sub',       session.email);
  set('sb-role-name',  name);
  set('sb-role-email', session.email);

  ['modalDetail','modalConfirm'].forEach(function(id){
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

/* ── ENSURE PHP SESSION IS ALIVE ──────────────────────────── */
function ensureSession(done) {
  secureFetch(API + '/debug/session', { credentials: 'include' })
  .then(function(r){ return r.json(); })
  .then(function(d){
    if (d.user_id) { done(true); }
    else { silentReLogin(done); }
  })
  .catch(function(){ silentReLogin(done); });
}

/* ── KEEP SESSION ALIVE ──────────────────────────────────── */
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
  /* FIX: read from role-specific key admin_creds_clerk */
  var raw = localStorage.getItem('admin_creds_clerk');
  if (!raw) { done(false); return; }
  var creds;
  try { creds = JSON.parse(raw); } catch(e) { done(false); return; }
  if (!creds || !creds.email || !creds.password) { done(false); return; }

  secureFetch(API + '/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: creds.email, password: creds.password })
  })
  .then(function(r){ return r.json(); })
  .then(function(res){
    if (res.status === 'success') {
      if (res.user) {
        var savedEmail = (session && session.email) ? session.email : '';
        session = Object.assign(session || {}, res.user);
        if (savedEmail) session.email = savedEmail;
        var correctRole = EMAIL_ROLE_MAP[savedEmail.toLowerCase().trim()];
        if (correctRole) session.role = correctRole;
        /* FIX: save back to role-specific key */
        localStorage.setItem('admin_user_clerk', JSON.stringify(session));
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

/* ── LOAD ALL APPLICATIONS ────────────────────────────────── */
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
    console.error('Load error:', err);
    toast('❌ Could not load applications.', 'err');
    ALL_APPS = [];
  })
  .finally(function(){
    stats();
    renderTable('pending');
  });
}

/* ── NORMALIZE backend row ────────────────────────────────── */
function norm(a) {
  var s   = (a.status || 'pending').toLowerCase().trim();
  var map = {
    pending:'pending', pending_clerk:'pending',
    clerk_approved:'clerk_approved', pending_hod:'clerk_approved',
    hod_approved:'hod_approved', pending_principal:'hod_approved',
    approved:'approved', principal_approved:'approved',
    rejected:'rejected', rejected_clerk:'rejected', clerk_rejected:'rejected',
    rejected_hod:'rejected', hod_rejected:'rejected',
    rejected_principal:'rejected', principal_rejected:'rejected'
  };
  var lbl = {
    pending:'Pending at Clerk',
    clerk_approved:'Forwarded to HOD',
    hod_approved:'Forwarded to Principal',
    approved:'Fully Approved',
    rejected:'Rejected'
  };
  var st = map[s] || 'pending';
  return {
    id:      a.id,
    appNo:   a.application_number || 'APP-'+String(a.id).padStart(6,'0'),
    name:    a.student_name  || a.full_name || a.name || 'Unknown Student',
    email:   a.student_email || a.email || '—',
    btid:    a.bt_id  || a.btid  || '',
    dept:    a.department || a.branch || 'N/A',
    year:    a.year   || '',
    dtype:   (a.certificate_type || a.document_type || a.adm_type || '').toLowerCase(),
    dtitle:  docTitle(a.certificate_type || a.document_type || ''),
    purpose: a.purpose || '',
    status:  st,
    label:   lbl[st] || st,
    date:    a.created_at || '',
    cremarks:a.clerk_remarks || '',
    files:   a.documents || []
  };
}

/* ── STATS ────────────────────────────────────────────────── */
function stats() {
  var apps = ALL_APPS.slice();
  var adminDept = getAdminDept(session ? session.email : '');
  if (adminDept) {
    apps = apps.filter(function(a) { 
      var aDept = (a.dept || '').toUpperCase();
      return aDept === adminDept || aDept === 'ALL'; 
    });
  }

  var p = apps.filter(function(a){ return a.status==='pending'; }).length;
  var a = apps.filter(function(a){
    return a.status==='clerk_approved' || a.status==='hod_approved' || a.status==='approved';
  }).length;
  var r = apps.filter(function(a){ return a.status==='rejected'; }).length;
  var t = apps.length;
  set('stat-total',    t); set('sc-total',    t);
  set('stat-pending',  p); set('sc-pending',  p);
  set('stat-approved', a); set('sc-approved', a);
  set('stat-rejected', r); set('sc-rejected', r);
  set('sb-pending-count', p > 0 ? p : '');
}

/* ── SECTION SWITCHER ─────────────────────────────────────── */
function showSection(name) {
  ['pending','all','approved','rejected','stats'].forEach(function(s){
    var el = document.getElementById('section-'+s);
    if (el) el.style.display = s===name ? '' : 'none';
  });
  document.querySelectorAll('.nav-link').forEach(function(l){ l.classList.remove('active'); });
  document.querySelectorAll('.nav-link').forEach(function(l){
    if ((l.getAttribute('onclick')||'').indexOf("'"+name+"'") > -1) l.classList.add('active');
  });
  renderTable(name);
}

/* ── TABLE RENDERER ───────────────────────────────────────── */
function renderTable(type) {
  var el = document.getElementById('table-'+type);
  if (!el) return;

  var apps = ALL_APPS.slice();
  
  var adminDept = getAdminDept(session ? session.email : '');
  if (adminDept) {
    apps = apps.filter(function(a) { 
      var aDept = (a.dept || '').toUpperCase();
      return aDept === adminDept || aDept === 'ALL'; 
    });
  }

  if (type==='pending')  apps = apps.filter(function(a){ return a.status==='pending'; });
  if (type==='approved') apps = apps.filter(function(a){
    return a.status==='clerk_approved' || a.status==='hod_approved' || a.status==='approved';
  });
  if (type==='rejected') apps = apps.filter(function(a){ return a.status==='rejected'; });

  var q = (val('search-'+type)||'').toLowerCase();
  if (q) apps = apps.filter(function(a){
    return (a.name+a.appNo+a.dtitle+a.email+a.btid).toLowerCase().indexOf(q)>-1;
  });

  if (!apps.length) {
    el.innerHTML =
      '<div class="empty-state">'+
      '<div class="empty-ico">📭</div>'+
      '<h3>Nothing Here</h3>'+
      '<p>'+(type==='pending'?'No pending applications. All caught up! 🎉':'No applications found.')+'</p>'+
      '</div>';
    return;
  }

  el.innerHTML =
    '<table class="app-table"><thead><tr>'+
    '<th>App ID</th><th>Student</th><th>Document</th>'+
    '<th>Submitted</th><th>Status</th><th>Action</th>'+
    '</tr></thead><tbody>'+
    apps.map(function(a){
      return '<tr>'+
        '<td><strong style="font-family:monospace;font-size:12px;">'+esc(a.appNo)+'</strong></td>'+
        '<td>'+
          '<div style="font-weight:600;">'+esc(a.name)+'</div>'+
          '<div style="font-size:11px;color:var(--text-3);">'+esc(a.email)+'</div>'+
          (a.dept?'<div style="font-size:11px;color:var(--text-3);">'+esc(a.dept)+(a.year?' · Yr '+a.year:'')+'</div>':'')+
        '</td>'+
        '<td>'+
          '<div style="font-weight:600;">'+dIcon(a.dtype)+' '+esc(a.dtitle)+'</div>'+
          (a.purpose?'<div style="font-size:11px;color:var(--text-3);">'+esc(a.purpose.substring(0,50))+'</div>':'')+
        '</td>'+
        '<td style="font-size:12px;">'+fmtDate(a.date)+'</td>'+
        '<td><span class="badge '+badge(a.status)+'">'+esc(a.label)+'</span></td>'+
        '<td><button class="btn btn-primary btn-sm" onclick="openDetail('+a.id+')">'+
          (a.status==='pending'?'📂 Review':'👁 View')+
        '</button></td>'+
      '</tr>';
    }).join('')+
    '</tbody></table>';
}

/* ── OPEN DETAIL MODAL ────────────────────────────────────── */
function openDetail(appId) {
  var app = ALL_APPS.find(function(a){ return a.id===appId; });
  if (!app) return;
  currentAppId = appId;

  set('modal-app-id', app.appNo);
  var sb = document.getElementById('modal-app-status');
  if (sb) sb.innerHTML = '<span class="badge '+badge(app.status)+'">'+esc(app.label)+'</span>';

  var aa = document.getElementById('clerk-action-area');
  if (aa) aa.style.display = app.status==='pending' ? '' : 'none';

  var rd = document.getElementById('clerk-remarks');
  if (rd) rd.value = '';

  var det = document.getElementById('modal-app-detail');
  if (det) det.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:32px;">⏳</div><div style="color:#6b7280;margin-top:10px;">Loading details…</div></div>';
  openModal('modalDetail');

  fetch(API + '/application/view?application_id='+appId, { credentials: 'include' })
  .then(function(r){ return r.json(); })
  .then(function(res){
    if (res.success && res.data) {
      var d = res.data;
      app.name    = d.student_name  || d.name  || app.name;
      app.email   = d.student_email || d.email || app.email;
      app.btid    = d.bt_id || d.btid || app.btid;
      app.dept    = d.department || d.branch || app.dept;
      app.year    = d.year || app.year;
      app.purpose = d.purpose || app.purpose;
      app.cremarks= d.clerk_remarks || app.cremarks;
      if (Array.isArray(d.documents) && d.documents.length > 0) app.files = d.documents;
    }
    if (det) det.innerHTML = buildDetail(app);
  })
  .catch(function(){
    if (det) det.innerHTML = buildDetail(app);
  });
}

/* ── BUILD DETAIL HTML ────────────────────────────────────── */
function buildDetail(app) {

  var html =
    '<div class="detail-grid">'+
      field('Student Name',  app.name)+
      field('Student Email', app.email || '—')+
      field('Department',    app.dept)+
      field('Year',          app.year || '—')+
      field('Document',      dIcon(app.dtype)+' '+app.dtitle)+
      field('App Number',    app.appNo)+
      field('Purpose',       app.purpose || '—')+
      field('Submitted',     fmtDate(app.date))+
    '</div>';

  if (app.cremarks) {
    html +=
      '<div class="section-divider" style="margin-top:16px;">Previous Remarks</div>'+
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:13px;">'+esc(app.cremarks)+'</div>';
  }

  html += '<div class="section-divider" style="margin-top:16px;">📎 Student Uploaded Documents</div>';

  if (!app.files || app.files.length === 0) {
    html +=
      '<div style="padding:24px;text-align:center;background:var(--surface);border:1px dashed var(--border);border-radius:8px;color:var(--text-3);">'+
      '📂 No documents uploaded with this application.'+
      '</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:10px;">';

    app.files.forEach(function(f, i){
      var fname = '';
      var furl  = null;

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
      var isImg = ['jpg','jpeg','png','gif','webp'].includes(ext);
      var isPdf = ext === 'pdf';

      html +=
        '<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;">'+
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--surface);">'+
            '<span style="font-size:13px;font-weight:600;">'+ico+' '+esc(fname)+'</span>'+
            '<div style="display:flex;gap:8px;">'+
              '<a href="'+esc(furl)+'" target="_blank" style="font-size:12px;padding:5px 14px;background:var(--info-bg);color:var(--info);border:1px solid var(--info);border-radius:6px;text-decoration:none;font-weight:600;">'+
              (isImg ? '🖼️ View' : '👁 Open')+
              '</a>'+
              '<a href="'+esc(furl)+'" download="'+esc(fname)+'" style="font-size:12px;padding:5px 14px;background:var(--ok-bg);color:var(--ok);border:1px solid var(--ok);border-radius:6px;text-decoration:none;font-weight:600;">⬇ Download</a>'+
            '</div>'+
          '</div>';

      if (isImg) {
        html +=
          '<div style="padding:10px;background:#fff;text-align:center;">'+
          '<img src="'+esc(furl)+'" style="max-width:100%;max-height:350px;border-radius:6px;">'+
          '</div>';
      }

      if (isPdf) {
        html +=
          '<div style="padding:10px;background:#fff;">'+
          '<iframe src="'+esc(furl)+'" style="width:100%;height:420px;border:none;border-radius:6px;"></iframe>'+
          '</div>';
      }

      html += '</div>';
    });

    html += '</div>';
  }

  return html;
}

function field(l,v){ return '<div class="detail-field"><div class="detail-lbl">'+esc(l)+'</div><div class="detail-val">'+(v||'—')+'</div></div>'; }

/* ── CLERK ACTIONS ────────────────────────────────────────── */
function clerkAction(type) {
  var remarks = (val('clerk-remarks')||'').trim();
  if (!remarks) {
    toast('⚠️ Please write remarks before taking action.','warn');
    var el = document.getElementById('clerk-remarks');
    if (el) { el.focus(); el.style.borderColor='var(--err)'; }
    return;
  }
  var ok = type==='approve';
  set('conf-ico',   ok?'✅':'❌');
  set('conf-title', ok?'Approve & Forward to HOD?':'Reject Application?');
  set('conf-msg',   ok ? 'Application will be forwarded to HOD. Student will be notified.' : 'Application will be rejected. Student will be notified with your remarks.');
  var btn = document.getElementById('conf-btn');
  if (btn) {
    btn.className    = 'btn '+(ok?'btn-ok':'btn-err');
    btn.textContent  = ok?'✅ Confirm Approve':'❌ Confirm Reject';
    btn.disabled     = false;
    btn.dataset.type    = type;
    btn.dataset.remarks = remarks;
  }
  closeModal('modalDetail');
  openModal('modalConfirm');
}

function executeAction() {
  var btn  = document.getElementById('conf-btn');
  var type = btn ? btn.dataset.type : null;
  var rmks = btn ? btn.dataset.remarks : '';
  if (!currentAppId || !type) return;

  var ok  = type==='approve';
  var app = ALL_APPS.find(function(a){ return a.id===currentAppId; });
  if (!app) return;

  if (btn) { btn.disabled=true; btn.textContent='⏳ Processing…'; }

  function doAction() {
    secureFetch(API+(ok?'/application/clerk-approve':'/application/clerk-reject'), {
      method:'POST',
      credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ application_id: currentAppId, remarks: rmks })
    })
    .then(function(r){ return r.json(); })
    .then(function(res){
      if (res.success || res.status==='success') {
        app.status   = ok ? 'clerk_approved' : 'rejected';
        app.label    = ok ? 'Forwarded to HOD' : 'Rejected';
        app.cremarks = rmks;
        closeModal('modalConfirm');
        stats();
        ['pending','approved','rejected','all'].forEach(renderTable);
        toast(ok ? '✅ '+app.appNo+' approved and forwarded to HOD.' : '❌ '+app.appNo+' rejected.', ok?'ok':'err');
        currentAppId = null;
      } else if (res.message === 'Not logged in') {
        silentReLogin(function(loginOk){
          if (loginOk) doAction();
          else { toast('❌ Session expired. Please login again.','err'); if(btn){btn.disabled=false;btn.textContent=ok?'✅ Confirm Approve':'❌ Confirm Reject';} }
        });
      } else {
        toast('❌ '+(res.message||'Action failed.'),'err');
        if (btn) { btn.disabled=false; btn.textContent=ok?'✅ Confirm Approve':'❌ Confirm Reject'; }
      }
    })
    .catch(function(err){
      console.error(err);
      toast('❌ Network error.','err');
      if (btn) { btn.disabled=false; btn.textContent=ok?'✅ Confirm Approve':'❌ Confirm Reject'; }
    });
  }

  doAction();
}

/* ── LOGOUT ───────────────────────────────────────────────── */
function logout() {
  if (!confirm('Logout?')) return;
  fetch(API+'/auth/logout',{method:'POST',credentials:'include'}).catch(function(){});
  /* FIX: remove role-specific keys */
  localStorage.removeItem('admin_user_clerk');
  localStorage.removeItem('admin_creds_clerk');
  window.location.replace('index.html');
}

/* ── UTILS ────────────────────────────────────────────────── */
function openModal(id)  { var e=document.getElementById(id); if(e) e.classList.add('show'); }
function closeModal(id) { var e=document.getElementById(id); if(e) e.classList.remove('show'); }
function set(id,v)      { var e=document.getElementById(id); if(e) e.textContent=(v!==undefined && v!==null)?v:''; }
function val(id)        { var e=document.getElementById(id); return e?e.value:''; }
function loading(id)    { var e=document.getElementById(id); if(e) e.innerHTML='<div style="text-align:center;padding:50px;color:#6b7280;">⏳ Loading…</div>'; }

var _tw=null;
function toast(msg,type){
  if(!_tw){ _tw=document.createElement('div'); _tw.style.cssText='position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;'; document.body.appendChild(_tw); }
  var t=document.createElement('div');
  var bg={ok:'#16a34a',err:'#dc2626',warn:'#d97706'};
  t.style.cssText='background:'+(bg[type]||'#1e3a5f')+';color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.2);max-width:380px;';
  t.textContent=msg; _tw.appendChild(t);
  setTimeout(function(){ t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(function(){ if(t.parentNode)t.remove(); },320); },3500);
}
function esc(s){ return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmtDate(d){ if(!d)return'—'; var dt=new Date(d); return isNaN(dt)?d:dt.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
function dIcon(t){ var m={bonafide:'📜',character:'🎖️',transcript:'📊',noc:'📋',leaving:'🚪',tc:'🚪',provisional:'🏅',marksheet:'📝',degree:'🎓',migration:'📦',admission:'📩',idcard:'🪪',hallticket:'🎟️',feereceipt:'🧾'}; return m[(t||'').toLowerCase()]||'📄'; }
function docTitle(t){ var m={bonafide:'Bonafide Certificate',character:'Character Certificate',transcript:'Official Transcript',noc:'No Objection Certificate',leaving:'Transfer Certificate',tc:'Transfer Certificate',provisional:'Provisional Certificate',marksheet:'Mark Sheet',degree:'Degree Certificate',migration:'Migration Certificate',admission:'Admission Letter',idcard:'ID Card',hallticket:'Hall Ticket',feereceipt:'Fee Receipt'}; return m[(t||'').toLowerCase()]||(t?t.charAt(0).toUpperCase()+t.slice(1).replace(/_/g,' '):'Document'); }
function badge(s){ var m={pending:'badge-pending',clerk_approved:'badge-clerk',hod_approved:'badge-hod',approved:'badge-ok',rejected:'badge-err'}; return m[s]||'badge-pending'; }