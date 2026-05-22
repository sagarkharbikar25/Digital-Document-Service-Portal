const BASE_URL = window.location.origin + window.location.pathname.split('/public/')[0];
const API_BASE = BASE_URL + '/public/index.php/api';

/* ── DOCUMENT CATALOG ───────────────────────────── */
const DOC_CATALOG = {
    bonafide: {
        icon:'📜', title:'Bonafide Certificate', fee:'Rs.50',
        desc:'Issued to confirm that the student is currently enrolled in the institution. Accepted for bank loans, scholarships, internships, passport, and other official purposes.',
        time:'2 Working Days', authority:'Academic Section, College Office',
        uploads:[
            { id:'fee_receipt', name:'Fee Receipt',     hint:'Current semester fee receipt', types:'PDF, JPG, PNG', maxMB:5 },
            { id:'college_id',  name:'College ID Card', hint:'Both sides of your ID card',   types:'PDF, JPG, PNG', maxMB:2 }
        ]
    },
    character: {
        icon:'⭐', title:'Character Certificate', fee:'Rs.50',
        desc:"Certifies the student's good conduct, discipline, and behavior during their course tenure at the institution.",
        time:'5–7 Working Days', authority:'Principal / HOD Office',
        uploads:[
            { id:'college_id', name:'College ID Card',    hint:'Valid college ID',              types:'PDF, JPG, PNG', maxMB:2 },
            { id:'attendance', name:'Attendance Record',   hint:'Latest attendance certificate', types:'PDF',           maxMB:5 }
        ]
    },
    leaving: {
        icon:'🚪', title:'Transfer Certificate (TC)', fee:'Rs.100',
        desc:'Issued when a student formally leaves the institution. Mandatory for admission to other colleges or higher education institutions.',
        time:'7–10 Working Days', authority:'Principal Office',
        uploads:[
            { id:'college_id', name:'College ID Card',             hint:'Valid college ID',               types:'PDF, JPG, PNG', maxMB:2 },
            { id:'fee_clear',  name:'Fee Clearance Certificate',   hint:'No-dues from accounts section',  types:'PDF',           maxMB:5 },
            { id:'lib_nodues', name:'Library No-Dues Certificate', hint:'Issued by the library',          types:'PDF',           maxMB:5 },
            { id:'marksheets', name:'All Semester Marksheets',     hint:'All semesters scanned together', types:'PDF',           maxMB:10 }
        ]
    },
    transcript: {
        icon:'📊', title:'Official Transcript', fee:'Rs.200',
        desc:'Complete academic records including all semester marks, grades, and performance. Required for higher education applications and employment.',
        time:'10–15 Working Days', authority:'Examination Section',
        uploads:[
            { id:'college_id', name:'College ID Card',         hint:'Valid college ID',             types:'PDF, JPG, PNG', maxMB:2 },
            { id:'marksheets', name:'All Semester Marksheets', hint:'All semesters scanned',        types:'PDF',           maxMB:10 },
            { id:'fee_receipt',name:'Fee Receipt',             hint:'Current semester fee receipt', types:'PDF, JPG, PNG', maxMB:5 }
        ]
    },
    noc: {
        icon:'✅', title:'No Objection Certificate (NOC)', fee:'Free',
        desc:"Issued for internships, external projects, examinations, passport applications, or any purpose requiring the college's formal no-objection.",
        time:'3–5 Working Days', authority:'HOD / Dean Office',
        uploads:[
            { id:'college_id',     name:'College ID Card',          hint:'Valid college ID',           types:'PDF, JPG, PNG', maxMB:2 },
            { id:'purpose_letter', name:'Purpose / Request Letter', hint:'Letter stating the purpose', types:'PDF',           maxMB:5 }
        ]
    },
    migration: {
        icon:'🔀', title:'Migration Certificate', fee:'Rs.300',
        desc:'Required when a student migrates to another university after course completion. Issued in coordination with RTM Nagpur University.',
        time:'10–15 Working Days', authority:'Examination Section / University',
        uploads:[
            { id:'tc',         name:'Transfer Certificate',           hint:'TC issued by JDCOEM',           types:'PDF',           maxMB:5 },
            { id:'degree',     name:'Degree / Provisional Certificate',hint:'Final degree or provisional',   types:'PDF',           maxMB:5 },
            { id:'college_id', name:'College ID Card',                 hint:'Valid college ID',              types:'PDF, JPG, PNG', maxMB:2 }
        ]
    },
    provisional: {
        icon:'🎗', title:'Provisional Certificate', fee:'Rs.100',
        desc:'A temporary certificate confirming course completion, issued before the final degree certificate is ready from the university.',
        time:'5–7 Working Days', authority:'Examination Section',
        uploads:[
            { id:'college_id', name:'College ID Card',            hint:'Valid college ID',      types:'PDF, JPG, PNG', maxMB:2 },
            { id:'marksheets', name:'All Semester Marksheets',    hint:'Final year marksheets', types:'PDF',           maxMB:10 },
            { id:'fee_clear',  name:'Fee Clearance Certificate',  hint:'No-dues from accounts', types:'PDF',           maxMB:5 }
        ]
    },
    admission: {
        icon:'📩', title:'Admission Letter', fee:'Rs.50',
        desc:"Confirms the student's admission to the institution. Contains course name, year, roll number, and student details.",
        time:'3–5 Working Days', authority:'Admissions Office',
        uploads:[
            { id:'app_form',    name:'Admission Application Form', hint:'Signed application form',     types:'PDF',           maxMB:5 },
            { id:'fee_receipt', name:'Fee Receipt',                hint:'Admission fee payment proof', types:'PDF, JPG, PNG', maxMB:5 }
        ]
    },
    idcard: {
        icon:'🪪', title:'Identity Card (College ID)', fee:'Rs.100',
        desc:'The official JDCOEM identity card. Mandatory for campus entry, examinations, library, and laboratory access.',
        time:'2–3 Working Days', authority:'Administrative Office',
        uploads:[
            { id:'photo',     name:'Passport Size Photo', hint:'Recent white background photo',   types:'JPG, PNG', maxMB:2 },
            { id:'admission', name:'Admission Proof',     hint:'Admission letter or fee receipt', types:'PDF, JPG', maxMB:5 }
        ]
    },
    feereceipt: {
        icon:'🧾', title:'Fee Receipt / Fee Structure', fee:'Free',
        desc:'Official proof of semester-wise or yearly tuition fee payment. Required for scholarship applications, bank records, or income tax purposes.',
        time:'1–2 Working Days', authority:'Accounts Section',
        uploads:[
            { id:'college_id', name:'College ID Card', hint:'Valid college ID', types:'PDF, JPG, PNG', maxMB:2 }
        ]
    },
    hallticket: {
        icon:'🎫', title:'Hall Ticket / Admit Card', fee:'Free',
        desc:'Required for entry to internal or university examinations. Issued only after fee clearance and no-dues verification.',
        time:'1 Working Day', authority:'Examination Section',
        uploads:[
            { id:'fee_clear', name:'Fee Clearance Certificate', hint:'No-dues from accounts', types:'PDF', maxMB:5 }
        ]
    },
    marksheet: {
        icon:'📊', title:'Mark Sheet', fee:'Rs.50',
        desc:'Semester-wise academic performance record. Issued by the autonomous institute or RTM Nagpur University.',
        time:'7–10 Working Days', authority:'Examination Section',
        uploads:[
            { id:'college_id', name:'College ID Card',  hint:'Valid college ID',                 types:'PDF, JPG, PNG', maxMB:2 },
            { id:'exam_form',  name:'Examination Form', hint:'Submitted exam registration form', types:'PDF',           maxMB:5 }
        ]
    },
    degree: {
        icon:'🎓', title:'Degree Certificate', fee:'Rs.500',
        desc:'The final qualification certificate awarded upon successful completion of the degree programme, issued by RTM Nagpur University.',
        time:'15–30 Working Days', authority:'RTM Nagpur University via Examination Section',
        uploads:[
            { id:'marksheets', name:'All Semester Marksheets',   hint:'All semesters, clearly scanned', types:'PDF',           maxMB:10 },
            { id:'fee_clear',  name:'Fee Clearance Certificate', hint:'No-dues from accounts',          types:'PDF',           maxMB:5 },
            { id:'tc',         name:'Transfer Certificate (TC)', hint:'Issued by JDCOEM',               types:'PDF',           maxMB:5 },
            { id:'college_id', name:'College ID Card',           hint:'Valid college ID',               types:'PDF, JPG, PNG', maxMB:2 }
        ]
    }
};

