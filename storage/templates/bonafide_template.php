<?php

function generateBonafideHTML($data)
{
    $name    = htmlspecialchars($data['student_name'] ?? 'Student Name');
    $branch  = htmlspecialchars($data['branch']  ?? $data['department'] ?? '');
    $year    = htmlspecialchars($data['year']         ?? '');
    $dob     = htmlspecialchars($data['dob']          ?? '');
    $purpose = htmlspecialchars($data['purpose']      ?? '');

    /* ── Gender-based pronouns ── */
    $gender  = strtolower(trim($data['gender'] ?? ''));
    if ($gender === 'male' || $gender === 'm') {
        $heShe  = 'He';      $hisHer = 'his';      $himHer = 'him';
    } elseif ($gender === 'female' || $gender === 'f') {
        $heShe  = 'She';     $hisHer = 'her';      $himHer = 'her';
    } else {
        $heShe  = 'He / She'; $hisHer = 'his / her'; $himHer = 'him / her';
    }

    if (empty($branch)) $branch = 'N/A';

    /* Format DOB: 2003-05-12 → 12-05-2003 */
    if ($dob && preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob)) {
        [$y, $m, $d] = explode('-', $dob);
        $dob = $d . '-' . $m . '-' . $y;
    }

    /* Year ordinal */
    $yearMap = [
        'First Year'  => '1st', 'Second Year' => '2nd',
        'Third Year'  => '3rd', 'Fourth Year' => '4th',
        '1st' => '1st', '2nd' => '2nd', '3rd' => '3rd', '4th' => '4th',
        '1'   => '1st', '2'   => '2nd', '3'   => '3rd', '4'   => '4th',
    ];
    $yearFormatted = $yearMap[$year] ?? $year;

    $acadYear = htmlspecialchars($data['ac_year'] ?? $data['acYear'] ?? '2025-26');
    $certNum  = htmlspecialchars($data['certificate_number'] ?? 'CERT-XXXX');
    $date     = date("d/m/Y");

    /* Asset paths */
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

    /* HOD signature — smart rotation (portrait → landscape) */
    $hodB64 = '';
    if (file_exists($sigHod) && function_exists('imagecreatefromstring')) {
        $src = @imagecreatefromstring(file_get_contents($sigHod));
        if ($src !== false) {
            $w = imagesx($src); $h = imagesy($src);
            if ($h > $w) { $rot = imagerotate($src, 270, 0); imagedestroy($src); }
            else { $rot = $src; }
            if ($rot !== false) {
                ob_start(); imagepng($rot);
                $hodB64 = 'data:image/png;base64,' . base64_encode(ob_get_clean());
                imagedestroy($rot);
            }
        }
    }
    if (!$hodB64) $hodB64 = $b64($sigHod);

    $logoLB64 = $b64($logoL);
    $logoRB64 = $b64($logoR);
    $prinB64  = $b64($sigPrin);

    /* Logo HTML */
    $logoLHtml = $logoLB64
        ? "<img src='{$logoLB64}' width='90' height='90' style='object-fit:contain;display:block;'>"
        : "<div style='width:90px;height:90px;'></div>";

    $logoRHtml = $logoRB64
        ? "<img src='{$logoRB64}' width='90' height='90' style='object-fit:contain;display:block;margin-left:auto;'>"
        : "<div style='width:90px;height:90px;'></div>";

    $hodHtml = $hodB64
        ? "<img src='{$hodB64}' style='height:55px;max-width:130px;width:auto;object-fit:contain;display:block;'>"
        : "<div style='height:55px;'></div>";

    $prinHtml = $prinB64
        ? "<img src='{$prinB64}' style='height:55px;max-width:130px;width:auto;object-fit:contain;display:block;margin-left:auto;'>"
        : "<div style='height:55px;'></div>";

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

/* ── Page setup ── */
@page {
    size: A4 portrait;
    margin: 0;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    color: #000;
    background: #fff;
    /* Replicate @page margins so HTML preview & PDF both look right */
    padding: 15mm 20mm 15mm 20mm;
}

.wrap {
    width: 170mm;
    margin: 0 auto;
}

/* ══════════════════════════════════════════════
   HEADER
══════════════════════════════════════════════ */
table.hdr {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
}
table.hdr td { vertical-align: middle; padding: 0; }

.td-logo-l {
    width: 25mm;
    text-align: left;
    vertical-align: middle;
}
.td-logo-r {
    width: 25mm;
    text-align: right;
    vertical-align: middle;
}
.td-center {
    text-align: center;
    padding: 0 4mm;
}

.society-name {
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.4pt;
    line-height: 1.5;
    margin-bottom: 2px;
}

.college-name {
    font-size: 17pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
    line-height: 1.35;
    margin-bottom: 4px;
}

.college-addr {
    font-size: 10.5pt;
    font-weight: bold;
    margin-top: 5px;
    margin-bottom: 2px;
}

.college-info {
    font-size: 9.5pt;
    margin-top: 2px;
    line-height: 1.65;
}

.college-dept {
    font-size: 11.5pt;
    font-weight: bold;
    margin-top: 6px;
    margin-bottom: 2px;
}

.college-italic {
    font-size: 9.5pt;
    font-style: italic;
    margin-top: 4px;
    margin-bottom: 2px;
}

