<?php

if (!isset($router)) {
    die("Router not initialized");
}

/* ================================================== TEST ================================================== */
$router->get('/api/test', fn() => (new TestController())->test());
$router->get('/api/debug/session', fn() => (new ApplicationController())->debugSession());

/* ================================================== AUTH ================================================== */
$router->post('/api/auth/register', fn() => (new AuthController())->register());
$router->post('/api/auth/login',    fn() => (new AuthController())->login());
$router->post('/api/auth/logout',   fn() => (new AuthController())->logout());
$router->post('/api/auth/verify-otp', fn() => (new AuthController())->verifyOtp());
$router->get('/api/auth/me',        fn() => (new AuthController())->me());
$router->get('/api/auth/csrf',      fn() => (new AuthController())->csrf());

/* ================================================== STUDENT ================================================== */
$router->post('/api/student/create',       fn() => (new StudentController())->create());
$router->get('/api/student/profile',       fn() => (new StudentController())->profile());
$router->get('/api/student/dashboard',     fn() => (new StudentController())->dashboard());
$router->get('/api/student/certificates',  fn() => (new StudentController())->certificates());

/* ================================================== PROFILE ================================================== */
$router->post('/api/profile/photo',        fn() => (new ProfileController())->uploadPhoto());
$router->post('/api/profile/document',     fn() => (new ProfileController())->uploadDocument());
$router->post('/api/profile/update',       fn() => (new ProfileController())->update());

/* ================================================== DOCUMENTS ================================================== */
$router->post('/api/documents/upload',    fn() => (new DocumentController())->upload());
$router->get('/api/documents/my',         fn() => (new DocumentController())->myDocuments());
$router->get('/api/documents/download',   fn() => (new DocumentController())->download());
$router->post('/api/documents/delete',    fn() => (new DocumentController())->delete());

/* ================================================== APPLICATIONS ================================================== */
$router->post('/api/application/create',   fn() => (new ApplicationController())->create());
$router->post('/api/application/submit',   fn() => (new ApplicationController())->submit());
$router->post('/api/application/store',    fn() => (new ApplicationController())->store());   /* ← NEW: admission.js multipart submit */
$router->get('/api/application/all',       fn() => (new ApplicationController())->all());
$router->get('/api/application/view',      fn() => (new ApplicationController())->view());
$router->get('/api/application/timeline',  fn() => (new ApplicationController())->timeline());
$router->get('/api/application/my',        fn() => (new ApplicationController())->myApplications());
$router->get('/api/application/status',    fn() => (new ApplicationController())->getStatus());
$router->get('/api/application/progress',  fn() => (new ApplicationController())->progress());

/* ================================================== CLERK ================================================== */
$router->get('/api/application/clerk-pending',  fn() => (new ApplicationController())->clerkPending());
$router->post('/api/application/clerk-approve', fn() => (new ApplicationController())->clerkApprove());
$router->post('/api/application/clerk-reject',  fn() => (new ApplicationController())->clerkReject());

/* ================================================== HOD ================================================== */
$router->get('/api/application/hod-pending',  fn() => (new ApplicationController())->hodPending());
$router->post('/api/application/hod-approve', fn() => (new ApplicationController())->hodApprove());
$router->post('/api/application/hod-reject',  fn() => (new ApplicationController())->hodReject());

/* Camel-case aliases — hod.js older versions used these */
$router->post('/api/application/hodApprove', fn() => (new ApplicationController())->hodApprove());
$router->post('/api/application/hodReject',  fn() => (new ApplicationController())->hodReject());

/* ================================================== PRINCIPAL ================================================== */
$router->get('/api/application/principal-pending',        fn() => (new ApplicationController())->principalPending());
$router->post('/api/application/principal-approve',       fn() => (new ApplicationController())->principalApprove());
$router->post('/api/application/principal-reject',        fn() => (new ApplicationController())->principalReject());
$router->post('/api/application/principal-approve-final', fn() => (new ApplicationController())->principalApproveFinal());

/* Camel-case aliases — principal.js older versions used these */
$router->post('/api/application/principalApprove', fn() => (new ApplicationController())->principalApprove());
$router->post('/api/application/principalReject',  fn() => (new ApplicationController())->principalReject());

/* ================================================== CERTIFICATES ================================================== */
$router->post('/api/certificate/generate',  fn() => (new CertificateController())->generate());
$router->get('/api/certificate/download',   fn() => (new CertificateController())->download());
$router->get('/api/certificate/verify',     fn() => (new CertificateController())->verify());
$router->post('/api/certificate/verify-hash', fn() => (new CertificateController())->verifyHash());

/* ================================================== ADMIN — CERTIFICATES ================================================== */
$router->get('/api/admin/certificates',          fn() => (new AdminCertificateController())->index());
$router->get('/api/admin/certificates/search',   fn() => (new AdminCertificateController())->search());
$router->get('/api/admin/certificates/stats',    fn() => (new AdminCertificateController())->stats());
$router->get('/api/admin/certificates/view',     fn() => (new AdminCertificateController())->view());
$router->get('/api/admin/certificates/download', fn() => (new AdminCertificateController())->download());

/* ================================================== NOTIFICATIONS ================================================== */
$router->get('/api/notifications/my',             fn() => (new NotificationController())->myNotifications());
$router->post('/api/notifications/read',          fn() => (new NotificationController())->markRead());
$router->post('/api/notifications/mark-all-read', fn() => (new NotificationController())->markAllRead());
$router->get('/api/notifications/unread-count',   fn() => (new NotificationController())->unreadCount());
$router->get('/api/notifications',                fn() => (new NotificationController())->myNotifications());

/* ================================================== DASHBOARD / STATS ================================================== */
$router->get('/api/application/dashboardStats', fn() => (new ApplicationController())->dashboardStats());
$router->get('/api/application/pendingCount',   fn() => (new ApplicationController())->pendingCount());

/* ================================================== REST COMPATIBILITY ALIASES ================================================== */
$router->post('/api/applications',          fn() => (new ApplicationController())->create());
$router->get('/api/applications/my',        fn() => (new ApplicationController())->myApplications());
$router->get('/api/applications/status',    fn() => (new ApplicationController())->getStatus());
$router->get('/api/applications/progress',  fn() => (new ApplicationController())->progress());
$router->get('/api/applications/view',      fn() => (new ApplicationController())->getApplication());