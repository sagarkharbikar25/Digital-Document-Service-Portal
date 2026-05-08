/* ─── STATE ──────────────────────────────────────────────────────────────── */
var state = {
  reqType: 'new',
  reason:  'new_admission',
  uploads: {},
  decl:    false,
  step:    1
};

var TYPE_LABELS = {
  new:         'New Identity Card',
  duplicate:   'Duplicate Identity Card',
  replacement: 'Replacement (Damaged Card)',
  correction:  'Correction in Details'
};

var REASON_LABELS = {
  new_admission: 'New Admission',
  lost:          'Lost ID Card',
  damaged:       'Damaged / Unreadable Card',
  correction:    'Correction in Details'
};

const API_BASE = window.location.origin + window.location.pathname.split('/').slice(0, -2).join('/') + '/api';

/* ── HELPERS ── */
function safeSet(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff/60) + 'm ago';
    if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
    return d.toLocaleDateString('en-IN', {day:'2-digit', month:'short'});
}

/* ── NOTIFICATIONS ── */
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
            const icon = n.type === 'status' ? '🔔' : '📅';
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
    const d = document.getElementById('notifDropdown');
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
        body: JSON.stringify({ notification_id: id })
    }).then(() => loadNotifications());
}

function renderUser(u) {
    var name     = u.name || u.full_name || u.bt_id || 'Student';
    var btid     = u.bt_id || u.btid || u.student_id || u.email || '--';
    var initials = name.split(' ').filter(Boolean).map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();

    safeSet('userInitials', initials);
    safeSet('userName',     name);
    safeSet('userId',       btid);
}

/* ─── INIT ───────────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', function () {
  try {
    var raw = localStorage.getItem('user');
    if (!raw) { window.location.href = 'login.html'; return; }

    var u = JSON.parse(raw);
    
    // 1. Initial render
    renderUser(u);
    loadNotifications();

    // 2. Verify Session
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
    });

    // 3. Load application count for sidebar
    fetch(API_BASE + '/application/my', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        const apps = res.data || (Array.isArray(res) ? res : []);
        const sideBadge = document.getElementById('sideAppBadge');
        if (sideBadge) {
            sideBadge.textContent = apps.length;
            sideBadge.style.display = apps.length > 0 ? 'block' : 'none';
        }
    });

    // 4. Global click listener for dropdowns
    document.addEventListener('click', function(e) {
        const notifDropdown = document.getElementById('notifDropdown');
        const notifBtn = document.querySelector('.notif-btn');
        if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
            notifDropdown.classList.remove('open');
        }
    });

    // Student info fields
    setText('f-name',   u.name   || '—');
    setText('f-roll',   u.roll_number || u.bt_id || u.btid  || '—');
    setText('f-btid',   u.bt_id || u.btid   || '—');
    setText('f-dept',   u.branch || u.department  || '—');
    setText('f-year',   u.year   || u.current_year || '—');
    setText('f-email',  u.email  || '—');
    setText('f-mobile', u.mobile || u.phone || '—');

    // ID card preview
    setText('preview-name', u.name   || 'Student Name');
    setText('preview-btid', u.bt_id  || u.btid || 'BT00CS000');
    setText('preview-dept', u.branch || u.department || '—');
    setText('preview-year', u.year   || u.current_year || '—');
  } catch (e) {
    console.warn('Init error:', e);
  }

  updateProgress();
});

/* ─── UTILITY ────────────────────────────────────────────────────────────── */
function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ─── OPTION SELECTION ───────────────────────────────────────────────────── */
function selectOption(key, val, el) {
  state[key] = val;

  // Deselect all siblings
  var gridId = (key === 'reqType') ? 'reqTypeGrid' : 'reasonGrid';
  var grid   = document.getElementById(gridId);
  if (grid) {
    grid.querySelectorAll('.opt-card').forEach(function (c) {
      c.classList.remove('selected');
    });
  }
  if (el) el.classList.add('selected');

  updateProgress();
}

/* ─── FIR VISIBILITY ─────────────────────────────────────────────────────── */
function updateFIRVisibility() {
  var isLost  = (state.reason === 'lost');
  var notice  = document.getElementById('fir-notice');
  var firRow  = document.getElementById('fir-row');

  if (notice) notice.classList.toggle('show', isLost);
  if (firRow) firRow.classList.toggle('show', isLost);

  // Clear FIR upload state when no longer needed
  if (!isLost) {
    delete state.uploads['fir'];
    resetUploadUI('fir');
  }

  updateProgress();
}

/* ─── FILE UPLOAD ────────────────────────────────────────────────────────── */
function trigUp(id) {
  var inp = document.getElementById('file-' + id);
  if (inp) inp.click();
}

