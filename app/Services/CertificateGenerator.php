<?php

require_once __DIR__ . "/../Repositories/ApplicationRepository.php";
require_once __DIR__ . "/QRCodeService.php";
require_once dirname(__DIR__,2) . "/vendor/autoload.php";

use Dompdf\Dompdf;
use Dompdf\Options;

class CertificateGenerator
{
    private ApplicationRepository $repo;

    public function __construct()
    {
        $this->repo = new ApplicationRepository();
    }

    /*
    ==================================================
    ROUTER — picks the right generator.
    certificate_type checked FIRST (holds clean value).
    adm_type is fallback only (may hold admission category
    like "Direct Admission (CAP)" — not a cert type).
    ==================================================
    */
    public function generateForApplication(int $application_id): string
    {
        $data = $this->repo->getFullApplication($application_id);

        if (!$data) {
            throw new Exception("Application not found: " . $application_id);
        }

        $certType = strtolower(trim($data['certificate_type'] ?? ''));
        $admType  = strtolower(trim($data['adm_type']         ?? ''));

        if (!empty($certType)) {
            $type = $certType;
        } elseif (str_contains($admType, 'character')) {
            $type = 'character';
        } elseif (str_contains($admType, 'admission')) {
            $type = 'admission';
        } elseif (str_contains($admType, 'idcard') || str_contains($admType, 'id card')) {
            $type = 'idcard';
        } else {
            $type = 'bonafide';
        }

        switch ($type) {
            case 'admission': return $this->generateAdmission($application_id);
            case 'character': return $this->generateCharacter($application_id);
            case 'idcard':    return $this->generateIdcard($application_id);
            case 'fees_receipt': 
            case 'fees':      return $this->generateGeneric($application_id, 'fees_receipt_template.php', 'generateFeesReceiptHTML');
            case 'hall_ticket': return $this->generateGeneric($application_id, 'hall_ticket_template.php', 'generateHallTicketHTML');
            case 'marksheet': return $this->generateGeneric($application_id, 'marksheet_template.php', 'generateMarksheetHTML');
            case 'provisional': return $this->generateGeneric($application_id, 'provisional_template.php', 'generateProvisionalHTML');
            case 'degree':    return $this->generateGeneric($application_id, 'degree_template.php', 'generateDegreeHTML');
            case 'migration': return $this->generateGeneric($application_id, 'migration_template.php', 'generateMigrationHTML');
            case 'noc':       return $this->generateGeneric($application_id, 'noc_template.php', 'generateNocHTML');
            case 'transcript': return $this->generateGeneric($application_id, 'transcript_template.php', 'generateTranscriptHTML');
            case 'tc':
            case 'leaving':   return $this->generateGeneric($application_id, 'tc_template.php', 'generateTcHTML');
            case 'bonafide':
            default:          return $this->generateBonafide($application_id);
        }
    }

    /*
    ==================================================
    BONAFIDE GENERATOR — DO NOT BREAK
    ==================================================
    */
    public function generateBonafide(int $application_id): string
    {
        $data = $this->repo->getFullApplication($application_id);

        if (!$data) throw new Exception("Application not found");

        $certNumber = $data['certificate_number']
                   ?? $data['application_number']
                   ?? ('CERT-' . $application_id);

        $qrService = new QRCodeService();
        $qrPath = $qrService->generate($certNumber);

        $templateData = [
            'student_name'       => $data['student_name'] ?? $data['name']         ?? 'Student Name',
            'branch'             => $data['branch']       ?? $data['department']   ?? 'Computer Science and Engineering',
            'year'               => $data['year']         ?? $data['current_year'] ?? '',
            'dob'                => $data['dob']          ?? '',
            'purpose'            => $data['purpose']      ?? 'Official Purpose',
            'certificate_number' => $certNumber,
            'qr_path'            => $qrPath
        ];

        $templatePath = dirname(__DIR__, 2) . '/storage/templates/bonafide_template.php';
        if (!file_exists($templatePath)) throw new Exception("Template not found: " . $templatePath);

        require_once $templatePath;
        if (!function_exists('generateBonafideHTML')) throw new Exception("generateBonafideHTML not found");

        return $this->renderPdf(generateBonafideHTML($templateData), $application_id);
    }

