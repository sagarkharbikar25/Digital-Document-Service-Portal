/* ================================================
   bonafide.js — Bonafide Certificate Application Logic
   JDCOEM Digital Document Services Portal
   Connected to Backend API

   Upload Flow:
     Step 1 → POST /api/application/create        (JSON)
              ← { success, application_id, application_number }
     Step 2 → POST /api/documents/upload           (FormData)
              Fields: application_id, document_type, file
              ← { success, message, file_name }
     Step 3 → Show success modal
   ================================================ */

const API_BASE = window.location.origin + window.location.pathname.split('/').slice(0, -2).join('/') + '/api';
const uploadedFiles = {};

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
        body: JSON.stringify({ notification_id: parseInt(id, 10) })
    }).then(() => loadNotifications());
}

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', function () {
    const raw = localStorage.getItem('user');
    if (!raw) { window.location.href = 'login.html'; return; }

    /* Fill from localStorage immediately (no flicker) */
    const u = JSON.parse(raw);
    renderUser(u);

    /* Verify session + refresh user data from backend */
    fetch(API_BASE + '/auth/me', { credentials: 'include' })
        .then(function (r) {
            if (!r.ok) throw new Error('Session check failed');
            return r.json();
        })
        .then(function (res) {
            if (!res.success && !res.user) {
                localStorage.clear();
                window.location.href = 'login.html';
                return;
            }
            if (res.user) {
                const merged = Object.assign(JSON.parse(localStorage.getItem('user') || '{}'), res.user);
                localStorage.setItem('user', JSON.stringify(merged));
                renderUser(merged);
            }
        })
        .catch(function (err) {
            console.warn('Auth check failed:', err);
            /* Keep localStorage data — page still usable */
        });

    document.getElementById('dot-info').classList.add('ok');

    /* Declaration checkbox listener */
    const cb = document.getElementById('declCheck');
    if (cb) cb.addEventListener('change', function () { setDot('decl', cb.checked); });

    loadNotifications();
    loadSidebarBadge();

    // Global click listener for dropdowns
    document.addEventListener('click', function(e) {
        const notifDropdown = document.getElementById('notifDropdown');
        const notifBtn = document.querySelector('.notif-btn');
        if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
            notifDropdown.classList.remove('open');
        }
    });
});

/* ══════════════════════════════════════════════
   FILL PROFILE FIELDS
══════════════════════════════════════════════ */
function renderUser(u) {
    const name     = u.name         || u.full_name    || u.bt_id || 'Student';
    const btid     = u.bt_id        || u.btid         || u.student_id   || u.email || '--';
    const branch   = u.branch       || u.department   || '';
    const year     = u.year         || u.current_year || '';
    const email    = u.email        || '--';
    const initials = name.split(' ').filter(Boolean)
                         .map(function (n) { return n[0]; })
                         .join('').substring(0, 2).toUpperCase();

    /* Header */
    safeSet('userInitials', initials);
    safeSet('userName',     name);
    safeSet('userId',       btid);

    /* Read-only auto-filled fields in form */
    safeSet('sName',  name);
    safeSet('sBtid',  btid);
    safeSet('sEmail', email);

    /* Editable fields — only set if student hasn't filled them yet */
    const branchEl = document.getElementById('sBranch');
    const yearEl   = document.getElementById('sYear');
    if (branchEl && !branchEl.value) branchEl.value = branch;
    if (yearEl   && !yearEl.value)   yearEl.value   = year;
}

/* ══════════════════════════════════════════════
   SIDEBAR BADGE
══════════════════════════════════════════════ */
function loadSidebarBadge() {
    fetch(API_BASE + '/application/my', { credentials: 'include' })
        .then(function (r) { return r.json(); })
        .then(function (res) {
            if (res.success && res.data) {
                const badge = document.getElementById('sideAppBadge');
                if (badge) {
                    badge.textContent = res.data.length;
                    badge.style.display = res.data.length > 0 ? 'block' : 'none';
                }
            }
        })
        .catch(function () {}); /* silent — badge stays as-is */
}

