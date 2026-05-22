/* ============================================================
   profile.js  |  JDCOEM Student Portal – My Profile
   Connected to Backend API
   ============================================================ */

const API_BASE = window.location.origin + window.location.pathname.split('/').slice(0, -2).join('/') + '/api';

var editingPersonal = false;
var editingAcademic = false;

/* ── HELPER ─────────────────────────────────────── */
function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}
function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val || '';
}
function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatDate(d) {
    if (!d) return '--';
    try { return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }
    catch(e) { return d; }
}

/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

    var raw = localStorage.getItem('user');
    if (!raw) { window.location.href = 'login.html'; return; }
    var u = JSON.parse(raw);

    /* Render from cache immediately so page feels fast */
    renderUser(u);

    /* Then verify session + load fresh data from backend */
    secureFetch(API_BASE + '/auth/me', { credentials: 'include' })
        .then(function(r){ return r.json(); })
        .then(function(res){
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
            /* Load real application stats */
            loadStats();
            /* Load real notifications */
            return loadNotifications();
        })
        .catch(function(){ 
            loadStats();
            loadNotifications();
        });
});

/* ── RENDER USER DATA ───────────────────────────── */
function renderUser(u) {
    var name    = u.name    || u.full_name   || u.bt_id  || 'Student';
    var btid    = u.bt_id   || u.btid        || u.student_id  || u.email  || '—';
    var branch  = u.branch  || u.department  || 'Not specified';
    var year    = u.year    || u.current_year|| 'Not specified';
    var email   = u.email   || '—';
    var mobile  = u.mobile  || u.phone       || 'Not set';
    var address = u.address || 'Not set';
    var dob     = u.dob     || u.date_of_birth || '—';
    var gender  = u.gender  || '—';
    var programme  = u.programme   || 'B.Tech (Bachelor of Technology)';
    var semester   = u.semester    || '—';
    var admYear    = u.admission_year || '—';
    var section    = u.section     || '—';
    var prn        = u.prn || u.enrollment_no || '—';

    var ini = name.split(' ').filter(Boolean).map(function(n){return n[0];}).join('').substring(0,2).toUpperCase();

    /* ── Header ── */
    setEl('userInitials', ini);
    setEl('userName',     name);
    setEl('userId',       btid);

    /* ── Profile header card ── */
    setEl('phInitials', ini);
    setEl('phName',     name);
    setEl('phBtid',     btid);
    setEl('phSub',      branch + ' · ' + year + ' · JDCOEM, Nagpur');

    /* If photo exists */
    if (u.photo_url) {
        var avatar = document.getElementById('phAvatar');
        if (avatar) {
            var img = avatar.querySelector('img') || document.createElement('img');
            img.src = u.photo_url;
            if (!avatar.querySelector('img')) avatar.insertBefore(img, avatar.querySelector('.avatar-edit-btn'));
            setEl('phInitials', '');
        }
    }

    /* ── Personal info display ── */
    setEl('disp-fullname', name);
    setEl('disp-dob',      dob);
    setEl('disp-gender',   gender.charAt(0).toUpperCase() + gender.slice(1));
    setEl('disp-email',    email);
    setEl('disp-mobile',   mobile);
    setEl('disp-address',  address);

    /* ── Personal info inputs (pre-fill editable fields) ── */
    setVal('inp-fullname', name);
    setVal('inp-dob',      dob !== '—' ? dob : '');
    setVal('inp-gender',   gender.toLowerCase());
    setVal('inp-mobile',   mobile  !== 'Not set' ? mobile  : '');
    setVal('inp-address',  address !== 'Not set' ? address : '');

    /* ── Academic info ── */
    setEl('disp-branch',    branch);
    setEl('disp-programme', programme);
    setEl('disp-year',      year);
    setEl('disp-semester',  semester);
    setEl('disp-adm-year',  admYear);
    setEl('disp-section',   section);
    setEl('disp-btid2',     btid);
    setEl('disp-prn',       prn);

    /* ── Academic info inputs ── */
    setVal('inp-branch',    u.branch  || u.department || '');
    setVal('inp-programme', u.current_programme || u.programme || '');
    setVal('inp-year',      u.current_year || u.year || '');
    setVal('inp-semester',  u.semester || '');
    setVal('inp-adm-year',  u.admission_year || '');
    setVal('inp-section',   u.section || '');
    setVal('inp-btid',      u.bt_id   || u.btid || '');
    setVal('inp-prn',       u.prn     || u.enrollment_no || '');
}

