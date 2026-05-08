// ══════════════════════════════════════════════════════════════════
// 1️⃣ HELPERS & API
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
    fetch(API_BASE + '/notifications/unread-count', { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
        if (!res.success) return;
        const count = (res.data && res.data.unread_count) || res.count || 0;
        
        // Update Bell Badge
        const bellBadge = document.querySelector('.notif-badge');
        if (bellBadge) {
            bellBadge.textContent = count > 0 ? count : '';
            bellBadge.style.display = count > 0 ? 'block' : 'none';
        }
        
        // Update Sidebar Badge
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
    if (!u) return;
    var name     = u.name || u.full_name || u.bt_id || '';
    var btid     = u.bt_id || u.btid || u.student_id || '';
    var initials = name.split(' ').filter(Boolean).map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();

    safeSet('userInitials', initials || '?');
    safeSet('userName',     name     || 'Student');
    safeSet('userId',       btid     || '--');

    // Context specific fields
    const fields = [
        { id: 'studentName', val: name },
        { id: 'btId',        val: btid },
        { id: 'email',       val: u.email }
    ];

    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (el && f.val) {
            el.value = f.val;
            el.readOnly = true;
        }
    });
}

// ══════════════════════════════════════════════════════════════════
// 2️⃣ INITIALIZATION
// ══════════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function () {
  const raw = localStorage.getItem('user');
  if (!raw) { window.location.href = 'login.html'; return; }
  
  const u = JSON.parse(raw);
  
  // 1. Initial Render
  renderUser(u);
  loadNotifications();

  // 2. Refresh Session
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

          // Fill form specific fields with extra validation
          const mapping = {
              'rollNumber': merged.roll_number || merged.roll_no || '',
              'department': merged.branch || merged.department || '',
              'programme':  merged.programme || '',
              'yearSem':    merged.year || merged.current_year || '',
              'email':      merged.email || '',
              'mobile':     merged.mobile || merged.phone || ''
          };

          for (const [id, val] of Object.entries(mapping)) {
              const el = document.getElementById(id);
              if (el && val) {
                  el.value = val;
                  el.readOnly = true;
                  el.classList.add('populated');
              }
          }
      }
  })
  .catch(() => {});

  // 3. Load sidebar counts
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

  // 4. Global click listener for dropdowns
  document.addEventListener('click', function(e) {
      const notifDropdown = document.getElementById('notifDropdown');
      const notifBtn = document.querySelector('.notif-btn');
      if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
          notifDropdown.classList.remove('open');
      }
  });
});

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'include' })
        .finally(() => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}

