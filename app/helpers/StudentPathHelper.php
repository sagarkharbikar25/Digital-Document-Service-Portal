<?php

/**
 * StudentPathHelper
 *
 * Parses a BTID (e.g. "BT240076CS") and builds the correct
 * hierarchical storage paths for uploads and issued certificates.
 *
 * Path structure:
 *   storage/uploads/STUDENTS/{year}/{dept}/{btid}/
 *     ├── profile/
 *     ├── applications/{certType}/
 *     └── issued/
 */
class StudentPathHelper
{
    /**
     * Parse a BTID string into year and department.
     *
     * BT240076CS  →  [ 'year' => '2024', 'dept' => 'CS' ]
     *
     * Rules:
     *  - Strip leading "BT" (case-insensitive)
     *  - First 2 numeric chars  → admission year  (24 → 2024)
     *  - Trailing alpha chars   → department code  (CS, ME, IT …)
     *
     * @param  string $btid
     * @return array  ['year' => string, 'dept' => string]
     *                Returns ['year' => 'general', 'dept' => 'general'] on failure.
     */
    public static function parseBtid(string $btid): array
    {
        // Remove "BT" or "bt" prefix
        $raw = preg_replace('/^BT/i', '', trim($btid));

        if (empty($raw)) {
            return ['year' => 'general', 'dept' => 'general'];
        }

        // First 2 characters = year digits
        $yearDigits = substr($raw, 0, 2);
        $year = (is_numeric($yearDigits)) ? '20' . $yearDigits : 'general';

        // Trailing alphabetic characters = department
        preg_match('/([A-Za-z]+)$/', $raw, $m);
        $dept = !empty($m[1]) ? strtoupper($m[1]) : 'general';

        return ['year' => $year, 'dept' => $dept];
    }

    /**
     * Build the absolute base path for a student's upload folder.
     *
     * Returns: {BASE_PATH}/storage/uploads/STUDENTS/{year}/{dept}/{btid}/
     *
     * @param  string $btid  e.g. "BT240076CS"
     * @return string  absolute directory path (no trailing slash)
     */
    public static function getStudentBase(string $btid): string
    {
        $parts = self::parseBtid($btid);
        return BASE_PATH
            . '/storage/uploads/STUDENTS'
            . '/' . $parts['year']
            . '/' . $parts['dept']
            . '/' . $btid;
    }

    /**
     * Path for student profile photo: {base}/profile/
     */
    public static function getProfilePath(string $btid): string
    {
        return self::getStudentBase($btid) . '/profile';
    }

    /**
     * Path for uploaded application documents: {base}/applications/{certType}/
     *
     * @param  string $btid
     * @param  string $certType  e.g. 'bonafide', 'character', 'admission'
     * @return string
     */
    public static function getApplicationPath(string $btid, string $certType): string
    {
        return self::getStudentBase($btid) . '/applications/' . $certType;
    }

    /**
     * Path for issued (generated) certificates: {base}/issued/
     */
    public static function getIssuedPath(string $btid): string
    {
        return self::getStudentBase($btid) . '/issued';
    }

    /**
     * Relative path stored in DB for application documents.
     *
     * getDocuments() builds:  CONCAT('storage/uploads/', file_name)
     * So we store:            STUDENTS/{year}/{dept}/{btid}/applications/{certType}/{filename}
     *
     * @param  string $btid
     * @param  string $certType
     * @param  string $filename
     * @return string
     */
    public static function getRelativeDocPath(
        string $btid,
        string $certType,
        string $filename
    ): string {
        $parts = self::parseBtid($btid);
        return 'STUDENTS'
            . '/' . $parts['year']
            . '/' . $parts['dept']
            . '/' . $btid
            . '/applications/' . $certType
            . '/' . $filename;
    }

    /**
     * Relative path stored in DB for issued certificates.
     * CertificateController::download() resolves absolute path from this.
     *
     * @param  string $btid
     * @param  string $filename  e.g. "CERT-2026-XXXXX.pdf"
     * @return string
     */
    public static function getRelativeIssuedPath(
        string $btid,
        string $filename
    ): string {
        $parts = self::parseBtid($btid);
        return 'STUDENTS'
            . '/' . $parts['year']
            . '/' . $parts['dept']
            . '/' . $btid
            . '/issued/' . $filename;
    }

    /**
     * Ensure a directory exists, creating it recursively if needed.
     *
     * @param  string $path  absolute path
     * @return bool   true on success
     */
    public static function ensureDir(string $path): bool
    {
        if (!is_dir($path)) {
            return mkdir($path, 0777, true);
        }
        return true;
    }
}
