<?php

require_once __DIR__ . '/../Repositories/CertificateRepository.php';

class AdminCertificateService
{
    private $certificateRepository;

    public function __construct()
    {
        $this->certificateRepository = new CertificateRepository();
    }

    /*
    =====================================
    EXISTING — untouched
    =====================================
    */

    public function getAllCertificates()
    {
        return $this->certificateRepository->getAllWithStudent();
    }

    /*
    FIX #1: was calling searchByCertificateNumber() which didn't exist.
    Now repo has it — no change needed here, error is cleared.
    */
    public function searchCertificates($query)
    {
        return $this->certificateRepository->searchByCertificateNumber($query);
    }

    /*
    =====================================
    ENHANCED — new methods
    =====================================
    */

    /*
    FIX #2: was calling findByCertificateNumber() which didn't exist in repo.
    Added as alias in repo — no change needed here, error is cleared.
    */
    public function getCertificateByNumber($certificateNumber)
    {
        return $this->certificateRepository->findByCertificateNumber($certificateNumber);
    }

    public function getCertificatesByStudent($studentId)
    {
        return $this->certificateRepository->getByStudentId($studentId);
    }

    public function getCertificateStats()
    {
        $all          = $this->certificateRepository->getAllWithStudent();
        $total        = count($all);
        $thisMonth    = 0;
        $thisYear     = date('Y');
        $thisMonthNum = date('m');

        foreach ($all as $cert) {
            $at = $cert['created_at'] ?? $cert['generated_at'] ?? '';
            if ($at) {
                if (date('Y', strtotime($at)) === $thisYear
                    && date('m', strtotime($at)) === $thisMonthNum) {
                    $thisMonth++;
                }
            }
        }

        return [
            'total'      => $total,
            'this_month' => $thisMonth,
        ];
    }
}