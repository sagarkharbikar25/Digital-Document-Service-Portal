/* ================================================
   feereceipt.js — Fee Receipt Application Logic
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
            const icon = n.type === 'status' ? '🧾' : '📅';
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

/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */
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

    // Sidebar application count
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
    if (cb) cb.addEventListener('change', function() { /* Optional dot handling */ });

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
   RENDER USER
   ══════════════════════════════════════════════ */
function renderUser(u) {
    const name = u.name || u.full_name || u.bt_id || 'Student';
    const btid = u.bt_id || u.btid || u.student_id || '--';
    const branch = u.branch || u.department || '';
    const year = u.year || u.current_year || '';
    const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();

    safeSet('userInitials', initials);
    safeSet('userName',     name);
    safeSet('userId',       btid);

    // Auto-filled display fields
    safeSet('sName',  name);
    safeSet('sBtid',  btid);

    const branchEl = document.getElementById('sBranch');
    const yearEl   = document.getElementById('sYear');
    if (branchEl && !branchEl.value) branchEl.value = branch;
    if (yearEl   && !yearEl.value)   yearEl.value   = year;

    if (u.photo_url) {
        const avatar = document.getElementById('userAvatarBox') || document.getElementById('userInitials');
        if (avatar) {
            avatar.style.backgroundImage = 'url(' + u.photo_url + ')';
            avatar.style.backgroundSize = 'cover';
            avatar.style.backgroundPosition = 'center';
            avatar.textContent = '';
        }
    }
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

    const dz = document.getElementById('dz-' + id);
    const dzd = document.getElementById('dzd-' + id);
    dz.classList.add('has-file');
    if (dzd) dzd.style.display = 'none';

    /* Show file pill/preview if elements exist */
    const row = document.getElementById('fp-' + id);
    if (row) {
        const icons = { 'application/pdf': '📕', 'image/jpeg': '🖼️', 'image/png': '🖼️' };
        const fpiEl = document.getElementById('fpi-' + id);
        const fpnEl = document.getElementById('fpn-' + id);
        const fpsEl = document.getElementById('fps-' + id);
        if (fpiEl) fpiEl.textContent = icons[file.type] || '📄';
        if (fpnEl) fpnEl.textContent = file.name.length > 30 ? file.name.substring(0, 28) + '…' : file.name;
        if (fpsEl) fpsEl.textContent = (file.size / 1024).toFixed(1) + ' KB';
        row.classList.add('show');
    }
}

function removeFile(id, e) {
    if (e) e.stopPropagation();
    delete uploadedFiles[id];

    const dz = document.getElementById('dz-' + id);
    const dzd = document.getElementById('dzd-' + id);
    if (dz) dz.classList.remove('has-file');
    if (dzd) dzd.style.display = '';

    const row = document.getElementById('fp-' + id);
    if (row) row.classList.remove('show');
}

/* ══════════════════════════════════════════════
   DECLARATION
══════════════════════════════════════════════ */
function toggleDecl(e) {
    if (e && e.target && e.target.id === 'declCheck') return; // Let the checkbox handle itself
    const cb = document.getElementById('declCheck');
    if (cb) cb.checked = !cb.checked;
}

