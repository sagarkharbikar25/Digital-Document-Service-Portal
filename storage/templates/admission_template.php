<?php

function generateAdmissionHTML($data)
{
    $name    = htmlspecialchars($data['student_name'] ?? 'Student Name');
    $branch  = htmlspecialchars($data['branch']  ?? $data['department'] ?? '');
    $year    = htmlspecialchars($data['year'] ?? '');
    $purpose = htmlspecialchars($data['purpose'] ?? '');

    if (empty($branch)) $branch = 'N/A';

    $yearMap = [
        'First Year'  => '1st', 'Second Year' => '2nd',
        'Third Year'  => '3rd', 'Fourth Year' => '4th',
        '1' => '1st', '2' => '2nd', '3' => '3rd', '4' => '4th',
    ];
    $yearFormatted = $yearMap[$year] ?? $year;

    $acadYear = htmlspecialchars($data['ac_year'] ?? '2025-26');
    $certNum  = htmlspecialchars($data['certificate_number'] ?? 'CERT-XXXX');
    $date     = date("d/m/Y");

    $dir     = __DIR__;
    $logoL   = $dir . '/images/logo_left.png';
    $logoR   = $dir . '/images/logo_right.png';
    $sigPrin = $dir . '/../signatures/principal_signature.png';
    $sigHod  = $dir . '/../signatures/hod_signature.png';

    $b64 = function ($path) {
        if (!file_exists($path)) return '';
        $mime = mime_content_type($path) ?: 'image/png';
        return 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($path));
    };

    $logoLB64 = $b64($logoL);
    $logoRB64 = $b64($logoR);
    $prinB64  = $b64($sigPrin);
    $hodB64   = $b64($sigHod);

    $logoLHtml = $logoLB64 ? "<img src='{$logoLB64}' width='90'>" : "";
    $logoRHtml = $logoRB64 ? "<img src='{$logoRB64}' width='90'>" : "";
    $hodHtml   = $hodB64 ? "<img src='{$hodB64}' height='55'>" : "";
    $prinHtml  = $prinB64 ? "<img src='{$prinB64}' height='55'>" : "";

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
.bu { font-weight:bold; text-decoration:underline; }
</style>
</head>
<body>

<table width="100%">
<tr>
<td>{$logoLHtml}</td>
<td align="center">
<b>J D College of Engineering and Management</b><br>
Katol Road, Nagpur
</td>
<td align="right">{$logoRHtml}</td>
</tr>
</table>

<hr>

<table width="100%">
<tr>
<td>Certificate No: <b>{$certNum}</b></td>
<td align="right">Date: <b>{$date}</b></td>
</tr>
</table>

<div class="cert-title">Admission Certificate</div>

<div class="content">
<p>
This is to certify that <span class="bu">{$name}</span> has been granted admission in
<span class="b">B. Tech ({$branch}) {$yearFormatted} Year</span>
for the academic session <span class="b">{$acadYear}</span>.
</p>

<p>
The student is a bonafide student of this institution and is enrolled as per the rules and regulations of the college.
</p>

<p>
This certificate is issued for the purpose of <span class="bu">{$purpose}</span>.
</p>
</div>

<br><br><br>

<table width="100%">
<tr>
<td>{$hodHtml}<br><b>HOD</b></td>
<td align="right">{$qrHtml}{$prinHtml}<br><b>Principal</b></td>
</tr>
</table>

</body>
</html>
HTML;
}