<?php

require_once __DIR__ . "/ApplicationService.php";
require_once __DIR__ . "/CertificateService.php";

class ApprovalService
{
    private $appService;
    private $certificateService;

    public function __construct()
    {
        $this->appService = new ApplicationService();
        $this->certificateService = new CertificateService();
    }


    /*
    ========================================
    CLERK APPROVAL (PHASE 4 SAFE)
    ========================================
    */
    public function approveClerk($application_id, $clerk_id)
    {
        $this->appService->clerkApprove(
            $application_id,
            $clerk_id
        );

        return [
            "success" => true,
            "message" => "Clerk approved successfully"
        ];
    }


    /*
    ========================================
    HOD APPROVAL (PHASE 4 SAFE)
    ========================================
    */
    public function approveHod($application_id, $hod_id)
    {
        $this->appService->hodApprove(
            $application_id,
            $hod_id
        );

        return [
            "success" => true,
            "message" => "HOD approved successfully"
        ];
    }


    /*
    ========================================
    PRINCIPAL APPROVAL (PHASE 4 SAFE)
    This already generates certificate automatically
    ========================================
    */
    public function approvePrincipal($applicationId, $principalId)
{
    $db = Database::getInstance()->getConnection();

    try {

        $db->beginTransaction();

        // 1. Update application status
        $stmt = $db->prepare("
            UPDATE applications
            SET status = 'approved',
                principal_id = :principal_id,
                principal_approved_at = NOW()
            WHERE id = :id
        ");

        $stmt->execute([
            ':principal_id' => $principalId,
            ':id' => $applicationId
        ]);


        // 2. Generate certificate number
        require_once __DIR__ . '/CertificateNumberService.php';

        $numberService = new CertificateNumberService();

        $certificateNumber = $numberService->generate();


        // 3. Insert into certificates table
        $stmt = $db->prepare("
            INSERT INTO certificates
            (application_id, certificate_number, file_path, generated_by)
            VALUES
            (:application_id, :certificate_number, :file_path, :generated_by)
        ");

        $filePath = 'cert_' . $certificateNumber . '.pdf';

        $stmt->execute([
            ':application_id' => $applicationId,
            ':certificate_number' => $certificateNumber,
            ':file_path' => $filePath,
            ':generated_by' => $principalId
        ]);


        $db->commit();


        // ✅ IMPORTANT RETURN
        return [
            "certificate_number" => $certificateNumber,
            "file_path" => $filePath
        ];

    }
    catch (Exception $e)
    {
        $db->rollBack();
        throw $e;
    }
}


    /*
    ========================================
    FINAL APPROVE (PHASE 5 SAFE WRAPPER)
    This safely calls existing approvePrincipal
    without breaking old logic
    ========================================
    */
    public function finalApprove($applicationId, $principalId)
    {
        // reuse existing safe method
        return $this->approvePrincipal(
            $applicationId,
            $principalId
        );
    }

}