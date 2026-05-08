<?php

require_once __DIR__ . '/../../app/helpers/StudentPathHelper.php';

require_once __DIR__ . "/../../config/app.php";
require_once __DIR__ . "/../core/Database.php";
require_once __DIR__ . '/NotificationService.php';
require_once __DIR__ . "/CertificateNumberService.php";
require_once __DIR__ . "/CertificateGenerator.php";
require_once __DIR__ . "/PDFService.php";
require_once __DIR__ . "/SignatureService.php";
require_once __DIR__ . "/CertificateTemplateService.php";

require_once __DIR__ . "/../Repositories/ApplicationRepository.php";

class CertificateService
{
    private $applicationRepository;
    private $certificateNumberService;
    private $db;
    private $notificationService;

    public function __construct()
    {
        $this->applicationRepository    = new ApplicationRepository();
        $this->certificateNumberService = new CertificateNumberService();
        $this->notificationService      = new NotificationService();
        $this->db                       = Database::getInstance()->getConnection();
    }

    /*
    ==================================================
    GENERATE CERTIFICATE

    Routes to the correct template based on
    certificate_type / adm_type:
      bonafide  → generateBonafideCertificate()
      character → generateCharacterCertificate()
      idcard    → generateIdcardCertificate()   ← NEW
      (default) → generateBonafideCertificate()

    All other logic — DB insert, file path, notification
    — is unchanged.
    ==================================================
    */
    public function generateCertificate($applicationId)
    {
        try {

            if (!$applicationId) {
                throw new Exception("Application ID required");
            }

            $application = $this->applicationRepository->findById($applicationId);

            if (!$application) {
                throw new Exception("Application not found");
            }

            $certificateNumber = $this->certificateNumberService->generate();

            $fileName = $certificateNumber . ".pdf";

            /*
             * Build BTID-based issued path:
             *   storage/uploads/STUDENTS/{year}/{dept}/{btid}/issued/
             *
             * Fallback to public/storage/generated/ if BTID is unknown.
             */
            $btid = trim($application['bt_id'] ?? '');

            if ($btid === '') {
                // Attempt to fetch from students table
                try {
                    $stmt = $this->db->prepare('SELECT bt_id FROM students WHERE user_id = :uid LIMIT 1');
                    $stmt->execute([':uid' => $application['student_id'] ?? 0]);
                    $row  = $stmt->fetch(PDO::FETCH_ASSOC);
                    $btid = trim($row['bt_id'] ?? '');
                } catch (Exception $e) {
                    $btid = '';
                }
            }

            if ($btid !== '') {
                $storagePath = StudentPathHelper::getIssuedPath($btid);
                StudentPathHelper::ensureDir($storagePath);
                $storagePath .= '/';
                $dbFilePath   = StudentPathHelper::getRelativeIssuedPath($btid, $fileName);
            } else {
                // Fallback: no BTID — use old public/storage/generated/
                $storagePath = dirname(__DIR__, 2) . "/public/storage/generated/";
                if (!is_dir($storagePath)) {
                    mkdir($storagePath, 0777, true);
                }
                $dbFilePath = $fileName;
            }

            $filePath = $storagePath . $fileName;

            /* Inject certificate_number so template shows real number */
            $application['certificate_number'] = $certificateNumber;

            /* ── Route to correct template based on certificate_type ── */
            $templateService = new CertificateTemplateService();

            $certType = strtolower(trim(
                $application['certificate_type']
                ?? $application['adm_type']
                ?? $application['admType']
                ?? 'bonafide'
            ));

            $typeMap = [
                'fees'          => ['template' => 'fees_receipt_template.php', 'function' => 'generateFeesReceiptHTML'],
                'fees_receipt'  => ['template' => 'fees_receipt_template.php', 'function' => 'generateFeesReceiptHTML'],
                'hall_ticket'   => ['template' => 'hall_ticket_template.php',  'function' => 'generateHallTicketHTML'],
                'marksheet'     => ['template' => 'marksheet_template.php',    'function' => 'generateMarksheetHTML'],
                'provisional'   => ['template' => 'provisional_template.php',  'function' => 'generateProvisionalHTML'],
                'degree'        => ['template' => 'degree_template.php',       'function' => 'generateDegreeHTML'],
                'migration'     => ['template' => 'migration_template.php',    'function' => 'generateMigrationHTML'],
                'noc'           => ['template' => 'noc_template.php',          'function' => 'generateNocHTML'],
                'transcript'    => ['template' => 'transcript_template.php',   'function' => 'generateTranscriptHTML'],
                'tc'            => ['template' => 'tc_template.php',           'function' => 'generateTcHTML'],
                'leaving'       => ['template' => 'tc_template.php',           'function' => 'generateTcHTML'],
            ];

            if ($certType === 'character') {
                $templateService->generateCharacterCertificate($application, $filePath);
            } elseif ($certType === 'idcard') {
                $templateService->generateIdcardCertificate($application, $filePath);
            } elseif ($certType === 'admission') {
                $templateService->generateAdmissionCertificate($application, $filePath);
            } elseif (isset($typeMap[$certType])) {
                $map = $typeMap[$certType];
                $templateService->generateGenericCertificate($application, $filePath, $map['template'], $map['function']);
            } else {
                // fallback — keep existing behavior (DO NOT BREAK)
                $templateService->generateBonafideCertificate($application, $filePath);
            }

            if (class_exists("SignatureService")) {
                SignatureService::sign($filePath);
            }

            /* Calculate Cryptographic Hash of the Final File */
            $documentHash = null;
            if (file_exists($filePath)) {
                $documentHash = hash_file('sha256', $filePath);
            }

            /*
             * CORRECT column names — match actual PostgreSQL DB:
             *   file_path    ✅  (NOT certificate_file)
             *   generated_at ✅  (NOT created_at)
             *   document_hash✅  (NEW: Cryptographic Integrity)
             */
            $sql = "
                INSERT INTO certificates
                (certificate_number, application_id, file_path, document_hash, generated_at)
                VALUES (:number, :app_id, :file, :hash, NOW())
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ":number" => $certificateNumber,
                ":app_id" => $applicationId,
                ":file"   => $dbFilePath,   // relative path e.g. STUDENTS/2024/CS/BT240076CS/issued/CERT-....pdf
                ":hash"   => $documentHash
            ]);

