<?php

require_once __DIR__ . '/../helpers/StudentPathHelper.php';

/* ================================================
   DocumentController.php
   Handles file uploads for applications.

   Route: POST /api/documents/upload
   FormData fields received from frontend:
     application_id  → integer
     document_type   → string  e.g. "passport_photo", "fee_receipt"
     file            → $_FILES['file']
   ================================================ */

require_once __DIR__ . '/../Repositories/ApplicationRepository.php';

class DocumentController
{
    private $appRepo;

    /* Base storage folder — outside public/, not web-accessible directly */
    private $uploadDir;

    /* Allowed MIME types */
    private const ALLOWED_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf'
    ];

    /* Max file size: 5 MB */
    private const MAX_BYTES = 5 * 1024 * 1024;

    /*
     * Maps adm_type / certificate_type → subfolder name
     * Matches the folder structure in storage/uploads/
     *
     * FIX: Added 'idcard' → 'id card' so ID card document uploads
     * go to storage/uploads/id card/ instead of general/.
     * The folder already exists in the project structure.
     */
    private const TYPE_FOLDERS = [
        'bonafide'    => 'bonafide',
        'character'   => 'character',
        'admission'   => 'admission',
        'idcard'      => 'id card',   // ← ADDED: maps certificate_type 'idcard' → 'id card' folder
        'leaving'     => 'leaving',
        'noc'         => 'noc',
        'transcript'  => 'transcript',
        'provisional' => 'provisional',
        'feereceipt'  => 'fees',
    ];

    public function __construct()
    {
        $this->appRepo = new ApplicationRepository();
    }


    /*
    ================================================
    UPLOAD
    POST /api/documents/upload
    ================================================
    */
    public function upload()
    {
        /* ── Auth check ── */
        if (empty($_SESSION['user_id'])) {
            return $this->json(['success' => false, 'message' => 'Not authenticated.'], 401);
        }

        /* ── Validate required fields ── */
        $applicationId = isset($_POST['application_id']) ? (int) $_POST['application_id'] : 0;
        $documentType  = isset($_POST['document_type'])  ? trim($_POST['document_type'])  : '';

        if ($applicationId <= 0) {
            return $this->json(['success' => false, 'message' => 'application_id is required.'], 422);
        }
        if ($documentType === '') {
            return $this->json(['success' => false, 'message' => 'document_type is required.'], 422);
        }

        /* ── Check file was sent ── */
        if (empty($_FILES['file']) || $_FILES['file']['error'] === UPLOAD_ERR_NO_FILE) {
            return $this->json(['success' => false, 'message' => 'No file uploaded.'], 422);
        }

        /* ── PHP upload error codes ── */
        $uploadError = $_FILES['file']['error'];
        if ($uploadError !== UPLOAD_ERR_OK) {
            $msgs = [
                UPLOAD_ERR_INI_SIZE   => 'File exceeds server upload_max_filesize limit.',
                UPLOAD_ERR_FORM_SIZE  => 'File exceeds form MAX_FILE_SIZE limit.',
                UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded.',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder on server.',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
                UPLOAD_ERR_EXTENSION  => 'Upload blocked by server extension.',
            ];
            $msg = $msgs[$uploadError] ?? ('Upload error code ' . $uploadError);
            return $this->json(['success' => false, 'message' => $msg], 500);
        }

        /* ── Size check ── */
        if ($_FILES['file']['size'] > self::MAX_BYTES) {
            return $this->json(['success' => false, 'message' => 'File too large. Maximum size is 5MB.'], 422);
        }

        /* ── MIME type check ── */
        $finfo    = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($_FILES['file']['tmp_name']);

        if (!in_array($mimeType, self::ALLOWED_TYPES, true)) {
            return $this->json([
                'success' => false,
                'message' => 'Invalid file type. Allowed: JPEG, PNG, GIF, PDF. Got: ' . $mimeType
            ], 422);
        }

        /* ── Verify application belongs to this student ── */
        $role = strtolower($_SESSION['role'] ?? 'student');
        $app  = $this->appRepo->getById($applicationId);

        if (!$app) {
            return $this->json(['success' => false, 'message' => 'Application not found.'], 404);
        }
        if ($role === 'student' && (int) $app['student_id'] !== (int) $_SESSION['user_id']) {
            return $this->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        /*
         * ── Resolve student BTID ──
         * Fetch from students table via student_id stored in the application.
         * If BTID is missing, return an error — student must complete profile.
         */
        $btid = trim($app['bt_id'] ?? '');

        if ($btid === '' || $btid === null) {
            // Try fetching directly from students table
            try {
                require_once __DIR__ . '/../core/Database.php';
                $db   = Database::getInstance()->getConnection();
                $stmt = $db->prepare('SELECT bt_id FROM students WHERE user_id = :uid LIMIT 1');
                $stmt->execute([':uid' => $app['student_id']]);
                $row  = $stmt->fetch(PDO::FETCH_ASSOC);
                $btid = trim($row['bt_id'] ?? '');
            } catch (Exception $e) {
                $btid = '';
            }
        }

        if ($btid === '') {
            return $this->json([
                'success' => false,
                'message' => 'Your BTID is not set. Please complete your profile before uploading documents.'
            ], 422);
        }

        /*
         * ── Resolve certificate type for subfolder ──
         */
        $admType = strtolower(trim(
            $app['adm_type'] ?? $app['certificate_type'] ?? ''
        ));
        if ($admType === '' || $admType === 'null') {
            $admType = strtolower(trim($app['certificate_type'] ?? ''));
        }
        $certType = self::TYPE_FOLDERS[$admType] ?? 'general';

        /*
         * ── Build BTID-based upload directory ──
         * storage/uploads/STUDENTS/{year}/{dept}/{btid}/applications/{certType}/
         */
        $typeDir = StudentPathHelper::getApplicationPath($btid, $certType);

        /* ── Create directory if it doesn't exist ── */
        if (!StudentPathHelper::ensureDir($typeDir)) {
            error_log('[Upload] Cannot create upload dir: ' . $typeDir);
            return $this->json(['success' => false, 'message' => 'Storage directory unavailable.'], 500);
        }

        /*
         * ── Generate unique filename ──
         * Format: {applicationId}_{documentType}_{timestamp}_{random}.{ext}
         */
        $ext      = $this->mimeToExt($mimeType);
        $safetype = preg_replace('/[^a-z0-9_]/', '_', strtolower($documentType));
        $fileName = $applicationId . '_' . $safetype . '_' . time() . '_' . bin2hex(random_bytes(2)) . '.' . $ext;
        $destPath = rtrim($typeDir, '/') . '/' . $fileName;

        /* ── Move uploaded file to storage ── */
        if (!move_uploaded_file($_FILES['file']['tmp_name'], $destPath)) {
            error_log('[Upload] move_uploaded_file failed → ' . $destPath);
            return $this->json(['success' => false, 'message' => 'Failed to save file on server.'], 500);
        }

        /*
         * ── Save record to application_documents table ──
         *
         * Store the relative path WITHOUT the "storage/uploads/" prefix.
         * getDocuments() builds: CONCAT('storage/uploads/', file_name)
         *
         * Stored value example:
         *   STUDENTS/2024/CS/BT240076CS/applications/bonafide/1234_passport_photo_....jpg
         *
         * Full resolved URL:
         *   storage/uploads/STUDENTS/2024/CS/BT240076CS/applications/bonafide/...jpg  ✅
         */
        $relPath = StudentPathHelper::getRelativeDocPath($btid, $certType, $fileName);

        try {
            $this->appRepo->saveDocument($applicationId, $documentType, $relPath);
        } catch (Exception $e) {
            error_log('[Upload] DB saveDocument failed: ' . $e->getMessage());
        }

        /* ── Log for debugging ── */
        error_log('[Upload] ✅ Saved: ' . $relPath . ' (btid=' . $btid . ' certType=' . $certType . ')');

        /* ── Success ── */
        return $this->json([
            'success'        => true,
            'message'        => 'Document uploaded successfully.',
            'file_name'      => $fileName,
            'document_type'  => $documentType,
            'application_id' => $applicationId,
            'path'           => 'storage/uploads/' . $relPath
        ]);
    }


    /*
    ================================================
    DOWNLOAD / VIEW a document
    GET /api/documents/download?application_id=X&file_name=Y
    ================================================
    */
    public function download()
    {
        if (empty($_SESSION['user_id'])) {
            http_response_code(401);
            exit('Not authenticated.');
        }

        $fileName = isset($_GET['file_name']) ? $_GET['file_name'] : '';

        // Security: strip any path traversal attempts
        $fileName = str_replace(['..', '\\'], '', $fileName);
        $fileName = ltrim($fileName, '/');

        if (!$fileName) {
            http_response_code(422);
            exit('file_name is required.');
        }

        // file_name stores the path RELATIVE to storage/uploads/
        $filePath = BASE_PATH . '/storage/uploads/' . $fileName;

        if (!file_exists($filePath)) {
            error_log('[Download] File not found: ' . $filePath);
            http_response_code(404);
            exit('File not found.');
        }

        $finfo    = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($filePath);

        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: inline; filename="' . basename($fileName) . '"');
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: private, max-age=3600');
        readfile($filePath);
        exit;
    }


    /*
    ================================================
    HELPERS
    ================================================
    */
    private function mimeToExt(string $mime): string
    {
        $map = [
            'image/jpeg'      => 'jpg',
            'image/png'       => 'png',
            'image/gif'       => 'gif',
            'application/pdf' => 'pdf',
        ];
        return $map[$mime] ?? 'bin';
    }

    private function json(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}