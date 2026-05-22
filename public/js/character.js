/* ================================================
   character.js — Character Certificate Application
   JDCOEM Digital Document Services Portal
   Connected to Backend API
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
function markRead(id) {
    secureFetch(API_BASE + '/notifications/read', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: id })
    }).then(() => loadNotifications());
}
function toggleNotif() {
    const d = document.getElementById('notifDropdown');
    if (d) d.classList.toggle('open');
}

/* ── INIT ──────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', function () {
    const raw = localStorage.getItem('user');
    if (!raw) { window.location.href = 'login.html'; return; }

    const u = JSON.parse(raw);
    renderUser(u);
    loadNotifications();

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

    // Sidebar count
    secureFetch(API_BASE + '/application/my', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        const apps = res.data || (Array.isArray(res) ? res : []);
        const chip = document.getElementById('sideAppBadge');
        if (chip) {
            chip.textContent = apps.length;
            chip.style.display = apps.length > 0 ? 'block' : 'none';
        }
    });

    // Declaration listener
    const cb = document.getElementById('declCheck');
    if (cb) cb.addEventListener('change', function() { setDot('decl', cb.checked); });

    // Global click listener for dropdowns
    document.addEventListener('click', function(e) {
        const notifDropdown = document.getElementById('notifDropdown');
        const notifBtn = document.querySelector('.notif-btn');
        if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
            notifDropdown.classList.remove('open');
        }
    });
});

/* ── RENDER USER ───────────────────────────────── */
function renderUser(u) {
    const name = u.name || u.full_name || u.bt_id || 'Student';
    const btid = u.bt_id || u.btid || u.student_id || '--';
    const email = u.email || '--';
    const branch = u.branch || u.department || '';
    const year = u.year || u.current_year || '';
    const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();

    safeSet('userInitials', initials);
    safeSet('userName',     name);
    safeSet('userId',       btid);
    
    // Auto-filled read-only fields
    safeSet('sName',  name);
    safeSet('sBtid',  btid);
    safeSet('sEmail', email);

    const branchEl = document.getElementById('sBranch');
    const yearEl   = document.getElementById('sYear');
    if (branchEl && !branchEl.value) branchEl.value = branch;
    if (yearEl   && !yearEl.value)   yearEl.value   = year;
}

/* ── SIDEBAR BADGE ──────────────────────────────── */
function loadSidebarBadge() {
    secureFetch(API_BASE + '/application/my', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (res.success && res.data) {
                var badge = document.getElementById('sideAppBadge');
                if (badge) {
                    badge.textContent = res.data.length;
                    badge.style.display = res.data.length > 0 ? 'block' : 'none';
                }
            }
        })
        .catch(function() {});
}

/* ── PURPOSE CHANGE ─────────────────────────────── */
function onPurposeChange() {
    var val  = document.getElementById('purpose').value;
    var wrap = document.getElementById('otherPurposeWrap');
    wrap.style.display = (val === 'other') ? 'block' : 'none';
    setDot('purpose', val !== '');
}

/* ── DRAG & DROP ────────────────────────────────── */
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

/* ── FILE PROCESSING ────────────────────────────── */
function processFile(file, id, maxMB, types) {
    var errEl = document.getElementById('fe-' + id);
    errEl.classList.remove('show');
    errEl.textContent = '';

    if (file.size > maxMB * 1024 * 1024) {
        errEl.textContent = '⚠ File too large. Maximum allowed size is ' + maxMB + 'MB.';
        errEl.classList.add('show');
        return;
    }
    if (types && !types.includes(file.type)) {
        var readable = types.map(function(t){
            return t.replace('image/','').replace('application/','').toUpperCase();
        }).join(', ');
        errEl.textContent = '⚠ Invalid file type. Allowed: ' + readable;
        errEl.classList.add('show');
        return;
    }

    uploadedFiles[id] = file;
    showPreview(id, file);
    updateReadiness();
}

function showPreview(id, file) {
    var dz  = document.getElementById('dz-' + id);
    var dzd = document.getElementById('dzd-' + id);
    dz.classList.add('has-file');
    dzd.style.display = 'none';

    if (id === 'photo') {
        var wrap   = document.getElementById('pp-photo');
        var img    = document.getElementById('pp-img-photo');
        var reader = new FileReader();
        reader.onload = function(e) { img.src = e.target.result; };
        reader.readAsDataURL(file);
        document.getElementById('pp-name-photo').textContent = file.name.length > 28 ? file.name.substring(0,26)+'…' : file.name;
        document.getElementById('pp-size-photo').textContent = (file.size/1024).toFixed(1)+' KB';
        wrap.classList.add('show');
    } else {
        var row   = document.getElementById('fp-' + id);
        var icons = { 'application/pdf':'📕','image/jpeg':'🖼️','image/png':'🖼️' };
        document.getElementById('fpi-' + id).textContent = icons[file.type] || '📄';
        document.getElementById('fpn-' + id).textContent = file.name.length > 30 ? file.name.substring(0,28)+'…' : file.name;
        document.getElementById('fps-' + id).textContent = (file.size/1024).toFixed(1)+' KB';
        row.classList.add('show');
    }
}

