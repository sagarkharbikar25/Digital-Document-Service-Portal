<?php

function generateIdcardHTML(array $data): string
{
    /* ── Raw values ── */
    $nameRaw       = $data['student_name']  ?? 'Student Name';
    $branchRaw     = $data['branch']        ?? $data['department'] ?? 'Computer Science & Engineering';
    $btidRaw       = $data['btid']          ?? $data['bt_id']      ?? '';
    $dobRaw        = $data['dob']           ?? '';
    $mobileRaw     = $data['mobile']        ?? '';
    $parentRaw     = $data['parent_mobile'] ?? $data['parent_no']  ?? '';
    $addressRaw    = $data['address']       ?? $data['full_address'] ?? $data['permanent_address'] ?? '';
    $acadYearRaw   = $data['ac_year']       ?? $data['acYear']     ?? '2025-26';

    /* ── Format DOB: 2006-06-11 -> 11/06/2006 ── */
    if (!empty($dobRaw) && strpos($dobRaw, '-') !== false) {
        $parts = explode('-', $dobRaw);
        if (count($parts) === 3) {
            $dobRaw = $parts[2] . '/' . $parts[1] . '/' . $parts[0];
        }
    }

    /* ── Batch year: 2025-26 -> 2024-28 ── */
    $batchYear = '2024-28';
    if (!empty($acadYearRaw) && strpos($acadYearRaw, '-') !== false) {
        $startYr   = (int) explode('-', $acadYearRaw)[0];
        $batchYear = ($startYr - 1) . '-' . substr((string)($startYr + 3), -2);
    }

    /* ── Escape values ── */
    $name    = htmlspecialchars($nameRaw, ENT_QUOTES, 'UTF-8');
    $branch  = htmlspecialchars($branchRaw, ENT_QUOTES, 'UTF-8');
    $btid    = htmlspecialchars($btidRaw, ENT_QUOTES, 'UTF-8');
    $dob     = htmlspecialchars($dobRaw, ENT_QUOTES, 'UTF-8');
    $mobile  = htmlspecialchars($mobileRaw, ENT_QUOTES, 'UTF-8');
    $parent  = htmlspecialchars($parentRaw, ENT_QUOTES, 'UTF-8');
    $address = htmlspecialchars($addressRaw, ENT_QUOTES, 'UTF-8');

    /* ── Asset loader ── */
    $b64 = function (string $path): string {
        if (!file_exists($path) || !is_file($path)) {
            error_log("[ID-CARD DEBUG] File NOT found: " . $path);
            return '';
        }

        error_log("[ID-CARD DEBUG] File FOUND: " . $path);
        $mime = mime_content_type($path) ?: 'image/png';
        return 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($path));
    };

    $dir      = __DIR__;
    $logoB64  = $b64($dir . '/images/logo_left.png');
    $prinB64  = $b64($dir . '/../signatures/principal_signature.png');

    $logoHtml = $logoB64
        ? "<img src=\"{$logoB64}\" width=\"34\" height=\"34\">"
        : "";

    $prinHtml = $prinB64
        ? "<img src=\"{$prinB64}\" height=\"22\">"
        : "";

    $qrB64 = '';
    if (!empty($data['qr_path']) && file_exists($data['qr_path'])) {
        $qrB64 = $b64($data['qr_path']);
    }
    $qrHtml = $qrB64
        ? "<img src='{$qrB64}' style='width:38px;height:38px;margin-bottom:2px;display:block;margin-left:auto;'>"
        : "";

    /* ── Student photo loader ── */
    $photoB64  = '';
    $documents = $data['documents'] ?? [];
    $root      = rtrim($data['_root'] ?? dirname(__DIR__, 2), '/\\');

    error_log("[ID-CARD DEBUG] _root = " . $root);
    error_log("[ID-CARD DEBUG] documents count = " . count($documents));

    foreach ($documents as $i => $doc) {
        error_log(
            "[ID-CARD DEBUG] doc[$i] type=" . ($doc['document_type'] ?? 'NULL')
            . " file_name=" . ($doc['file_name'] ?? 'NULL')
            . " file_path=" . ($doc['file_path'] ?? 'NULL')
        );
    }

    $tryLoad = function (string $filePath) use ($root, $b64): string {
        if (empty($filePath)) return '';

        $filePath = trim(str_replace('\\', '/', $filePath), '/');
        $baseName = basename($filePath);

        $candidates = [
            $root . '/' . $filePath,
            $root . '/storage/' . $filePath,
            $root . '/storage/uploads/' . $filePath,
            $root . '/storage/app/' . $filePath,
            $root . '/storage/app/public/' . $filePath,
            $root . '/public/storage/' . $filePath,

            $root . '/storage/uploads/id card/' . $baseName,
            $root . '/storage/uploads/id_card/' . $baseName,
            $root . '/storage/uploads/general/' . $baseName,
            $root . '/storage/uploads/' . $baseName,

            $root . '/storage/app/public/uploads/id card/' . $baseName,
            $root . '/storage/app/public/uploads/id_card/' . $baseName,
            $root . '/storage/app/public/uploads/' . $baseName,

            $root . '/public/storage/uploads/id card/' . $baseName,
            $root . '/public/storage/uploads/id_card/' . $baseName,
            $root . '/public/storage/uploads/' . $baseName,
        ];

        $candidates = array_values(array_unique(array_map(function ($p) {
            return str_replace('\\', '/', $p);
        }, $candidates)));

        error_log("[ID-CARD DEBUG] Trying to load: " . $filePath);

        foreach ($candidates as $diskPath) {
            error_log("[ID-CARD DEBUG]   checking: " . $diskPath . " => " . (file_exists($diskPath) ? 'EXISTS' : 'MISSING'));
            if (file_exists($diskPath) && is_file($diskPath)) {
                $result = $b64($diskPath);
                if (!empty($result) && strpos($result, 'data:image') === 0) {
                    return $result;
                }
            }
        }

        return '';
    };

    $photoTypes = [
        'id card',
        'id_card',
        'passport_photo',
        'passport photo',
        'student_photo',
        'student photo',
        'photo',
        'image'
    ];

    foreach ($documents as $doc) {
        $dtype = strtolower(trim($doc['document_type'] ?? ''));
        if (in_array($dtype, $photoTypes, true)) {
            $possiblePaths = array_filter([
                $doc['file_name'] ?? '',
                $doc['file_path'] ?? '',
            ]);

            foreach ($possiblePaths as $path) {
                $result = $tryLoad($path);
                if (!empty($result)) {
                    $photoB64 = $result;
                    break 2;
                }
            }
        }
    }

    if (empty($photoB64)) {
        foreach ($documents as $doc) {
            $possiblePaths = array_filter([
                $doc['file_name'] ?? '',
                $doc['file_path'] ?? '',
            ]);

            foreach ($possiblePaths as $path) {
                $lower = strtolower(basename($path));
                if (
                    strpos($lower, 'passport') !== false ||
                    strpos($lower, 'photo') !== false ||
                    strpos($lower, 'image') !== false ||
                    strpos($lower, 'id_card') !== false ||
                    strpos($lower, 'id card') !== false
                ) {
                    $result = $tryLoad($path);
                    if (!empty($result)) {
                        $photoB64 = $result;
                        break 2;
                    }
                }
            }
        }
    }

    if (empty($photoB64)) {
        foreach ($documents as $doc) {
            $possiblePaths = array_filter([
                $doc['file_name'] ?? '',
                $doc['file_path'] ?? '',
            ]);

            foreach ($possiblePaths as $path) {
                $result = $tryLoad($path);
                if (!empty($result) && strpos($result, 'data:image') === 0) {
                    $photoB64 = $result;
                    break 2;
                }
            }
        }
    }

    error_log("[ID-CARD DEBUG] photoB64 loaded = " . (!empty($photoB64) ? 'YES (' . strlen($photoB64) . ' bytes)' : 'NO'));

    $photoInner = $photoB64
        ? "<img src=\"{$photoB64}\" width=\"108\" height=\"108\">"
        : "<div style=\"color:#777;font-size:8pt;text-align:center;padding-top:34px;line-height:1.4;\">Student<br>Photo</div>";

    /* ── Barcode ── */
    $barcodeHtml = '';
    if (!empty($btidRaw)) {
        $bars = '';
        for ($i = 0, $len = strlen($btidRaw); $i < $len; $i++) {
            $byte = ord($btidRaw[$i]);
            for ($b = 7; $b >= 0; $b--) {
                $bit = ($byte >> $b) & 1;
                $w   = $bit ? '2' : '1';
                $h   = ($b % 3 === 0) ? '38' : '30';
                $bars .= "<span style=\"display:inline-block;width:{$w}px;height:{$h}px;background:#000;margin:0 0.2px;vertical-align:bottom;\"></span>";
            }
            $bars .= "<span style=\"display:inline-block;width:3px;\"></span>";
        }
        $barcodeHtml = "<div style=\"line-height:0;\">{$bars}</div>";
    }

    return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
        font-family: Arial, Helvetica, sans-serif;
        background: #ffffff;
        padding-top: 10mm;
    }

    .card {
        width: 54mm;
        height: 86mm;
        margin: 0 auto;
        border: 1px solid #cfcfcf;
        border-radius: 5mm;
        background: #fff;
        overflow: hidden;
        position: relative;
    }

    .top {
        padding: 3px 4px 0 4px;
    }

    .top-table {
        width: 100%;
    }

    .top-table td {
        vertical-align: middle;
    }

    .logo-cell {
        width: 36px;
    }

    .title-big {
        font-size: 13pt;
        font-weight: 900;
        color: #1a1a55;
        line-height: 1.0;
        letter-spacing: 0.3px;
    }

    .title-sub {
        font-size: 4.8pt;
        font-weight: 700;
        color: #333;
        line-height: 1.2;
        text-transform: uppercase;
        margin-top: 1px;
    }

    .auto-strip {
        margin-top: 2px;
        background: #ea9f7f;
        color: #fff;
        text-align: center;
        font-size: 5.8pt;
        font-weight: bold;
        padding: 2px 0;
    }

    .photo-wrap {
        text-align: center;
        padding-top: 6px;
        padding-bottom: 4px;
    }

    .photo-box {
        width: 31mm;
        height: 31mm;
        border-radius: 50%;
        border: 2px solid #2c74b8;
        overflow: hidden;
        background: #dcecff;
        display: inline-block;
        text-align: center;
    }

    .name-row {
        width: 100%;
        padding: 0 4px 2px 4px;
    }

    .name-table {
        width: 100%;
    }

    .name-table td {
        font-size: 7pt;
        color: #111;
        vertical-align: top;
    }

    .name-label {
        width: 17mm;
        font-weight: normal;
    }

    .name-colon {
        width: 3mm;
        text-align: center;
    }

    .name-value {
        font-weight: normal;
    }

    .details {
        padding: 2px 4px 0 4px;
    }

    .details-table {
        width: 100%;
    }

    .details-table td {
        font-size: 6.4pt;
        color: #111;
        vertical-align: top;
        padding-bottom: 1.2px;
    }

    .lbl {
        width: 17mm;
        font-weight: bold;
        white-space: nowrap;
    }

    .colon {
        width: 3mm;
        text-align: center;
        font-weight: bold;
    }

    .val {
        word-break: break-word;
        font-weight: normal;
    }

    .address-cell {
        line-height: 1.05;
    }

    .bottom-zone {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 6mm;
        padding: 0 4px;
    }

    .bottom-table {
        width: 100%;
    }

    .bottom-table td {
        vertical-align: bottom;
    }

    .barcode-cell {
        width: 67%;
        text-align: left;
    }

    .barcode-text {
        font-family: monospace;
        font-size: 5.5pt;
        letter-spacing: 1px;
        margin-top: 1px;
        text-align: center;
    }

    .sign-cell {
        width: 33%;
        text-align: center;
        padding-left: 2px;
    }

    .sign-label {
        font-size: 5.5pt;
        color: #333;
        font-weight: bold;
        margin-top: 1px;
        line-height: 1.1;
    }

    .batch-strip {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 54mm;
        background: #e07020;
        color: #111;
        padding: 2px 5px;
        font-size: 7pt;
        font-weight: 900;
    }

    .batch-table {
        width: 100%;
    }

    .batch-left {
        text-align: left;
    }

    .batch-right {
        text-align: right;
    }