.college-sem {
    font-size: 10.5pt;
    font-weight: bold;
    margin-top: 3px;
}

/* ── Divider: double-rule effect matching the reference ── */
.divider-wrap {
    margin: 10px 0 30px 0;
}
hr.divider-top {
    border: none;
    border-top: 3px solid #000;
    margin: 0 0 2px 0;
}
hr.divider-bot {
    border: none;
    border-top: 1px solid #000;
    margin: 0;
}

/* ══════════════════════════════════════════════
   CERT META ROW
══════════════════════════════════════════════ */
table.meta {
    width: 100%;
    border-collapse: collapse;
    font-size: 11pt;
    margin-bottom: 4px;
}
table.meta td { vertical-align: middle; padding: 0; }
.td-cert { width: 60%; text-align: left; }
.td-date { width: 40%; text-align: right; white-space: nowrap; }

/* ── Title ── */
.cert-title {
    text-align: center;
    font-size: 17pt;
    font-weight: bold;
    text-decoration: underline;
    margin: 22px 0 28px 0;
}

/* ── Body ── */
.content {
    font-size: 12pt;
    line-height: 2;
    text-align: justify;
    word-wrap: break-word;
}
.content p { margin: 0 0 8px 0; }
.indent { display: inline-block; width: 70px; }
.bu { font-weight: bold; text-decoration: underline; white-space: nowrap; }
.b  { font-weight: bold; }

/* ── Signatures ── */
table.sigs {
    width: 100%;
    border-collapse: collapse;
    margin-top: 55px;
}
table.sigs td { vertical-align: bottom; padding: 0; }
.td-sig-l { width: 50%; text-align: left;  padding-right: 5mm; }
.td-sig-r { width: 50%; text-align: right; padding-left:  5mm; }
.sig-name { font-weight: bold; font-size: 12pt; margin-top: 5px; }
.sig-dept { font-size: 10pt; margin-top: 3px; line-height: 1.4; }

/* ── Footer ── */
.footer {
    margin-top: 40px;
    border-top: 1px solid #bbb;
    padding-top: 5px;
    font-size: 8pt;
    color: #555;
    text-align: center;
}

</style>
</head>
<body>

<div class="wrap">

<!-- HEADER -->
<table class="hdr">
  <tr>
    <td class="td-logo-l">{$logoLHtml}</td>
    <td class="td-center">
      <div class="society-name">Jaidev Education Society's</div>
      <div class="college-name">J D College of Engineering and Management</div>
      <div class="college-addr">Katol Road, Nagpur</div>
      <div class="college-info">Affiliated to <b>DBATU, RTMNU &amp; MSBTE Mumbai.</b></div>
      <div class="college-info">Website: www.jdcoem.ac.in &nbsp;&nbsp;&nbsp; E-mail: info@jdcoem.ac.in</div>
      <div class="college-info">An Autonomous Institute, with NAAC "A" Grade</div>
      <div class="college-dept">Department of {$branch}</div>
      <div class="college-italic">"A Place to Learn; A Chance to Grow"</div>
      <div class="college-sem">{$acadYear} (ODD Sem)</div>
    </td>
    <td class="td-logo-r">{$logoRHtml}</td>
  </tr>
</table>

<!-- DOUBLE DIVIDER matching reference -->
<div class="divider-wrap">
  <hr class="divider-top">
  <hr class="divider-bot">
</div>

<!-- CERT NO + DATE -->
<table class="meta">
  <tr>
    <td class="td-cert">Certificate No: <strong>{$certNum}</strong></td>
    <td class="td-date">Date: <strong>{$date}</strong></td>
  </tr>
</table>

<!-- TITLE -->
<div class="cert-title">Bonafide Certificate</div>

<!-- BODY -->
<div class="content">
  <p>
    <span class="indent"></span>This is to certify that,
    <span class="bu">{$name}</span>
    is a bonafide student of JD College of Engineering and Management.
  </p>
  <p>
    {$heShe} is studying in
    <span class="b">B. Tech ({$branch}) {$yearFormatted} Year</span>
    during the academic session <span class="b">{$acadYear}.</span>
  </p>
  <p>
    <span class="indent"></span>On the basis of mandatory documents submitted
    by the student to the college, {$hisHer} date of birth is
    <span class="bu">{$dob}</span>.
  </p>
  <p>
    Based on {$hisHer} request, this certificate is being issued to {$himHer}
    for <span class="bu">{$purpose}</span>.
  </p>
</div>

<!-- SIGNATURES -->
<table class="sigs">
  <tr>
    <td class="td-sig-l">
      {$hodHtml}
      <div class="sig-name">HOD</div>
      <div class="sig-dept">Dept. of {$branch}</div>
    </td>
    <td class="td-sig-r">
      {$qrHtml}
      {$prinHtml}
      <div class="sig-name">Principal</div>
      <div class="sig-dept">JD College of Engg. &amp; Management, Nagpur</div>
    </td>
  </tr>
</table>

<!-- FOOTER -->
<div class="footer">
  This is a digitally generated certificate. &nbsp;|&nbsp; Verification ID: {$certNum}
</div>

</div><!-- end .wrap -->

</body>
</html>
HTML;
}