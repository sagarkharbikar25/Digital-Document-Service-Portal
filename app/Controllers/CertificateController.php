<?php

require_once __DIR__ . '/../helpers/StudentPathHelper.php';

require_once __DIR__ . "/../core/Controller.php";
require_once __DIR__ . "/../Services/CertificateService.php";
require_once __DIR__ . "/../Repositories/ApplicationRepository.php";

class CertificateController extends Controller
{
    private $certificateService;
    private $applicationRepo;

    public function __construct()
    {
        $this->certificateService = new CertificateService();
        $this->applicationRepo = new ApplicationRepository();
    }

    /*
    ========================================
    GENERATE CERTIFICATE
    ========================================
    */
    public function generate()
    {
        try {

            $data = json_decode(file_get_contents("php://input"), true);

            if (!isset($data['application_id']))
            {
                return $this->json([
                    "success" => false,
                    "message" => "application_id required"
                ], 400);
            }

            $certificateNumber =
                $this->certificateService
                     ->generateCertificate($data['application_id']);

            return $this->json([
                "success" => true,
                "message" => "Certificate generated successfully",
                "certificate_number" => $certificateNumber
            ]);

        }
        catch (Exception $e)
        {
            return $this->json([
                "success" => false,
                "message" => $e->getMessage()
            ], 500);
        }
    }


    /*
    ========================================
    VERIFY CERTIFICATE
    ========================================
    */
    public function verify()
    {
        try {

            $certificateNumber = $_GET['certificate_number'] ?? null;

            $scriptName = $_SERVER['SCRIPT_NAME'];
            $base = str_replace('/index.php', '', $scriptName);
            
            if ($certificateNumber) {
                header("Location: " . $base . "/verify/index.html?cert=" . urlencode($certificateNumber));
                exit;
            } else {
                header("Location: " . $base . "/verify/index.html");
                exit;
            }

        }
        catch (Exception $e)
        {
            $scriptName = $_SERVER['SCRIPT_NAME'];
            $base = str_replace('/index.php', '', $scriptName);
            header("Location: " . $base . "/verify/index.html");
            exit;
        }
    }


    /*
    ========================================
    DOWNLOAD CERTIFICATE (FULL SAFE VERSION)
    Supports:
    ✔ application_id (NEW phase)
    ✔ certificate_number (OLD phase)
    ✔ file_path (legacy)
    ========================================
    */
    public function download()
    {
        try {

            $application_id =
                $_GET['application_id'] ?? null;

            $certificateNumber =
                $_GET['certificate_number'] ?? null;

            $fileName = null;


            /*
            ====================================
            CASE 1: application_id (NEW PHASE)
            ====================================
            */
            if ($application_id)
            {
                $app =
                    $this->applicationRepo
                         ->getFullApplication($application_id);

                if (!$app)
                {
                    throw new Exception("Application not found");
                }

                if (empty($app['certificate_file']))
                {
                    throw new Exception(
                        "Certificate not generated yet"
                    );
                }

                $fileName =
                    $app['certificate_file'];
            }


            /*
            ====================================
            CASE 2: certificate_number (OLD PHASE)
            ====================================
            */
            else if ($certificateNumber)
            {
                $certificate =
                    $this->certificateService
                         ->verifyCertificate($certificateNumber);

                if (!$certificate)
                {
                    throw new Exception(
                        "Certificate not found"
                    );
                }

                $fileName =
                    $certificate['file_path']
                    ?? ($certificateNumber . ".pdf");
            }


            else
            {
                throw new Exception(
                    "application_id OR certificate_number required"
                );
            }

            /*
            ====================================
            CHECK ALL POSSIBLE PATHS
            ====================================
            */
            $paths = [];
            if (strpos($fileName, '/') !== false || strpos($fileName, '\\') !== false) {
                $paths[] = BASE_PATH . '/storage/uploads/' . $fileName;
            }
            $paths[] = dirname(__DIR__, 2) . "/public/storage/generated/" . basename($fileName);
            $paths[] = dirname(__DIR__, 2) . "/storage/generated/"        . basename($fileName);
            $paths[] = dirname(__DIR__, 2) . "/storage/certificates/"     . basename($fileName);
            $paths[] = STORAGE_PATH        . "/generated/"                . basename($fileName);
            $paths[] = STORAGE_PATH        . "/certificates/"             . basename($fileName);

            $filePath = null;
            foreach ($paths as $path) {
                if (file_exists($path)) {
                    $filePath = realpath($path);
                    break;
                }
            }

            if (!$filePath) {
                throw new Exception("Certificate file not found");
            }

            /*
            ====================================
            OUTPUT PDF
            ====================================
            */
            if (ob_get_length()) {
                ob_clean();
            }

            header("Content-Type: application/pdf");
            header("Content-Disposition: inline; filename=\"" . basename($filePath) . "\"");
            header("Content-Length: " . filesize($filePath));
            readfile($filePath);
            exit;

        }
        catch (Exception $e)
        {
            return $this->json([
                "success" => false,
                "message" => $e->getMessage()
            ], 400);
        }
    }