    /*
    ==================================================
    ADMISSION LETTER GENERATOR — DO NOT BREAK
    ==================================================
    */
    public function generateAdmission(int $application_id): string
    {
        $data = $this->repo->getFullApplication($application_id);

        if (!$data) throw new Exception("Application not found");

        $certNumber = $data['certificate_number']
                   ?? $data['application_number']
                   ?? ('CERT-' . $application_id);

        $qrService = new QRCodeService();
        $qrPath = $qrService->generate($certNumber);

        $templateData = [
            'student_name'       => $data['student_name']  ?? $data['name']         ?? 'Student Name',
            'branch'             => $data['branch']         ?? $data['department']   ?? 'Computer Science and Engineering',
            'year'               => $data['year']           ?? $data['current_year'] ?? '',
            'dob'                => $data['dob']            ?? '',
            'email'              => $data['student_email']  ?? $data['email']        ?? '',
            'mobile'             => $data['mobile']         ?? '',
            'btid'               => $data['btid']           ?? $data['bt_id']        ?? '',
            'ac_year'            => $data['ac_year']        ?? '',
            'adm_type'           => $data['adm_type']       ?? '',
            'purpose'            => $data['purpose']        ?? 'Official Purpose',
            'certificate_number' => $certNumber,
            'qr_path'            => $qrPath
        ];

        $templatePath = dirname(__DIR__, 2) . '/storage/templates/admission_template.php';
        if (!file_exists($templatePath)) throw new Exception("Template not found: " . $templatePath);

        require_once $templatePath;
        if (!function_exists('generateAdmissionHTML')) throw new Exception("generateAdmissionHTML not found");

        return $this->renderPdf(generateAdmissionHTML($templateData), $application_id);
    }

    /*
    ==================================================
    CHARACTER CERTIFICATE GENERATOR — DO NOT BREAK
    ==================================================
    */
    public function generateCharacter(int $application_id): string
    {
        $data = $this->repo->getFullApplication($application_id);

        if (!$data) throw new Exception("Application not found");

        $certNumber = $data['certificate_number']
                   ?? $data['application_number']
                   ?? ('CERT-' . $application_id);

        $qrService = new QRCodeService();
        $qrPath = $qrService->generate($certNumber);

        $templateData = [
            'student_name'       => $data['student_name'] ?? $data['name']         ?? 'Student Name',
            'branch'             => $data['branch']       ?? $data['department']   ?? 'Computer Science and Engineering',
            'year'               => $data['year']         ?? $data['current_year'] ?? '',
            'dob'                => $data['dob']          ?? '',
            'purpose'            => $data['purpose']      ?? 'Official Purpose',
            'certificate_number' => $certNumber,
            'qr_path'            => $qrPath
        ];

        $templatePath = dirname(__DIR__, 2) . '/storage/templates/character_template.php';
        if (!file_exists($templatePath)) throw new Exception("Template not found: " . $templatePath);

        require_once $templatePath;
        if (!function_exists('generateCharacterHTML')) throw new Exception("generateCharacterHTML not found");

        return $this->renderPdf(generateCharacterHTML($templateData), $application_id);
    }

