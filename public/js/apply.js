/* ================================================
   apply.js — Generic Document Application Logic
   Handles: character, tc, noc, transcript
   JDCOEM Digital Document Services Portal
   Connected to Backend API
   ================================================ */

const API_BASE = window.location.origin + window.location.pathname.split('/').slice(0, -2).join('/') + '/api';

// ══════════════════════════════════════════════════════════════════
// 1️⃣  DOCUMENT TYPE TEMPLATES
// ══════════════════════════════════════════════════════════════════
const documentTemplates = {
  tc: `
    <div class="card dynamic-section active">
      <div class="card-header">
        <h2 class="card-title"><span class="card-icon">🚪</span> Transfer Certificate Details</h2>
      </div>
      <div class="form-field">
        <label class="form-label required">Reason for Leaving</label>
        <textarea class="form-textarea" name="reason" required
          placeholder="Please explain your reason for leaving the college in detail..."></textarea>
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
        <input type="text" class="form-input" name="organization" required
          placeholder="Enter full organization name">
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
        <span class="form-help">Request letter from organization (if applicable) – PDF format, Max 5MB</span>
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
        <input type="text" class="form-input" name="programme"
          value="B.Tech (Bachelor of Technology)" readonly>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <label class="form-label required">Semester Range (From)</label>
          <select class="form-select" name="semesterFrom" required>
            <option value="">-- Select --</option>
            <option value="1">Semester I</option><option value="2">Semester II</option>
            <option value="3">Semester III</option><option value="4">Semester IV</option>
            <option value="5">Semester V</option><option value="6">Semester VI</option>
            <option value="7">Semester VII</option><option value="8">Semester VIII</option>
          </select>
          <span class="form-error">Start semester is required</span>
        </div>
        <div class="form-field">
          <label class="form-label required">Semester Range (To)</label>
          <select class="form-select" name="semesterTo" required>
            <option value="">-- Select --</option>
            <option value="1">Semester I</option><option value="2">Semester II</option>
            <option value="3">Semester III</option><option value="4">Semester IV</option>
            <option value="5">Semester V</option><option value="6">Semester VI</option>
            <option value="7">Semester VII</option><option value="8">Semester VIII</option>
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
        <span class="form-help">All semester marksheets (PDF, Max 5MB each). Multiple files allowed.</span>
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
        <textarea class="form-textarea" name="additionalInfo"
          placeholder="Any specific requirements or additional information..."></textarea>
      </div>
    </div>
  `
};

// ══════════════════════════════════════════════════════════════════
// 2️⃣  HELPERS & NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════
function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    var now = new Date();
    var diff = (now - d) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff/60) + 'm ago';
    if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
    return d.toLocaleDateString('en-IN', {day:'2-digit', month:'short'});
}

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

