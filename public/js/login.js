/* ============================================================
   login.js  |  JDCOEM Student Portal
   Flow: Login/Register → OTP sent → Verify OTP → home.html
   ============================================================ */

// API_BASE is now defined dynamically in security.js
var API_BASE = SECURITY_API;

/* ── OTP PANEL INJECTED DYNAMICALLY ── */
(function injectOtpPanel() {
    const panel = document.createElement('div');
    panel.id = 'panel-otp';
    panel.className = 'form-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
        <div class="alert alert-error"   id="otp-error"></div>
        <div class="alert alert-success" id="otp-success"></div>
        <div class="form-note">
            <strong>📧 OTP Sent!</strong>
            A 6-digit OTP has been sent to your college email.
            Please enter it below to verify your identity.
        </div>
        <div class="otp-email-display" id="otpEmailDisplay"
             style="text-align:center; font-weight:600; color:var(--saffron);
                    margin:8px 0 16px; font-size:15px;"></div>
        <form id="form-otp" onsubmit="handleVerifyOtp(event)" novalidate>
            <div class="form-row">
                <label for="otp-input">Enter OTP <span class="req">*</span></label>
                <div class="input-wrap">
                    <span class="input-icon">🔑</span>
                    <input type="text" id="otp-input" name="otp"
                           placeholder="Enter 6-digit OTP"
                           maxlength="6" autocomplete="one-time-code"
                           style="letter-spacing:6px; font-size:20px; text-align:center;">
                </div>
            </div>
            <button type="submit" class="submit-btn" id="otp-btn">Verify OTP</button>
        </form>
        <div style="text-align:center; margin-top:14px; font-size:13px; color:var(--gray-500);">
            Didn't receive the OTP?
            <a href="javascript:void(0)" onclick="resendOtp()"
               style="color:var(--saffron); font-weight:600;">Resend OTP</a>
        </div>
        <div style="text-align:center; margin-top:10px; font-size:13px;">
            <a href="javascript:void(0)" onclick="backToLogin()"
               style="color:var(--gray-500);">← Back to Login</a>
        </div>
    `;

    const authCard = document.querySelector('.auth-card');
    if (authCard) authCard.appendChild(panel);
})();

/* ── STATE ── */
var _pendingEmail    = '';   // email waiting for OTP verification
var _pendingPassword = '';   // password kept in memory for silent re-login cred save

/* ── TAB SWITCHER ── */
function switchTab(tab) {
    const btnLogin    = document.getElementById('tab-login');
    const btnRegister = document.getElementById('tab-register');
    const panelLogin  = document.getElementById('panel-login');
    const panelReg    = document.getElementById('panel-register');
    const panelOtp    = document.getElementById('panel-otp');

    if (panelOtp) panelOtp.style.display = 'none';

    if (tab === 'login') {
        btnLogin.classList.add('active');
        btnRegister.classList.remove('active');
        panelLogin.style.display = 'block';
        panelReg.style.display   = 'none';
    } else {
        btnRegister.classList.add('active');
        btnLogin.classList.remove('active');
        panelReg.style.display   = 'block';
        panelLogin.style.display = 'none';
    }

    document.querySelectorAll('.alert').forEach(a => a.classList.remove('show'));
}

/* ── SHOW OTP PANEL ── */
function showOtpPanel(email) {
    _pendingEmail = email;

    document.getElementById('panel-login').style.display    = 'none';
    document.getElementById('panel-register').style.display = 'none';
    document.getElementById('panel-otp').style.display      = 'block';

    const tabSwitcher = document.querySelector('.tab-switcher');
    if (tabSwitcher) tabSwitcher.style.display = 'none';

    const emailDisplay = document.getElementById('otpEmailDisplay');
    if (emailDisplay) emailDisplay.textContent = email;

    setTimeout(() => {
        const inp = document.getElementById('otp-input');
        if (inp) inp.focus();
    }, 100);
}

/* ── BACK TO LOGIN ── */
function backToLogin() {
    _pendingEmail    = '';
    _pendingPassword = '';
    document.getElementById('panel-otp').style.display   = 'none';
    document.getElementById('panel-login').style.display = 'block';
    const tabSwitcher = document.querySelector('.tab-switcher');
    if (tabSwitcher) tabSwitcher.style.display = '';
    document.querySelectorAll('.alert').forEach(a => a.classList.remove('show'));
}

/* ── ALERT HELPER ── */
function showAlert(id, msg) {
    document.querySelectorAll('.alert').forEach(a => a.classList.remove('show'));
    const el = document.getElementById(id);
    if (!el) return;
    if (msg) el.textContent = msg;
    el.classList.add('show');
}

/* ── LOGIN ── */
async function handleLogin(event) {
    event.preventDefault();

    const email    = document.getElementById('login-btid').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = document.getElementById('login-btn');

    if (!email || !password) {
        showAlert('login-error', 'Please enter your email and password.');
        return;
    }

    /* ── FIX: Block admin emails from student portal entirely.
       Admin accounts must use the Admin Portal (admin-portal/index.html).
       Checking client-side first for instant feedback — the backend
       also enforces this via OTP requirement, but this is cleaner UX. ── */
    var ADMIN_EMAILS = [
        'saar@jdcoem.ac.in',
        'skhod@jdcoem.ac.in',
        'sagar@jdcoem.ac.in'
    ];
    if (ADMIN_EMAILS.indexOf(email.toLowerCase().trim()) > -1) {
        showAlert('login-error', '⛔ Admin accounts cannot access the Student Portal. Please use the Admin Portal.');
        _pendingPassword = '';
        return;
    }


    /* SAVE: keep password in memory so we can store it after OTP success */
    _pendingPassword = password;

    btn.classList.add('loading');
    btn.disabled = true;

    try {
        /* ── FIX: Destroy any existing admin PHP session FIRST.
           Without this, if an admin was logged in on this browser,
           their session cookie stays alive and the student dashboard
           shows the admin's data instead of the student's own data.
           This mirrors exactly what admin/login.js already does.   ── */
        try {
            await secureFetch(`${API_BASE}/auth/logout`);
        } catch(e) { /* safe to ignore — session may already be empty */ }

        const response = await secureFetch(`${API_BASE}/auth/login`, {
            method:      'POST',
            headers:     { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body:        JSON.stringify({ email, password })
        });

        const result = await response.json();
        console.log('Login result:', result);

        if (result.status === 'otp_required') {
            showOtpPanel(result.email || email);

        } else if (result.status === 'error') {
            showAlert('login-error', result.message || 'Invalid credentials.');
            _pendingPassword = '';

        } else {
            showAlert('login-error', result.message || 'Unexpected response from server.');
            _pendingPassword = '';
        }

    } catch (error) {
        console.error('Login error:', error);
        showAlert('login-error', 'Cannot connect to server. Please check the backend.');
        _pendingPassword = '';
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

/* ── REGISTER ── */
async function handleRegister(event) {
    event.preventDefault();

    const fname   = document.getElementById('reg-fname').value.trim();
    const lname   = document.getElementById('reg-lname').value.trim();
    const btid    = document.getElementById('reg-btid').value.trim();
    const email   = document.getElementById('reg-email').value.trim();
    const branch  = document.getElementById('reg-branch').value;
    const year    = document.getElementById('reg-year').value;
    const mobile  = document.getElementById('reg-mobile').value.trim();
    const pass    = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const terms   = document.getElementById('terms-check').checked;
    const btn     = document.getElementById('reg-btn');

    if (!fname || !lname || !btid || !email || !branch || !year || !mobile || !pass || !confirm) {
        showAlert('reg-error', 'Please fill in all required fields.');
        return;
    }
    if (!email.endsWith('@jdcoem.ac.in')) {
        showAlert('reg-error', 'Only @jdcoem.ac.in email addresses are accepted.');
        return;
    }
    if (pass !== confirm) {
        showAlert('reg-error', 'Passwords do not match. Please try again.');
        return;
    }
    if (!terms) {
        showAlert('reg-error', 'You must accept the Terms of Use and Privacy Policy.');
        return;
    }

    /* SAVE password for silent re-login after OTP */
    _pendingPassword = pass;

    btn.classList.add('loading');
    btn.disabled = true;

    try {
        const response = await secureFetch(`${API_BASE}/auth/register`, {
            method:      'POST',
            headers:     { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body:        JSON.stringify({
                name:     fname + ' ' + lname,
                email,
                password: pass,
                bt_id:    btid,
                branch,
                year,
                mobile
            })
        });

        const data = await response.json();
        console.log('Register result:', data);

        if (data.success === true) {
            document.getElementById('form-register').reset();
            showOtpPanel(email);
        } else {
            showAlert('reg-error', data.message || 'Registration failed. Try again.');
            _pendingPassword = '';
        }

    } catch (error) {
        console.error('Register error:', error);
        showAlert('reg-error', 'Cannot connect to backend server.');
        _pendingPassword = '';
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

/* ── VERIFY OTP ── */
async function handleVerifyOtp(event) {
    event.preventDefault();

    const otp = document.getElementById('otp-input').value.trim();
    const btn = document.getElementById('otp-btn');

    if (!otp || otp.length < 4) {
        showAlert('otp-error', 'Please enter the OTP sent to your email.');
        return;
    }
    if (!_pendingEmail) {
        showAlert('otp-error', 'Session expired. Please login again.');
        backToLogin();
        return;
    }

    btn.classList.add('loading');
    btn.disabled = true;

    try {
        const response = await secureFetch(`${API_BASE}/auth/verify-otp`, {
            method:      'POST',
            headers:     { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body:        JSON.stringify({ email: _pendingEmail, otp })
        });

        const result = await response.json();
        console.log('OTP result:', result);

        if (result.status === 'success') {
            // ✅ Save user to localStorage
            localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.setItem('role', result.user?.role || 'student');

            // Clear password from memory
            _pendingPassword = '';

            showAlert('otp-success', 'Verified! Redirecting…');

            setTimeout(() => {
                window.location.href = 'home.html';
            }, 800);

        } else {
            showAlert('otp-error', result.message || 'Invalid or expired OTP. Please try again.');
        }

    } catch (error) {
        console.error('OTP error:', error);
        showAlert('otp-error', 'Cannot connect to server. Please try again.');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

/* ── RESEND OTP ── */
async function resendOtp() {
    if (!_pendingEmail) return;

    try {
        await secureFetch(`${API_BASE}/auth/login`, {
            method:      'POST',
            headers:     { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body:        JSON.stringify({ email: _pendingEmail, resend: true })
        });
        showAlert('otp-success', 'OTP resent to ' + _pendingEmail);
    } catch (e) {
        showAlert('otp-error', 'Failed to resend OTP. Please try again.');
    }
}

/* ── HELPER: Password Toggle ── */
function togglePassword(id, btn) {
    const input = document.getElementById(id);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

function togglePasswordCheckbox(id, checkbox) {
    const input = document.getElementById(id);
    if (input) input.type = checkbox.checked ? 'text' : 'password';
}

/* ── HELPER: Password Strength ── */
function checkStrength(val) {
    const fill  = document.getElementById('strength-fill');
    const label = document.getElementById('strength-label');
    if (!fill || !label) return;

    let score = 0;
    if (val.length >= 8)           score++;
    if (/[A-Z]/.test(val))         score++;
    if (/[0-9]/.test(val))         score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#e74c3c', '#f39c12', '#3498db', '#27ae60'];
    const widths = ['0%', '25%', '50%', '75%', '100%'];

    fill.style.width      = widths[score];
    fill.style.background = colors[score];
    label.textContent     = 'Strength: ' + (levels[score] || '–');
}

/* ── HELPER: Forgot Password ── */
function showForgotAlert() {
    alert('Please contact the Academic Section at Block A, Room 101, or email support@jdcoem.ac.in');
}