    /*
    ==================================================
    ID CARD GENERATOR

    FIXES APPLIED (vs original):
      1. isRemoteEnabled = true   — Dompdf silently blocks
         ALL base64 data-URI images when this is false.
         This was the root cause of photos not showing.
      2. file_path → file_name normalization so both
         DB column naming conventions work.
      3. Debug logging to trace photo-load issues.

    NOTE: getFullApplication() already calls getDocuments()
          and attaches the result as $data['documents'],
          so no separate document fetch is needed here.
    ==================================================
    */
    public function generateIdcard(int $application_id): string
    {
        $data = $this->repo->getFullApplication($application_id);

        if (!$data) throw new Exception("Application not found");

        $certNumber = $data['certificate_number']
                   ?? $data['application_number']
                   ?? ('CERT-' . $application_id);

        /*
         * dirname(__DIR__, 2):
         *   __DIR__ = /path/to/project/app/Services
         *   up 1    = /path/to/project/app
         *   up 2    = /path/to/project         ← correct project root
         */
        $projectRoot = dirname(__DIR__, 2);

        /*
         * Documents are already loaded by getFullApplication()
         * which calls getDocuments() internally.
         *
         * getDocuments() returns rows from application_documents:
         *   file_name      = "id card/1234567890_photo.jpg"
         *   document_type  = "id card"
         *   path           = "storage/uploads/id card/1234567890_photo.jpg"
         */
        $documents = $data['documents'] ?? [];

        /*
         * Normalize: some tables use 'file_path' instead of 'file_name'.
         * Ensure every document entry has 'file_name' set.
         */
        foreach ($documents as &$doc) {
            if (empty($doc['file_name']) && !empty($doc['file_path'])) {
                $doc['file_name'] = $doc['file_path'];
            }
        }
        unset($doc);

        /* ── Debug log (remove after confirming photos work) ── */
        error_log("=== ID CARD DEBUG START ===");
        error_log("application_id : " . $application_id);
        error_log("project_root   : " . $projectRoot);
        error_log("documents count: " . count($documents));
        foreach ($documents as $i => $doc) {
            error_log("  doc[$i]: type="
                . ($doc['document_type'] ?? 'NULL')
                . " | file="
                . ($doc['file_name'] ?? 'NULL'));
        }
        error_log("=== ID CARD DEBUG END ===");

        $qrService = new QRCodeService();
        $qrPath = $qrService->generate($certNumber);

        $templateData = [
            'student_name'       => $data['student_name']  ?? $data['name']         ?? 'Student Name',
            'branch'             => $data['branch']         ?? $data['department']   ?? 'Computer Science & Engineering',
            'year'               => $data['year']           ?? $data['current_year'] ?? '',
            'dob'                => $data['dob']            ?? '',
            'btid'               => $data['btid']           ?? $data['bt_id']        ?? '',
            'mobile'             => $data['mobile']         ?? '',
            'parent_mobile'      => $data['parent_mobile']  ?? $data['parent_no']    ?? '',
            'address'            => $data['address']        ?? '',
            'ac_year'            => $data['ac_year']        ?? '',
            'gender'             => $data['gender']         ?? '',
            'request_type'       => $data['request_type']   ?? 'new',
            'reason'             => $data['reason']         ?? '',
            'purpose'            => $data['purpose']        ?? '',
            'certificate_number' => $certNumber,
            'documents'          => $documents,
            '_root'              => $projectRoot,
            'qr_path'            => $qrPath
        ];

        $templatePath = dirname(__DIR__, 2) . '/storage/templates/idcard_template.php';
        if (!file_exists($templatePath)) throw new Exception("ID card template not found: " . $templatePath);

        require_once $templatePath;
        if (!function_exists('generateIdcardHTML')) throw new Exception("generateIdcardHTML not found");

        $html = generateIdcardHTML($templateData);

        /* ── Save debug HTML to verify in browser (remove after fix) ── */
        $debugDir = $projectRoot . '/public/storage/generated/';
        if (!is_dir($debugDir)) mkdir($debugDir, 0777, true);
        file_put_contents($debugDir . 'debug_idcard_' . $application_id . '.html', $html);
        error_log("Debug HTML → " . $debugDir . 'debug_idcard_' . $application_id . '.html');

        /* ── Dompdf ── */
        $options = new Options();
        $options->set('dpi', 96);
        $options->set('isHtml5ParserEnabled', true);

        /*
         * ═══════════════════════════════════════════════════════
         * CRITICAL FIX: isRemoteEnabled MUST be true
         *
         * Dompdf treats base64 data:image/... src values as
         * "remote" resources. When this is false, ALL base64
         * <img> tags are silently discarded — no error thrown,
         * just blank space where logo/photo/signature should be.
         *
         * This was the root cause of photos not showing.
         * ═══════════════════════════════════════════════════════
         */
        $options->set('isRemoteEnabled', true);

        $options->set('isPhpEnabled', false);
        $options->set('defaultFont', 'DejaVu Sans');
        $options->setChroot($projectRoot);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $fileName = 'certificate_' . $application_id . '_' . time() . '.pdf';
        
        $btid = trim($data['btid'] ?? $data['bt_id'] ?? '');

        if ($btid !== '') {
            require_once __DIR__ . '/../helpers/StudentPathHelper.php';
            $path = StudentPathHelper::getIssuedPath($btid);
            StudentPathHelper::ensureDir($path);
            $path .= '/';
            $dbFilePath = StudentPathHelper::getRelativeIssuedPath($btid, $fileName);
        } else {
            $path = dirname(__DIR__, 2) . "/public/storage/generated/";
            if (!is_dir($path)) mkdir($path, 0777, true);
            $dbFilePath = $fileName;
        }

        file_put_contents($path . $fileName, $dompdf->output());

        return $dbFilePath;
    }