function removeFile(id, e) {
    e.stopPropagation();
    delete uploadedFiles[id];

    var dz  = document.getElementById('dz-' + id);
    var dzd = document.getElementById('dzd-' + id);
    dz.classList.remove('has-file');
    dzd.style.display = '';

    if (id === 'photo') {
        document.getElementById('pp-photo').classList.remove('show');
    } else {
        document.getElementById('fp-' + id).classList.remove('show');
    }
    updateReadiness();
}

/* ── READINESS DOTS ─────────────────────────────── */
function setDot(id, ok) {
    var d = document.getElementById('dot-' + id);
    if (!d) return;
    d.classList.toggle('ok',  ok);
    d.classList.toggle('bad', !ok);
}
function updateReadiness() {
    setDot('photo',  !!uploadedFiles['photo']);
    setDot('idcard', !!uploadedFiles['idcard']);
}

/* ── DECLARATION ────────────────────────────────── */
function toggleDecl() {
    var cb = document.getElementById('declCheck');
    cb.checked = !cb.checked;
    setDot('decl', cb.checked);
}

/* ══════════════════════════════════════════════
   UPLOAD A SINGLE DOCUMENT TO BACKEND
   POST /api/documents/upload
══════════════════════════════════════════════ */
function uploadDocument(file, documentType, applicationId) {
    return new Promise(function(resolve) {
        var fd = new FormData();
        fd.append('application_id', applicationId);
        fd.append('document_type',  documentType);
        fd.append('file',           file);

        secureFetch(API_BASE + '/documents/upload', {
            method:      'POST',
            credentials: 'include',
            body:        fd
        })
        .then(function(r) {
            if (!r.ok) {
                console.warn('[Upload] HTTP ' + r.status + ' for ' + documentType);
                resolve({ success: false, httpStatus: r.status });
                return;
            }
            return r.json();
        })
        .then(function(res) {
            if (!res) return;
            if (res.success) {
                console.log('[Upload] ✅ ' + documentType + ' saved → ' + (res.file_name || ''));
            } else {
                console.warn('[Upload] ⚠ ' + documentType + ' rejected:', res.message);
            }
            resolve(res);
        })
        .catch(function(err) {
            console.warn('[Upload] ❌ Network error for ' + documentType + ':', err.message);
            resolve({ success: false, error: err.message });
        });
    });
}

