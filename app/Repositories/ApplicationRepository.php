<?php

require_once __DIR__ . '/../core/Database.php';

class ApplicationRepository
{
    /** @var PDO */
    private $db;

    public function __construct()
    {
        $database = Database::getInstance();

        if (!$database)
        {
            throw new Exception("Database instance failed");
        }

        $this->db = $database->getConnection();

        if (!$this->db)
        {
            throw new Exception("Database connection failed");
        }
    }


    /*
    ========================================
    CREATE (LEGACY SUPPORT)

    FIX: Added adm_type parameter so character.js
    2-step flow correctly saves the certificate type.
    Without this, adm_type was NULL → DocumentController
    defaulted to 'general/' subfolder → wrong upload path.

    adm_type is optional (defaults to null) so all
    existing callers that don't pass it still work.
    ========================================
    */
    public function create($student_id, $document_id, $purpose, $adm_type = null)
    {
        $sql = "
            INSERT INTO applications
            (
                student_id,
                document_id,
                purpose,
                adm_type,
                status,
                created_at,
                updated_at
            )
            VALUES
            (
                :student_id,
                :document_id,
                :purpose,
                :adm_type,
                'pending',
                NOW(),
                NOW()
            )
            RETURNING id
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':student_id'  => $student_id,
            ':document_id' => $document_id,
            ':purpose'     => $purpose,
            ':adm_type'    => $adm_type,
        ]);

        return $stmt->fetchColumn();
    }


    /*
    ========================================
    CREATE FULL APPLICATION

    FIX 1: PostgreSQL rejects empty string "" for DATE
            columns. $orNull converts "" → null safely.

    FIX 2: Added certificate_type to INSERT.
            Previously only adm_type was saved, but
            adm_type = "Direct Admission (CAP)" (the
            dropdown value from the form) — not 'admission'.

            generateForApplication() checks adm_type first
            then certificate_type. Without saving
            certificate_type = 'admission', the router
            never matched and always fell back to 'bonafide'.

            Now both columns are saved correctly:
              adm_type         = "Direct Admission (CAP)"  ← student's dropdown choice
              certificate_type = 'admission'               ← document type for PDF routing
    ========================================
    */
    public function createAdmission($userId, $data)
    {
        // Convert empty strings to null so PostgreSQL
        // DATE / typed columns don't crash on "" input.
        $orNull = fn($key) => isset($data[$key]) && trim((string)$data[$key]) !== ''
            ? trim($data[$key])
            : null;

        $sql = "
            INSERT INTO applications
            (
                student_id,
                full_name,
                dob,
                gender,
                mobile,
                email,
                btid,
                branch,
                year,
                ac_year,
                adm_type,
                certificate_type,
                purpose,
                status,
                created_at,
                updated_at
            )
            VALUES
            (
                :student_id,
                :full_name,
                :dob,
                :gender,
                :mobile,
                :email,
                :btid,
                :branch,
                :year,
                :ac_year,
                :adm_type,
                :certificate_type,
                :purpose,
                'pending',
                NOW(),
                NOW()
            )
            RETURNING id
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':student_id'       => $userId,
            ':full_name'        => $orNull('fullName'),
            ':dob'              => $orNull('dob'),
            ':gender'           => $orNull('gender'),
            ':mobile'           => $orNull('mobile'),
            ':email'            => $orNull('email'),
            ':btid'             => $orNull('btid'),
            ':branch'           => $orNull('branch'),
            ':year'             => $orNull('year'),
            ':ac_year'          => $orNull('acYear'),
            ':adm_type'         => $orNull('admType'),
            ':certificate_type' => $orNull('certificate_type'),
            ':purpose'          => $orNull('purpose'),
        ]);

        return $stmt->fetchColumn();
    }


    /*
    ========================================
    STUDENT APPLICATIONS
    ========================================
    */

    public function getByUserId($student_id)
    {
        $sql = "
            SELECT *
            FROM applications
            WHERE student_id = :student_id
            ORDER BY created_at DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':student_id' => $student_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function getApplicationStatus($application_id)
    {
        $sql = "
            SELECT *
            FROM applications
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $application_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    /*
    ========================================
    CLERK FUNCTIONS

    FIX: Added COALESCE(a.branch, ...) and
    COALESCE(a.year, ...) so character/admission
    applications show their submitted values
    instead of always pulling from students table.
    ========================================
    */

    public function getClerkPending()
    {
        $sql = "
            SELECT
                a.*,
                COALESCE(u.name,  'Unknown')                       AS student_name,
                COALESCE(u.email, '')                              AS student_email,
                COALESCE(a.branch, s.department, s.branch, 'N/A') AS department,
                COALESCE(a.year,   s.current_year, s.year, '')     AS year,
                COALESCE(s.bt_id,  '')                             AS bt_id
            FROM applications a
            LEFT JOIN users    u ON u.id = a.student_id
            LEFT JOIN students s ON s.user_id = a.student_id
            WHERE a.status = 'pending'
            ORDER BY a.created_at ASC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function clerkApproveSafe($applicationId, $clerkId)
    {
        $sql = "
            UPDATE applications
            SET
                clerk_id          = :clerk_id,
                status            = 'clerk_approved',
                clerk_approved_at = NOW(),
                updated_at        = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':clerk_id' => $clerkId,
            ':id'       => $applicationId
        ]);
    }


    public function clerkRejectSafe($applicationId, $clerkId, $reason)
    {
        $sql = "
            UPDATE applications
            SET
                clerk_id         = :clerk_id,
                status           = 'rejected',
                rejection_reason = :reason,
                clerk_remarks    = :reason,
                updated_at       = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':clerk_id' => $clerkId,
            ':reason'   => $reason,
            ':id'       => $applicationId
        ]);
    }


    /*
    ========================================
    CLERK APPROVE / REJECT WITH REMARKS
    ========================================
    */
    public function clerkApproveWithRemarks(int $applicationId, int $clerkId, string $remarks): bool
    {
        $sql = "
            UPDATE applications
            SET
                clerk_id          = :clerk_id,
                status            = 'clerk_approved',
                clerk_remarks     = :remarks,
                clerk_approved_at = NOW(),
                updated_at        = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':clerk_id' => $clerkId,
            ':remarks'  => $remarks,
            ':id'       => $applicationId
        ]);
    }


    public function clerkRejectWithRemarks(int $applicationId, int $clerkId, string $remarks): bool
    {
        $sql = "
            UPDATE applications
            SET
                clerk_id         = :clerk_id,
                status           = 'rejected',
                rejection_reason = :remarks,
                clerk_remarks    = :remarks,
                updated_at       = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':clerk_id' => $clerkId,
            ':remarks'  => $remarks,
            ':id'       => $applicationId
        ]);
    }


    /*
    ========================================
    HOD FUNCTIONS

    FIX: Added COALESCE(a.branch, ...) and
    COALESCE(a.year, ...) — same as clerk fix.
    ========================================
    */

    public function getHodPending()
    {
        $sql = "
            SELECT
                a.*,
                COALESCE(u.name,  'Unknown')                       AS student_name,
                COALESCE(u.email, '')                              AS student_email,
                COALESCE(a.branch, s.department, s.branch, 'N/A') AS department,
                COALESCE(a.year,   s.current_year, s.year, '')     AS year,
                COALESCE(s.bt_id,  '')                             AS bt_id
            FROM applications a
            LEFT JOIN users    u ON u.id = a.student_id
            LEFT JOIN students s ON s.user_id = a.student_id
            WHERE a.status = 'clerk_approved'
            ORDER BY a.created_at ASC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function hodApprove($application_id, $hod_id)
    {
        $sql = "
            UPDATE applications
            SET
                hod_id          = :hod_id,
                status          = 'hod_approved',
                hod_approved_at = NOW(),
                updated_at      = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':hod_id' => $hod_id,
            ':id'     => $application_id
        ]);
    }


    /*
    ========================================
    HOD APPROVE / REJECT WITH REMARKS
    ========================================
    */
    public function hodApproveWithRemarks(int $applicationId, int $hodId, string $remarks): bool
    {
        $sql = "
            UPDATE applications
            SET
                hod_id          = :hod_id,
                status          = 'hod_approved',
                hod_remarks     = :remarks,
                hod_approved_at = NOW(),
                updated_at      = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':hod_id'  => $hodId,
            ':remarks' => $remarks,
            ':id'      => $applicationId
        ]);
    }


    public function hodRejectWithRemarks(int $applicationId, int $hodId, string $remarks): bool
    {
        $sql = "
            UPDATE applications
            SET
                hod_id           = :hod_id,
                status           = 'rejected',
                rejection_reason = :remarks,
                hod_remarks      = :remarks,
                updated_at       = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':hod_id'  => $hodId,
            ':remarks' => $remarks,
            ':id'      => $applicationId
        ]);
    }


    /*
    ========================================
    PRINCIPAL FUNCTIONS

    FIX: Added COALESCE(a.branch, ...) and
    COALESCE(a.year, ...) — same as clerk/HOD fix.
    ========================================
    */

    public function getPrincipalPending()
    {
        $sql = "
            SELECT
                a.*,
                COALESCE(u.name,  'Unknown')                       AS student_name,
                COALESCE(u.email, '')                              AS student_email,
                COALESCE(a.branch, s.department, s.branch, 'N/A') AS department,
                COALESCE(a.year,   s.current_year, s.year, '')     AS year,
                COALESCE(s.bt_id,  '')                             AS bt_id
            FROM applications a
            LEFT JOIN users    u ON u.id = a.student_id
            LEFT JOIN students s ON s.user_id = a.student_id
            WHERE a.status = 'hod_approved'
            ORDER BY a.created_at ASC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function principalApprove($application_id, $principal_id)
    {
        $sql = "
            UPDATE applications
            SET
                principal_id = :principal_id,
                status       = 'approved',
                approved_at  = NOW(),
                updated_at   = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':principal_id' => $principal_id,
            ':id'           => $application_id
        ]);
    }


    /*
    ========================================
    PRINCIPAL APPROVE / REJECT WITH REMARKS
    ========================================
    */
    public function principalApproveWithRemarks(int $applicationId, int $principalId, string $remarks): bool
    {
        $sql = "
            UPDATE applications
            SET
                principal_id      = :principal_id,
                status            = 'approved',
                principal_remarks = :remarks,
                approved_at       = NOW(),
                updated_at        = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':principal_id' => $principalId,
            ':remarks'      => $remarks,
            ':id'           => $applicationId
        ]);
    }


    public function principalRejectWithRemarks(int $applicationId, int $principalId, string $remarks): bool
    {
        $sql = "
            UPDATE applications
            SET
                principal_id     = :principal_id,
                status           = 'rejected',
                rejection_reason = :remarks,
                updated_at       = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':principal_id' => $principalId,
            ':remarks'      => $remarks,
            ':id'           => $applicationId
        ]);
    }


    /*
    ========================================
    STATUS UPDATE
    ========================================
    */

    public function updateStatus($application_id, $status)
    {
        $sql = "
            UPDATE applications
            SET
                status     = :status,
                updated_at = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':status' => $status,
            ':id'     => $application_id
        ]);
    }


    /*
    ========================================
    CERTIFICATE
    ========================================
    */

    public function saveCertificateFile($application_id, $file)
    {
        $sql = "
            UPDATE applications
            SET
                certificate_file = :file,
                updated_at       = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':file' => $file,
            ':id'   => $application_id
        ]);
    }


    public function updateCertificate($application_id, $certificateNumber, $fileName)
    {
        $sql = "
            UPDATE applications
            SET
                certificate_number = :number,
                certificate_file   = :file,
                status             = 'approved',
                approved_at        = NOW(),
                updated_at         = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':number' => $certificateNumber,
            ':file'   => $fileName,
            ':id'     => $application_id
        ]);
    }


    /*
    ========================================
    GET FULL APPLICATION

    FIX 1: s.roll_number → s.roll_number
           (actual DB column name from schema)

    FIX 2: application fields take priority over
           student profile values (branch/year/dob).
    ========================================
    */
    public function getFullApplication(int $application_id): ?array
    {
        error_log("=== ID-CARD DEBUG START ===");
        error_log("[ID-CARD DEBUG][REPO] getFullApplication application_id = " . $application_id);

        $sql = "
            SELECT
                a.*,
                COALESCE(u.name,  'Unknown')                       AS student_name,
                COALESCE(u.email, '')                              AS student_email,
                COALESCE(a.branch, s.department, s.branch, 'N/A') AS branch,
                COALESCE(a.year,   s.current_year, s.year, '')     AS year,
                COALESCE(a.dob,    s.dob)                          AS dob,
                COALESCE(s.bt_id,  '')                             AS bt_id,
                s.roll_number
            FROM applications a
            LEFT JOIN users    u ON u.id = a.student_id
            LEFT JOIN students s ON s.user_id = a.student_id
            WHERE a.id = :id
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $application_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result) {
            error_log("[ID-CARD DEBUG][REPO] Application not found for id = " . $application_id);
            return null;
        }

        error_log("[ID-CARD DEBUG][REPO] Application found: student_id=" . ($result['student_id'] ?? 'NULL')
            . " certificate_type=" . ($result['certificate_type'] ?? 'NULL')
            . " adm_type=" . ($result['adm_type'] ?? 'NULL')
            . " full_name=" . ($result['full_name'] ?? 'NULL'));

        $result['documents'] = $this->getDocuments($application_id);

        error_log("[ID-CARD DEBUG][REPO] documents count = " . count($result['documents']));

        foreach ($result['documents'] as $i => $doc) {
            error_log("[ID-CARD DEBUG][REPO] doc[$i] type=" . ($doc['document_type'] ?? 'NULL')
                . " file_name=" . ($doc['file_name'] ?? 'NULL')
                . " file_path=" . ($doc['file_path'] ?? 'NULL')
                . " path=" . ($doc['path'] ?? 'NULL'));
        }

        error_log("=== ID-CARD DEBUG END ===");

        return $result;
    }


    /*
    ========================================
    GET DOCUMENTS FOR AN APPLICATION

    FIX: file_name now stores the subfolder too
    (e.g. "character/1234_photo.jpg") so the path
    builds correctly as:
      storage/uploads/character/1234_photo.jpg

    Bonafide files stored as "bonafide/1234_photo.jpg"
    also work correctly — no bonafide breakage.
    ========================================
    */
    public function getDocuments(int $applicationId): array
    {
        $sql = "
            SELECT
                id,
                application_id,
                document_type,
                file_name,
                file_name                              AS original_name,
                file_name                              AS file_path,
                CONCAT('storage/uploads/', file_name)  AS path
            FROM application_documents
            WHERE application_id = :app_id
            ORDER BY created_at ASC
        ";

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':app_id' => $applicationId]);
            $docs = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

            error_log("[ID-CARD DEBUG][REPO] getDocuments app_id = " . $applicationId . " count = " . count($docs));

            foreach ($docs as $i => $doc) {
                error_log("[ID-CARD DEBUG][REPO] getDocuments doc[$i] type=" . ($doc['document_type'] ?? 'NULL')
                    . " file_name=" . ($doc['file_name'] ?? 'NULL')
                    . " file_path=" . ($doc['file_path'] ?? 'NULL')
                    . " path=" . ($doc['path'] ?? 'NULL'));
            }

            return $docs;
        } catch (Exception $e) {
            error_log('[getDocuments] ' . $e->getMessage());
            return [];
        }
    }


    /*
    ========================================
    ALL APPLICATIONS — admin / clerk view
    ========================================
    */
    public function getAllApplications()
    {
        $sql = "
            SELECT
                a.*,
                COALESCE(u.name,  'Unknown')                       AS student_name,
                COALESCE(u.email, '')                              AS student_email,
                COALESCE(a.branch, s.department, s.branch, 'N/A') AS department,
                COALESCE(a.year,   s.current_year, s.year, '')     AS year,
                COALESCE(s.bt_id,  '')                             AS bt_id
            FROM applications a
            LEFT JOIN users    u ON u.id = a.student_id
            LEFT JOIN students s ON s.user_id = a.student_id
            ORDER BY a.created_at DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    /*
    ========================================
    FIND BY ID — used by CertificateService

    FIX 1: s.roll_number → s.roll_number
           (actual DB column name from schema)
    FIX 2: application fields take priority.
    ========================================
    */
    public function findById($application_id)
    {
        $sql = "
            SELECT
                a.*,
                COALESCE(u.name,  'Unknown')                       AS student_name,
                COALESCE(u.email, '')                              AS email,
                COALESCE(a.branch, s.department, s.branch, 'N/A') AS branch,
                COALESCE(a.year,   s.current_year, s.year, '')     AS year,
                COALESCE(a.dob,    s.dob)                          AS dob,
                COALESCE(s.bt_id,  '')                             AS bt_id,
                s.roll_number
            FROM applications a
            LEFT JOIN users    u ON u.id = a.student_id
            LEFT JOIN students s ON s.user_id = a.student_id
            WHERE a.id = :id
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $application_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }


    /*
    ========================================
    FIND BY APPLICATION NUMBER
    ========================================
    */
    public function findByApplicationNumber(string $appNumber): ?array
    {
        $sql = "
            SELECT
                a.*,
                COALESCE(u.name,  'Unknown')  AS student_name,
                COALESCE(u.email, '')          AS student_email,
                COALESCE(s.bt_id, '')          AS bt_id
            FROM applications a
            LEFT JOIN users    u ON u.id = a.student_id
            LEFT JOIN students s ON s.user_id = a.student_id
            WHERE (a.application_number = :num OR a.certificate_number = :num)
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':num' => $appNumber]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }


    /*
    ========================================
    DASHBOARD STATS
    ========================================
    */
    public function getDashboardStats()
    {
        $sql = "
            SELECT
                COUNT(*)                                                  AS total,
                COUNT(CASE WHEN status = 'pending'         THEN 1 END)   AS pending_clerk,
                COUNT(CASE WHEN status = 'clerk_approved'  THEN 1 END)   AS pending_hod,
                COUNT(CASE WHEN status = 'hod_approved'    THEN 1 END)   AS pending_principal,
                COUNT(CASE WHEN status = 'approved'        THEN 1 END)   AS approved,
                COUNT(CASE WHEN status = 'rejected'        THEN 1 END)   AS rejected,
                COUNT(CASE WHEN certificate_file IS NOT NULL THEN 1 END) AS certificates
            FROM applications
        ";

        $stmt = $this->db->query($sql);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public function countPending()
    {
        $stmt   = $this->db->query("SELECT COUNT(*) AS total FROM applications WHERE status = 'pending'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int) $result['total'];
    }


    /*
    ========================================
    GET BY ID (simple, no joins)
    ========================================
    */
    public function getById(int $applicationId): ?array
    {
        $sql  = "SELECT * FROM applications WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $applicationId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }


    /*
    ========================================
    UPDATE APPLICATION NUMBER
    ========================================
    */
    public function updateApplicationNumber($applicationId, $applicationNumber)
    {
        $stmt = $this->db->prepare("
            UPDATE applications
            SET application_number = :application_number
            WHERE id = :id
        ");
        $stmt->execute([
            ':application_number' => $applicationNumber,
            ':id'                 => $applicationId
        ]);
    }


    /*
    ========================================
    SAVE DOCUMENT (file upload)

    $fileName includes the subfolder:
    e.g. "character/1234567890_photo.jpg"
    so getDocuments() builds correct URL:
    storage/uploads/character/1234567890_photo.jpg
    ========================================
    */
    public function saveDocument($applicationId, $type, $fileName)
    {
        error_log("[ID-CARD DEBUG][REPO] saveDocument application_id=" . $applicationId
            . " document_type=" . $type
            . " file_name=" . $fileName);

        $stmt = $this->db->prepare("
            INSERT INTO application_documents
            (application_id, document_type, file_name, created_at)
            VALUES (:application_id, :document_type, :file_name, NOW())
        ");

        $stmt->execute([
            ':application_id' => $applicationId,
            ':document_type'  => $type,
            ':file_name'      => $fileName,
        ]);

        error_log("[ID-CARD DEBUG][REPO] saveDocument insert done");
    }


    /*
    ========================================
    REJECT WITH REASON (generic)
    ========================================
    */
    public function rejectWithReason($application_id, $reason)
    {
        $sql = "
            UPDATE applications
            SET
                status           = 'rejected',
                rejection_reason = :reason,
                updated_at       = NOW()
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':reason' => $reason,
            ':id'     => $application_id
        ]);
    }


    /*
    ========================================
    SAVE REMARK
    ========================================
    */
    public function saveRemark(int $applicationId, int $userId, string $role, string $remark): bool
    {
        $sql = "
            INSERT INTO application_remarks
            (application_id, user_id, role, remark, created_at)
            VALUES (:application_id, :user_id, :role, :remark, NOW())
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':application_id' => $applicationId,
            ':user_id'        => $userId,
            ':role'           => $role,
            ':remark'         => $remark
        ]);
    }

}