    /*
    ==================================================
    GENERIC GENERATOR — for the expanded list
    ==================================================
    */
    public function generateGeneric(int $application_id, string $templateFile, string $functionName): string
    {
        $data = $this->repo->getFullApplication($application_id);
        if (!$data) throw new Exception("Application not found");

        $certNumber = $data['certificate_number'] ?? $data['application_number'] ?? ('CERT-' . $application_id);
        
        $qrService = new QRCodeService();
        $qrPath = $qrService->generate($certNumber);

        $templateData = [
            'student_name'       => $data['student_name'] ?? $data['name'] ?? 'Student Name',
            'branch'             => $data['branch'] ?? $data['department'] ?? 'Computer Science and Engineering',
            'year'               => $data['year'] ?? $data['current_year'] ?? '',
            'dob'                => $data['dob'] ?? '',
            'ac_year'            => $data['ac_year'] ?? '2025-26',
            'purpose'            => $data['purpose'] ?? 'Official Purpose',
            'certificate_number' => $certNumber,
            'qr_path'            => $qrPath
        ];

        $templatePath = dirname(__DIR__, 2) . '/storage/templates/' . $templateFile;
        if (!file_exists($templatePath)) throw new Exception("Template not found: " . $templatePath);

        require_once $templatePath;
        if (!function_exists($functionName)) throw new Exception("$functionName not found");

        return $this->renderPdf($functionName($templateData), $application_id);
    }
    public static function generate(array $application, string $certificateNumber): array
    {
        return [
            "certificate_number" => $certificateNumber,
            "student_id"         => $application['student_id']      ?? null,
            "certificate_type"   => $application['certificate_type'] ?? "Bonafide",
            "issued_at"          => date("Y-m-d"),
            "application_id"     => $application['id']              ?? null
        ];
    }

    /*
    ==================================================
    SHARED PDF RENDERER — A4 portrait
    Used by bonafide, admission, character.
    generateIdcard has its own block above.
    ==================================================
    */
    private function renderPdf(
        string $html,
        int    $application_id,
        string $paper       = 'A4',
        string $orientation = 'portrait'
    ): string {
        $options = new Options();
        $options->set('dpi', 96);
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', false);
        $options->set('isPhpEnabled', false);
        $options->set('defaultFont', 'DejaVu Sans');
        $options->setChroot(dirname(__DIR__, 2));

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper($paper, $orientation);
        $dompdf->render();

        $fileName = 'certificate_' . $application_id . '_' . time() . '.pdf';
        
        $data = $this->repo->getFullApplication($application_id);
        $btid = trim($data['btid'] ?? $data['bt_id'] ?? '');

        if ($btid !== '') {
            require_once __DIR__ . '/../helpers/StudentPathHelper.php';
            $path = StudentPathHelper::getIssuedPath($btid);
            StudentPathHelper::ensureDir($path);
            $path .= '/';
            $dbFilePath = StudentPathHelper::getRelativeIssuedPath($btid, $fileName);
        } else {
            $path = dirname(__DIR__, 2) . "/public/storage/generated/";
            if (!is_dir($path)) mkdir($path, 0777, true);
            $dbFilePath = $fileName;
        }

        file_put_contents($path . $fileName, $dompdf->output());

        return $dbFilePath;
    }
}