/* ── SUBMIT ─────────────────────────────────────── */
async function submitForm() {
    var errors = [];

    var branch     = document.getElementById('sBranch').value;
    var year       = document.getElementById('sYear').value;
    var sem        = document.getElementById('semester').value;
    var mobile     = document.getElementById('mobile').value.trim();
    var periodFrom = document.getElementById('periodFrom').value;
    var periodTo   = document.getElementById('periodTo').value;
    var purposeVal = document.getElementById('purpose').value;
    var acadYr     = document.getElementById('academic-year').value.trim();
    var decl       = document.getElementById('declCheck').checked;
    var addInfo    = document.getElementById('additionalInfo').value.trim();

    // Resolve final purpose text
    var finalPurpose = purposeVal;
    if (purposeVal === 'other') {
        finalPurpose = document.getElementById('otherPurpose').value.trim();
        if (!finalPurpose) errors.push('Please specify your purpose.');
    }

    if (!branch)     errors.push('Please select your department / branch.');
    if (!year)       errors.push('Please select your current year.');
    if (!sem)        errors.push('Please select your current semester.');
    if (!mobile || mobile.length !== 10 || !/^\d+$/.test(mobile))
                     errors.push('Please enter a valid 10-digit mobile number.');
    if (!periodFrom) errors.push('Please select Period of Study — From.');
    if (!periodTo)   errors.push('Please select Period of Study — To.');
    if (periodFrom && periodTo && periodFrom > periodTo)
                     errors.push('Period From cannot be after Period To.');
    if (!purposeVal) errors.push('Please select the purpose of certificate.');
    if (!uploadedFiles['photo'])  errors.push('Please upload your passport size photograph.');
    if (!uploadedFiles['idcard']) errors.push('Please upload your college ID card.');
    if (!decl)       errors.push('Please accept the declaration before submitting.');

    setDot('photo',   !!uploadedFiles['photo']);
    setDot('idcard',  !!uploadedFiles['idcard']);
    setDot('purpose', !!purposeVal);
    setDot('decl',    decl);

    if (errors.length > 0) {
        var al    = document.getElementById('formAlert');
        var extra = errors.length > 1
            ? '  (+' + (errors.length-1) + ' more issue' + (errors.length > 2 ? 's' : '') + ')'
            : '';
        document.getElementById('formAlertMsg').textContent = errors[0] + extra;
        al.classList.add('show');
        al.scrollIntoView({ behavior:'smooth', block:'center' });
        return;
    }

    document.getElementById('formAlert').classList.remove('show');

    var submitBtn = document.querySelector('.btn-primary');
    var origText  = submitBtn.textContent;
    submitBtn.textContent = '⏳ Submitting…';
    submitBtn.disabled    = true;

    try {
        /* ════════════════════════════════════════
           STEP 1 — Create application record (JSON)
           FIX: Send BOTH adm_type AND certificate_type
           so DocumentController can always find the folder.
           createAdmission() in repo uses :adm_type → $data['admType']
           So we send admType = 'character' (camelCase key for repo mapping)
           AND certificate_type = 'character' (snake_case backup)
        ════════════════════════════════════════ */
        var u = JSON.parse(localStorage.getItem('user') || '{}');

        var response = await secureFetch(API_BASE + '/application/create', {
            method:      'POST',
            credentials: 'include',
            headers:     { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                certificate_type: 'character',   // ← stored in certificate_type column
                admType:          'character',   // ← stored in adm_type column via createAdmission()
                adm_type:         'character',   // ← extra safety: some controllers read this key
                purpose:          finalPurpose,
                branch:           branch,
                year:             year,
                semester:         sem,
                mobile:           mobile,
                periodFrom:       periodFrom,
                periodTo:         periodTo,
                acYear:           acadYr,
                additionalInfo:   addInfo,
                fullName:         u.name       || u.full_name || '',
                dob:              u.dob        || '',
                gender:           u.gender     || '',
                email:            u.email      || '',
                btid:             u.btid       || u.student_id || ''
            })
        });

        if (!response.ok) throw new Error('Server error: ' + response.status);

        var result = await response.json();
        if (!result.success) throw new Error(result.message || 'Submission failed. Please try again.');

        var appNumber = result.application_number || result.application_id || 'N/A';
        var appId     = result.application_id || result.id;

        if (!appId) throw new Error('Application ID missing from server response.');

        console.log('[Character] ✅ Application created | Number:', appNumber, '| ID:', appId);

        /* ════════════════════════════════════════
           STEP 2 — Upload documents
           Files saved to: storage/uploads/character/
        ════════════════════════════════════════ */
        var uploads = [];

        if (uploadedFiles['photo']) {
            uploads.push(uploadDocument(uploadedFiles['photo'],  'passport_photo', appId));
        }
        if (uploadedFiles['idcard']) {
            uploads.push(uploadDocument(uploadedFiles['idcard'], 'id_card',        appId));
        }
        if (uploadedFiles['fee']) {
            uploads.push(uploadDocument(uploadedFiles['fee'],    'fee_clearance',  appId));
        }

        var results = await Promise.all(uploads);
        var failed  = results.filter(function(r) { return r && !r.success; });
        if (failed.length > 0) {
            console.warn('[Character] ' + failed.length + ' document(s) failed to upload.');
        }

        /* ════════════════════════════════════════
           STEP 3 — Show success modal
        ════════════════════════════════════════ */
        var apps = JSON.parse(localStorage.getItem('applications') || '[]');
        apps.unshift({
            id:             appNumber,
            docType:        'character',
            docTitle:       'Character Certificate',
            purpose:        finalPurpose,
            date:           new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }),
            status:         'Pending',
            processingTime: '3 Working Days'
        });
        localStorage.setItem('applications', JSON.stringify(apps));

        var modalEl = document.getElementById('modalAppId');
        if (modalEl) modalEl.textContent = appNumber;
        document.getElementById('successModal').classList.add('open');

    } catch (err) {
        var al = document.getElementById('formAlert');
        document.getElementById('formAlertMsg').textContent =
            '❌ ' + (err.message || 'Network error. Please check your connection and try again.');
        al.classList.add('show');
        al.scrollIntoView({ behavior:'smooth', block:'center' });
        console.error('[Character] Submit error:', err);
    } finally {
        submitBtn.textContent = origText;
        submitBtn.disabled    = false;
    }
}

/* ── LOGOUT ─────────────────────────────────────── */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        secureFetch(API_BASE + '/auth/logout', { method:'POST', credentials:'include' })
        .finally(function() {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}