// ══════════════════════════════════════════════════════════════════
// 2️⃣ DOCUMENT TYPE TEMPLATES (ONLY 4 DOCUMENTS)
// ══════════════════════════════════════════════════════════════════
const documentTemplates = {
  tc: `
    <div class="card dynamic-section active">
      <div class="card-header">
        <h2 class="card-title"><span class="card-icon">🚪</span> Transfer Certificate Details</h2>
      </div>
      <div class="form-field">
        <label class="form-label required">Reason for Leaving</label>
        <textarea class="form-textarea" name="reason" required placeholder="Please explain your reason for leaving the college in detail..."></textarea>
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
            <option value="7">Semester VII</option>
            <option value="8">Semester VIII</option>
          </select>
          <span class="form-error">Last semester is required</span>
        </div>
        <div class="form-field">
          <label class="form-label required">Last Attendance Date</label>
          <input type="date" class="form-input" name="lastDate" required>
          <span class="form-error">Last attendance date is required</span>
        </div>
      </div>
      <div class="form-field">
        <label class="form-label required">Upload Clearance Proof</label>
        <input type="file" class="form-input form-file" name="clearance" accept=".pdf" required>
        <span class="form-help">Library No-Dues & Fee Clearance Certificate (PDF only, Max 5MB)</span>
        <span class="form-error">Clearance proof is required</span>
      </div>
    </div>
  `,

  noc: `
    <div class="card dynamic-section active">
      <div class="card-header">
        <h2 class="card-title"><span class="card-icon">✅</span> No Objection Certificate Details</h2>
      </div>
      <div class="form-field">
        <label class="form-label required">Purpose of NOC</label>
        <select class="form-select" name="purpose" required>
          <option value="">-- Select Purpose --</option>
          <option value="internship">Internship</option>
          <option value="project">Project Work / Industrial Training</option>
          <option value="passport">Passport Application</option>
          <option value="exam">External Exam / Certification</option>
          <option value="competition">Competition / Event Participation</option>
          <option value="other">Other (Please Specify)</option>
        </select>
        <span class="form-error">Purpose is required</span>
      </div>
      <div class="form-field">
        <label class="form-label required">Organization / Institution Name</label>
        <input type="text" class="form-input" name="organization" required placeholder="Enter full organization name">
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
        <label class="form-label">Upload Supporting Letter / Request Letter</label>
        <input type="file" class="form-input form-file" name="supportingLetter" accept=".pdf">
        <span class="form-help">Request letter from organization (if applicable) - PDF format, Max 5MB</span>
      </div>
    </div>
  `,

  transcript: `
    <div class="card dynamic-section active">
      <div class="card-header">
        <h2 class="card-title"><span class="card-icon">📋</span> Official Transcript Details</h2>
      </div>
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
            <option value="7">Semester VII</option>
            <option value="8">Semester VIII</option>
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
            <option value="7">Semester VII</option>
            <option value="8">Semester VIII</option>
          </select>
          <span class="form-error">End semester is required</span>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <label class="form-label required">Number of Copies</label>
          <input type="number" class="form-input" name="copies" min="1" max="5" value="1" required>
          <span class="form-help">Maximum 5 copies allowed</span>
          <span class="form-error">Number of copies is required</span>
        </div>
        <div class="form-field">
          <label class="form-label required">Purpose</label>
          <select class="form-select" name="purpose" required>
            <option value="">-- Select Purpose --</option>
            <option value="higher-studies">Higher Studies / University Application</option>
            <option value="employment">Employment / Job Application</option>
            <option value="visa">Visa / Immigration</option>
            <option value="scholarship">Scholarship Application</option>
            <option value="other">Other</option>
          </select>
          <span class="form-error">Purpose is required</span>
        </div>
      </div>
      <div class="form-field">
        <label class="form-label">Upload Previous Mark Sheets (Optional)</label>
        <input type="file" class="form-input form-file" name="marksheets" accept=".pdf" multiple>
        <span class="form-help">All semester marksheets (PDF format, Max 5MB each). Multiple files allowed.</span>
      </div>
    </div>
  `,

  character: `
    <div class="card dynamic-section active">
      <div class="card-header">
        <h2 class="card-title"><span class="card-icon">⭐</span> Character Certificate Details</h2>
      </div>
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
        <label class="form-label required">Purpose of Certificate</label>
        <select class="form-select" name="purpose" required>
          <option value="">-- Select Purpose --</option>
          <option value="employment">Employment / Job Application</option>
          <option value="higher-studies">Higher Studies / University Admission</option>
          <option value="visa">Visa / Immigration Application</option>
          <option value="scholarship">Scholarship Application</option>
          <option value="government">Government Service Application</option>
          <option value="other">Other (Please Specify)</option>
        </select>
        <span class="form-error">Purpose is required</span>
      </div>
      <div class="form-field">
        <label class="form-label">Additional Information (Optional)</label>
        <textarea class="form-textarea" name="additionalInfo" placeholder="Any specific requirements or additional information..."></textarea>
      </div>
    </div>
  `
};

// ══════════════════════════════════════════════════════════════════
// 3️⃣ HANDLE DOCUMENT TYPE CHANGE
// ══════════════════════════════════════════════════════════════════
document.getElementById('docType').addEventListener('change', function () {
  const docType = this.value;
  const container = document.getElementById('dynamicFieldsContainer');
  const uploadSection = document.getElementById('uploadSection');
  const declarationSection = document.getElementById('declarationSection');

  container.innerHTML = '';

  if (docType && documentTemplates[docType]) {
    container.innerHTML = documentTemplates[docType];
    uploadSection.style.display = 'block';
    declarationSection.style.display = 'block';
  } else {
    uploadSection.style.display = 'none';
    declarationSection.style.display = 'none';
  }
});

