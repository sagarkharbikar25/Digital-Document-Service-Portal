/* ================================================
   admission.js — Admission Letter Application Logic
   JDCOEM Digital Document Services Portal
   ================================================ */

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

/* ══════════════════════════════════════════════
   USER RENDERING
   ─────────────────────────────────────────────
   Populates header, sidebar, and form fields
   from localStorage / backend response.
   ══════════════════════════════════════════════ */
function renderUser(u) {
    if (!u) return;
    const name     = u.name         || u.full_name || u.bt_id || 'Student';
    const btid     = u.bt_id        || u.btid      || u.student_id   || '--';
    const email    = u.email        || '--';
    const initials = name.split(' ').filter(Boolean)
                         .map(n => n[0]).join('').substring(0, 2).toUpperCase();

    /* Header */
    safeSet('userInitials', initials);
    safeSet('userName',     name);
    safeSet('userId',       btid);

    /* Form Fields — Pre-fill if empty */
    trySet('fullName', name);
    trySet('btid',     btid);
    trySet('email',    email);
    
    // Auto-fill branch/year if available and not already set
    if (u.branch) trySelectContains('branch', u.branch);
    if (u.year)   trySelectContains('year',   u.year);
    
    updateProgress();
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

function markRead(id) {
    fetch(API_BASE + '/notifications/read', {
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

/* ── STATE ─────────────────────────────────────── */
let currentStep  = 1;
let uploadedDocs = {};

const REQUIRED_DOCS = [
    'ui-regform', 'ui-photos', 'ui-aadhaar', 'ui-dob',
    'ui-10th', 'ui-12th', 'ui-tc', 'ui-character-prev',
    'ui-feereceipt', 'ui-antiragging', 'ui-collegeform', 'ui-undertaking'
];

const DETAIL_FIELDS = [
    'fullName','dob','gender','aadhaar','mobile','email',
    'btid','branch','year','acYear','admType','purpose'
];

const ALL_DOCS = [
    { id:'ui-regform',        name:'Application / Registration Form' },
    { id:'ui-photos',         name:'Passport-size Photographs' },
    { id:'ui-aadhaar',        name:'Aadhaar Card' },
    { id:'ui-dob',            name:'Birth Certificate / 10th (DOB Proof)' },
    { id:'ui-10th',           name:'10th Marksheet & Certificate' },
    { id:'ui-12th',           name:'12th Marksheet & Certificate' },
    { id:'ui-tc',             name:'Transfer Certificate (TC)' },
    { id:'ui-migration',      name:'Migration Certificate' },
    { id:'ui-character-prev', name:'Character Certificate' },
    { id:'ui-offer',          name:'Offer Letter' },
    { id:'ui-entrance',       name:'Entrance Scorecard' },
    { id:'ui-allotment',      name:'Allotment Letter' },
    { id:'ui-caste',          name:'Caste Certificate' },
    { id:'ui-caste-validity', name:'Caste Validity Certificate' },
    { id:'ui-ncl',            name:'NCL Certificate' },
    { id:'ui-ews',            name:'EWS Certificate' },
    { id:'ui-pwd',            name:'PWD Certificate' },
    { id:'ui-income',         name:'Income Certificate' },
    { id:'ui-feereceipt',     name:'Fee Receipt / Payment Proof' },
    { id:'ui-scholarship',    name:'Scholarship Form' },
    { id:'ui-domicile',       name:'Domicile Certificate' },
    { id:'ui-gap',            name:'Gap Certificate' },
    { id:'ui-medical',        name:'Medical Fitness Certificate' },
    { id:'ui-antiragging',    name:'Anti-Ragging Undertaking' },
    { id:'ui-collegeform',    name:'College Admission Form' },
    { id:'ui-undertaking',    name:'Undertaking / Declaration Forms' },
    { id:'ui-bankdetails',    name:'Bank Account Details' },
];

/* ── INIT ──────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', function () {
    const raw = localStorage.getItem('user');
    if (!raw) { window.location.href = 'login.html'; return; }

    const u = JSON.parse(raw);
    renderUser(u);
    loadNotifications();

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
        })
        .catch(() => { });

    // Load sidebar counts
    fetch(API_BASE + '/application/my', { credentials: 'include' })
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
        if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
            notifDropdown.classList.remove('open');
        }
    });

    // Attach change listeners for live progress update
    DETAIL_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateProgress);
    });
    ['decl1','decl2','decl3'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateProgress);
    });

    updateProgress();
});

/* ── HELPERS ────────────────────────────────────── */
function trySet(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function trySelectContains(id, text) {
    const sel = document.getElementById(id);
    if (!sel) return;
    for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text.includes(text)) { sel.selectedIndex = i; break; }
    }
}

/* ── STEPPER ────────────────────────────────────── */
function goStep(step) {
    ['step1-content','step2-content','step3-content'].forEach((id, i) => {
        document.getElementById(id).style.display = (i + 1 === step) ? '' : 'none';
    });

    currentStep = step;
    updateStepper(step);
    if (step === 3) buildReview();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepper(step) {
    for (let i = 1; i <= 3; i++) {
        const sc = document.getElementById('sc' + i);
        const st = document.getElementById('st' + i);
        const sl = document.getElementById('sl' + i);
        if (i < step) {
            sc.className    = 'step-circle done';
            sc.textContent  = '✓';
            if (sl) sl.className = 'step-line done';
        } else if (i === step) {
            sc.className    = 'step-circle active';
            sc.textContent  = String(i);
            st.className    = 's-title active';
        } else {
            sc.className    = 'step-circle pending';
            sc.textContent  = String(i);
            st.className    = 's-title';
        }
    }
}

/* ── FILE UPLOAD ────────────────────────────────── */
function triggerUpload(id, e) {
    e.stopPropagation();
    document.querySelector(`#${id} .file-input`).click();
}

function markUploaded(id, input) {
    if (!input.files || !input.files[0]) return;
    const item  = document.getElementById(id);
    const fname = input.files[0].name;

    item.classList.add('uploaded');
    item.querySelector('.ui-sub').textContent  = '✓ ' + fname;

    const badge      = item.querySelector('.ui-badge');
    badge.className  = 'ui-badge badge-done';
    badge.textContent = 'Uploaded';

    item.querySelector('.ui-btn').textContent = 'Change';
    uploadedDocs[id] = fname;
    updateProgress();
}

/* ── PROGRESS ───────────────────────────────────── */
function checkDetailsFilled() {
    return DETAIL_FIELDS.every(id => {
        const el = document.getElementById(id);
        return el && el.value && el.value.trim() !== '';
    });
}

function updateProgress() {
    const detailsDone = checkDetailsFilled();
    const uploadedReq = REQUIRED_DOCS.filter(id => !!uploadedDocs[id]).length;
    const reqDocsDone = uploadedReq === REQUIRED_DOCS.length;

    const decl1 = document.getElementById('decl1');
    const decl2 = document.getElementById('decl2');
    const decl3 = document.getElementById('decl3');
    const declDone = currentStep === 3 &&
        decl1 && decl1.checked && decl2 && decl2.checked && decl3 && decl3.checked;

    setChk('chk-details',  'chkl-details',  detailsDone, 'Student details filled');
    setChk('chk-reqDocs',  'chkl-reqDocs',  reqDocsDone, `Required docs uploaded (${uploadedReq}/${REQUIRED_DOCS.length})`);
    setChk('chk-decl',     'chkl-decl',     declDone,    'Declarations confirmed');

    const docScore  = Math.round((uploadedReq / REQUIRED_DOCS.length) * 45);
    let score = (detailsDone ? 40 : 0) + docScore + (declDone ? 15 : 0);
    score = Math.min(score, 100);

    const circ   = 150.8;
    const offset = circ - (circ * score / 100);
    document.getElementById('ringFill').setAttribute('stroke-dashoffset', offset);
    document.getElementById('ringText').textContent = score + '%';

    document.getElementById('progressTitle').textContent =
        score === 100 ? 'Ready to Submit!' :
        score >= 70   ? 'Almost There'     :
        score >= 40   ? 'In Progress'      : 'Getting Started';

    document.getElementById('progressSub').textContent =
        score === 100 ? 'All requirements met' : score + '% complete';
}

function setChk(dotId, lblId, done, label) {
    const dot      = document.getElementById(dotId);
    const lbl      = document.getElementById(lblId);
    dot.className  = 'chk-dot ' + (done ? 'done' : 'pending');
    dot.textContent = done ? '✓' : '';
    lbl.className  = 'chk-label ' + (done ? 'done' : 'pending');
    lbl.textContent = label;
}

/* ── REVIEW BUILD ───────────────────────────────── */
function buildReview() {
    const reviewFields = [
        { label:'Full Name',      id:'fullName'  },
        { label:'Date of Birth',  id:'dob'       },
        { label:'Gender',         id:'gender'    },
        { label:'Mobile',         id:'mobile'    },
        { label:'Email',          id:'email'     },
        { label:'BTID',           id:'btid'      },
        { label:'Roll No.',       id:'rollno'    },
        { label:'Branch',         id:'branch'    },
        { label:'Year',           id:'year'      },
        { label:'Academic Year',  id:'acYear'    },
        { label:'Admission Type', id:'admType'   },
        { label:'Category',       id:'category'  },
        { label:'Purpose',        id:'purpose'   },
        { label:'Remarks',        id:'remarks'   },
    ];

    // Summary grid
    const rs   = document.getElementById('reviewSummary');
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;';

    reviewFields.forEach(f => {
        const el  = document.getElementById(f.id);
        const val = el ? (el.value || '—') : '—';
        const div = document.createElement('div');
        div.style.cssText = 'background:var(--g50);border-radius:var(--radius-lg);padding:10px 14px;';
        div.innerHTML = `
            <div style="font-size:11px;font-weight:700;color:var(--g400);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">${f.label}</div>
            <div style="font-size:13.5px;font-weight:600;color:var(--g900);">${val}</div>`;
        grid.appendChild(div);
    });
    rs.innerHTML = '';
    rs.appendChild(grid);

    // Documents summary
    const ds = document.getElementById('docsSummary');
    ds.innerHTML = '';

    ALL_DOCS.forEach(d => {
        const uploaded = !!uploadedDocs[d.id];
        const isReq    = REQUIRED_DOCS.includes(d.id);
        if (!uploaded && !isReq) return; // skip optional not uploaded

        const div = document.createElement('div');
        div.style.cssText = `
            display:flex;align-items:center;gap:10px;padding:8px 12px;
            border-radius:var(--radius-lg);
            background:${uploaded ? 'var(--success-bg)' : 'var(--error-bg)'};
            border:1px solid ${uploaded ? 'var(--success-border)' : 'var(--error-border)'};`;

        div.innerHTML = `
            <span style="font-size:16px;">${uploaded ? '✅' : '❌'}</span>
            <span style="font-size:13px;font-weight:600;color:${uploaded ? 'var(--success)' : 'var(--error)'};flex:1;">${d.name}</span>
            ${uploaded
                ? `<span style="font-size:11.5px;color:var(--g500);">${uploadedDocs[d.id]}</span>`
                : `<span style="font-size:11px;background:var(--error-bg);color:var(--error);padding:2px 8px;border-radius:10px;font-weight:700;">${isReq ? 'MISSING' : 'Not Uploaded'}</span>`
            }`;
        ds.appendChild(div);
    });
}

/* ── SUBMIT ─────────────────────────────────────── */
async function submitApplication() {
    const decl1 = document.getElementById('decl1');
    const decl2 = document.getElementById('decl2');
    const decl3 = document.getElementById('decl3');

    if (!decl1.checked || !decl2.checked || !decl3.checked) {
        alert('Please confirm all declarations before submitting.');
        return;
    }

    const missing = REQUIRED_DOCS.filter(id => !uploadedDocs[id]);
    if (missing.length > 0) {
        if (!confirm(`Some required documents are missing (${missing.length}). Submit anyway?`)) return;
    }

    /* ── Show loading state ── */
    const btn = document.querySelector('.submit-btn') || document.querySelector('[onclick="submitApplication()"]');
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

    try {
        /* ── Build FormData (text fields + files) ── */
        const formData = new FormData();

        // ─── FIX: Tell the backend this is an 'admission' application
        //         so it uses storage/uploads/admission/ as the subfolder.
        //         Without this, admType = "Direct Admission (CAP)" which
        //         doesn't match any key in $typeToFolder → files land in general/.
        formData.append('certificate_type', 'admission');

        // Append all text/select fields
        DETAIL_FIELDS.forEach(fieldId => {
            const el = document.getElementById(fieldId);
            if (el) formData.append(fieldId, el.value || '');
        });

        // Append optional fields that exist in the form
        ['rollno', 'aadhaar', 'category', 'remarks'].forEach(fieldId => {
            const el = document.getElementById(fieldId);
            if (el && el.value) formData.append(fieldId, el.value);
        });

        // Append uploaded files — grab from actual DOM file inputs
        // PHP receives as $_FILES['documents']['name']['ui-regform'] etc.
        ALL_DOCS.forEach(doc => {
            const input = document.querySelector(`#${doc.id} .file-input`);
            if (input && input.files && input.files[0]) {
                formData.append(`documents[${doc.id}]`, input.files[0]);
            }
        });

        /* ── POST to backend ── */
        const response = await fetch(`${API_BASE}/application/store`, {
            method:      'POST',
            credentials: 'include',   // sends session cookie
            body:        formData     // no Content-Type header — browser sets multipart boundary
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Submission failed');
        }

        /* ── Success — show modal with real app number ── */
        const appNumber = result.application_number || result.application_id || 'N/A';
        const displayEl = document.getElementById('appIdDisplay');
        if (displayEl) displayEl.textContent = appNumber;

        const modal = document.getElementById('successModal');
        if (modal) modal.classList.add('show');

    } catch (err) {
        console.error('[submitApplication]', err);
        alert('Submission failed: ' + err.message + '\n\nPlease try again or contact support.');
    } finally {
        /* ── Restore button ── */
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
}

/* ── LOGOUT ─────────────────────────────────────── */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch(API_BASE + '/auth/logout', { 
            method: 'POST', 
            credentials: 'include' 
        })
        .finally(() => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}