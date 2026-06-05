<?php

require_once __DIR__ . '/../helpers/StudentPathHelper.php';

require_once __DIR__ . '/../Services/ApplicationService.php';
require_once __DIR__ . '/../core/Session.php';
require_once __DIR__ . '/../Repositories/ApplicationRepository.php';

class ApplicationController extends Controller
{
    private $applicationService;
    private ApplicationService $service;
    private $repo;

    public function __construct()
    {
        Session::start();

        $this->service            = new ApplicationService();
        $this->applicationService = $this->service;
        $this->repo               = new ApplicationRepository();
    }

    /* ==================================================
       HELPERS
    ==================================================*/

    private function adminLoggedIn(): bool
    {
        return !empty(Session::get('user_id'))
            || !empty(Session::get('admin_id'))
            || !empty(Session::get('id'));
    }

    private function currentUserId()
    {
        return Session::get('user_id')
            ?? Session::get('admin_id')
            ?? Session::get('id')
            ?? null;
    }

    private function jsonInput()
    {
        return json_decode(file_get_contents("php://input"), true) ?? [];
    }

    private function respond($data, $code = 200)
    {
        http_response_code($code);
        header("Content-Type: application/json");
        echo json_encode($data);
    }

    /* ==================================================
       DEBUG SESSION
    ==================================================*/

    public function debugSession()
    {
        $this->respond([
            "role"    => Session::get("role"),
            "user_id" => Session::get("user_id"),
            "user"    => Session::get("user")
        ]);
    }

    /* ==================================================
       CREATE APPLICATION

       FIX: Now extracts admType / certificate_type from
       $data and passes it to repo->create() as adm_type.

       Without this fix, adm_type was always NULL in DB.
       DocumentController reads adm_type to pick the upload
       subfolder — NULL → 'general/' → wrong folder.

       With fix:
         character.js sends admType: 'character'
         → create() passes 'character' to repo->create()
         → adm_type = 'character' saved in DB
         → DocumentController picks storage/uploads/character/  ✅

       All existing callers unaffected — admType defaults
       to null if not present in $data.
    ==================================================*/