function handleUpload(id, input, maxMB, allowedExts) {
  var file = input.files && input.files[0];
  if (!file) return;

  var ext = file.name.split('.').pop().toLowerCase();

  if (allowedExts.indexOf(ext) === -1) {
    alert('Invalid file type. Allowed: ' + allowedExts.join(', ').toUpperCase());
    input.value = '';
    return;
  }
  if (file.size > maxMB * 1024 * 1024) {
    alert('File too large. Maximum size is ' + maxMB + ' MB.');
    input.value = '';
    return;
  }

  /* Store the actual File object (not just metadata) for upload */
  state.uploads[id] = { name: file.name, size: file.size, file: file };

  // Update upload item UI
  var item  = document.getElementById('up-' + id);
  var sub   = document.getElementById('up-sub-' + id);
  var badge = document.getElementById('up-badge-' + id);
  var btn   = document.getElementById('up-btn-' + id);

  if (item)  item.classList.add('done');
  if (sub)   sub.textContent = '\u2713 ' + file.name;
  if (badge) { badge.className = 'up-badge badge-done'; badge.textContent = 'Uploaded'; }
  if (btn)   btn.textContent = 'Change';

  // Live photo preview on ID card
  if (id === 'photo') {
    var reader = new FileReader();
    reader.onload = function (e) {
      var slot = document.getElementById('previewPhotoSlot');
      if (slot) {
        slot.classList.add('has-photo');
        slot.innerHTML = '<img src="' + e.target.result + '" alt="Photo">';
      }
    };
    reader.readAsDataURL(file);
  }

  updateProgress();
}

function resetUploadUI(id) {
  var item  = document.getElementById('up-' + id);
  if (!item) return;

  item.classList.remove('done', 'error-state');

  var origSubs = {
    photo: 'Recent, white background, formal attire – JPG or PNG',
    fee:   'Original or scanned copy of current academic year fee receipt',
    fir:   'First Information Report from the nearest police station'
  };

  var sub   = document.getElementById('up-sub-' + id);
  var badge = document.getElementById('up-badge-' + id);
  var btn   = document.getElementById('up-btn-' + id);
  var inp   = document.getElementById('file-' + id);

  if (sub)   sub.textContent = origSubs[id] || '';
  if (badge) { badge.className = 'up-badge badge-req'; badge.textContent = 'Required'; }
  if (btn)   btn.textContent = 'Upload';
  if (inp)   inp.value = '';
}