/* ── STATE ──────────────────────────────────────── */
let uploadedFiles = {};
let currentDoc    = null;

/* ── HELPERS ── */
function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {day:'2-digit', month:'short'});
}
function safeSet(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ── NOTIFICATIONS ── */
function toggleNotif() {
    const d = document.getElementById('notifDropdown');
    if (d) d.classList.toggle('open');
}
window.addEventListener('click', function(e) {
    const d = document.getElementById('notifDropdown');
    const b = document.querySelector('.notif-btn');
    if (d && b && !d.contains(e.target) && !b.contains(e.target)) {
        d.classList.remove('open');
    }
});

function loadNotifications() {
    secureFetch(API_BASE + '/notifications/unread-count', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        if (!res.success) return;
        const count = res.data ? res.data.unread_count : 0;
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

    secureFetch(API_BASE + '/notifications/my', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        const list = document.getElementById('notifList');
        if (!list) return;
        const data = Array.isArray(res) ? res : (res.data || []);
        if (data.length === 0) {
            list.innerHTML = '<div style="padding:24px;text-align:center;color:#9ca3af;font-size:12px;">No new notifications</div>';
            return;
        }
        let html = '';
        data.filter(n => !n.is_read).slice(0, 5).forEach(n => {
            const icon = n.type === 'status' ? '⚡' : '📅';
            html += `
            <div class="nd-item" onclick="markRead(${n.id})">
                <div class="nd-icon">${icon}</div>
                <div class="nd-text">
                    <div class="nd-title">${esc(n.title)}</div>
                    <div class="nd-desc">${esc(n.message)}</div>
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
    })
    .then(r => r.json())
    .then(res => {
        if (res.success) loadNotifications();
    });
}

function clearNotifs() {
    // Strategy: fetch all unread and mark each
    secureFetch(API_BASE + '/notifications/my', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        const data = Array.isArray(res) ? res : (res.data || []);
        const unread = data.filter(n => !n.is_read);
        if (unread.length === 0) return;
        Promise.all(unread.map(n => 
            secureFetch(API_BASE + '/notifications/read', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notification_id: n.id })
            })
        )).then(() => loadNotifications());
    });
}

function loadSidebarBadges() {
    secureFetch(API_BASE + '/application/my', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        const data = Array.isArray(res) ? res : (res.data || []);
        const count = data.length;
        const badge = document.getElementById('sideAppBadge');
        if (badge) {
            badge.textContent = count > 0 ? count : '';
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    });
}

function renderUser(u) {
    const name     = u.name || u.full_name || u.bt_id || u.btid || 'Student';
    const btid     = u.bt_id || u.btid || u.student_id || u.email || '--';
    const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();

    safeSet('userName',     name);
    safeSet('userId',       btid);
    safeSet('userInitials', initials);
    safeSet('sName',        name);
    safeSet('sBtid',        btid);
    safeSet('sBranch',      u.branch || 'Not specified');
    safeSet('sYear',        u.year   || 'Not specified');
    safeSet('sEmail',       u.email  || '--');

    const avatars = document.querySelectorAll('.user-avatar');
    avatars.forEach(a => a.textContent = initials);
}

/* ── INIT ──────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', function () {
    const raw = localStorage.getItem('user');
    if (!raw) { window.location.href = 'login.html'; return; }

    try {
        const u = JSON.parse(raw);
        renderUser(u);
    } catch(e) {
        localStorage.clear();
        window.location.href = 'login.html';
        return;
    }

    /* Refresh from backend session */
    secureFetch(API_BASE + '/auth/me', { credentials: 'include' })
        .then(r => r.json())
        .then(res => {
            if (res.success && res.user) {
                const merged = Object.assign(JSON.parse(localStorage.getItem('user') || '{}'), res.user);
                localStorage.setItem('user', JSON.stringify(merged));
                renderUser(merged);
            }
        })
        .catch(() => {});

    // Info dot always green (student data pre-filled)
    const dotInfo = document.getElementById('dot-info');
    if (dotInfo) dotInfo.classList.add('ok');

    const docType = localStorage.getItem('selectedDocument') || 'bonafide';
    loadDocument(docType);
    loadNotifications();
    loadSidebarBadges();
});

/* ── LOAD DOCUMENT ──────────────────────────────── */
function loadDocument(type) {
    const doc = DOC_CATALOG[type] || DOC_CATALOG['bonafide'];
    currentDoc = { type, doc };

    document.getElementById('docIcon').textContent         = doc.icon;
    document.getElementById('docTitle').textContent        = doc.title;
    document.getElementById('docDesc').textContent         = doc.desc;
    document.getElementById('docTime').textContent         = doc.time;
    document.getElementById('docAuthority').textContent    = doc.authority;
    document.getElementById('docFee').textContent          = doc.fee;
    document.getElementById('breadcrumbDoc').textContent   = doc.title;
    document.title = `Apply – ${doc.title} | JDCOEM Portal`;

    // Required docs checklist
    document.getElementById('reqDocsList').innerHTML = doc.uploads.map(u => `
        <div class="req-doc-item" id="req-${u.id}">
            <div class="req-doc-check" id="check-${u.id}">○</div>
            <div class="req-doc-text">
                <h5>${u.name}</h5>
                <p>${u.hint}</p>
            </div>
            <span class="req-doc-badge">${u.types} · Max ${u.maxMB}MB</span>
        </div>`).join('');

    // Upload drop zones
    document.getElementById('uploadGrid').innerHTML = doc.uploads.map(u => {
        const accept = getAccept(u.types);
        return `
        <div class="upload-field" id="uf-${u.id}">
            <div class="upload-label">
                <span class="ul-name">📎 ${u.name} <span class="ul-req">*</span></span>
                <span class="ul-hint">${u.types} · Max ${u.maxMB}MB</span>
            </div>
            <div class="drop-zone" id="dz-${u.id}"
                ondragover="handleDragOver(event,'${u.id}')"
                ondragleave="handleDragLeave('${u.id}')"
                ondrop="handleDrop(event,'${u.id}',${u.maxMB})">
                <div id="dz-default-${u.id}">
                    <span class="drop-icon">☁️</span>
                    <div class="drop-text"><strong>Click to upload</strong> or drag and drop</div>
                    <div class="drop-subtext">${u.types} · Maximum file size: ${u.maxMB} MB</div>
                </div>
                <div class="file-preview" id="fp-${u.id}">
                    <span class="fp-icon" id="fpi-${u.id}">📄</span>
                    <div>
                        <div class="fp-name" id="fpn-${u.id}"></div>
                        <div class="fp-size" id="fps-${u.id}"></div>
                    </div>
                    <button class="fp-remove" onclick="removeFile('${u.id}',event)" title="Remove">✕</button>
                </div>
                <input type="file" accept="${accept}"
                    onchange="handleFileInput(this,'${u.id}',${u.maxMB})">
            </div>
            <div class="file-error" id="fe-${u.id}"></div>
        </div>`;
    }).join('');
}

function getAccept(types) {
    const map = { 'PDF':'.pdf', 'JPG':'.jpg,.jpeg', 'PNG':'.png' };
    return types.split(',').map(t => map[t.trim()] || '').filter(Boolean).join(',');
}

/* ── FILE HANDLING ──────────────────────────────── */
function handleFileInput(input, fieldId, maxMB) {
    if (input.files && input.files[0]) processFile(input.files[0], fieldId, maxMB);
}
function handleDragOver(e, fieldId) {
    e.preventDefault();
    document.getElementById('dz-' + fieldId).classList.add('dragover');
}
function handleDragLeave(fieldId) {
    document.getElementById('dz-' + fieldId).classList.remove('dragover');
}
function handleDrop(e, fieldId, maxMB) {
    e.preventDefault();
    document.getElementById('dz-' + fieldId).classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files && files[0]) processFile(files[0], fieldId, maxMB);
}

function processFile(file, fieldId, maxMB) {
    const errEl = document.getElementById('fe-' + fieldId);
    errEl.classList.remove('show');

    if (file.size > maxMB * 1024 * 1024) {
        errEl.textContent = `File too large. Maximum size is ${maxMB}MB.`;
        errEl.classList.add('show');
        return;
    }

    const upload  = currentDoc.doc.uploads.find(u => u.id === fieldId);
    const allowed = getAccept(upload.types).split(',');
    const ext     = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
        errEl.textContent = `Invalid file type. Allowed: ${upload.types}`;
        errEl.classList.add('show');
        return;
    }

    uploadedFiles[fieldId] = file;
    showFilePreview(fieldId, file);
    updateUploadStatus();
}

function showFilePreview(fieldId, file) {
    const dz      = document.getElementById('dz-' + fieldId);
    const def     = document.getElementById('dz-default-' + fieldId);
    const preview = document.getElementById('fp-' + fieldId);
    const nameEl  = document.getElementById('fpn-' + fieldId);
    const sizeEl  = document.getElementById('fps-' + fieldId);
    const iconEl  = document.getElementById('fpi-' + fieldId);
    const ext     = file.name.split('.').pop().toLowerCase();
    const icons   = { pdf:'📋', jpg:'🖼', jpeg:'🖼', png:'🖼' };

    dz.classList.add('has-file');
    def.style.display = 'none';
    preview.classList.add('show');
    iconEl.textContent = icons[ext] || '📄';
    nameEl.textContent = file.name.length > 30 ? file.name.substring(0, 28) + '…' : file.name;
    sizeEl.textContent = (file.size / 1024).toFixed(1) + ' KB';

    const check = document.getElementById('check-' + fieldId);
    if (check) { check.textContent = '✓'; check.classList.add('uploaded'); }
}

function removeFile(fieldId, e) {
    e.stopPropagation();
    delete uploadedFiles[fieldId];

    const dz      = document.getElementById('dz-' + fieldId);
    const def     = document.getElementById('dz-default-' + fieldId);
    const preview = document.getElementById('fp-' + fieldId);
    dz.classList.remove('has-file');
    def.style.display = 'block';
    preview.classList.remove('show');

    const check = document.getElementById('check-' + fieldId);
    if (check) { check.textContent = '○'; check.classList.remove('uploaded'); }
    updateUploadStatus();
}

function updateUploadStatus() {
    const total    = currentDoc.doc.uploads.length;
    const uploaded = Object.keys(uploadedFiles).length;
    const dot      = document.getElementById('dot-uploads');
    dot.className  = 'ss-dot' + (uploaded === total ? ' ok' : ' warn');
}

/* ── PURPOSE ────────────────────────────────────── */
function setPurpose(text) {
    const ta = document.getElementById('purposeText');
    ta.value = text;
    updateCharCount();
}

function updateCharCount() {
    const val = document.getElementById('purposeText').value;
    document.getElementById('charCount').textContent = val.length;
    const dot = document.getElementById('dot-purpose');
    dot.className = 'ss-dot' + (val.trim().length >= 10 ? ' ok' : ' warn');
}

/* ── DECLARATION ────────────────────────────────── */
function toggleDeclaration() {
    const cb  = document.getElementById('declarationCheck');
    cb.checked = !cb.checked;
    const dot = document.getElementById('dot-declaration');
    dot.className = 'ss-dot' + (cb.checked ? ' ok' : '');
}

/* ── SUBMIT ─────────────────────────────────────── */
function submitApplication() {
    const errors = [];
    const doc    = currentDoc.doc;

    doc.uploads.forEach(u => {
        if (!uploadedFiles[u.id]) errors.push(`${u.name} is required.`);
    });

    const purpose = document.getElementById('purposeText').value.trim();
    if (purpose.length < 10) errors.push('Please provide a reason for applying (minimum 10 characters).');

    if (!document.getElementById('declarationCheck').checked) {
        errors.push('Please accept the declaration before submitting.');
    }

    if (errors.length > 0) {
        const alertEl  = document.getElementById('formAlert');
        const alertMsg = document.getElementById('formAlertMsg');
        alertMsg.textContent = errors[0] + (errors.length > 1 ? ` (+${errors.length - 1} more)` : '');
        alertEl.classList.add('show');
        alertEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const appId = 'APP-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
    const application = {
        id:       appId,
        docType:  currentDoc.type,
        docTitle: currentDoc.doc.title,
        purpose:  purpose,
        date:     new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }),
        status:   'Pending',
        time:     currentDoc.doc.time
    };

    const apps = JSON.parse(localStorage.getItem('applications') || '[]');
    apps.unshift(application);
    localStorage.setItem('applications', JSON.stringify(apps));
    localStorage.removeItem('selectedDocument');

    document.getElementById('modalDocName').textContent = currentDoc.doc.title;
    document.getElementById('modalAppId').textContent   = appId;
    document.getElementById('successModal').classList.add('open');
}

function goToMyApplications() { window.location.href = 'dashboard.html'; }
function goToHome()           { window.location.href = 'home.html'; }

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        secureFetch(API_BASE + '/auth/logout', { method:'POST', credentials:'include' })
        .finally(function(){
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}