/* ── LOAD APPLICATION STATS ─────────────────────── */
function loadStats() {
    return secureFetch(API_BASE + '/application/my', { credentials: 'include' })
        .then(function(r){ return r.json(); })
        .then(function(res){
            var apps = (res.success && res.data) ? res.data : [];

            var total    = apps.length;
            var pending  = apps.filter(function(a){
                var s = (a.status||'').toLowerCase();
                return s === 'pending' || s === 'clerk_approved' || s === 'hod_approved';
            }).length;
            var approved = apps.filter(function(a){ return (a.status||'').toLowerCase() === 'approved'; }).length;
            var rejected = apps.filter(function(a){ return (a.status||'').toLowerCase().includes('rejected'); }).length;

            setEl('totalApps',    total);
            setEl('pendingApps',  pending);
            setEl('approvedApps', approved);
            setEl('rejectedApps', rejected);

            /* Update sidebar badge */
            setEl('sideAppBadge', total > 0 ? total : '');
        })
        .catch(function(){
            /* Fallback: show zeros */
            setEl('totalApps', '0');
            setEl('pendingApps', '0');
            setEl('approvedApps', '0');
            setEl('rejectedApps', '0');
        });
}

/* ── LOAD NOTIFICATIONS ─────────────────────────── */
function loadNotifications() {
    /* Unread count */
    secureFetch(API_BASE + '/notifications/unread-count', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (res.success) {
                var count = (res.data && res.data.unread_count) || res.count || 0;
                var bell = document.querySelector('.notif-badge');
                if (bell) {
                    bell.textContent = count > 0 ? count : '';
                    bell.style.display = count > 0 ? 'block' : 'none';
                }
                var sideBadge = document.getElementById('sideNotifBadge');
                if (sideBadge) {
                    sideBadge.textContent = count > 0 ? count : '';
                    sideBadge.style.display = count > 0 ? 'block' : 'none';
                }
            }
        })
        .catch(function(){});

    /* Notification list */
    secureFetch(API_BASE + '/notifications/my', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            var notifs = (res.success && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
            var typeIcons = { update:'📋', approved:'✅', rejected:'❌', info:'ℹ️', reminder:'⏰' };

            var dropdown = document.getElementById('notifDropdown');
            if (dropdown) {
                var hdr = dropdown.querySelector('.nd-header');
                var hdrHtml = hdr ? hdr.outerHTML : '<div class="nd-header">Notifications <span class="nd-clear" onclick="clearNotifs()">Mark all read</span></div>';
                dropdown.innerHTML = notifs.length === 0
                    ? hdrHtml + '<div class="nd-item" style="text-align:center;color:#888;padding:20px;">No notifications yet.</div>'
                    : hdrHtml + notifs.slice(0,5).map(function(n) {
                        return '<div class="nd-item" onclick="markRead(' + n.id + ')" style="cursor:pointer;">' +
                            '<div class="nd-icon">' + (n.icon || typeIcons[n.type] || '🔔') + '</div>' +
                            '<div class="nd-text">' +
                                '<div class="nd-title">' + esc(n.title || n.message || '') + '</div>' +
                                '<div class="nd-desc">'  + esc(n.description || n.body || '') + '</div>' +
                                '<div class="nd-time">'  + formatDate(n.created_at) + '</div>' +
                            '</div></div>';
                    }).join('');
            }
        })
        .catch(function(e) { console.error('loadNotifications:', e); });
}

function markRead(notifId) {
    secureFetch(API_BASE + '/notifications/read', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({ notification_id: notifId })
    })
    .then(function() { loadNotifications(); })
    .catch(function(){});
}

function clearNotifs() {
    secureFetch(API_BASE + '/notifications/read-all', { method: 'POST', credentials: 'include' })
        .catch(function(){})
        .finally(function() {
            var dropdown = document.getElementById('notifDropdown');
            if (dropdown) dropdown.classList.remove('open');
            var bell = document.querySelector('.notif-badge');
            if (bell) { bell.textContent = ''; bell.style.display = 'none'; }
            loadNotifications();
        });
}

function toggleNotif() {
    var d = document.getElementById('notifDropdown');
    if (d) d.classList.toggle('open');
}

document.addEventListener('click', function(e) {
    var d = document.getElementById('notifDropdown');
    if (d && !e.target.closest('.notif-btn') && !e.target.closest('.notif-dropdown'))
        d.classList.remove('open');
});

