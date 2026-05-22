// ══════════════════════════════════════════════════════════════════
// 1️⃣ HELPERS & NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════
const API_BASE = window.location.origin + window.location.pathname.split('/').slice(0, -2).join('/') + '/api';

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

function markRead(id) {
    secureFetch(API_BASE + '/notifications/read', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: id })
    }).then(() => loadNotifications());
}

var documentTemplates = {

  bonafide: `
    <div class="card dynamic-section active">
      <h2 class="card-title"><span class="card-icon">📜</span> Bonafide Certificate Details</h2>
      <div class="form-grid">
        <div class="form-field">
          <label class="form-label required">Purpose</label>
          <select class="form-select" name="purpose" required>
            <option value="">-- Select Purpose --</option>
            <option value="bank">Bank Loan</option>
            <option value="scholarship">Scholarship</option>
            <option value="passport">Passport Application</option>
            <option value="internship">Internship</option>
            <option value="other">Other</option>
          </select>
          <span class="form-error">Purpose is required</span>
        </div>
        <div class="form-field">
          <label class="form-label required">Academic Year</label>
          <select class="form-select" name="academicYear" required>
            <option value="">-- Select Year --</option>
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
            <option value="2022-23">2022-23</option>
          </select>
          <span class="form-error">Academic year is required</span>
        </div>
      </div>
    </div>
  `,

  idcard: `
    <div class="card dynamic-section active">
      <h2 class="card-title"><span class="card-icon">🪪</span> Identity Card Details</h2>
      <div class="form-field">
        <label class="form-label required">Reason for Request</label>
        <select class="form-select" name="reason" id="idReason" required onchange="toggleFIRField()">
          <option value="">-- Select Reason --</option>
          <option value="new">New ID Card</option>
          <option value="lost">Lost ID Card</option>
          <option value="damaged">Damaged ID Card</option>
        </select>
        <span class="form-error">Reason is required</span>
      </div>
      <div class="form-field">
        <label class="form-label required">Upload Recent Photograph</label>
        <input type="file" class="form-input form-file" name="photo" accept=".jpg,.jpeg,.png" required>
        <span class="form-help">Passport size photo (Max 2MB)</span>
        <span class="form-error">Photo is required</span>
      </div>
      <div class="form-field" id="firField" style="display:none;">
        <label class="form-label required">Upload FIR Copy</label>
        <input type="file" class="form-input form-file" name="fir" accept=".pdf,.jpg,.jpeg,.png">
        <span class="form-help">Required for lost ID card (Max 5MB)</span>
      </div>
    </div>
  `,

  hallticket: `
    <div class="card dynamic-section active">
      <h2 class="card-title"><span class="card-icon">🎟️</span> Hall / Exam Ticket Details</h2>
      <div class="form-grid">
        <div class="form-field">
          <label class="form-label required">Exam Type</label>
          <select class="form-select" name="examType" required>
            <option value="">-- Select Exam --</option>
            <option value="internal">Internal Exam</option>
            <option value="university">University Exam</option>
            <option value="supplementary">Supplementary Exam</option>
          </select>
          <span class="form-error">Exam type is required</span>
        </div>
        <div class="form-field">
          <label class="form-label required">Semester</label>
          <select class="form-select" name="semester" required>
            <option value="">-- Select Semester --</option>
            <option value="1">Semester I</option>
            <option value="2">Semester II</option>
            <option value="3">Semester III</option>
            <option value="4">Semester IV</option>
            <option value="5">Semester V</option>
            <option value="6">Semester VI</option>
            <option value="7">Semester VII</option>
            <option value="8">Semester VIII</option>
          </select>
          <span class="form-error">Semester is required</span>
        </div>
        <div class="form-field">
          <label class="form-label required">Academic Year</label>
          <select class="form-select" name="academicYear" required>
            <option value="">-- Select Year --</option>
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
          </select>
          <span class="form-error">Academic year is required</span>
        </div>
      </div>
    </div>
  `,

  tc: `
    <div class="card dynamic-section active">
      <h2 class="card-title"><span class="card-icon">🚪</span> Transfer Certificate Details</h2>
      <div class="form-field">
        <label class="form-label required">Reason for Leaving</label>
        <textarea class="form-textarea" name="reason" required placeholder="Please explain your reason for leaving the college..."></textarea>
        <span class="form-error">Reason is required</span>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <label class="form-label required">Last Attended Semester</label>
          <select class="form-select" name="lastSemester" required>
            <option value="">-- Select Semester --</option>
            <option value="1">Semester I</option>
            <option value="2">Semester II</option>
            <option value="3">Semester III</option>
            <option value="4">Semester IV</option>
            <option value="5">Semester V</option>
            <option value="6">Semester VI</option>
          </select>
          <span class="form-error">Last semester is required</span>
        </div>
      </div>
      <div class="form-field">
        <label class="form-label required">Upload Clearance Proof</label>
        <input type="file" class="form-input form-file" name="clearance" accept=".pdf" required>
        <span class="form-help">Library No-Dues & Fee Clearance (PDF only, Max 5MB)</span>
        <span class="form-error">Clearance proof is required</span>
      </div>
    </div>
  `,

  character: `
    <div class="card dynamic-section active">
      <h2 class="card-title"><span class="card-icon">⭐</span> Character Certificate Details</h2>
      <div class="form-grid">
        <div class="form-field">
          <label class="form-label required">Period of Study (From)</label>
          <input type="month" class="form-input" name="periodFrom" required>
          <span class="form-error">Start date is required</span>
        </div>
        <div class="form-field">
          <label class="form-label required">Period of Study (To)</label>
          <input type="month" class="form-input" name="periodTo" required>
          <span class="form-error">End date is required</span>
        </div>
      </div>
      <div class="form-field">
        <label class="form-label required">Purpose</label>
        <select class="form-select" name="purpose" required>
          <option value="">-- Select Purpose --</option>
          <option value="employment">Employment</option>
          <option value="higher-studies">Higher Studies</option>
          <option value="visa">Visa Application</option>
          <option value="other">Other</option>
        </select>
        <span class="form-error">Purpose is required</span>
      </div>
    </div>
  `,

  noc: `
    <div class="card dynamic-section active">
      <h2 class="card-title"><span class="card-icon">✅</span> No Objection Certificate Details</h2>
      <div class="form-field">
        <label class="form-label required">Purpose</label>
        <select class="form-select" name="purpose" required>
          <option value="">-- Select Purpose --</option>
          <option value="internship">Internship</option>
          <option value="project">Project Work</option>
          <option value="passport">Passport Application</option>
          <option value="exam">External Exam</option>
          <option value="other">Other</option>
        </select>
        <span class="form-error">Purpose is required</span>
      </div>
      <div class="form-field">
        <label class="form-label required">Organization Name</label>
        <input type="text" class="form-input" name="organization" required placeholder="Enter organization name">
        <span class="form-error">Organization name is required</span>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <label class="form-label required">Validity Period (From)</label>
          <input type="date" class="form-input" name="validityFrom" required>
          <span class="form-error">Start date is required</span>
        </div>
        <div class="form-field">
          <label class="form-label required">Validity Period (To)</label>
          <input type="date" class="form-input" name="validityTo" required>
          <span class="form-error">End date is required</span>
        </div>
      </div>
      <div class="form-field">
        <label class="form-label">Upload Supporting Letter (Optional)</label>
        <input type="file" class="form-input form-file" name="supportingLetter" accept=".pdf">
        <span class="form-help">Request letter from organization (PDF, Max 5MB)</span>
      </div>
    </div>
  `,

  transcript: `
    <div class="card dynamic-section active">
      <h2 class="card-title"><span class="card-icon">📋</span> Transcript Details</h2>
      <div class="form-field">
        <label class="form-label required">Programme</label>
        <input type="text" class="form-input" name="programme" value="B.Tech (Bachelor of Technology)" readonly>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <label class="form-label required">Semester Range (From)</label>
          <select class="form-select" name="semesterFrom" required>
            <option value="">-- Select --</option>
            <option value="1">Semester I</option>
            <option value="2">Semester II</option>
            <option value="3">Semester III</option>
            <option value="4">Semester IV</option>
            <option value="5">Semester V</option>
            <option value="6">Semester VI</option>
          </select>
          <span class="form-error">Start semester is required</span>
        </div>
        <div class="form-field">
          <label class="form-label required">Semester Range (To)</label>
          <select class="form-select" name="semesterTo" required>
            <option value="">-- Select --</option>
            <option value="1">Semester I</option>
            <option value="2">Semester II</option>
            <option value="3">Semester III</option>
            <option value="4">Semester IV</option>
            <option value="5">Semester V</option>
            <option value="6">Semester VI</option>
          </select>
          <span class="form-error">End semester is required</span>
        </div>
      </div>
      <div class="form-field">
        <label class="form-label required">Number of Copies</label>
        <input type="number" class="form-input" name="copies" min="1" max="5" value="1" required>
        <span class="form-help">Maximum 5 copies allowed</span>
        <span class="form-error">Number of copies is required</span>
      </div>
      <div class="form-field">
        <label class="form-label">Upload Previous Mark Sheets (Optional)</label>
        <input type="file" class="form-input form-file" name="marksheets" accept=".pdf" multiple>
        <span class="form-help">All semester marksheets (PDF, Max 5MB each)</span>
      </div>
    </div>
  `
};

