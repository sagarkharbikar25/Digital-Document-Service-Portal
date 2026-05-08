<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once BASE_PATH . '/vendor/autoload.php';
require_once BASE_PATH . '/app/core/Config.php';
require_once BASE_PATH . '/app/core/Logger.php';

class EmailService
{
    private static function getMailer(): ?PHPMailer
    {
        $driver = Config::get("MAIL_DRIVER", "smtp");

        if ($driver === "log") {
            return null; // Return null to indicate logging mode
        }

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = Config::get("MAIL_HOST", "smtp.gmail.com");
            $mail->SMTPAuth   = true;
            $mail->Username   = Config::get("MAIL_USERNAME");
            $mail->Password   = Config::get("MAIL_PASSWORD");
            $mail->SMTPSecure = Config::get("MAIL_ENCRYPTION") === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = Config::get("MAIL_PORT", 587);

            $mail->setFrom(
                Config::get("MAIL_FROM_ADDRESS"),
                Config::get("MAIL_FROM_NAME")
            );

            $mail->isHTML(true);
        } catch (Exception $e) {
            error_log("Mailer Config Error: " . $e->getMessage());
        }

        return $mail;
    }

    public static function sendGeneric(string $email, string $subject, string $message): bool
    {
        try {
            $mail = self::getMailer();

            if ($mail === null) {
                // Log the email instead of sending
                Logger::init();
                $logMsg = "EMAIL TO: $email | SUBJECT: $subject | BODY: $message";
                file_put_contents(BASE_PATH . "/storage/logs/mail.log", "[" . date("Y-m-d H:i:s") . "] " . $logMsg . PHP_EOL, FILE_APPEND);
                return true;
            }

            $mail->addAddress($email);
            $mail->Subject = $subject;
            $mail->Body = "
                <div style='font-family:Arial;padding:20px'>
                    <h2 style='color:#2c3e50'>JDCOEM Digital Document Portal</h2>
                    <p>$message</p>
                    <hr>
                    <small>This is an automated message from JDCOEM Portal.</small>
                </div>
            ";

            return $mail->send();
        } catch (Exception $e) {
            error_log("Mail Error: " . $e->getMessage());
            return false;
        }
    }

    public static function sendOTP(string $email, string $otp): bool
    {
        return self::sendGeneric($email, "JDCOEM OTP Verification", "Your OTP is:<br><br><h1 style='color:#007bff'>$otp</h1>Valid for 5 minutes.");
    }

    public static function sendApplicationSubmitted(string $email, string $applicationNumber, string $type): bool
    {
        return self::sendGeneric($email, "Application Submitted", "Your application <b>$applicationNumber</b> ($type) has been submitted.");
    }

    public static function sendApplicationApproved(string $email, string $applicationNumber, string $approvedBy): bool
    {
        return self::sendGeneric($email, "Application Approved", "Your application <b>$applicationNumber</b> has been approved by <b>$approvedBy</b>.");
    }

    public static function sendCertificateReady(string $email, string $certificateNumber): bool
    {
        return self::sendGeneric($email, "Certificate Ready", "Your certificate <b>$certificateNumber</b> is ready for download.");
    }

    public static function sendPasswordReset(string $email, string $otp): bool
    {
        return self::sendGeneric($email, "Password Reset", "Your reset OTP is: <h1>$otp</h1>");
    }

    public static function sendApplicationRejected(string $email, string $applicationNumber, string $reason): bool
    {
        return self::sendGeneric($email, "Application Rejected", "Your application <b>$applicationNumber</b> was rejected. Reason: <b>$reason</b>");
    }
}