    public function create()
    {
        try {
            $data      = $this->jsonInput();
            $studentId = Session::get("user_id");
            if (!$studentId) throw new Exception("Unauthorized");

            $data['student_id'] = $studentId;

            /*
             * Extract adm_type from whichever key the frontend sends:
             *   character.js  → admType: 'character'
             *   bonafide.js   → admType: 'bonafide'
             *   admission.js  → admType: 'admission'
             * Falls back to null if not present (legacy callers unaffected).
             */
            $admType = strtolower(trim(
                $data['admType']
                ?? $data['adm_type']
                ?? $data['certificate_type']
                ?? ''
            )) ?: null;

            // Check if student has a profile (bt_id exists)
            $btid = '';
            try {
                require_once __DIR__ . '/../core/Database.php';
                $db   = Database::getInstance()->getConnection();
                $stmt = $db->prepare('SELECT bt_id FROM students WHERE user_id = :uid LIMIT 1');
                $stmt->execute([':uid' => $studentId]);
                $row  = $stmt->fetch(PDO::FETCH_ASSOC);
                $btid = trim($row['bt_id'] ?? '');
            } catch (Exception $e) {
                $btid = '';
            }

            if ($btid === '') {
                return $this->respond([
                    'success' => false,
                    'message' => 'Your profile is incomplete. Please complete your profile before applying for any document.'
                ], 422);
            }

            /*
             * service->createApplication() calls repo->create()
             * which now accepts adm_type as 4th optional param.
             */
            $id = $this->service->createApplication($data, $admType);

            require_once __DIR__ . '/../Services/ApplicationNumberService.php';
            $numberService = new ApplicationNumberService();
            $appNumber     = $numberService->assign($id);

            $this->respond([
                "success"            => true,
                "application_id"     => $id,
                "application_number" => $appNumber
            ]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /* ==================================================
       LEGACY SUBMIT
    ==================================================*/

    public function submit()
    {
        try {
            $studentId = Session::get("user_id");
            if (!$studentId) throw new Exception("Unauthorized");

            $data       = $_POST ?: $this->jsonInput();
            $documentId = $data['document_id'] ?? $data['document_type'] ?? null;
            $purpose    = $data['purpose'] ?? '';

            $result = $this->service->submitApplication($studentId, $documentId, $purpose);

            $this->respond(["success" => true, "application_number" => $result]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /* ==================================================
       STORE APPLICATION WITH FILE UPLOAD
       Used by: bonafide, admission, character (and any
       future certificate type) via multipart FormData.

       Upload folder is determined by certificate_type.

       CRITICAL: Files MUST go into public/storage/uploads/{type}/
       so they are web-accessible by the browser.
       storage/uploads/ is OUTSIDE public/ — browser
       cannot reach files there directly.

       File saved to disk:
         public/storage/uploads/character/1234_photo.jpg

       Path stored in DB (for getDocuments() URL building):
         storage/uploads/character/1234_photo.jpg
         → browser loads: /college-portal/public/storage/uploads/character/1234_photo.jpg ✅
    ==================================================*/

    public function store()
    {
        $userId = $this->currentUserId();

        if (!$userId) {
            return $this->respond(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $applicationId = $this->repo->createAdmission($userId, $_POST);

            /*
             * FIX: Use assign() not generate().
             *
             * generate() only formats the number string — it does NOT save it.
             * The separate updateApplicationNumber() call after it was also
             * redundant and could race/overwrite in edge cases.
             *
             * assign() does everything safely in one call:
             *   1. Checks if number already assigned (prevents overwrite)
             *   2. Generates APP-YYYY-XXXXXX
             *   3. Saves to DB
             *   4. Returns the number
             *
             * This matches how create() works — same service, same method.
             */
            require_once __DIR__ . '/../Services/ApplicationNumberService.php';
            $applicationNumberService = new ApplicationNumberService();
            $applicationNumber        = $applicationNumberService->assign($applicationId);

            // Determine cert type for folder name
            $typeToFolder = [
                'bonafide'    => 'bonafide',
                'admission'   => 'admission',
                'character'   => 'character',
                'leaving'     => 'leaving',
                'noc'         => 'noc',
                'transcript'  => 'transcript',
                'provisional' => 'provisional',
                'id card'     => 'id card',
                'id_card'     => 'id card',
                'idcard'      => 'id card',
                'identity'    => 'id card',
            ];

            $certTypeRaw = strtolower(trim($_POST['certificate_type'] ?? $_POST['admType'] ?? ''));
            $certType    = $typeToFolder[$certTypeRaw] ?? 'general';

            /*
             * Fetch student BTID to build hierarchical path.
             * If no BTID → error (student must complete profile).
             */
            $btid = '';
            try {
                require_once __DIR__ . '/../core/Database.php';
                $db   = Database::getInstance()->getConnection();
                $stmt = $db->prepare('SELECT bt_id FROM students WHERE user_id = :uid LIMIT 1');
                $stmt->execute([':uid' => $userId]);
                $row  = $stmt->fetch(PDO::FETCH_ASSOC);
                $btid = trim($row['bt_id'] ?? '');
            } catch (Exception $e) {
                $btid = '';
            }

            if ($btid === '') {
                return $this->respond([
                    'success' => false,
                    'message' => 'Your BTID is not set. Please complete your profile before submitting.'
                ], 422);
            }

            /*
             * Build BTID-based upload directory:
             * storage/uploads/STUDENTS/{year}/{dept}/{btid}/applications/{certType}/
             */
            $uploadDir = StudentPathHelper::getApplicationPath($btid, $certType);
            StudentPathHelper::ensureDir($uploadDir);

            // Handle uploaded documents
            // JS sends as documents[photo], documents[id_card], etc.
            // PHP parses into $_FILES['documents']['name']['photo'] etc.
            if (!empty($_FILES['documents']['name'])) {
                foreach ($_FILES['documents']['name'] as $docType => $fileName) {
                    if (empty($fileName)) continue;

                    $tmpFile = $_FILES['documents']['tmp_name'][$docType];
                    $error   = $_FILES['documents']['error'][$docType];

                    if ($error !== UPLOAD_ERR_OK || !is_uploaded_file($tmpFile)) continue;

                    // Security: Validate file type and size
                    require_once __DIR__ . '/../helpers/FileUploadHelper.php';
                    $validation = FileUploadHelper::validate([
                        'name' => $fileName,
                        'tmp_name' => $tmpFile,
                        'error' => $error,
                        'size' => $_FILES['documents']['size'][$docType]
                    ]);

                    if ($validation !== true) {
                        throw new Exception("File upload error ($docType): " . $validation);
                    }

                    $safeName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', basename($fileName));
                    move_uploaded_file($tmpFile, rtrim($uploadDir, '/') . '/' . $safeName);

                    $relPath = StudentPathHelper::getRelativeDocPath($btid, $certType, $safeName);

                    error_log('[store] Saving document: app=' . $applicationId
                        . ' docType=' . $docType
                        . ' path=' . $relPath);

                    /*
                     * Store relative path (without "storage/uploads/" prefix).
                     * getDocuments() builds: CONCAT('storage/uploads/', file_name)
                     *
                     * Example stored value:
                     *   STUDENTS/2024/CS/BT240076CS/applications/admission/ui-regform_....pdf
                     *
                     * Resolved URL:
                     *   storage/uploads/STUDENTS/2024/CS/BT240076CS/applications/admission/...pdf  ✅
                     */
                    $this->repo->saveDocument(
                        $applicationId,
                        $docType,
                        $relPath
                    );
                }
            }

            $this->respond([
                'success'            => true,
                'application_id'     => $applicationId,
                'application_number' => $applicationNumber
            ]);

        } catch (Exception $e) {
            error_log('[ApplicationController::store] ' . $e->getMessage());
            $this->respond(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /* ==================================================
       STUDENT APPLICATIONS
    ==================================================*/

    public function myApplications()
    {
        try {
            $studentId = Session::get("user_id");
            $data      = $this->service->getStudentApplications($studentId);
            $this->respond(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function index()
    {
        return $this->myApplications();
    }

    /* ==================================================
       ALL APPLICATIONS (ADMIN)
    ==================================================*/

    public function all()
    {
        if (!$this->adminLoggedIn()) {
            return $this->respond(["success" => false, "message" => "Not logged in"], 401);
        }

        try {
            $user = Session::get("user");
            $department = $user['department'] ?? null;
            
            $globalAdmins = ['saar@jdcoem.ac.in', 'skhod@jdcoem.ac.in', 'sagar@jdcoem.ac.in'];
            if (in_array($user['email'] ?? '', $globalAdmins)) {
                $department = null;
            } elseif (empty($department) && !empty($user['name'])) {
                $department = trim(str_ireplace([' clerk', ' hod', ' admin'], '', $user['name']));
            }

            $data = $this->repo->getAllApplications($department);
            $this->respond(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /* ==================================================
       APPLICATION VIEW
    ==================================================*/

    public function view()
    {
        try {
            $applicationId = $_GET['application_id'] ?? null;

            if (!$applicationId) {
                return $this->respond(["success" => false, "message" => "application_id required"], 400);
            }

            $data = $this->service->getFullApplicationDetails($applicationId);

            if (!isset($data['documents'])) $data['documents'] = [];

            $this->respond(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /* ==================================================
       TIMELINE
    ==================================================*/

    public function timeline()
    {
        try {
            $applicationId = $_GET['application_id'] ?? $_GET['application_number'] ?? null;

            if (!$applicationId) {
                return $this->respond(["success" => false, "message" => "application_id required"], 400);
            }

            $data = $this->service->getApplicationTimeline($applicationId);
            $this->respond(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /* ==================================================
       STATUS — handles APP-2026-XXXXXX strings
    ==================================================*/

    public function getStatus()
    {
        try {
            $appNumber = $_GET['application_number']
                ?? $_GET['application_id']
                ?? null;

            if (!$appNumber) {
                return $this->respond(["success" => false, "message" => "application_number required"], 400);
            }

            $data = null;

            /* Try by application_number string first */
            try {
                $data = $this->repo->findByApplicationNumber($appNumber);
                if ($data) {
                    $data['documents'] = $this->repo->getDocuments((int)$data['id']);
                }
            } catch (Exception $e) {
                $data = null;
            }

            /* Fallback: try numeric ID */
            if (!$data && is_numeric($appNumber)) {
                try {
                    $data = $this->service->getFullApplicationDetails((int)$appNumber);
                } catch (Exception $e2) {
                    $data = null;
                }
            }

            /* Fallback: try service with raw string */
            if (!$data) {
                try {
                    $data = $this->service->getApplicationStatus($appNumber);
                } catch (Exception $e3) {
                    $data = null;
                }
            }

            if (!$data) {
                return $this->respond([
                    "success" => false,
                    "message" => "Application not found: " . $appNumber
                ], 404);
            }

            if (!isset($data['documents'])) $data['documents'] = [];

            $this->respond(["success" => true, "data" => $data]);

        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /* ==================================================
       PROGRESS
    ==================================================*/

    public function progress()
    {
        try {
            $applicationId = $_GET['application_id'] ?? null;

            if (!$applicationId) {
                return $this->respond(["success" => false, "message" => "application_id required"], 400);
            }

            $data = $this->service->getApprovalProgress((int)$applicationId);
            $this->respond(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /* ==================================================
       CLERK
    ==================================================*/

    public function clerkPending()
    {
        if (!$this->adminLoggedIn()) {
            return $this->respond(["success" => false, "message" => "Not logged in"], 401);
        }

        try {
            $user = Session::get("user");
            $department = $user['department'] ?? null;
            
            $globalAdmins = ['saar@jdcoem.ac.in', 'skhod@jdcoem.ac.in', 'sagar@jdcoem.ac.in'];
            if (in_array($user['email'] ?? '', $globalAdmins)) {
                $department = null;
            } elseif (empty($department) && !empty($user['name'])) {
                $department = trim(str_ireplace([' clerk', ' hod', ' admin'], '', $user['name']));
            }
            
            $data = $this->service->getClerkPending($department);
            $this->respond(["success" => true, "data" => $data]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function clerkApprove()
    {
        if (!$this->adminLoggedIn()) {
            return $this->respond(["success" => false, "message" => "Not logged in"], 401);
        }

        $data = $this->jsonInput();

        if (empty($data['application_id'])) {
            return $this->respond(["success" => false, "message" => "application_id required"], 400);
        }

        try {
            $clerkId = $this->currentUserId();
            $remarks = $data['remarks'] ?? null;
            $this->service->clerkApprove($data['application_id'], $clerkId, $remarks);
            $this->respond(["success" => true, "message" => "Approved and forwarded to HOD"]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function clerkReject()
    {
        if (!$this->adminLoggedIn()) {
            return $this->respond(["success" => false, "message" => "Not logged in"], 401);
        }

        $data = $this->jsonInput();

        try {
            $clerkId = $this->currentUserId();
            $reason  = $data['remarks'] ?? $data['reason'] ?? "Rejected by clerk";
            $this->service->clerkReject($data['application_id'], $clerkId, $reason);
            $this->respond(["success" => true, "message" => "Application rejected"]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /* ==================================================
       HOD
    ==================================================*/

    public function hodPending()
    {
        if (!$this->adminLoggedIn()) {
            return $this->respond(["success" => false, "message" => "Not logged in"], 401);
        }

        try {
            $user = Session::get("user");
            $department = $user['department'] ?? null;
            
            $globalAdmins = ['saar@jdcoem.ac.in', 'skhod@jdcoem.ac.in', 'sagar@jdcoem.ac.in'];
            if (in_array($user['email'] ?? '', $globalAdmins)) {
                $department = null;
            } elseif (empty($department) && !empty($user['name'])) {
                $department = trim(str_ireplace([' clerk', ' hod', ' admin'], '', $user['name']));
            }
            
            $data = $this->service->hodPending($department);
            $this->respond(["success" => true, "data" => $data ?? []]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function hodApprove()
    {
        if (!$this->adminLoggedIn()) {
            return $this->respond(["success" => false, "message" => "Not logged in"], 401);
        }

        $data = $this->jsonInput();

        if (empty($data['application_id'])) {
            return $this->respond(["success" => false, "message" => "application_id required"], 400);
        }

        try {
            $hodId   = $this->currentUserId();
            $remarks = $data['remarks'] ?? null;
            $this->service->hodApprove($data['application_id'], $hodId, $remarks);
            $this->respond(["success" => true, "message" => "Approved and forwarded to Principal"]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function hodReject()
    {
        if (!$this->adminLoggedIn()) {
            return $this->respond(["success" => false, "message" => "Not logged in"], 401);
        }

        $data = $this->jsonInput();

        if (empty($data['application_id'])) {
            return $this->respond(["success" => false, "message" => "application_id required"], 400);
        }

        try {
            $hodId  = $this->currentUserId();
            $reason = $data['remarks'] ?? "Rejected by HOD";
            $this->service->hodReject($data['application_id'], $hodId, $reason);
            $this->respond(["success" => true, "message" => "Application rejected"]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /* ==================================================
       PRINCIPAL
    ==================================================*/

    public function principalPending()
    {
        if (!$this->adminLoggedIn()) {
            return $this->respond(["success" => false, "message" => "Not logged in"], 401);
        }

        try {
            $data = $this->service->principalPending();
            $this->respond(["success" => true, "data" => $data ?? []]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function principalApprove()
    {
        if (!$this->adminLoggedIn()) {
            return $this->respond(["success" => false, "message" => "Not logged in"], 401);
        }

        $data = $this->jsonInput();

        if (empty($data['application_id'])) {
            return $this->respond(["success" => false, "message" => "application_id required"], 400);
        }

        try {
            $principalId = $this->currentUserId();
            $this->applicationService->principalApprove($data['application_id'], $principalId);

            require_once __DIR__ . '/../Services/CertificateService.php';
            $certificateService = new CertificateService();
            $certificateNumber  = $certificateService->generateCertificate($data['application_id']);

            $this->respond([
                "success"            => true,
                "message"            => "Final approval granted. Certificate generated.",
                "certificate_number" => $certificateNumber
            ]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function principalReject()
    {
        if (!$this->adminLoggedIn()) {
            return $this->respond(["success" => false, "message" => "Not logged in"], 401);
        }

        $data = $this->jsonInput();

        if (empty($data['application_id'])) {
            return $this->respond(["success" => false, "message" => "application_id required"], 400);
        }

        try {
            $reason = $data['remarks'] ?? "Rejected by Principal";
            $this->service->principalReject($data['application_id'], $reason);
            $this->respond(["success" => true, "message" => "Application rejected"]);
        } catch (Exception $e) {
            $this->respond(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function principalApproveFinal()
    {
        return $this->principalApprove();
    }

    /* ==================================================
       DASHBOARD
    ==================================================*/

    public function dashboardStats()
    {
        $this->respond([
            "status" => "success",
            "data"   => $this->service->getDashboardStats()
        ]);
    }

    public function pendingCount()
    {
        $this->respond([
            "status"  => "success",
            "pending" => $this->service->countPending()
        ]);
    }

    /* ==================================================
       GET APPLICATION (alias)
    ==================================================*/

    public function getApplication()
    {
        return $this->view();
    }
}