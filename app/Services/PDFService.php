<?php

use Dompdf\Dompdf;
use Dompdf\Options;

class PDFService
{
    /*
    =====================================================
    generate() — ORIGINAL — DO NOT TOUCH
    =====================================================
    */
    public static function generate($certificateData, $filePath)
    {
        $directory = dirname($filePath);

        if (!is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        require_once __DIR__ . "/../../vendor/autoload.php";

        $options = new Options();
        $options->set('isRemoteEnabled', true);

        $dompdf = new Dompdf($options);

        $collegeName = "JAIDEV EDUCATION SOCIETY'S
        J D COLLEGE OF ENGINEERING AND MANAGEMENT";

        $collegeAddress = "
        KATOL ROAD, NAGPUR<br>
        Affiliated to DBATU, RTMNU & MSBTE Mumbai<br>
        Website: www.jdcoem.ac.in
        Email: info@jdcoem.ac.in<br>
        NAAC 'A' Grade Institute
        ";

        $certificateTitle = "Bonafide Certificate";

        $studentName       = $certificateData['student_name'] ?? "Student Name";
        $studentId         = $certificateData['student_id'] ?? '';
        $branch            = $certificateData['branch'] ?? "Computer Science and Engineering";
        $year              = $certificateData['year'] ?? "2nd Year";
        $dob               = $certificateData['dob'] ?? "01-01-2000";
        $purpose           = $certificateData['purpose'] ?? "SCHOLARSHIP";
        $certificateNumber = $certificateData['certificate_number'] ?? 'CERT-XXXX';
        $issuedDate        = date("d-m-Y");

        $html = "
        <html>
        <head>
        <style>
        body { font-family: 'Times New Roman', serif; padding: 40px; }
        .certificate-container { border: 4px solid black; padding: 40px; }
        .header { text-align: center; font-size: 18px; font-weight: bold; }
        .sub-header { text-align: center; font-size: 14px; margin-top: 5px; }
        .title { text-align: center; font-size: 28px; font-weight: bold; margin-top: 40px; margin-bottom: 40px; }
        .content { font-size: 18px; line-height: 1.8; text-align: justify; }
        .bold { font-weight: bold; }
        .footer { margin-top: 80px; }
        .signature { float: right; text-align: center; font-weight: bold; }
        .certificate-number { margin-top: 20px; font-size: 14px; }
        </style>
        </head>
        <body>
        <div class='certificate-container'>
            <div class='header'>$collegeName</div>
            <div class='sub-header'>$collegeAddress</div>
            <div class='certificate-number'>Certificate No: $certificateNumber<br>Date: $issuedDate</div>
            <div class='title'>$certificateTitle</div>
            <div class='content'>
                This is to certify that <span class='bold'>$studentName</span>
                is a bonafide student of JD College of Engineering and Management.<br><br>
                He/She is studying in <span class='bold'>B.Tech ($branch) $year</span>
                during the academic session 2025-26.<br><br>
                On the basis of documents submitted, his/her date of birth is
                <span class='bold'>$dob</span>.<br><br>
                This certificate is issued upon request for <span class='bold'>$purpose</span> purpose.
            </div>
            <div class='footer'><div class='signature'>Principal</div></div>
        </div>
        </body>
        </html>
        ";

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        file_put_contents($filePath, $dompdf->output());
    }

    /*
    =====================================================
    generateFromHTML — PROFESSIONAL VERSION
    =====================================================
    */
    public static function generateFromHTML($html, $filePath)
    {
        $directory = dirname($filePath);

        if (!is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        require_once __DIR__ . "/../../vendor/autoload.php";

        $options = new Options();
        $options->set('dpi', 96);
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', false);
        $options->set('isPhpEnabled', false);
        $options->set('defaultFont', 'DejaVu Sans');
        $options->setChroot(dirname(__DIR__, 2));

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        file_put_contents($filePath, $dompdf->output());
    }

    /*
    =====================================================
    generateByType — SAFE ROUTER (NEW)
    =====================================================
    */
    public static function generateByType($certificateData, $filePath)
    {
        $type = strtolower(trim(
            $certificateData['adm_type'] 
            ?? $certificateData['certificate_type'] 
            ?? ''
        ));

        $basePath = dirname(__DIR__, 2) . '/storage/templates/';

        switch ($type) {

            case 'character':
                require_once $basePath . 'character_template.php';
                $html = generateCharacterHTML($certificateData);
                break;

            case 'bonafide':
                require_once $basePath . 'bonafide_template.php';
                $html = generateBonafideHTML($certificateData);
                break;

            case 'admission':
                require_once $basePath . 'admission_template.php';
                $html = generateAdmissionHTML($certificateData);
                break;

            default:
                // fallback — DO NOT BREAK OLD SYSTEM
                return self::generate($certificateData, $filePath);
        }

        return self::generateFromHTML($html, $filePath);
    }
}