<?php

require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../Repositories/ApplicationRepository.php';
require_once __DIR__ . '/CertificateGenerator.php';
require_once __DIR__ . '/NotificationService.php';

class ApplicationService
{
    /** @var ApplicationRepository */
    private $repo;

    /** @var PDO */
    private $db;
    private $applicationRepository;
    private $notificationService;


    public function __construct()
    {
        // Initialize repository safely
        $this->repo = new ApplicationRepository();

        // SAFE alias (for new functions)
        $this->applicationRepository = $this->repo;

        $this->notificationService = new NotificationService();

        // Initialize database safely
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
    CREATE APPLICATION (SAFE)

    FIX: Added $admType parameter (optional, default null).
    character.js → controller passes 'character'
    bonafide.js  → controller passes 'bonafide'
    Legacy callers that don't pass it → null (safe, no break)

    Both adm_type AND certificate_type are now saved:
      adm_type        → used by DocumentController to pick upload subfolder
      certificate_type → used by CertificateService to pick template
    ========================================
    */
    public function createApplication(array $data, ?string $admType = null): int
    {
        if (empty($data['student_id']))
        {
            throw new Exception("student_id required");
        }

        /*
         * Resolve adm_type from all possible sources:
         *   1. $admType param — passed by ApplicationController::create()
         *   2. $data['admType'] — direct key from frontend JSON
         *   3. $data['adm_type'] — snake_case variant
         *   4. $data['certificate_type'] — fallback (same meaning)
         *   5. 'bonafide' — safe default
         */
        $resolvedAdmType = strtolower(trim(
            $admType
            ?? $data['admType']          ?? null
            ?? $data['adm_type']         ?? null
            ?? $data['certificate_type'] ?? null
            ?? 'bonafide'
        ));

        // INSERT APPLICATION
        $sql = "
            INSERT INTO applications
            (
                student_id,
                certificate_type,
                adm_type,
                purpose,
                status,
                created_at,
                updated_at
            )
            VALUES
            (
                :student_id,
                :certificate_type,
                :adm_type,
                :purpose,
                'pending',
                NOW(),
                NOW()
            )
            RETURNING id
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ":student_id"       => $data['student_id'],
            ":certificate_type" => $resolvedAdmType,
            ":adm_type"         => $resolvedAdmType,
            ":purpose"          => $data['purpose'] ?? ''
        ]);

        $applicationId = $stmt->fetchColumn();


        // =====================================
        // ASSIGN APPLICATION NUMBER
        // =====================================

        require_once __DIR__ . "/ApplicationNumberService.php";

        $numberService = new ApplicationNumberService();

        $applicationNumber = $numberService->assign($applicationId);


        // =====================================
        // SEND EMAIL
        // =====================================

        require_once __DIR__ . "/EmailService.php";
        require_once __DIR__ . "/../Repositories/UserRepository.php";

        $userRepo = new UserRepository();

        $student = $userRepo->findById($data['student_id']);

        if ($student && isset($student['email']))
        {
            EmailService::sendApplicationSubmitted(
                $student['email'],
                $applicationNumber,
                $resolvedAdmType
            );
        }


        return $applicationId;
    }

    /*
    ========================================
    LEGACY SAFE SUPPORT
    ========================================
    */
    public function submitApplication($student_id, $document_id, $purpose)
    {
        return $this->repo->create(
            $student_id,
            $document_id,
            $purpose
        );
    }


    /*
    ========================================
    CLERK FUNCTIONS
    ========================================
    */

    public function getClerkPending(): array
    {
        return $this->repo->getClerkPending();
    }