/* ════════════════════════════════════════════════
   AVATAR PREVIEW
════════════════════════════════════════════════ */
function previewAvatar(input) {
    if (!input.files || !input.files[0]) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        var avatar   = document.getElementById('phAvatar');
        var existing = avatar.querySelector('img');
        if (existing) { existing.src = e.target.result; }
        else {
            var img = document.createElement('img');
            img.src = e.target.result;
            avatar.insertBefore(img, avatar.querySelector('.avatar-edit-btn'));
        }
        setEl('phInitials', '');
        showToast('✅ Profile photo preview updated');

        /* Upload to backend */
        var fd = new FormData();
        fd.append('photo', input.files[0]);
        secureFetch(API_BASE + '/profile/photo', { method:'POST', body:fd, credentials:'include' })
            .then(function(r){ return r.json(); })
            .then(function(res){
                if (res.success) showToast('✅ Profile photo saved');
            })
            .catch(function(){});
    };
    reader.readAsDataURL(input.files[0]);
}

/* ════════════════════════════════════════════════
   EDIT / SAVE PERSONAL INFO
════════════════════════════════════════════════ */
function toggleEdit(section) {
    var btn, saveRow, ids, isEditing;

    if (section === 'personal') {
        editingPersonal = !editingPersonal;
        btn       = document.getElementById('editPersonalBtn');
        saveRow   = document.getElementById('save-personal');
        ids       = ['fullname','dob','gender','mobile','address'];
        isEditing = editingPersonal;
    } 
    else if (section === 'academic') {
        editingAcademic = !editingAcademic;
        btn       = document.getElementById('editAcademicBtn');
        saveRow   = document.getElementById('save-academic');
        ids       = ['branch','programme','year','semester','adm-year','section','btid','prn'];
        isEditing = editingAcademic;
    }
    else return;

    ids.forEach(function(id){
        var disp  = document.getElementById('disp-'  + id);
        var input = document.getElementById('inp-'   + id);
        if (id === 'btid') disp = document.getElementById('disp-btid2'); // Special case for ID
        
        if (!disp || !input) return;
        if (isEditing) {
            disp.classList.add('hidden');
            input.classList.remove('hidden');
        } else {
            disp.classList.remove('hidden');
            input.classList.add('hidden');
        }
    });

    if (isEditing) {
        btn.textContent = '✕ Cancel';
        saveRow.classList.remove('hidden');
    } else {
        btn.textContent = '✏️ Edit';
        saveRow.classList.add('hidden');
    }
}

function savePersonal() {
    var name    = (document.getElementById('inp-fullname') || {}).value || '';
    var dob     = (document.getElementById('inp-dob')      || {}).value || '';
    var gender  = (document.getElementById('inp-gender')   || {}).value || '';
    var mobile  = (document.getElementById('inp-mobile')   || {}).value || '';
    var address = (document.getElementById('inp-address')  || {}).value || '';

    name    = name.trim();
    mobile  = mobile.trim();
    address = address.trim();

    if (!name) {
        showToast('⚠️ Full Name is required', true);
        return;
    }

    if (mobile && (mobile.length !== 10 || !/^[0-9]+$/.test(mobile))) {
        showToast('⚠️ Please enter a valid 10-digit mobile number', true);
        return;
    }

    var btn = document.getElementById('editPersonalBtn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Saving…'; }

    /* Send to backend */
    secureFetch(API_BASE + '/profile/update', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
            name: name,
            dob: dob,
            gender: gender,
            mobile: mobile,
            address: address 
        })
    })
    .then(function(r){ return r.json(); })
    .then(function(res){
        if (!res.success) throw new Error(res.message);

        /* Update display values */
        setEl('disp-fullname', name);
        setEl('disp-dob',      dob || '—');
        setEl('disp-gender',   gender ? (gender.charAt(0).toUpperCase() + gender.slice(1)) : '—');
        setEl('disp-mobile',   mobile || 'Not set');
        setEl('disp-address',  address || 'Not set');

        /* Update Header & Avatar Initials if name changed */
        var ini = name.split(' ').filter(Boolean).map(function(n){return n[0];}).join('').substring(0,2).toUpperCase();
        setEl('userInitials', ini);
        setEl('userName',     name);
        setEl('phInitials',   ini);
        setEl('phName',       name);

        /* Persist to localStorage */
        var raw = localStorage.getItem('user');
        var u   = raw ? JSON.parse(raw) : {};
        Object.assign(u, {
            name: name,
            full_name: name,
            dob: dob,
            gender: gender,
            mobile: mobile,
            address: address
        });
        localStorage.setItem('user', JSON.stringify(u));

        cancelEdit('personal');
        showToast('✅ Personal information updated successfully');
    })
    .catch(function(){
        /* Even if backend fails, update locally */
        setEl('disp-mobile',  mobile  || 'Not set');
        setEl('disp-address', address || 'Not set');

        var raw = localStorage.getItem('user');
        var u   = raw ? JSON.parse(raw) : {};
        if (mobile)  u.mobile  = mobile;
        if (address) u.address = address;
        localStorage.setItem('user', JSON.stringify(u));

        cancelEdit('personal');
        showToast('✅ Personal information saved locally');
    })
    .finally(function(){
        if (btn) { btn.disabled = false; btn.textContent = '✏️ Edit'; }
    });
}

