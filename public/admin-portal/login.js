/* ============================================================
   JDCOEM Admin Portal — login.js
   Location: public/admin-portal/login.js
   ============================================================ */

// BASE_URL and SECURITY_API are now globally defined in security.js
// We use API_BASE here to match the existing code structure
var API_BASE = SECURITY_API;

var ROLE_REDIRECT = {
  clerk:     'clerk.html',
  hod:       'hod.html',
  principal: 'principal.html',
  admin:     'clerk.html'
};

/* Permanent email → role map.
   This is the single source of truth — overrides whatever the DB returns. */
var EMAIL_ROLE = {
  'saar@jdcoem.ac.in':  'clerk',
  'skhod@jdcoem.ac.in': 'hod',
  'sagar@jdcoem.ac.in': 'principal'
};

/* ── PAGE LOAD ──────────────────────────────────────────────
   ALWAYS wipe localStorage on the login page.
   Stale admin_user was the reason principal.html kept loading
   without a login — the old version auto-redirected from here.
   Fix: login page never redirects. User MUST type credentials.
   Also remove old shared keys (pre role-specific fix) so stale
   data from the old format never interferes. */
window.addEventListener('DOMContentLoaded', function () {
  /* Remove old shared keys from before the role-specific fix */
  localStorage.removeItem('admin_user');
  localStorage.removeItem('admin_creds');
  // Remove role-specific creds too
  localStorage.removeItem('admin_creds_clerk');
  localStorage.removeItem('admin_creds_hod');
  localStorage.removeItem('admin_creds_principal');

  var emailEl = document.getElementById('emailIn');
  if (emailEl) emailEl.focus();
});

/* Enter key triggers login from any input on the page */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') doLogin();
});

/* ── CLEAR FORM ERRORS ── */
function clearErr() {
  var el = document.getElementById('formErr');
  if (el) el.classList.remove('show');
  var emailEl = document.getElementById('emailIn');
  var pwEl    = document.getElementById('pwIn');
  if (emailEl) emailEl.classList.remove('err');
  if (pwEl)    pwEl.classList.remove('err');
}

/* ── MAIN LOGIN ─────────────────────────────────────────────
   Flow:
   1. Validate inputs
   2. POST /auth/logout  → destroy any existing PHP session
      (prevents student session leaking into admin API calls)
   3. POST /auth/login   → fresh login
   4. Email→role map guarantees correct role regardless of DB value
   5. Save to ROLE-SPECIFIC localStorage key → redirect to correct dashboard
      Using role-specific keys (admin_user_clerk, admin_user_hod, etc.)
      prevents different roles open in the same browser from
      overwriting each other's session data — which was the root
      cause of the 4-minute redirect bug.                               */
function doLogin() {
  var emailEl = document.getElementById('emailIn');
  var pwEl    = document.getElementById('pwIn');
  var btn     = document.getElementById('signInBtn');

  var email = emailEl ? emailEl.value.trim() : '';
  var pw    = pwEl    ? pwEl.value           : '';

  if (!email) {
    showError('Please enter your email address.');
    if (emailEl) { emailEl.classList.add('err'); emailEl.focus(); }
    return;
  }
  if (!pw) {
    showError('Please enter your password.');
    if (pwEl) { pwEl.classList.add('err'); pwEl.focus(); }
    return;
  }

  clearErr();
  setBtn(btn, true, 'Signing in…');

  /* Step 1 — Destroy any existing PHP session */
  secureFetch(API_BASE + '/auth/logout')
  .catch(function () { /* safe to ignore — session may already be empty */ })
  .finally(function () {

    /* Step 2 — Fresh admin login */
    secureFetch(API_BASE + '/auth/login', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ email: email, password: pw })
    })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      console.log('[Admin Login] Response:', JSON.stringify(res));

      /* ── SUCCESS — admin login returns status:"success" with no OTP ── */
      if (res.status === 'success') {
        var user = res.user || {};
        var role = (user.role || '').toLowerCase().trim();

        /* Email map always overrides DB role — guaranteed correct redirect */
        var mappedRole = EMAIL_ROLE[email.toLowerCase().trim()];
        if (mappedRole) role = mappedRole;

        if (!ROLE_REDIRECT[role]) {
          showError('Access denied. This account does not have admin access.');
          setBtn(btn, false, 'Sign In to Admin Portal');
          return;
        }

        /* ── FIX: save to ROLE-SPECIFIC keys so clerk, hod, principal
           open in the same browser never overwrite each other's data.
           clerk  → admin_user_clerk  / admin_creds_clerk
           hod    → admin_user_hod    / admin_creds_hod
           principal → admin_user_principal / admin_creds_principal   ── */
        localStorage.setItem('admin_user_' + role, JSON.stringify({
          id:    user.id    || null,
          name:  user.name  || user.full_name || email.split('@')[0],
          email: user.email || email,
          role:  role
        }));

        console.log('[Admin Login] Role:', role, '→ Redirecting to:', ROLE_REDIRECT[role]);
        setBtn(btn, true, 'Redirecting…');

        setTimeout(function () {
          window.location.replace(ROLE_REDIRECT[role]);
        }, 250);
        return;
      }

      /* ── STUDENT ACCOUNT — backend sends otp_required for students ── */
      if (res.status === 'otp_required') {
        showError('Student accounts cannot access the admin portal.');
        setBtn(btn, false, 'Sign In to Admin Portal');
        return;
      }

      /* ── WRONG CREDENTIALS ── */
      showError(res.message || 'Incorrect email or password. Please try again.');
      if (pwEl) pwEl.value = '';
      setBtn(btn, false, 'Sign In to Admin Portal');
    })
    .catch(function (err) {
      console.error('[Admin Login] Network error:', err);
      showError('Network error. Check that XAMPP is running.');
      setBtn(btn, false, 'Sign In to Admin Portal');
    });

  });
}

/* ── HELPERS ── */
function showError(msg) {
  var errEl  = document.getElementById('formErr');
  var errTxt = document.getElementById('formErrTxt');
  if (errTxt) errTxt.textContent = msg;
  if (errEl)  errEl.classList.add('show');
}

function setBtn(btn, disabled, text) {
  if (!btn) return;
  btn.disabled    = disabled;
  btn.textContent = text;
}

function togglePw() {
  var inp = document.getElementById('pwIn');
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
}