function safeSet(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function clearNotifs() {
    fetch(API_BASE + '/notifications/mark-all-read', { method: 'POST', credentials: 'include' })
    .then(() => loadNotifications());
}

function renderUser(u) {
    const name = u.name || u.full_name || u.bt_id || 'Student';
    const btid = u.bt_id || u.btid || u.student_id || '--';
    const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();

    safeSet('userInitials', initials);
    safeSet('userName',     name);
    safeSet('userId',       btid);

    // Form fields
    const fields = {
        'studentName': u.name || u.full_name || '',
        'rollNumber':  u.roll_number || u.bt_id || '',
        'btId':        btid,
        'department':  u.branch || u.department || '',
        'programme':   'B.Tech (Bachelor of Technology)',
        'yearSem':     u.year || u.current_year || '',
        'email':       u.email || '',
        'mobile':      u.mobile || u.phone || ''
    };

    for (let id in fields) {
        const el = document.getElementById(id);
        if (el) el.value = fields[id];
    }
}

// ══════════════════════════════════════════════════════════════════
// 3️⃣  AUTO-SELECT DOC TYPE FROM localStorage (from documents.html)
// ══════════════════════════════════════════════════════════════════
function autoSelectDocType() {
    // Map from documents.html DOC_PAGES keys to apply.html option values
    var typeMap = {
        character:  'character',
        noc:        'noc',
        transcript: 'transcript',
        leaving:    'tc',
        migration:  'tc'
    };

    var selected = localStorage.getItem('selectedDocument');
    if (selected && typeMap[selected]) {
        var docTypeEl = document.getElementById('docType');
        if (docTypeEl) {
            docTypeEl.value = typeMap[selected];
            handleDocTypeChange(); // auto-load the fields
        }
    }
}

// ══════════════════════════════════════════════════════════════════
// 4️⃣  HANDLE DOCUMENT TYPE CHANGE
// ══════════════════════════════════════════════════════════════════
function handleDocTypeChange() {
    var docType        = document.getElementById('docType').value;
    var container      = document.getElementById('dynamicFieldsContainer');
    var uploadSection  = document.getElementById('uploadSection');
    var declarationSec = document.getElementById('declarationSection');

    container.innerHTML = '';

    if (docType && documentTemplates[docType]) {
        container.innerHTML = documentTemplates[docType];
        uploadSection.style.display  = 'block';
        declarationSec.style.display = 'block';
    } else {
        uploadSection.style.display  = 'none';
        declarationSec.style.display = 'none';
    }
}

// ══════════════════════════════════════════════════════════════════
// 5️⃣  FORM VALIDATION
// ══════════════════════════════════════════════════════════════════
function validateForm() {
    var isValid = true;
    var form = document.getElementById('applicationForm');

    var docTypeEl = document.getElementById('docType');
    if (!docTypeEl.value) {
        docTypeEl.closest('.form-field').classList.add('error');
        isValid = false;
    } else {
        docTypeEl.closest('.form-field').classList.remove('error');
    }

    var requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(function(field) {
        var isEmpty = !field.value || (field.type === 'checkbox' && !field.checked);
        var wrapper = field.closest('.form-field');
        if (isEmpty) {
            if (wrapper) wrapper.classList.add('error');
            isValid = false;
        } else {
            if (wrapper) wrapper.classList.remove('error');
        }
    });

    var MAX_FILE_SIZE = 5 * 1024 * 1024;
    var fileInputs = form.querySelectorAll('input[type="file"]');
    fileInputs.forEach(function(input) {
        Array.from(input.files).forEach(function(file) {
            if (file.size > MAX_FILE_SIZE) {
                alert('File "' + file.name + '" exceeds the 5 MB limit.');
                isValid = false;
            }
        });
    });

    return isValid;
}

// ══════════════════════════════════════════════════════════════════
// 6️⃣  FORM SUBMISSION — CONNECTED TO BACKEND
// ══════════════════════════════════════════════════════════════════
function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        var firstError = document.querySelector('.form-field.error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    var docTypeEl   = document.getElementById('docType');
    var docType     = docTypeEl.value;
    var docTypeName = docTypeEl.options[docTypeEl.selectedIndex].text;

    // Collect purpose from dynamic fields
    var purposeEl = document.querySelector('[name="purpose"]');
    var purpose   = purposeEl ? purposeEl.value : docTypeName;

    // Collect all dynamic field values for extra_data
    var extraData = { document_type_name: docTypeName };
    var dynamicFields = document.querySelectorAll('#dynamicFieldsContainer [name]');
    dynamicFields.forEach(function(field) {
        if (field.type !== 'file') extraData[field.name] = field.value;
    });

    // Show loading
    var submitBtn = document.getElementById('submitBtn');
    var origText  = submitBtn.innerHTML;
    submitBtn.innerHTML  = '⏳ Submitting…';
    submitBtn.disabled   = true;

    // ── Step 1: Create application (sends email + notification) ──
    fetch(API_BASE + '/application/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            certificate_type: docType,
            purpose:          purpose,
            extra_data:       JSON.stringify(extraData)
        })
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
        if (!res.success) {
            throw new Error(res.message || 'Submission failed. Please try again.');
        }

        var appNumber = res.application_number || ('APP-' + Date.now());

        // ── Step 2: Upload any files attached ──
        var fileData = new FormData();
        fileData.append('application_number', appNumber);
        var fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(function(input) {
            Array.from(input.files).forEach(function(file, i) {
                fileData.append('documents[' + input.name + '_' + i + ']', file);
            });
        });

        return fetch(API_BASE + '/documents/upload', {
            method: 'POST',
            credentials: 'include',
            body: fileData
        })
        .then(function() { return appNumber; })
        .catch(function() { return appNumber; });
    })
    .then(function(appNumber) {
        submitBtn.innerHTML = origText;
        submitBtn.disabled  = false;

        // Save to localStorage for track status
        var apps = JSON.parse(localStorage.getItem('applications') || '[]');
        apps.unshift({
            id:        appNumber,
            docType:   docType,
            docTitle:  docTypeName,
            purpose:   purpose,
            date:      new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            status:    'Pending'
        });
        localStorage.setItem('applications', JSON.stringify(apps));

        // Show success modal
        document.getElementById('appIdDisplay').textContent = appNumber;
        document.getElementById('successModal').classList.add('open');
    })
    .catch(function(err) {
        submitBtn.innerHTML = origText;
        submitBtn.disabled  = false;
        alert('❌ ' + (err.message || 'Network error. Please try again.'));
        console.error('Apply submit error:', err);
    });
}

// ══════════════════════════════════════════════════════════════════
// 7️⃣  RESET FORM
// ══════════════════════════════════════════════════════════════════
function resetForm() {
    if (!confirm('⚠️ Are you sure you want to reset the form? All entered data will be lost.')) return;
    document.getElementById('applicationForm').reset();
    document.getElementById('dynamicFieldsContainer').innerHTML = '';
    document.getElementById('uploadSection').style.display      = 'none';
    document.getElementById('declarationSection').style.display = 'none';
    document.querySelectorAll('.form-field').forEach(function(f) { f.classList.remove('error'); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════════════════════════════════
// 8️⃣  LOGOUT
// ══════════════════════════════════════════════════════════════════
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'include' })
        .finally(function() {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}

// ══════════════════════════════════════════════════════════════════
// 9️⃣  INIT
// ══════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
    loadStudentData();
    loadNotifications();
    autoSelectDocType(); // auto-select doc type if coming from documents.html
    document.getElementById('docType').addEventListener('change', handleDocTypeChange);
    document.getElementById('applicationForm').addEventListener('submit', handleFormSubmit);

    // Global click listener to close dropdowns
    document.addEventListener('click', function(e) {
        var notifDropdown = document.getElementById('notifDropdown');
        var notifBtn = document.querySelector('.notif-btn');
        if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
            notifDropdown.classList.remove('open');
        }
    });

    // Close modal on outside click
    document.getElementById('successModal').addEventListener('click', function(e) {
        if (e.target === document.getElementById('successModal')) {
            document.getElementById('successModal').classList.remove('open');
            window.location.href = 'dashboard.html';
        }
    });
});