/* ══════════════════════════════════════════════
   DRAG & DROP
══════════════════════════════════════════════ */
function onDragOver(e, id) {
    e.preventDefault();
    document.getElementById('dz-' + id).classList.add('dragover');
}
function onDragLeave(id) {
    document.getElementById('dz-' + id).classList.remove('dragover');
}
function onDrop(e, id, maxMB, types) {
    e.preventDefault();
    onDragLeave(id);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0], id, maxMB, types);
}
function onFileInput(input, id, maxMB, types) {
    if (input.files[0]) processFile(input.files[0], id, maxMB, types);
}

/* ══════════════════════════════════════════════
   FILE PROCESSING — validate then store in memory
══════════════════════════════════════════════ */
function processFile(file, id, maxMB, types) {
    const errEl = document.getElementById('fe-' + id);
    errEl.classList.remove('show');
    errEl.textContent = '';

    if (file.size > maxMB * 1024 * 1024) {
        errEl.textContent = '⚠ File too large. Maximum allowed size is ' + maxMB + 'MB.';
        errEl.classList.add('show');
        return;
    }
    if (types && types.length && !types.includes(file.type)) {
        const readable = types.map(function (t) {
            return t.replace('image/', '').replace('application/', '').toUpperCase();
        }).join(', ');
        errEl.textContent = '⚠ Invalid file type. Allowed: ' + readable;
        errEl.classList.add('show');
        return;
    }

    uploadedFiles[id] = file;
    showPreview(id, file);
    markChecklist(id, true);
    updateReadiness();
}

function showPreview(id, file) {
    const dz  = document.getElementById('dz-' + id);
    const dzd = document.getElementById('dzd-' + id);
    dz.classList.add('has-file');
    dzd.style.display = 'none';

    if (id === 'photo') {
        const wrap   = document.getElementById('pp-photo');
        const img    = document.getElementById('pp-img-photo');
        const reader = new FileReader();
        reader.onload = function (e) { img.src = e.target.result; };
        reader.readAsDataURL(file);
        document.getElementById('pp-name-photo').textContent = file.name.length > 28 ? file.name.substring(0, 26) + '…' : file.name;
        document.getElementById('pp-size-photo').textContent = (file.size / 1024).toFixed(1) + ' KB';
        wrap.classList.add('show');
    } else {
        const row   = document.getElementById('fp-' + id);
        const icons = { 'application/pdf': '📕', 'image/jpeg': '🖼️', 'image/png': '🖼️' };
        document.getElementById('fpi-' + id).textContent = icons[file.type] || '📄';
        document.getElementById('fpn-' + id).textContent = file.name.length > 30 ? file.name.substring(0, 28) + '…' : file.name;
        document.getElementById('fps-' + id).textContent = (file.size / 1024).toFixed(1) + ' KB';
        row.classList.add('show');
    }
}

function removeFile(id, e) {
    e.stopPropagation();
    delete uploadedFiles[id];

    const dz  = document.getElementById('dz-' + id);
    const dzd = document.getElementById('dzd-' + id);
    dz.classList.remove('has-file');
    dzd.style.display = '';

    if (id === 'photo') {
        document.getElementById('pp-photo').classList.remove('show');
    } else {
        document.getElementById('fp-' + id).classList.remove('show');
    }

    markChecklist(id, false);
    updateReadiness();
}

function markChecklist(id, done) {
    const item  = document.getElementById('req-' + id);
    const check = document.getElementById('check-' + id);
    if (!item || !check) return;
    if (done) { item.classList.add('complete');    check.textContent = '✓'; }
    else      { item.classList.remove('complete'); check.textContent = '○'; }
}

/* ══════════════════════════════════════════════
   PURPOSE
══════════════════════════════════════════════ */
function setPurpose(text) {
    document.getElementById('purpose').value = text;
    onPurposeInput();
}
function onPurposeInput() {
    const v = document.getElementById('purpose').value;
    document.getElementById('charCount').textContent = v.length;
    setDot('purpose', v.trim().length >= 10);
}

