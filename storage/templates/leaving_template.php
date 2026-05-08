<?php

function generateLeavingHTML($data)
{
    $name    = htmlspecialchars($data['student_name'] ?? 'Student Name');
    $branch  = htmlspecialchars($data['branch']  ?? $data['department'] ?? '');
    $acadYear = htmlspecialchars($data['ac_year'] ?? '2025-26');
    $certNum  = htmlspecialchars($data['certificate_number'] ?? 'CERT-XXXX');
    $date     = date("d/m/Y");

    $dir     = __DIR__;
    $logoL   = $dir . '/images/logo_left.png';
    $logoR   = $dir . '/images/logo_right.png';
    $sigPrin = $dir . '/../signatures/principal_signature.png';

    $b64 = function ($path) {
        if (!file_exists($path)) return '';
        $mime = mime_content_type($path) ?: 'image/png';
        return 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($path));
    };

    $logoLB64 = $b64($logoL);
    $logoRB64 = $b64($logoR);
    $prinB64  = $b64($sigPrin);

    $qrB64 = '';
    if (!empty($data['qr_path']) && file_exists($data['qr_path'])) {
        $qrB64 = $b64($data['qr_path']);
    }
    $qrHtml = $qrB64
        ? "<img src='{$qrB64}' style='width:65px;height:65px;margin-bottom:6px;display:block;margin-left:auto;'>"
        : "";

    return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: 'Times New Roman'; padding: 20mm; }
.cert-title { text-align:center; font-size:18pt; font-weight:bold; text-decoration:underline; margin:20px 0; }
.content { font-size:12pt; line-height:1.8; text-align:justify; }
.b { font-weight:bold; }
</style>
</head>
<body>
<table width="100%">
<tr>
<td><img src="{$logoLB64}" width="90"></td>
<td align="center">
<b>J D College of Engineering and Management</b><br>
Katol Road, Nagpur
</td>
<td align="right"><img src="{$logoRB64}" width="90"></td>
</tr>
</table>
<hr>
<div class="cert-title">Transfer Certificate (Leaving)</div>
<div class="content">
<p>This is to certify that <span class="b">{$name}</span> was a student of this college in the department of <span class="b">{$branch}</span>.</p>
<p>The student has successfully completed the coursework for the academic year {$acadYear}.</p>
<p>To the best of our knowledge, the conduct of the student during the stay at the institution was good.</p>
</div>
<br><br>
<table width="100%">
<tr>
<td>Date: {$date}</td>
<td align="right">
{$qrHtml}
<img src="{$prinB64}" height="55"><br>
<b>Principal</b>
</td>
</tr>
</table>
</body>
</html>
HTML;
}