function saveAcademic() {
    var data = {
        branch:         (document.getElementById('inp-branch')    || {}).value || '',
        programme:      (document.getElementById('inp-programme') || {}).value || '',
        year:           (document.getElementById('inp-year')      || {}).value || '',
        semester:       (document.getElementById('inp-semester')  || {}).value || '',
        admission_year: (document.getElementById('inp-adm-year')  || {}).value || '',
        section:        (document.getElementById('inp-section')   || {}).value || '',
        bt_id:          (document.getElementById('inp-btid')      || {}).value || '',
        prn:            (document.getElementById('inp-prn')       || {}).value || ''
    };

    var btn = document.getElementById('editAcademicBtn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Saving…'; }

    /* Validation: JBTECH ID */
    if (data.prn && !/^JBTECH\d{5}$/i.test(data.prn)) {
        showToast('⚠️ JBTECH ID must be in format JBTECH24XXX', true);
        if (btn) { btn.disabled = false; btn.textContent = '✏️ Edit'; }
        return;
    }

    secureFetch(API_BASE + '/profile/update', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    })
    .then(function(r){ return r.json(); })
    .then(function(res){
        if (!res.success) throw new Error(res.message);

        /* Update UI Display */
        setEl('disp-branch',    data.branch);
        setEl('disp-programme', data.programme);
        setEl('disp-year',      data.year);
        setEl('disp-semester',  data.semester);
        setEl('disp-adm-year',  data.admission_year);
        setEl('disp-section',   data.section);
        setEl('disp-btid2',     data.bt_id);
        setEl('disp-prn',       data.prn);

        /* Update LocalStorage */
        var raw = localStorage.getItem('user');
        var u   = raw ? JSON.parse(raw) : {};
        Object.assign(u, {
            branch:            data.branch,
            department:        data.branch,
            current_programme: data.programme,
            year:              data.year,
            current_year:      data.year,
            semester:          data.semester,
            admission_year:    data.admission_year,
            section:           data.section,
            bt_id:             data.bt_id,
            btid:              data.bt_id,
            prn:               data.prn
        });
        localStorage.setItem('user', JSON.stringify(u));

        cancelEdit('academic');
        showToast('✅ Academic information updated successfully');
    })
    .catch(function(err){
        console.error('Save error:', err);
        showToast('❌ Failed to update academic info: ' + (err.message || 'Server error'), true);
    })
    .finally(function(){
        if (btn) { btn.disabled = false; btn.textContent = '✏️ Edit'; }
    });
}

function cancelEdit(section) {
    if (section === 'personal' && editingPersonal) {
        toggleEdit('personal');
    }
    else if (section === 'academic' && editingAcademic) {
        toggleEdit('academic');
    }
}

/* ════════════════════════════════════════════════
   KYC DOCUMENT UPLOAD
════════════════════════════════════════════════ */
function triggerUpload(id) {
    var el = document.getElementById(id + '-upload');
    if (el) el.click();
}

function handleKycUpload(input, id) {
    if (!input.files || !input.files[0]) return;

    var file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
        showToast('⚠️ File too large (max 5MB)', true);
        return;
    }

    var item     = input.closest('.kyc-item');
    var statusEl = item ? item.querySelector('.kyc-status') : null;
    var btn      = item ? item.querySelector('.kyc-view-btn') : null;

    if (statusEl) { statusEl.className = 'kyc-status pending'; statusEl.textContent = '⏳ Uploading…'; }
    if (btn)      { btn.textContent = 'Uploading…'; btn.disabled = true; }

    var fd = new FormData();
    fd.append('document', file);
    fd.append('document_type', id);

    secureFetch(API_BASE + '/profile/document', { method:'POST', body:fd, credentials:'include' })
        .then(function(r){ return r.json(); })
        .then(function(res){
            if (statusEl) { statusEl.className = 'kyc-status pending'; statusEl.textContent = '⏳ Under Review'; }
            if (btn)      { btn.textContent = 'Uploaded'; btn.disabled = true; }
            showToast('📤 Document uploaded. Under review by admin.');
        })
        .catch(function(){
            if (statusEl) { statusEl.className = 'kyc-status pending'; statusEl.textContent = '⏳ Under Review'; }
            if (btn)      { btn.textContent = 'Uploaded'; btn.disabled = true; }
            showToast('📤 Document uploaded. Under review by admin.');
        });
}

