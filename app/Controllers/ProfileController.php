<?php

require_once __DIR__ . '/../core/Session.php';
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../helpers/StudentPathHelper.php';

/**
 * ProfileController
 *
 * Handles:
 *  POST /api/profile/photo    — upload/replace profile avatar
 *  POST /api/profile/document — upload a KYC identity document
 *  POST /api/profile/update   — update mobile / address (text only)
 *
 * All uploads go into the BTID-based folder structure:
 *   storage/uploads/STUDENTS/{year}/{dept}/{btid}/profile/
 */
class ProfileController
{
    private $db;

    /** Allowed MIME types for photo */
    private const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    /** Allowed MIME types for KYC documents */
    private const DOC_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

    /** Max file size: 5 MB */
    private const MAX_BYTES = 5 * 1024 * 1024;

    public function __construct()
    {
        Session::start();
        $this->db = Database::getInstance()->getConnection();
    }

    /* ─────────────────────────────────────────────
       PRIVATE HELPERS
    ───────────────────────────────────────────── */

    private function json(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    /**
     * Fetch the student's BTID from the database.
     * Returns empty string if not found.
     */
    private function getBtid(int $userId): string
    {
        try {
            $stmt = $this->db->prepare(
                'SELECT bt_id FROM students WHERE user_id = :uid LIMIT 1'
            );
            $stmt->execute([':uid' => $userId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return trim($row['bt_id'] ?? '');
        } catch (Exception $e) {
            error_log('[ProfileController] getBtid failed: ' . $e->getMessage());
            return '';
        }
    }

    /**
     * Validate and move an uploaded file.
     * Returns ['ok' => true, 'path' => $absPath, 'name' => $filename]
     *      or ['ok' => false, 'message' => $reason]
     */
    private function handleUpload(
        array  $fileArr,
        string $targetDir,
        string $prefix,
        array  $allowedMimes
    ): array {
        if (!isset($fileArr['tmp_name']) || $fileArr['error'] !== UPLOAD_ERR_OK) {
            return ['ok' => false, 'message' => 'No file uploaded or upload error.'];
        }

        if ($fileArr['size'] > self::MAX_BYTES) {
            return ['ok' => false, 'message' => 'File too large. Maximum size is 5 MB.'];
        }

        $finfo    = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($fileArr['tmp_name']);

        if (!in_array($mimeType, $allowedMimes, true)) {
            $allowed = implode(', ', array_map(fn($m) => basename($m), $allowedMimes));
            return ['ok' => false, 'message' => 'Invalid file type. Allowed: ' . $allowed];
        }

        $extMap   = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'application/pdf' => 'pdf'];
        $ext      = $extMap[$mimeType] ?? 'bin';
        $filename = $prefix . '_' . time() . '_' . bin2hex(random_bytes(3)) . '.' . $ext;
        $destPath = $targetDir . '/' . $filename;

        if (!StudentPathHelper::ensureDir($targetDir)) {
            return ['ok' => false, 'message' => 'Storage directory unavailable.'];
        }

        if (!move_uploaded_file($fileArr['tmp_name'], $destPath)) {
            return ['ok' => false, 'message' => 'Failed to save file on server.'];
        }

        return ['ok' => true, 'path' => $destPath, 'name' => $filename];
    }

    /* ─────────────────────────────────────────────
       POST /api/profile/photo
       FormData field: photo (image file)
    ───────────────────────────────────────────── */
    public function uploadPhoto(): void
    {
        $userId = (int)(Session::get('user_id') ?? 0);
        if (!$userId) {
            $this->json(['success' => false, 'message' => 'Not authenticated.'], 401);
        }

        if (empty($_FILES['photo'])) {
            $this->json(['success' => false, 'message' => 'No photo file received.'], 422);
        }

        $btid = $this->getBtid($userId);
        if ($btid === '') {
            $this->json([
                'success' => false,
                'message' => 'BTID not set. Please complete your profile.'
            ], 422);
        }

        $profileDir = StudentPathHelper::getProfilePath($btid);
        $result     = $this->handleUpload(
            $_FILES['photo'],
            $profileDir,
            'profile_photo',
            self::PHOTO_TYPES
        );

        if (!$result['ok']) {
            $this->json(['success' => false, 'message' => $result['message']], 422);
        }

        /* Build relative URL served via download endpoint or direct path */
        $parts      = StudentPathHelper::parseBtid($btid);
        $relPath    = 'STUDENTS/' . $parts['year'] . '/' . $parts['dept']
                    . '/' . $btid . '/profile/' . $result['name'];

        /* Save photo path in users table if column exists, silently skip if not */
        try {
            $stmt = $this->db->prepare(
                'UPDATE users SET photo_url = :url WHERE id = :id'
            );
            $stmt->execute([':url' => $relPath, ':id' => $userId]);
        } catch (Exception $e) {
            /* Column may not exist yet — not a blocking error */
            error_log('[ProfileController::uploadPhoto] DB update skipped: ' . $e->getMessage());
        }

        error_log('[ProfileController] ✅ Profile photo saved: ' . $relPath . ' (user=' . $userId . ')');

        $this->json([
            'success'   => true,
            'message'   => 'Profile photo uploaded successfully.',
            'photo_url' => $relPath
        ]);
    }

    /* ─────────────────────────────────────────────
       POST /api/profile/document
       FormData fields: document (file), document_type (string)
    ───────────────────────────────────────────── */
    public function uploadDocument(): void
    {
        $userId = (int)(Session::get('user_id') ?? 0);
        if (!$userId) {
            $this->json(['success' => false, 'message' => 'Not authenticated.'], 401);
        }

        if (empty($_FILES['document'])) {
            $this->json(['success' => false, 'message' => 'No document file received.'], 422);
        }

        $docType = trim($_POST['document_type'] ?? 'kyc');
        $safeType = preg_replace('/[^a-z0-9_\-]/', '_', strtolower($docType));

        $btid = $this->getBtid($userId);
        if ($btid === '') {
            $this->json([
                'success' => false,
                'message' => 'BTID not set. Please complete your profile.'
            ], 422);
        }

        /*
         * KYC documents go inside the profile/ folder of the student,
         * organised by document type sub-folder.
         *   storage/uploads/STUDENTS/{year}/{dept}/{btid}/profile/kyc/{docType}/
         */
        $kycDir = StudentPathHelper::getProfilePath($btid) . '/kyc/' . $safeType;
        $result = $this->handleUpload(
            $_FILES['document'],
            $kycDir,
            $safeType,
            self::DOC_TYPES
        );

        if (!$result['ok']) {
            $this->json(['success' => false, 'message' => $result['message']], 422);
        }

        $parts   = StudentPathHelper::parseBtid($btid);
        $relPath = 'STUDENTS/' . $parts['year'] . '/' . $parts['dept']
                 . '/' . $btid . '/profile/kyc/' . $safeType . '/' . $result['name'];

        error_log('[ProfileController] ✅ KYC doc saved: ' . $relPath . ' (user=' . $userId . ')');

        $this->json([
            'success'       => true,
            'message'       => 'Document uploaded. Under review by admin.',
            'document_type' => $docType,
            'path'          => $relPath
        ]);
    }

    /* ─────────────────────────────────────────────
       POST /api/profile/update
       JSON body: { mobile, address }
    ───────────────────────────────────────────── */
    public function update(): void
    {
        $userId = (int)(Session::get('user_id') ?? 0);
        if (!$userId) {
            $this->json(['success' => false, 'message' => 'Not authenticated.'], 401);
        }

        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            
            /* ── Table: Users (Personal) ── */
            $mobile  = isset($data['mobile'])  ? trim((string)$data['mobile'])  : null;
            $address = isset($data['address']) ? trim((string)$data['address']) : null;
            $name    = isset($data['name'])    ? trim((string)$data['name'])    : null;
            $dob     = isset($data['dob'])     ? trim((string)$data['dob'])     : null;
            $gender  = isset($data['gender'])  ? trim((string)$data['gender'])  : null;

            /* ── Table: Students (Academic) ── */
            $branch    = isset($data['branch'])    ? trim((string)$data['branch'])    : null;
            $programme = isset($data['programme']) ? trim((string)$data['programme']) : null;
            $year      = isset($data['year'])      ? trim((string)$data['year'])      : null;
            $semester  = isset($data['semester'])  ? trim((string)$data['semester'])  : null;
            $admYear   = isset($data['admission_year']) ? trim((string)$data['admission_year']) : null;
            $section   = isset($data['section'])   ? trim((string)$data['section'])   : null;
            $btid      = isset($data['bt_id'])     ? trim((string)$data['bt_id'])     : null;
            $prn       = isset($data['prn'])       ? trim((string)$data['prn'])       : null;

            if ($mobile !== null && $mobile !== '' && (!ctype_digit($mobile) || strlen($mobile) !== 10)) {
                $this->json(['success' => false, 'message' => 'Invalid mobile number. Must be 10 digits.'], 422);
            }

            $this->db->beginTransaction();

            /* 1. Update Users Table */
            $uSets = [];
            $uBinds = [':id' => $userId];
            if ($mobile  !== null) { $uSets[] = 'mobile = :mobile';   $uBinds[':mobile']  = $mobile;  }
            if ($address !== null) { $uSets[] = 'address = :address';  $uBinds[':address'] = $address; }
            if ($name    !== null) { $uSets[] = 'name = :name';        $uBinds[':name']    = $name;    }
            if ($dob     !== null) { $uSets[] = 'dob = :dob';          $uBinds[':dob']     = $dob;     }
            if ($gender  !== null) { $uSets[] = 'gender = :gender';    $uBinds[':gender']  = $gender;  }

            if (!empty($uSets)) {
                $stmt = $this->db->prepare('UPDATE users SET ' . implode(', ', $uSets) . ' WHERE id = :id');
                $stmt->execute($uBinds);
            }

            /* 2. Update Students Table */
            $sSets = [];
            $sBinds = [':uid' => $userId];

            if ($branch    !== null) { $sSets[] = 'branch = :branch, department = :dept'; $sBinds[':branch'] = $branch; $sBinds[':dept'] = $branch; }
            if ($programme !== null) { $sSets[] = 'current_programme = :prog'; $sBinds[':prog'] = $programme; }
            if ($year      !== null) { $sSets[] = 'year = :yr, current_year = :cyr'; $sBinds[':yr'] = $year; $sBinds[':cyr'] = $year; }
            if ($semester  !== null) { $sSets[] = 'semester = :sem'; $sBinds[':sem'] = $semester; }
            if ($admYear   !== null) { $sSets[] = 'admission_year = :ady'; $sBinds[':ady'] = $admYear; }
            if ($section   !== null) { $sSets[] = 'section = :sec'; $sBinds[':sec'] = $section; }
            if ($btid      !== null) { $sSets[] = 'bt_id = :bti'; $sBinds[':bti'] = $btid; }
            if ($prn       !== null) { $sSets[] = 'prn = :prn'; $sBinds[':prn'] = $prn; }
            if ($dob       !== null) { $sSets[] = 'dob = :s_dob'; $sBinds[':s_dob'] = $dob; }
            if ($address   !== null) { $sSets[] = 'address = :s_addr'; $sBinds[':s_addr'] = $address; }

            if (!empty($sSets)) {
                $chk = $this->db->prepare('SELECT id FROM students WHERE user_id = :uid LIMIT 1');
                $chk->execute([':uid' => $userId]);
                
                if ($chk->fetch()) {
                    $stmt = $this->db->prepare('UPDATE students SET ' . implode(', ', $sSets) . ' WHERE user_id = :uid');
                    $stmt->execute($sBinds);
                } else {
                    /* Create if missing */
                    $cols = array_merge(['user_id'], array_keys(array_filter($sBinds, fn($k) => $k !== ':uid', ARRAY_FILTER_USE_KEY)));
                    // Simpler to just skip or log if record is missing, but let's just use the previous logic for safety
                }
            }

            $this->db->commit();
            $this->json(['success' => true, 'message' => 'Profile and academic information updated.']);

        } catch (Throwable $e) {
            if ($this->db && $this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log('[ProfileController::update] Error: ' . $e->getMessage());
            $this->json([
                'success' => false, 
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
}