// ══════════════════════════════════════════════════════════════════
// LOAD STUDENT DATA
// ══════════════════════════════════════════════════════════════════
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
        if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
            notifDropdown.classList.remove('open');
        }
    });

    /* Specific Migration.js Doc Type Change */
    const docSelect = document.getElementById('docType');
    if (docSelect) docSelect.addEventListener('change', handleTemplateChange);
});

function renderUser(u) {
    if (!u) return;
    const name = u.name || u.full_name || u.bt_id || '';
    const btid = u.bt_id || u.btid || u.student_id || '';
    const email = u.email || '';
    const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();

    safeSet('userInitials', initials || '?');
    safeSet('userName',     name     || 'Student');
    safeSet('userId',       btid     || '--');

    // Auto-filled fields mapping
    const fields = {
        'studentName': name,
        'rollNumber':  u.roll_number || u.rollNo || '',
        'btId':        btid,
        'department':  u.department || u.branch || '',
        'programme':   u.programme || 'B.Tech (Bachelor of Technology)',
        'yearSem':     u.current_year || u.year || '',
        'email':       email,
        'mobile':      u.mobile || u.phone || ''
    };

    for (let id in fields) {
        const el = document.getElementById(id);
        if (el && fields[id]) {
            el.value = fields[id];
            el.readOnly = true;
        }
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        secureFetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'include' })
        .finally(() => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}