// ══════════════════════════════════════════════════════════════════
// 4️⃣ FORM VALIDATION
// ══════════════════════════════════════════════════════════════════
function validateForm() {
  let isValid = true;
  const form = document.getElementById('applicationForm');

  // Check document type
  const docType = document.getElementById('docType');
  if (!docType.value) {
    docType.closest('.form-field').classList.add('error');
    isValid = false;
  } else {
    docType.closest('.form-field').classList.remove('error');
  }

  // Check all required fields in dynamic section
  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    if (!field.value || (field.type === 'checkbox' && !field.checked)) {
      field.closest('.form-field')?.classList.add('error');
      isValid = false;
    } else {
      field.closest('.form-field')?.classList.remove('error');
    }
  });

  // File size validation
  const fileInputs = form.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    if (input.files.length > 0) {
      Array.from(input.files).forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
          alert(`File "${file.name}" exceeds 5MB limit. Please upload a smaller file.`);
          isValid = false;
        }
      });
    }
  });

  return isValid;
}

/* ── UPLOAD HELPER ──────────────────────────────── */
async function uploadDocument(file, type, appId) {
  if (!file) return { success: true };
  const fd = new FormData();
  fd.append('application_id', appId);
  fd.append('document_type',  type);
  fd.append('file',           file);

  const r = await fetch(API_BASE + '/documents/upload', {
    method:      'POST',
    credentials: 'include',
    body:        fd
  });
  return r.json();
}

// ══════════════════════════════════════════════════════════════════
// 5️⃣ FORM SUBMISSION
// ══════════════════════════════════════════════════════════════════
document.getElementById('applicationForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!validateForm()) {
    alert('⚠️ Please fill all required fields correctly');
    const firstError = document.querySelector('.form-field.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span>⏳</span> Processing...';
  submitBtn.disabled = true;

  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    const docType = document.getElementById('docType').value;
    const formEl = document.getElementById('applicationForm');
    const formDataObj = new FormData(formEl);
    
    // Construct reason/purpose string from dynamic fields
    let purposeStr = '';
    for (let [key, value] of formDataObj.entries()) {
        if (key !== 'supportingDocs') {
            purposeStr += `${key}: ${value} | `;
        }
    }

    const res = await fetch(API_BASE + '/application/create', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        certificate_type: docType,
        branch: document.getElementById('department').value,
        year: document.getElementById('yearSem').value,
        purpose: purposeStr,
        fullName: u.name || u.full_name || '',
        btid: u.bt_id || u.btid || u.student_id || ''
      })
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.message || 'Submission failed');

    const appId = result.application_id || result.id;
    
    // Handle multiple file uploads
    const fileInput = document.getElementById('supportingDocs');
    if (fileInput && fileInput.files.length > 0) {
      const uploadPromises = Array.from(fileInput.files).map(file => 
        uploadDocument(file, 'supporting_document', appId)
      );
      await Promise.all(uploadPromises);
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
// 6️⃣ RESET FORM
// ══════════════════════════════════════════════════════════════════
function resetForm() {
  if (confirm('⚠️ Are you sure you want to reset the form? All entered data will be lost.')) {
    document.getElementById('applicationForm').reset();
    document.getElementById('dynamicFieldsContainer').innerHTML = '';
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('declarationSection').style.display = 'none';
    document.querySelectorAll('.form-field').forEach(field => field.classList.remove('error'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ══════════════════════════════════════════════════════════════════
// 7️⃣ CLOSE MODAL ON OUTSIDE CLICK
// ══════════════════════════════════════════════════════════════════
document.getElementById('successModal').addEventListener('click', function (e) {
  if (e.target === this) {
    this.classList.remove('open');
    window.location.href = 'dashboard.html';
  }
});