public function clerkApprove(
    int $applicationId,
    int $clerkId,
    ?string $remarks = null
): bool{
    if (!$applicationId)
    {
        throw new Exception("Application ID required");
    }

    // =====================================
    // OLD SAFE APPROVAL (KEEP)
    // =====================================

    $result = $this->repo->clerkApproveSafe(
        $applicationId,
        $clerkId
    );
    if ($remarks) {
    try {
        $this->repo->saveRemark(
            $applicationId,
            $clerkId,
            "clerk",
            $remarks
        );
    } catch (Exception $e) {
        error_log("Remark save failed: " . $e->getMessage());
    }
}

    // =====================================
    // OLD NOTIFICATION SYSTEM (KEEP)
    // =====================================

    if ($result)
    {
        $application = $this->repo->getById($applicationId);

        if ($application && !empty($application['student_id']))
        {
            $this->notificationService->send(
                $application['student_id'],
                "Your application has been approved by Clerk."
            );
        }
    }


    // =====================================
    // NEW EMAIL SYSTEM (SAFE ENHANCEMENT)
    // =====================================

    if ($result)
    {
        try {

            require_once __DIR__ . "/EmailService.php";
            require_once __DIR__ . "/../Repositories/UserRepository.php";

            $application = $this->repo->getById($applicationId);

            if ($application && !empty($application['student_id']))
            {
                $userRepo = new UserRepository();

                $student = $userRepo->findById(
                    $application['student_id']
                );

                if ($student && !empty($student['email']))
                {
                    EmailService::sendApplicationApproved(
                        $student['email'],
                        $application['application_number'] ?? "N/A",
                        "Clerk"
                    );
                }
            }

        } catch (Exception $e) {

            error_log(
                "Clerk approval email error: " .
                $e->getMessage()
            );

        }
    }


    return $result;
}
    


    public function clerkReject(
        int $applicationId,
        int $clerkId,
        string $reason
    ): bool
    {
        if (!$applicationId || !$reason)
        {
            throw new Exception(
                "Application ID and reason required"
            );
        }

        return $this->repo->clerkRejectSafe(
            $applicationId,
            $clerkId,
            $reason
        );
    }


    /*
    ========================================
    HOD FUNCTIONS
    ========================================
    */

    public function hodPending(): array
    {
        return $this->repo->getHodPending();
    }


    public function hodApprove(int $applicationId, int $hodId): bool
{
    // =====================================
    // OLD APPROVAL (KEEP)
    // =====================================

    $result = $this->repo->hodApprove(
        $applicationId,
        $hodId
    );

    $this->repo->updateStatus(
        $applicationId,
        "hod_approved"
    );


    // =====================================
    // OLD NOTIFICATION SYSTEM (KEEP)
    // =====================================

    if ($result)
    {
        $application = $this->repo->getById($applicationId);

        if ($application && !empty($application['student_id']))
        {
            $this->notificationService->send(
                $application['student_id'],
                "Your application has been approved by HOD."
            );
        }
    }


    // =====================================
    // NEW EMAIL SYSTEM (SAFE ENHANCEMENT)
    // =====================================

    if ($result)
    {
        try {

            require_once __DIR__ . "/EmailService.php";
            require_once __DIR__ . "/../Repositories/UserRepository.php";

            $application = $this->repo->getById($applicationId);

            if ($application && !empty($application['student_id']))
            {
                $userRepo = new UserRepository();

                $student = $userRepo->findById(
                    $application['student_id']
                );

                if ($student && !empty($student['email']))
                {
                    EmailService::sendApplicationApproved(
                        $student['email'],
                        $application['application_number'] ?? "N/A",
                        "HOD"
                    );
                }
            }

        } catch (Exception $e) {

            error_log(
                "HOD approval email error: " .
                $e->getMessage()
            );

        }
    }


    return $result;
}


    public function hodReject(int $application_id): bool
    {
        return $this->repo->updateStatus(
            $application_id,
            "rejected_hod"
        );
    }


    /*
    ========================================
    PRINCIPAL FUNCTIONS
    ========================================
    */

    public function principalPending(): array
    {
        return $this->repo->getPrincipalPending();
    }


    public function principalApprove(
    int $application_id,
    int $principal_id
): string
{
    try
    {
        $this->db->beginTransaction();


        // =====================================
        // OLD FLOW (KEEP EXACT)
        // =====================================

        // approve principal
        $this->repo->principalApprove(
            $application_id,
            $principal_id
        );

        // update final status
        $this->repo->updateStatus(
            $application_id,
            "approved"
        );

        // generate certificate
        // FIX: was generateBonafide() — hardcoded, always produced
        // a Bonafide PDF regardless of application type.
        // generateForApplication() reads adm_type from DB and
        // routes to the correct template automatically:
        //   adm_type = 'bonafide'  → generateBonafide()
        //   adm_type = 'admission' → generateAdmission()
        //   adm_type = 'character' → generateCharacter()
        // All existing bonafide applications are unaffected.
        $generator = new CertificateGenerator();

        $file = $generator->generateForApplication(
            $application_id
        );

        // save certificate file
        $this->repo->saveCertificateFile(
            $application_id,
            $file
        );


        // commit transaction
        $this->db->commit();



        // =====================================
        // OLD NOTIFICATION SYSTEM (KEEP)
        // =====================================

        $application = $this->repo->getById(
            $application_id
        );

        if ($application && !empty($application['student_id']))
        {
            $this->notificationService->send(
                $application['student_id'],
                "Your certificate has been generated successfully. Certificate No: "
                . ($application['certificate_number'] ?? "N/A")
            );
        }



        // =====================================
        // NEW SAFE FEATURE: SEND EMAILS
        // =====================================

        try {

            require_once __DIR__ . "/EmailService.php";
            require_once __DIR__ . "/../Repositories/UserRepository.php";

            if ($application && !empty($application['student_id']))
            {
                $userRepo = new UserRepository();

                $student = $userRepo->findById(
                    $application['student_id']
                );

                if ($student && !empty($student['email']))
                {
                    // send approval email
                    EmailService::sendApplicationApproved(
                        $student['email'],
                        $application['application_number'] ?? "N/A",
                        "Principal"
                    );

                    // send certificate ready email
                    EmailService::sendCertificateReady(
                        $student['email'],
                        $application['certificate_number'] ?? $file
                    );
                }
            }

        }
        catch (Exception $emailError)
        {
            error_log(
                "Principal approval email error: " .
                $emailError->getMessage()
            );
        }


        // =====================================
        // RETURN ORIGINAL RESULT (DO NOT CHANGE)
        // =====================================

        return $file;
    }
    catch (Exception $e)
    {
        $this->db->rollBack();
        throw $e;
    }
}


    public function principalReject(int $application_id): bool
    {
        return $this->repo->updateStatus(
            $application_id,
            "rejected_principal"
        );
    }


    /*
    ========================================
    STUDENT FUNCTIONS
    ========================================
    */

    public function getStudentApplications(int $student_id): array
    {
        return $this->repo->getByUserId(
            $student_id
        );
    }


    public function getApplicationStatus(int $application_id): array
    {
        return $this->repo->getApplicationStatus(
            $application_id
        );
    }


    /*
    ========================================
    CERTIFICATE FUNCTIONS
    ========================================
    */

    public function getFullApplication(int $application_id): array
    {
        return $this->repo->getFullApplication(
            $application_id
        );
    }


    public function rejectWithReason(
        int $application_id,
        string $reason
    ): bool
    {
        return $this->repo->rejectWithReason(
            $application_id,
            $reason
        );
    }


    public function getCertificateFile(
        int $application_id
    ): ?string
    {
        $app = $this->repo->getFullApplication(
            $application_id
        );

        return $app['certificate_file'] ?? null;
    }


    /*
    ========================================
    ADMIN FUNCTIONS
    ========================================
    */

    public function getDashboardStats(): array
    {
        return $this->repo->getDashboardStats();
    }


    public function countPending(): int
    {
        return $this->repo->countPending();
    }


    /*
    ========================================
    APPROVAL TRACKING
    ========================================
    */

    public function getApprovalProgress(
        int $application_id
    ): ?array
    {
        $app = $this->repo->getFullApplication(
            $application_id
        );

        if (!$app)
        {
            return null;
        }

        return [

            "application_id" => $application_id,

            "status" => $app['status'],

            "clerk_approved" =>
                !empty($app['clerk_id']),

            "hod_approved" =>
                !empty($app['hod_id']),

            "principal_approved" =>
                !empty($app['principal_id']),

            "certificate_generated" =>
                !empty($app['certificate_file']),

            "certificate_file" =>
                $app['certificate_file']
        ];
    }
    /*
/*
==================================================
GET FULL APPLICATION DETAILS (NEW - SAFE)
==================================================
*/
public function getFullApplicationDetails($applicationId)
{
    try {

        if (!$applicationId) {
            throw new Exception("Application ID required");
        }

        // use repository method (already exists)
        $application =
            $this->applicationRepository
                 ->getFullApplication($applicationId);

        if (!$application) {
            throw new Exception("Application not found");
        }

        return $application;

    } catch (Exception $e) {

        error_log("Get full application failed: " . $e->getMessage());

        throw $e;
    }
}
/*
==================================================
APPLICATION TIMELINE (SAFE NEW FEATURE)
==================================================
*/