// ══════════════════════════════════════════════════════════════════
// HANDLE DOCUMENT TYPE CHANGE
// ══════════════════════════════════════════════════════════════════
function handleTemplateChange() {
  var docType           = this.value;
  var container         = document.getElementById('dynamicFieldsContainer');
  var uploadSection     = document.getElementById('uploadSection');
  var declarationSection = document.getElementById('declarationSection');

  if (!container) return;
  container.innerHTML = '';

  if (docType && documentTemplates[docType]) {
    container.innerHTML = documentTemplates[docType];
    if (uploadSection) uploadSection.style.display      = 'block';
    if (declarationSection) declarationSection.style.display = 'block';
  } else {
    if (uploadSection) uploadSection.style.display      = 'none';
    if (declarationSection) declarationSection.style.display = 'none';
  }
}

/* ── UPLOAD HELPER ──────────────────────────────── */
async function uploadDocument(file, type, appId) {
  if (!file) return { success: true };
  const fd = new FormData();
  fd.append('application_id', appId);
  fd.append('document_type',  type);
  fd.append('file',           file);

  const r = await secureFetch(API_BASE + '/documents/upload', {
    method:      'POST',
    credentials: 'include',
    body:        fd
  });
  return r.json();
}

// ══════════════════════════════════════════════════════════════════
// TOGGLE FIR FIELD FOR ID CARD
// ══════════════════════════════════════════════════════════════════
function toggleFIRField() {
  var reason   = document.getElementById('idReason');
  var firField = document.getElementById('firField');
  var firInput = firField ? firField.querySelector('input') : null;

  if (reason && firField) {
    if (reason.value === 'lost') {
      firField.style.display = 'block';
      if (firInput) firInput.required = true;
    } else {
      firField.style.display = 'none';
      if (firInput) firInput.required = false;
    }
  }
}