/* ─── STEP NAVIGATION ────────────────────────────────────────────────────── */
function goStep(n) {
  document.getElementById('step1').style.display = (n === 1) ? '' : 'none';
  document.getElementById('step2').style.display = (n === 2) ? '' : 'none';
  document.getElementById('step3').style.display = (n === 3) ? '' : 'none';

  state.step = n;
  updateStepper(n);
  if (n === 3) buildReview();
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepper(n) {
  for (var i = 1; i <= 3; i++) {
    var sc = document.getElementById('sc' + i);
    var st = document.getElementById('st' + i);
    var sl = document.getElementById('sl' + i);
    if (!sc) continue;

    if (i < n) {
      sc.className    = 'stp-circle done';
      sc.textContent  = '\u2713';
      if (sl) sl.className = 'stp-line done';
    } else if (i === n) {
      sc.className    = 'stp-circle active';
      sc.textContent  = String(i);
      if (st) st.className = 'stp-title act';
    } else {
      sc.className    = 'stp-circle pending';
      sc.textContent  = String(i);
      if (st) st.className = 'stp-title';
    }
  }
}

/* ─── DECLARATION ────────────────────────────────────────────────────────── */
function toggleDecl() {
  var cb = document.getElementById('decl1');
  if (cb) {
    cb.checked  = !cb.checked;
    state.decl  = cb.checked;
    updateProgress();
  }
}

/* ─── PROGRESS ───────────────────────────────────────────────────────────── */
function updateProgress() {
  var reqTypeOk = !!state.reqType;
  var reasonOk  = !!state.reason;
  var photoOk   = !!state.uploads['photo'];
  var feeOk     = !!state.uploads['fee'];
  var firNeeded = (state.reason === 'lost');
  var firOk     = !firNeeded || !!state.uploads['fir'];
  var cb        = document.getElementById('decl1');
  var declOk    = cb && cb.checked;

  setChk('ck1', 'cl1', reqTypeOk, 'Request type selected');
  setChk('ck2', 'cl2', reasonOk,  'Reason selected');
  setChk('ck3', 'cl3', photoOk,   'Photo uploaded');
  setChk('ck4', 'cl4', feeOk,     (firNeeded && !firOk) ? 'Fee receipt &amp; FIR needed' : 'Fee receipt uploaded');
  setChk('ck5', 'cl5', declOk,    'Declaration signed');

  var score = (reqTypeOk ? 20 : 0)
            + (reasonOk  ? 10 : 0)
            + (photoOk   ? 20 : 0)
            + (feeOk     ? 15 : 0)
            + (firNeeded ? (firOk ? 15 : 0) : 15)
            + (declOk    ? 20 : 0);
  score = Math.min(score, 100);

  // Update ring
  var C    = 138.2;
  var fill = document.getElementById('ringFill');
  if (fill) fill.setAttribute('stroke-dashoffset', String(C - C * score / 100));
  var pct = document.getElementById('ringPct');
  if (pct) pct.textContent = score + '%';

  // Update title
  var titles = ['Not Started', 'In Progress', 'Almost There', 'Ready to Submit!'];
  var ti  = (score === 100) ? 3 : (score >= 60) ? 2 : (score >= 20) ? 1 : 0;
  var ttl = document.getElementById('progTitle');
  var sub = document.getElementById('progSub');
  if (ttl) ttl.textContent = titles[ti];
  if (sub) sub.textContent = (score === 100) ? 'All requirements met' : score + '% complete';
}

function setChk(dotId, lblId, done, text) {
  var d = document.getElementById(dotId);
  var l = document.getElementById(lblId);
  if (!d || !l) return;
  d.className   = 'chk-dot ' + (done ? 'done' : 'pend');
  d.textContent = done ? '\u2713' : '';
  l.className   = 'chk-lbl ' + (done ? 'done' : 'pend');
  l.innerHTML   = text;
}

/* ─── BUILD REVIEW ───────────────────────────────────────────────────────── */
function buildReview() {
  var user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch (e) {}

  setText('rv-name',   user.name              || '—');
  setText('rv-btid',   user.btid              || '—');
  setText('rv-dept',   user.branch || user.dept || '—');
  setText('rv-year',   user.year              || '—');
  setText('rv-type',   TYPE_LABELS[state.reqType]   || '—');
  setText('rv-reason', REASON_LABELS[state.reason]  || '—');

  // Build docs review list
  var wrap = document.getElementById('rv-docs');
  if (!wrap) return;

  var docs = [
    { key: 'photo', label: 'Passport-Size Photograph',            req: true },
    { key: 'fee',   label: 'College Fee Receipt (Current Year)',   req: true },
    { key: 'fir',   label: 'FIR Copy',                            req: state.reason === 'lost' }
  ];

  wrap.innerHTML = '';

  docs.forEach(function (d) {
    if (!d.req && !state.uploads[d.key]) return;

    var isUp  = !!state.uploads[d.key];
    var fname = isUp ? state.uploads[d.key].name : (d.req ? 'MISSING' : 'Not uploaded');
    var fshort = fname.length > 28 ? fname.substring(0, 26) + '...' : fname;
    var ico   = isUp ? '\u2705' : '\u274c';
    var clr   = isUp ? 'var(--ok)' : 'var(--err)';
    var bg    = isUp ? 'var(--ok-bg)' : 'var(--err-bg)';
    var bd    = isUp ? 'var(--ok-bd)' : 'var(--err-bd)';

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 12px;'
                      + 'border-radius:var(--rl);margin-bottom:7px;'
                      + 'background:' + bg + ';border:1px solid ' + bd + ';';
    row.innerHTML =
      '<span style="font-size:15px;">' + ico + '</span>' +
      '<span style="flex:1;font-size:12.5px;font-weight:600;color:' + clr + ';">' + d.label + '</span>' +
      '<span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;' +
        'background:' + bg + ';color:' + clr + ';">' + fshort + '</span>';

    wrap.appendChild(row);
  });
}

/* ─── UPLOAD A SINGLE DOCUMENT TO BACKEND ───────────────────────────────── */
/* Mirrors bonafide.js uploadDocument() exactly.
   POST /api/documents/upload
   FormData: application_id, document_type, file               */
function uploadDocument(file, documentType, applicationId) {
  return new Promise(function (resolve) {
    var fd = new FormData();
    fd.append('application_id', applicationId);
    fd.append('document_type',  documentType);
    fd.append('file',           file);

    fetch(API_BASE + '/documents/upload', {
      method:      'POST',
      credentials: 'include',
      body:        fd
    })
    .then(function (r) {
      if (!r.ok) {
        console.warn('[Upload] HTTP ' + r.status + ' for ' + documentType);
        resolve({ success: false, httpStatus: r.status });
        return;
      }
      return r.json();
    })
    .then(function (res) {
      if (!res) return;
      if (res.success) {
        console.log('[Upload] ✅ ' + documentType + ' saved → ' + (res.file_name || ''));
      } else {
        console.warn('[Upload] ⚠ ' + documentType + ' rejected:', res.message);
      }
      resolve(res);
    })
    .catch(function (err) {
      console.warn('[Upload] ❌ Network error for ' + documentType + ':', err.message);
      resolve({ success: false, error: err.message });
    });
  });
}

/* ─── SUBMIT ─────────────────────────────────────────────────────────────── */
/* FIX: replaced fake localStorage-only submitApp() with real API flow
   matching bonafide.js exactly:
     Step 1 → POST /api/application/create (JSON)
     Step 2 → POST /api/documents/upload   (FormData, one call per file)
     Step 3 → Show success modal with real APP number from server        */
function submitApp() {
  var cb = document.getElementById('decl1');
  if (!cb || !cb.checked) {
    alert('Please confirm the declaration before submitting.');
    return;
  }
  if (!state.uploads['photo']) {
    alert('Passport-size photograph is required. Please upload it in Step 2.');
    return;
  }
  if (!state.uploads['fee']) {
    alert('Fee receipt is required. Please upload it in Step 2.');
    return;
  }
  if (state.reason === 'lost' && !state.uploads['fir']) {
    alert('FIR copy is mandatory for lost ID card requests. Please upload it in Step 2.');
    return;
  }

  /* Disable submit button */
  var submitBtn = document.querySelector('.stp-submit-btn') || document.querySelector('[onclick*="submitApp"]');
  var origLabel = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) { submitBtn.textContent = '⏳ Submitting…'; submitBtn.disabled = true; }

  /* ── STEP 1: Create application record ── */
  fetch(API_BASE + '/application/create', {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      certificate_type: 'idcard',
      admType:          'idcard',
      purpose:          TYPE_LABELS[state.reqType] + ' — ' + REASON_LABELS[state.reason],
      request_type:     state.reqType,
      reason:           state.reason
    })
  })
  .then(function (r) {
    if (!r.ok) throw new Error('Server error ' + r.status);
    return r.json();
  })
  .then(function (res) {
    if (!res.success) throw new Error(res.message || 'Submission failed. Please try again.');

    var appNumber = res.application_number || ('APP-' + Date.now());
    var appId     = res.application_id || res.id;

    if (!appId) throw new Error('Application ID missing from server response.');

    console.log('[IDCard] ✅ Application created | Number:', appNumber, '| ID:', appId);

    /* ── STEP 2: Upload documents in parallel ── */
    var uploads = [];

    if (state.uploads['photo'] && state.uploads['photo'].file) {
      uploads.push(uploadDocument(state.uploads['photo'].file, 'passport_photo', appId));
    }
    if (state.uploads['fee'] && state.uploads['fee'].file) {
      uploads.push(uploadDocument(state.uploads['fee'].file, 'fee_receipt', appId));
    }
    if (state.uploads['fir'] && state.uploads['fir'].file) {
      uploads.push(uploadDocument(state.uploads['fir'].file, 'fir_copy', appId));
    }

    return Promise.all(uploads).then(function (results) {
      var failed = results.filter(function (r) { return r && !r.success; });
      if (failed.length > 0) {
        console.warn('[IDCard] ' + failed.length + ' document(s) failed to upload.');
      }
      return appNumber;
    });
  })
  .then(function (appNumber) {

    /* ── STEP 3: Show success ── */
    if (submitBtn) { submitBtn.textContent = origLabel; submitBtn.disabled = false; }

    /* Save to localStorage for home.html track widget */
    try {
      var apps = JSON.parse(localStorage.getItem('applications') || '[]');
      apps.unshift({
        id:             appNumber,
        docType:        'idcard',
        docTitle:       'Identity Card',
        purpose:        TYPE_LABELS[state.reqType] + ' — ' + REASON_LABELS[state.reason],
        date:           new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        status:         'Pending',
        processingTime: '2–3 Working Days'
      });
      localStorage.setItem('applications', JSON.stringify(apps));
    } catch (e) { /* non-critical */ }

    /* Show success modal */
    setText('modalAppId', appNumber);
    var modal = document.getElementById('successModal');
    if (modal) modal.classList.add('show');
  })
  .catch(function (err) {
    if (submitBtn) { submitBtn.textContent = origLabel; submitBtn.disabled = false; }
    alert('❌ ' + (err.message || 'Network error. Please check your connection and try again.'));
    console.error('[IDCard] Submit error:', err);
  });
}

/* ─── MODAL ──────────────────────────────────────────────────────────────── */
function closeModal(e) {
  var modal = document.getElementById('successModal');
  if (modal && e.target === modal) modal.classList.remove('show');
}

/* ─── LOGOUT ─────────────────────────────────────────────────────────────── */
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    fetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'include' })
      .finally(function () {
        localStorage.clear();
        window.location.href = 'login.html';
      });
  }
}