/* ══════════════════════════════════════════════
   DECLARATION
══════════════════════════════════════════════ */
function toggleDecl() {
    const cb = document.getElementById('declCheck');
    setDot('decl', cb.checked);
}

/* ══════════════════════════════════════════════
   READINESS DOTS
══════════════════════════════════════════════ */
function setDot(id, ok) {
    const d = document.getElementById('dot-' + id);
    if (!d) return;
    d.classList.toggle('ok',  !!ok);
    d.classList.toggle('bad', !ok);
}
function updateReadiness() {
    setDot('photo', !!uploadedFiles['photo']);
    setDot('fee',   !!uploadedFiles['fee']);
}

/* ══════════════════════════════════════════════
   UPLOAD A SINGLE DOCUMENT TO BACKEND
   ─────────────────────────────────────────────
   POST /api/documents/upload
   FormData fields the backend reads:
     application_id  → integer  (from /application/create response)
     document_type   → string   e.g. "passport_photo", "fee_receipt"
                        ↑ matches saveDocument($appId, $type, $fileName)
     file            → File     (backend reads via $_FILES['file'])
   ─────────────────────────────────────────────
   Returns a Promise that always resolves (never rejects)
   so one failed upload doesn't block the whole submission.
══════════════════════════════════════════════ */
function uploadDocument(file, documentType, applicationId) {
    return new Promise(function (resolve) {
        const fd = new FormData();
        fd.append('application_id', applicationId);  /* integer ID */
        fd.append('document_type',  documentType);   /* ← FIXED: was "document_name" */
        fd.append('file',           file);            /* backend: $_FILES['file']     */

        /* DO NOT set Content-Type manually — browser sets multipart boundary */
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
            /* Network error — resolve so Promise.all doesn't reject */
            console.warn('[Upload] ❌ Network error for ' + documentType + ':', err.message);
            resolve({ success: false, error: err.message });
        });
    });
}