    /*
    ========================================
    SHOW QR
    ========================================
    */
    public function showQR()
    {
        $file = $_GET['file'] ?? null;

        if (!$file)
        {
            http_response_code(400);
            echo "QR file required";
            return;
        }

        $path =
            STORAGE_PATH .
            "/certificates/" .
            $file;

        if (!file_exists($path))
        {
            http_response_code(404);
            echo "QR not found";
            return;
        }

        header("Content-Type: image/png");
        readfile($path);
    }

    /*
    ========================================
    VERIFY DOCUMENT BY CRYPTOGRAPHIC HASH
    ========================================
    */
    public function verifyHash()
    {
        try {
            $input  = json_decode(file_get_contents("php://input"), true) ?? [];
            $hash   = $input['hash'] ?? null;
            $certNo = $input['certificate_number'] ?? null;

            if (!$hash) {
                return $this->json(["success" => false, "message" => "Hash is required"], 400);
            }

            $db = \Database::getInstance()->getConnection();
            $stmt = $db->prepare("
                SELECT c.certificate_number, c.generated_at, u.name as student_name, s.department, a.adm_type, a.status, a.id as application_id
                FROM certificates c
                LEFT JOIN applications a ON c.application_id = a.id
                LEFT JOIN students s ON a.student_id = s.user_id
                LEFT JOIN users u ON (s.user_id = u.id OR a.student_id = u.id)
                WHERE LOWER(c.document_hash) = LOWER(:hash)
                LIMIT 1
            ");
            $stmt->execute([":hash" => $hash]);
            $cert = $stmt->fetch(\PDO::FETCH_ASSOC);

            if ($cert && $cert['certificate_number']) {
                $cert['status'] = 'authentic';
                return $this->json([
                    "data" => $cert,
                    "message" => "Document is mathematically authentic and untampered."
                ]);
            }

            /* ── 2. Check if Certificate Number is known (Mismatch check) ── */
            if ($certNo) {
                $stmt = $db->prepare("
                    SELECT c.certificate_number, c.generated_at, u.name as student_name, s.department, a.adm_type, a.status, a.id as application_id
                    FROM certificates c
                    LEFT JOIN applications a ON c.application_id = a.id
                    LEFT JOIN students s ON a.student_id = s.user_id
                    LEFT JOIN users u ON (s.user_id = u.id OR a.student_id = u.id)
                    WHERE (c.certificate_number = :number OR a.id = :id_num)
                    LIMIT 1
                ");
                $stmt->execute([
                    ":number" => $certNo,
                    ":id_num" => is_numeric($certNo) ? (int)$certNo : -1
                ]);
                $meta = $stmt->fetch(\PDO::FETCH_ASSOC);

                if ($meta) {
                    $meta['status'] = 'modified';
                    return $this->json([
                        "data" => $meta,
                        "message" => "Record exists, but file content differs (Metadata modification or tampering)."
                    ]);
                }
            }

            /* ── 3. Total Mismatch ── */
            error_log("[Verification] Unmatched hash: " . $hash);
            return $this->json([
                "success" => true,
                "status" => 'tampered',
                "message" => "Hash not found in database. The document may be old (pre-hashing) or tampered."
            ]);

        } catch (Exception $e) {
            return $this->json([
                "success" => false,
                "message" => $e->getMessage()
            ], 500);
        }
    }

}