/* ════════════════════════════════════════════════
   CHANGE PASSWORD MODAL
════════════════════════════════════════════════ */
function openModal(id) {
    var el = document.getElementById('modal-' + id);
    if (el) el.classList.add('open');
}

function closeModal(id) {
    var el = document.getElementById('modal-' + id);
    if (el) el.classList.remove('open');

    ['cur-pass','new-pass','conf-pass'].forEach(function(fid){
        var f = document.getElementById(fid);
        if (f) f.value = '';
    });
    var al   = document.getElementById('pw-alert');
    var fill = document.getElementById('pw-fill');
    var lbl  = document.getElementById('pw-label');
    if (al)   { al.style.display = 'none'; al.className = 'modal-alert'; }
    if (fill) fill.style.width = '0';
    if (lbl)  lbl.textContent = '–';
}

function togglePw(inputId, btn) {
    var inp = document.getElementById(inputId);
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
    btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function checkPwStrength(val) {
    var fill  = document.getElementById('pw-fill');
    var label = document.getElementById('pw-label');
    if (!fill || !label) return;

    var score = 0;
    if (val.length >= 8)           score++;
    if (/[A-Z]/.test(val))         score++;
    if (/[0-9]/.test(val))         score++;
    if (/[^A-Za-z0-9]/.test(val))  score++;

    var cfg = [
        { w:'25%',  bg:'#ef4444', t:'Weak'   },
        { w:'50%',  bg:'#f97316', t:'Fair'   },
        { w:'75%',  bg:'#eab308', t:'Good'   },
        { w:'100%', bg:'#22c55e', t:'Strong' }
    ];
    var c = cfg[Math.max(score - 1, 0)];
    fill.style.width      = c.w;
    fill.style.background = c.bg;
    label.textContent     = c.t;
    label.style.color     = c.bg;
}

function changePassword() {
    var cur  = (document.getElementById('cur-pass')  || {}).value || '';
    var nw   = (document.getElementById('new-pass')  || {}).value || '';
    var conf = (document.getElementById('conf-pass') || {}).value || '';
    var al   = document.getElementById('pw-alert');

    function showErr(msg) {
        if (!al) return;
        al.textContent   = '⚠️ ' + msg;
        al.className     = 'modal-alert error';
        al.style.display = 'block';
    }

    if (!cur)            return showErr('Please enter your current password.');
    if (nw.length < 8)  return showErr('New password must be at least 8 characters.');
    if (nw !== conf)     return showErr('Passwords do not match.');

    var btn = document.querySelector('#modal-changePassword .btn-modal-primary');
    if (btn) { btn.disabled = true; btn.textContent = 'Updating…'; }

    secureFetch(API_BASE + '/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        credentials: 'include',
        body: JSON.stringify({ current_password: cur, new_password: nw })
    })
    .then(function(r){ return r.json(); })
    .then(function(res){
        if (res.success) {
            if (al) {
                al.textContent   = '✅ Password updated successfully!';
                al.className     = 'modal-alert success';
                al.style.display = 'block';
            }
            setTimeout(function(){
                closeModal('changePassword');
                showToast('🔑 Password changed successfully');
            }, 1200);
        } else {
            showErr(res.message || 'Current password is incorrect.');
        }
    })
    .catch(function(){
        showErr('Could not connect to server. Please try again.');
    })
    .finally(function(){
        if (btn) { btn.disabled = false; btn.textContent = 'Update Password'; }
    });
}

/* ════════════════════════════════════════════════
   LOGOUT ALL DEVICES
════════════════════════════════════════════════ */
function confirmLogoutAll() {
    if (confirm('This will log you out from all devices. Continue?')) {
        secureFetch(API_BASE + '/auth/logout-all', { method:'POST', credentials:'include' })
        .finally(function(){
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}

/* ════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════ */
function showToast(msg, isError) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent      = msg;
    t.style.background = isError ? '#b91c1c' : '#111827';
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(function(){ t.classList.remove('show'); }, 3000);
}

/* ════════════════════════════════════════════════
   LOGOUT
════════════════════════════════════════════════ */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        secureFetch(API_BASE + '/auth/logout', { method:'POST', credentials:'include' })
        .finally(function(){
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}