/* ══════════════════════════════════════════════
   SUBMIT FORM
══════════════════════════════════════════════ */
function submitForm() {

    /* ── Collect field values ── */
    const branch  = document.getElementById('sBranch').value;
    const year    = document.getElementById('sYear').value;
    const sem     = document.getElementById('semester').value;
    const mobile  = document.getElementById('mobile').value.trim();
    const parent  = document.getElementById('parentName').value.trim();
    const admYr   = document.getElementById('admissionYear').value;
    const cat     = document.getElementById('category').value;
    const purpose = document.getElementById('purpose').value.trim();
    const decl    = document.getElementById('declCheck').checked;
    const acadYr  = document.getElementById('academic-year').value.trim();

    /* ── Validate ── */
    const errors = [];
    if (!branch)                                               errors.push('Please select your department / branch.');
    if (!year)                                                 errors.push('Please select your current year.');
    if (!sem)                                                  errors.push('Please select your current semester.');
    if (!mobile || mobile.length !== 10 || !/^\d+$/.test(mobile)) errors.push('Please enter a valid 10-digit mobile number.');
    if (!parent)                                               errors.push('Please enter parent / guardian name.');
    if (!admYr)                                                errors.push('Please select your admission year.');
    if (!cat)                                                  errors.push('Please select your category.');
    if (!uploadedFiles['photo'])                               errors.push('Please upload your passport size photograph.');
    if (!uploadedFiles['fee'])                                 errors.push('Please upload your fee receipt.');
    if (purpose.length < 10)                                   errors.push('Please provide a reason (min. 10 characters).');
    if (!decl)                                                 errors.push('Please accept the declaration before submitting.');

    /* Update readiness dots */
    setDot('photo',   !!uploadedFiles['photo']);
    setDot('fee',     !!uploadedFiles['fee']);
    setDot('purpose', purpose.length >= 10);
    setDot('decl',    decl);

    if (errors.length > 0) {
        const extra = errors.length > 1
            ? '  (+' + (errors.length - 1) + ' more issue' + (errors.length > 2 ? 's' : '') + ')'
            : '';
        showAlert(errors[0] + extra);
        return;
    }
    hideAlert();

    /* ── Loading state ── */
    const submitBtn  = document.querySelector('.btn-primary');
    const origLabel  = submitBtn.textContent;
    submitBtn.textContent = '⏳ Submitting…';
    submitBtn.disabled    = true;

    /* ════════════════════════════════════════════
       STEP 1 — Create application record (JSON)
       Endpoint: POST /api/application/create
       Returns:  { success, application_id, application_number }
    ════════════════════════════════════════════ */
    fetch(API_BASE + '/application/create', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            certificate_type: 'bonafide',
            purpose:          purpose,
            branch:           branch,
            current_year:     year,
            semester:         sem,
            mobile:           mobile,
            parent_name:      parent,
            admission_year:   admYr,
            category:         cat,
            academic_year:    acadYr
        })
    })
    .then(function (r) {
        if (!r.ok) throw new Error('Server error ' + r.status);
        return r.json();
    })
    .then(function (res) {
        if (!res.success) {
            throw new Error(res.message || 'Submission failed. Please try again.');
        }

        const appNumber = res.application_number || ('APP-' + Date.now());
        const appId     = res.application_id || res.id;

        if (!appId) throw new Error('Application ID missing from server response.');

        console.log('[Bonafide] ✅ Application created | Number:', appNumber, '| ID:', appId);

        /* ════════════════════════════════════════
           STEP 2 — Upload documents
           Each file → POST /api/documents/upload
           FormData: application_id, document_type, file

           document_type values sent:
             "passport_photo"  → student's photo
             "fee_receipt"     → fee receipt PDF/image

           These are stored in application_documents table:
             saveDocument($appId, $type, $fileName)
             → clerk sees them in Review modal

           Using Promise.all so both upload in parallel.
           We always resolve (never throw) so one failed
           upload doesn't block showing the success modal.
        ════════════════════════════════════════ */
        const uploads = [];

        if (uploadedFiles['photo']) {
            uploads.push(uploadDocument(uploadedFiles['photo'], 'passport_photo', appId));
        }
        if (uploadedFiles['fee']) {
            uploads.push(uploadDocument(uploadedFiles['fee'], 'fee_receipt', appId));
        }

        return Promise.all(uploads).then(function (results) {
            /* Log any failed uploads but don't block success */
            const failed = results.filter(function (r) { return r && !r.success; });
            if (failed.length > 0) {
                console.warn('[Bonafide] ' + failed.length + ' document(s) failed to upload.');
            }
            return appNumber;
        });
    })
    .then(function (appNumber) {

        /* ════════════════════════════════════════
           STEP 3 — Show success
        ════════════════════════════════════════ */
        submitBtn.textContent = origLabel;
        submitBtn.disabled    = false;

        /* Save to localStorage so home.html track widget shows this app */
        try {
            const apps = JSON.parse(localStorage.getItem('applications') || '[]');
            apps.unshift({
                id:             appNumber,
                docType:        'bonafide',
                docTitle:       'Bonafide Certificate',
                purpose:        purpose,
                date:           new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                status:         'Pending',
                processingTime: '2 Working Days'
            });
            localStorage.setItem('applications', JSON.stringify(apps));
        } catch (e) { /* non-critical */ }

        /* Show success modal */
        document.getElementById('modalAppId').textContent = appNumber;
        document.getElementById('successModal').classList.add('open');
    })
    .catch(function (err) {
        submitBtn.textContent = origLabel;
        submitBtn.disabled    = false;
        showAlert('❌ ' + (err.message || 'Network error. Please check your connection and try again.'));
        console.error('[Bonafide] Submit error:', err);
    });
}

/* ══════════════════════════════════════════════
   LOGOUT
══════════════════════════════════════════════ */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'include' })
            .finally(function () {
                localStorage.clear();
                window.location.href = 'login.html';
            });
    }
}

/* ══════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════ */
function showAlert(msg) {
    const al = document.getElementById('formAlert');
    document.getElementById('formAlertMsg').textContent = msg;
    al.classList.add('show');
    al.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function hideAlert() {
    document.getElementById('formAlert').classList.remove('show');
}