// ══════════════════════════════════════════════════════════════════
// FORM VALIDATION
// ══════════════════════════════════════════════════════════════════
function validateForm() {
  var isValid = true;
  var form    = document.getElementById('applicationForm');

  // Check document type
  var docType = document.getElementById('docType');
  if (docType) {
    var parent = docType.closest('.form-field');
    if (!docType.value) {
      if (parent) parent.classList.add('error');
      isValid = false;
    } else {
      if (parent) parent.classList.remove('error');
    }
  }

  // Check all required fields in dynamic section
  var requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(function (field) {
    var isEmpty = !field.value || (field.type === 'checkbox' && !field.checked);
    var parent  = field.closest('.form-field');
    if (isEmpty) {
      if (parent) parent.classList.add('error');
      isValid = false;
    } else {
      if (parent) parent.classList.remove('error');
    }
  });

  // File size validation (5MB max)
  var fileInputs = form.querySelectorAll('input[type="file"]');
  fileInputs.forEach(function (input) {
    if (input.files.length > 0) {
      Array.from(input.files).forEach(function (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('File ' + file.name + ' exceeds 5MB limit');
          isValid = false;
        }
      });
    }
  });

  return isValid;
}

// ══════════════════════════════════════════════════════════════════
// FORM SUBMISSION
// ══════════════════════════════════════════════════════════════════
document.getElementById('applicationForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!validateForm()) {
    alert('⚠️ Please fill all required fields correctly');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span>⏳</span> Processing...';
  submitBtn.disabled = true;

  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    const docType = 'migration'; // Force migration if on migration page, or use dynamic
    const reason = document.getElementById('reason').value.trim();
    
    // Step 1: Create Application
    const res = await secureFetch(API_BASE + '/application/create', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        certificate_type: 'migration',
        branch: document.getElementById('department').value,
        year: document.getElementById('yearSem').value,
        purpose: reason,
        fullName: u.name || u.full_name || '',
        btid: u.bt_id || u.btid || u.student_id || ''
      })
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.message || 'Submission failed');

    const appId = result.application_id || result.id;
    
    // Step 2: Upload Files
    const fileInput = document.getElementById('supportingDocs');
    if (fileInput && fileInput.files.length > 0) {
       await uploadDocument(fileInput.files[0], 'migration_support', appId);
    }

    // Show success modal
    document.getElementById('appIdDisplay').textContent = result.application_number || ('APP-' + appId);
    document.getElementById('successModal').classList.add('open');

  } catch (err) {
    alert('❌ Error: ' + err.message);
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

// ══════════════════════════════════════════════════════════════════
// RESET FORM
// ══════════════════════════════════════════════════════════════════
function resetForm() {
  if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
    document.getElementById('applicationForm').reset();
    document.getElementById('dynamicFieldsContainer').innerHTML = '';
    document.getElementById('uploadSection').style.display      = 'none';
    document.getElementById('declarationSection').style.display = 'none';
    document.querySelectorAll('.form-field').forEach(function (field) {
      field.classList.remove('error');
    });
  }
}