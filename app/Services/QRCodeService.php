<?php

require_once __DIR__ . "/../../vendor/autoload.php";

use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

class QRCodeService
{
    public function generate($certificateNumber)
    {
        try {

            // verify URL -> Navigates to dedicated Verification module
            $verifyURL =
                Config::get("APP_URL") . "/verify/index.html?cert="
                . $certificateNumber;

            // storage directory
            $directory = STORAGE_PATH . "/certificates/";

            if (!is_dir($directory)) {
                mkdir($directory, 0777, true);
            }

            // file path
            $filePath = $directory . "qr_" . $certificateNumber . ".png";

            // create QR object
            $qrCode = new QrCode($verifyURL);

            // writer
            $writer = new PngWriter();

            // generate QR
            $result = $writer->write($qrCode);

            // save file
            $result->saveToFile($filePath);

            return $filePath;

        } catch (Exception $e) {

            error_log("QR Error: " . $e->getMessage());

            return null;
        }
    }
}