<?php

require_once __DIR__ . '/../Repositories/StudentRepository.php';
require_once __DIR__ . '/../core/Database.php';

class StudentService
{
    private $repository;
    private $db;

    public function __construct()
    {
        $this->repository = new StudentRepository();
        $this->db = Database::getInstance()->getConnection();
    }

    // OLD FUNCTION — KEEP
    public function getDashboardStats($studentId)
    {
        return $this->repository->getDashboardStats($studentId);
    }

    // OLD FUNCTION — KEEP
    public function getCertificates($studentId)
    {
        return $this->repository->getCertificates($studentId);
    }

    // NEW FUNCTION — FIXED VERSION
    public function getDashboardSummary($user_id)
    {
        $summary = [];

        // Total applications
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM applications
            WHERE user_id = ?
        ");
        $stmt->execute([$user_id]);
        $summary['total_applications'] = (int)$stmt->fetchColumn();


        // Pending
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM applications
            WHERE user_id = ? AND status = 'pending'
        ");
        $stmt->execute([$user_id]);
        $summary['pending'] = (int)$stmt->fetchColumn();


        // Approved
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM applications
            WHERE user_id = ? AND status = 'approved'
        ");
        $stmt->execute([$user_id]);
        $summary['approved'] = (int)$stmt->fetchColumn();


        // Rejected
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM applications
            WHERE user_id = ? AND status = 'rejected'
        ");
        $stmt->execute([$user_id]);
        $summary['rejected'] = (int)$stmt->fetchColumn();


        // Certificates
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM certificates
            WHERE user_id = ?
        ");
        $stmt->execute([$user_id]);
        $summary['certificates'] = (int)$stmt->fetchColumn();

        return $summary;
    }
}