            $this->applicationRepository->updateCertificate(
                $applicationId,
                $certificateNumber,
                $dbFilePath
            );

            if (!empty($application['student_id'])) {
                $this->notificationService->send(
                    $application['student_id'],
                    "Your certificate has been generated. Certificate No: " . $certificateNumber
                );
            }

            return $certificateNumber;

        } catch (Exception $e) {
            error_log("Certificate generation failed: " . $e->getMessage());
            throw $e;
        }
    }

    /*
    ==================================================
    VERIFY CERTIFICATE — UNCHANGED
    ==================================================
    */
    public function verifyCertificate($certificateNumber)
    {
        $sql = "
            SELECT * FROM certificates
            WHERE certificate_number = :number
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([":number" => $certificateNumber]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /*
    ==================================================
    GET CERTIFICATE FILE PATH — UNCHANGED
    ==================================================
    */
    public function getCertificateFile($certificateNumber)
    {
        $cert = $this->verifyCertificate($certificateNumber);

        if (!$cert) return null;

        $fileName = $cert['file_path'];

        if (empty($fileName)) return null;

        $paths = [
            dirname(__DIR__, 2) . "/public/storage/generated/" . $fileName,
            STORAGE_PATH        . "/certificates/"              . $fileName,
            dirname(__DIR__, 2) . "/storage/certificates/"      . $fileName
        ];

        foreach ($paths as $path) {
            if (file_exists($path)) return realpath($path);
        }

        error_log("Certificate file missing: " . $fileName);
        return null;
    }
}