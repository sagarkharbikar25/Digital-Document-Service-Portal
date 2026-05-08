<?php

require_once __DIR__ . "/PDFService.php";
require_once __DIR__ . "/QRCodeService.php";
require_once __DIR__ . "/../core/Database.php";

class CertificateTemplateService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    ==================================================
    BONAFIDE CERTIFICATE — UNCHANGED
    ==================================================
    */
    public function generateBonafideCertificate($data, $filePath)
    {
        $qrPath = null;

        try
        {
            if ($this->db && !$this->db->inTransaction())
            {
                $this->db->beginTransaction();
            }

            $templatePath = STORAGE_PATH . "/templates/bonafide_template.php";

            if (!file_exists($templatePath))
            {
                throw new Exception(
                    "Certificate template not found: " . $templatePath
                );
            }

            require_once $templatePath;

            if (!empty($data['certificate_number']))
            {
                try
                {
                    $qrService = new QRCodeService();
                    $qrPath    = $qrService->generate($data['certificate_number']);
                    $data['qr_path'] = $qrPath;
                }
                catch (Exception $e)
                {
                    $data['qr_path'] = null;
                }
            }

            if (!function_exists("generateBonafideHTML"))
            {
                throw new Exception(
                    "Template function generateBonafideHTML not found"
                );
            }

            $html = generateBonafideHTML($data);

            $dir = dirname($filePath);
            if (!is_dir($dir))
            {
                if (!mkdir($dir, 0777, true))
                {
                    throw new Exception("Failed to create directory: " . $dir);
                }
            }

            PDFService::generateFromHTML($html, $filePath);

            if (!file_exists($filePath))
            {
                throw new Exception("PDF generation failed");
            }

            if ($this->db && $this->db->inTransaction())
            {
                $this->db->commit();
            }

            return $filePath;
        }
        catch (Exception $e)
        {
            if ($this->db && $this->db->inTransaction())
            {
                $this->db->rollBack();
            }

            if ($filePath && file_exists($filePath)) unlink($filePath);
            if ($qrPath   && file_exists($qrPath))   unlink($qrPath);

            throw $e;
        }
    }

    /*
    ==================================================
    CHARACTER CERTIFICATE — UNCHANGED
    ==================================================
    */
    public function generateCharacterCertificate($data, $filePath)
    {
        $qrPath = null;

        try
        {
            if ($this->db && !$this->db->inTransaction())
            {
                $this->db->beginTransaction();
            }

            $templatePath = STORAGE_PATH . "/templates/character_template.php";

            if (!file_exists($templatePath))
            {
                throw new Exception(
                    "Character template not found: " . $templatePath
                );
            }

            require_once $templatePath;

            if (!empty($data['certificate_number']))
            {
                try
                {
                    $qrService = new QRCodeService();
                    $qrPath    = $qrService->generate($data['certificate_number']);
                    $data['qr_path'] = $qrPath;
                }
                catch (Exception $e)
                {
                    $data['qr_path'] = null;
                }
            }

            if (!function_exists("generateCharacterHTML"))
            {
                throw new Exception(
                    "Template function generateCharacterHTML not found"
                );
            }

            $html = generateCharacterHTML($data);

            $dir = dirname($filePath);
            if (!is_dir($dir))
            {
                if (!mkdir($dir, 0777, true))
                {
                    throw new Exception("Failed to create directory: " . $dir);
                }
            }

            PDFService::generateFromHTML($html, $filePath);

            if (!file_exists($filePath))
            {
                throw new Exception("PDF generation failed");
            }

            if ($this->db && $this->db->inTransaction())
            {
                $this->db->commit();
            }

            return $filePath;
        }
        catch (Exception $e)
        {
            if ($this->db && $this->db->inTransaction())
            {
                $this->db->rollBack();
            }

            if ($filePath && file_exists($filePath)) unlink($filePath);
            if ($qrPath   && file_exists($qrPath))   unlink($qrPath);

            throw $e;
        }
    }

    /*
    ==================================================
    ID CARD CERTIFICATE — NEW
    Same pattern as bonafide/character, different
    template file and function name.
    ==================================================
    */
    public function generateIdcardCertificate($data, $filePath)
    {
        $qrPath = null;

        try
        {
            if ($this->db && !$this->db->inTransaction())
            {
                $this->db->beginTransaction();
            }

            $templatePath = STORAGE_PATH . "/templates/idcard_template.php";

            if (!file_exists($templatePath))
            {
                throw new Exception(
                    "ID Card template not found: " . $templatePath
                );
            }

            require_once $templatePath;

            if (!empty($data['certificate_number']))
            {
                try
                {
                    $qrService = new QRCodeService();
                    $qrPath    = $qrService->generate($data['certificate_number']);
                    $data['qr_path'] = $qrPath;
                }
                catch (Exception $e)
                {
                    $data['qr_path'] = null;
                }
            }

            if (!function_exists("generateIdcardHTML"))
            {
                throw new Exception(
                    "Template function generateIdcardHTML not found"
                );
            }

            $html = generateIdcardHTML($data);

            $dir = dirname($filePath);
            if (!is_dir($dir))
            {
                if (!mkdir($dir, 0777, true))
                {
                    throw new Exception("Failed to create directory: " . $dir);
                }
            }

            PDFService::generateFromHTML($html, $filePath);

            if (!file_exists($filePath))
            {
                throw new Exception("PDF generation failed");
            }

            if ($this->db && $this->db->inTransaction())
            {
                $this->db->commit();
            }

            return $filePath;
        }
        catch (Exception $e)
        {
            if ($this->db && $this->db->inTransaction())
            {
                $this->db->rollBack();
            }

            if ($filePath && file_exists($filePath)) unlink($filePath);
            if ($qrPath   && file_exists($qrPath))   unlink($qrPath);

            throw $e;
        }
    }
    /*
    ==================================================
    ADMISSION LETTER — NEW
    ==================================================
    */
    public function generateAdmissionCertificate($data, $filePath)
    {
        $qrPath = null;

        try
        {
            if ($this->db && !$this->db->inTransaction())
            {
                $this->db->beginTransaction();
            }

            $templatePath = STORAGE_PATH . "/templates/admission_template.php";

            if (!file_exists($templatePath))
            {
                throw new Exception(
                    "Admission template not found: " . $templatePath
                );
            }

            require_once $templatePath;

            if (!empty($data['certificate_number']))
            {
                try
                {
                    $qrService = new QRCodeService();
                    $qrPath    = $qrService->generate($data['certificate_number']);
                    $data['qr_path'] = $qrPath;
                }
                catch (Exception $e)
                {
                    $data['qr_path'] = null;
                }
            }

            if (!function_exists("generateAdmissionHTML"))
            {
                throw new Exception(
                    "Template function generateAdmissionHTML not found"
                );
            }

            $html = generateAdmissionHTML($data);

            $dir = dirname($filePath);
            if (!is_dir($dir))
            {
                if (!mkdir($dir, 0777, true))
                {
                    throw new Exception("Failed to create directory: " . $dir);
                }
            }

            PDFService::generateFromHTML($html, $filePath);

            if (!file_exists($filePath))
            {
                throw new Exception("PDF generation failed");
            }

            if ($this->db && $this->db->inTransaction())
            {
                $this->db->commit();
            }

            return $filePath;
        }
        catch (Exception $e)
        {
            if ($this->db && $this->db->inTransaction())
            {
                $this->db->rollBack();
            }

            if ($filePath && file_exists($filePath)) unlink($filePath);
            if ($qrPath   && file_exists($qrPath))   unlink($qrPath);

            throw $e;
        }
    }
    /*
    ==================================================
    GENERIC CERTIFICATE — for the expanded list
    ==================================================
    */
    public function generateGenericCertificate($data, $filePath, $templateName, $functionName)
    {
        $qrPath = null;
        try {
            if ($this->db && !$this->db->inTransaction()) $this->db->beginTransaction();

            $templatePath = STORAGE_PATH . "/templates/" . $templateName;
            if (!file_exists($templatePath)) throw new Exception("Template not found: " . $templatePath);

            require_once $templatePath;

            if (!empty($data['certificate_number'])) {
                try {
                    $qrService = new QRCodeService();
                    $qrPath    = $qrService->generate($data['certificate_number']);
                    $data['qr_path'] = $qrPath;
                } catch (Exception $e) {
                    $data['qr_path'] = null;
                }
            }

            if (!function_exists($functionName)) throw new Exception("$functionName not found");

            $html = $functionName($data);
            $dir = dirname($filePath);
            if (!is_dir($dir)) mkdir($dir, 0777, true);

            PDFService::generateFromHTML($html, $filePath);

            if ($this->db && $this->db->inTransaction()) $this->db->commit();
            return $filePath;
        } catch (Exception $e) {
            if ($this->db && $this->db->inTransaction()) $this->db->rollBack();
            if ($filePath && file_exists($filePath)) unlink($filePath);
            if ($qrPath   && file_exists($qrPath))   unlink($qrPath);
            throw $e;
        }
    }
}