</style>
</head>
<body>

<div class="card">

    <div class="top">
        <table class="top-table" cellspacing="0" cellpadding="0">
            <tr>
                <td class="logo-cell">{$logoHtml}</td>
                <td>
                    <div class="title-big">JD COLLEGE</div>
                    <div class="title-sub">OF ENGINEERING &amp; MANAGEMENT, NAGPUR</div>
                </td>
            </tr>
        </table>
        <div class="auto-strip">An Autonomous Institute</div>
    </div>

    <div class="photo-wrap">
        <div class="photo-box">{$photoInner}</div>
    </div>

    <div class="name-row">
        <table class="name-table" cellspacing="0" cellpadding="0">
            <tr>
                <td class="name-label">Name</td>
                <td class="name-colon">:</td>
                <td class="name-value">{$name}</td>
            </tr>
        </table>
    </div>

    <div class="details">
        <table class="details-table" cellspacing="0" cellpadding="0">
            <tr>
                <td class="lbl">Student ID</td>
                <td class="colon">:</td>
                <td class="val">{$btid}</td>
            </tr>
            <tr>
                <td class="lbl">DOB</td>
                <td class="colon">:</td>
                <td class="val">{$dob}</td>
            </tr>
            <tr>
                <td class="lbl">Dept.</td>
                <td class="colon">:</td>
                <td class="val">{$branch}</td>
            </tr>
            <tr>
                <td class="lbl">Address</td>
                <td class="colon">:</td>
                <td class="val address-cell">{$address}</td>
            </tr>
            <tr>
                <td class="lbl">Phone No.</td>
                <td class="colon">:</td>
                <td class="val">{$mobile}</td>
            </tr>
            <tr>
                <td class="lbl">Parent No.</td>
                <td class="colon">:</td>
                <td class="val">{$parent}</td>
            </tr>
        </table>
    </div>

    <div class="bottom-zone">
        <table class="bottom-table" cellspacing="0" cellpadding="0">
            <tr>
                <td class="barcode-cell">
                    {$barcodeHtml}
                    <div class="barcode-text">{$btid}</div>
                </td>
                <td class="sign-cell">
                    {$qrHtml}
                    {$prinHtml}
                    <div class="sign-label">Principal Sign</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="batch-strip">
        <table class="batch-table" cellspacing="0" cellpadding="0">
            <tr>
                <td class="batch-left">Batch</td>
                <td class="batch-right">: {$batchYear}</td>
            </tr>
        </table>
    </div>

</div>

</body>
</html>
HTML;
}