/* ══════════════════════════════════════════════
   UPLOAD A SINGLE DOCUMENT TO BACKEND
   ─────────────────────────────────────────────
   POST /api/documents/upload
   FormData fields:
     application_id  → integer  (from /application/create)
     document_type   → string   e.g. "payment_proof"
     file            → File     (backend reads via $_FILES['file'])
   ─────────────────────────────────────────────
   Always resolves — never rejects — so one failed
   upload doesn't block the whole submission.
══════════════════════════════════════════════ */
function uploadDocument(file, documentType, applicationId) {
    return new Promise(function (resolve) {
        const fd = new FormData();
        fd.append('application_id', applicationId);
        fd.append('document_type', documentType);
        fd.append('file', file);

        /* DO NOT set Content-Type manually — browser sets multipart boundary */
        secureFetch(API_BASE + '/documents/upload', {
            method: 'POST',
            credentials: 'include',
            body: fd
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

/* ══════════════════════════════════════════════
   SUBMIT FORM
══════════════════════════════════════════════ */
function submitForm() {

    /* ── Collect field values ── */
    const branch = document.getElementById('sBranch').value;
    const year = document.getElementById('sYear').value;
    const feeType = document.getElementById('feeType').value;
    const acadYear = (document.getElementById('academic-year') || {}).value
        ? document.getElementById('academic-year').value.trim() : '';
    const transactionId = document.getElementById('transactionId').value.trim();
    const amount = document.getElementById('paidAmount').value.trim();
    const purpose = document.getElementById('purpose').value.trim();
    const decl = document.getElementById('declCheck').checked;

    /* ── Validate ── */
    const errors = [];
    if (!branch) errors.push('Please select your department / branch.');
    if (!year) errors.push('Please select your current year.');
    if (!feeType) errors.push('Please select the fee type.');
    if (!transactionId) errors.push('Transaction / DD number is required.');
    if (!amount || isNaN(amount) || +amount <= 0) errors.push('Please enter a valid amount paid.');
    if (!uploadedFiles['paymentProof']) errors.push('Please upload the payment proof document.');
    if (!decl) errors.push('Please accept the declaration before submitting.');

    if (errors.length > 0) {
        showAlert(
            errors[0] +
            (errors.length > 1
                ? '  (+' + (errors.length - 1) + ' more issue' + (errors.length > 2 ? 's' : '') + ')'
                : '')
        );
        return;
    }
    hideAlert();

    /* ── Loading state ── */
    const submitBtn = document.querySelector('.btn-primary');
    const origLabel = submitBtn.textContent;
    submitBtn.textContent = '⏳ Submitting…';
    submitBtn.disabled = true;

    /* ════════════════════════════════════════════
       STEP 1 — Create application record (JSON)
       Endpoint: POST /api/application/create
       Returns:  { success, application_id, application_number }
    ════════════════════════════════════════════ */
    secureFetch(API_BASE + '/application/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            certificate_type: 'feereceipt',
            purpose: feeType + (purpose ? ': ' + purpose : ''),
            branch: branch,
            current_year: year,
            academic_year: acadYear,
            transaction_id: transactionId,
            amount: amount,
            fee_type: feeType
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
            const appId = res.application_id || res.id;

            if (!appId) throw new Error('Application ID missing from server response.');

            console.log('[FeeReceipt] ✅ Application created | Number:', appNumber, '| ID:', appId);

            /* ════════════════════════════════════════
               STEP 2 — Upload documents
               document_type: "payment_proof"
               Clerk sees this file in the Review modal.
            ════════════════════════════════════════ */
            const uploads = [];

            if (uploadedFiles['paymentProof']) {
                uploads.push(uploadDocument(uploadedFiles['paymentProof'], 'payment_proof', appId));
            }

            return Promise.all(uploads).then(function (results) {
                const failed = results.filter(function (r) { return r && !r.success; });
                if (failed.length > 0) {
                    console.warn('[FeeReceipt] ' + failed.length + ' document(s) failed to upload.');
                }
                return appNumber;
            });
        })
        .then(function (appNumber) {

            /* ════════════════════════════════════════
               STEP 3 — Show success
            ════════════════════════════════════════ */
            submitBtn.textContent = origLabel;
            submitBtn.disabled = false;

            /* Save to localStorage so home.html track widget shows this app */
            try {
                const apps = JSON.parse(localStorage.getItem('applications') || '[]');
                apps.unshift({
                    id: appNumber,
                    docType: 'feereceipt',
                    docTitle: 'Fee Receipt',
                    purpose: feeType + (purpose ? ': ' + purpose : ''),
                    date: new Date().toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    }),
                    status: 'Pending',
                    processingTime: '1 Working Day'
                });
                localStorage.setItem('applications', JSON.stringify(apps));
            } catch (e) { /* non-critical */ }

            /* Show success modal */
            const modalAppId = document.getElementById('modalAppId');
            if (modalAppId) modalAppId.textContent = appNumber;
            document.getElementById('successModal').classList.add('open');
        })
        .catch(function (err) {
            submitBtn.textContent = origLabel;
            submitBtn.disabled = false;
            showAlert('❌ ' + (err.message || 'Network error. Please check your connection and try again.'));
            console.error('[FeeReceipt] Submit error:', err);
        });
}

/* ══════════════════════════════════════════════
   LOGOUT
══════════════════════════════════════════════ */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        secureFetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'include' })
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
    const msgEl = document.getElementById('formAlertMsg');
    if (!al) { alert(msg); return; }
    if (msgEl) msgEl.textContent = msg;
    al.classList.add('show');
    al.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function hideAlert() {
    const al = document.getElementById('formAlert');
    if (al) al.classList.remove('show');
}