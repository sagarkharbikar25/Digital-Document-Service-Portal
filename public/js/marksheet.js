/* ================================================
   marksheet.js — Mark Sheet Application Logic
   JDCOEM Digital Document Services Portal
   Connected to Backend API
   ================================================ */

const API_BASE = window.location.origin + window.location.pathname.split('/').slice(0, -2).join('/') + '/api';
const uploadedFiles = {};

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

    // Load sidebar counts
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

    // Global click listener for dropdowns
    document.addEventListener('click', function(e) {
        const notifDropdown = document.getElementById('notifDropdown');
        const notifBtn = document.querySelector('.notif-btn');
        const isNotifBtn = notifBtn && notifBtn.contains(e.target);
        if (notifDropdown && !notifDropdown.contains(e.target) && !isNotifBtn) {
            notifDropdown.classList.remove('open');
        }
    });
});

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

/* ── FILL PROFILE ───────────────────────────────── */
function renderUser(u) {
    const name = u.name || u.full_name || u.bt_id || 'Student';
    const btid = u.bt_id || u.btid || u.student_id || '--';
    const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();

    safeSet('userInitials', initials);
    safeSet('userName',     name);
    safeSet('userId',       btid);
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
    const errEl = document.getElementById('fe-' + id);
    errEl.classList.remove('show');

    if (file.size > maxMB * 1024 * 1024) {
        errEl.textContent = 'File too large.';
        errEl.classList.add('show');
        return;
    }

    uploadedFiles[id] = file;
    const dz = document.getElementById('dz-' + id);
    const dzd = document.getElementById('dzd-' + id);
    dz.classList.add('has-file');
    dzd.style.display = 'none';
}

/* ── UPLOAD HELPER ──────────────────────────────── */
async function uploadDocument(file, type, appId) {
    const fd = new FormData();
    fd.append('application_id', appId);
    fd.append('document_type', type);
    fd.append('file', file);

    const r = await secureFetch(API_BASE + '/documents/upload', {
        method: 'POST',
        credentials: 'include',
        body: fd
    });
    return r.json();
}

/* ── SUBMIT ─────────────────────────────────────── */
async function submitForm() {
    const fields = {
        semester: document.getElementById('semester').value,
        examSession: document.getElementById('examSession').value,
        examYear: document.getElementById('examYear').value,
        resultType: document.getElementById('resultType').value,
        purpose: document.getElementById('purpose').value.trim()
    };

    if (!fields.semester || !fields.examSession || !fields.examYear || !fields.resultType) {
        alert('❌ Please select all required fields.');
        return;
    }

    if (!uploadedFiles['idProof']) {
        alert('❌ Please upload your ID Card copy.');
        return;
    }

    const submitBtn = document.querySelector('.btn-primary');
    submitBtn.textContent = '⏳ Submitting...';
    submitBtn.disabled = true;

    try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        const res = await secureFetch(API_BASE + '/application/create', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                certificate_type: 'marksheet',
                admType: 'marksheet',
                branch: u.branch || u.department || 'N/A',
                year: fields.semester,
                purpose: fields.examSession + ' ' + fields.examYear + ' (' + fields.resultType + ') - ' + fields.purpose,
                acYear: fields.examYear,
                fullName: u.name || '',
                btid: u.btid || u.student_id || ''
            })
        });

        const result = await res.json();
        if (!result.success) throw new Error(result.message);

        const appId = result.application_id;
        await uploadDocument(uploadedFiles['idProof'], 'college_id', appId);

        document.getElementById('modalAppId').textContent = result.application_number;
        document.getElementById('successModal').classList.add('open');

    } catch (err) {
        alert('❌ Error: ' + err.message);
    } finally {
        submitBtn.textContent = '📊 Request Mark Sheet';
        submitBtn.disabled = false;
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}
