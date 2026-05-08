<?php

require_once __DIR__ . "/../Services/AdminCertificateService.php";

class AdminCertificateController
{
    private AdminCertificateService $service;

    public function __construct()
    {
        $this->service = new AdminCertificateService();
    }

    /*
    ─────────────────────────────────────────
    GET /api/admin/certificates
    List all certificates
    ─────────────────────────────────────────
    */
    public function index()
    {
        try {
            $certificates = $this->service->getAllCertificates();
            $this->json(['success' => true, 'data' => $certificates]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    /*
    ─────────────────────────────────────────
    GET /api/admin/certificates/search?q=
    Search by certificate number or student name
    ─────────────────────────────────────────
    */
    public function search()
    {
        try {
            $query = $_GET['q'] ?? $_GET['query'] ?? '';
            if (!$query) {
                $this->json(['success' => false, 'message' => 'Query required']);
                return;
            }
            $results = $this->service->searchCertificates($query);
            $this->json(['success' => true, 'data' => $results]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    /*
    ─────────────────────────────────────────
    GET /api/admin/certificates/stats
    Dashboard summary counts
    ─────────────────────────────────────────
    */
    public function stats()
    {
        try {
            $stats = $this->service->getCertificateStats();
            $this->json([
                'success'    => true,
                'total'      => $stats['total'],
                'this_month' => $stats['this_month'],
            ]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    /*
    ─────────────────────────────────────────
    GET /api/admin/certificates/view?number=
    View single certificate details
    ─────────────────────────────────────────
    */
    public function view()
    {
        try {
            $number = $_GET['number'] ?? $_GET['certificate_number'] ?? '';
            if (!$number) {
                $this->json(['success' => false, 'message' => 'Certificate number required']);
                return;
            }
            $cert = $this->service->getCertificateByNumber($number);
            if (!$cert) {
                $this->json(['success' => false, 'message' => 'Certificate not found']);
                return;
            }
            $this->json(['success' => true, 'data' => $cert]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    /*
    ─────────────────────────────────────────
    GET /api/admin/certificates/download?number=
    Download certificate PDF
    ─────────────────────────────────────────
    */
    public function download()
    {
        try {
            $number = $_GET['number'] ?? $_GET['certificate_number'] ?? '';
            if (!$number) {
                $this->json(['success' => false, 'message' => 'Certificate number required']);
                return;
            }

            $cert = $this->service->getCertificateByNumber($number);
            if (!$cert) {
                $this->json(['success' => false, 'message' => 'Certificate not found']);
                return;
            }

            $fileName = $cert['file_path'];

            $paths = [];
            // If the path contains a slash, it is a new relative student path
            if (strpos($fileName, '/') !== false || strpos($fileName, '\\') !== false) {
                $paths[] = dirname(__DIR__, 2) . '/storage/uploads/' . ltrim($fileName, '/\\');
            }

            // Legacy paths
            $paths[] = dirname(__DIR__, 2) . '/public/storage/generated/' . basename($fileName);
            $paths[] = dirname(__DIR__, 2) . '/storage/generated/' . basename($fileName);
            $paths[] = dirname(__DIR__, 2) . '/storage/certificates/' . basename($fileName);

            $filePath = null;
            foreach ($paths as $path) {
                if (file_exists($path)) {
                    $filePath = realpath($path);
                    break;
                }
            }

            if (!$filePath) {
                $this->json(['success' => false, 'message' => 'File not found']);
                return;
            }

            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
            header('Content-Length: ' . filesize($filePath));
            readfile($filePath);
            exit;

        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    /* ── Helpers ── */

    private function json(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    private function error(string $message, int $status = 500): void
    {
        $this->json(['success' => false, 'message' => $message], $status);
    }
}