public function getApplicationTimeline($applicationId)
{
    if (!$applicationId) {
        throw new Exception("Application ID required");
    }

    $application =
        $this->applicationRepository
             ->getApplicationStatus($applicationId);

    if (!$application) {
        throw new Exception("Application not found");
    }

    return [
        "submitted" => [
            "status" => true,
            "time"   => $application['created_at']
        ],
        "clerk_approved" => [
            "status"  => !empty($application['clerk_id']),
            "time"    => $application['clerk_approved_at'] ?? null,
            "remarks" => $application['clerk_remarks'] ?? null
        ],
        "hod_approved" => [
            "status"  => !empty($application['hod_id']),
            "time"    => $application['hod_approved_at'] ?? null,
            "remarks" => $application['hod_remarks'] ?? null
        ],
        "principal_approved" => [
            "status"  => !empty($application['principal_id']),
            "time"    => $application['approved_at'] ?? null,
            "remarks" => $application['principal_remarks'] ?? null
        ],
        "certificate_generated" => [
            "status" => !empty($application['certificate_file']),
            "file"   => $application['certificate_file'] ?? null
        ]
    ];
}
private function sendApprovalEmail($applicationId, $approvedBy)
{
    require_once __DIR__ . "/EmailService.php";
    require_once __DIR__ . "/../Repositories/UserRepository.php";

    $app = $this->repo->getFullApplication($applicationId);

    if (!$app) return;

    $userRepo = new UserRepository();

    $student = $userRepo->findById($app['student_id']);

    if (!$student) return;

    EmailService::sendApplicationApproved(
        $student['email'],
        $app['application_number'] ?? "N/A",
        $approvedBy
    );
}


private function sendCertificateReadyEmail($applicationId)
{
    require_once __DIR__ . "/EmailService.php";
    require_once __DIR__ . "/../Repositories/UserRepository.php";

    $app = $this->repo->getFullApplication($applicationId);

    if (!$app) return;

    $userRepo = new UserRepository();

    $student = $userRepo->findById($app['student_id']);

    if (!$student) return;

    EmailService::sendCertificateReady(
        $student['email'],
        $app['certificate_number'] ?? "Generated"
    );
}

}