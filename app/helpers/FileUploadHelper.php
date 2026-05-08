<?php

class FileUploadHelper
{
    private static $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    private static $allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    private static $maxSize = 5242880; // 5MB

    public static function validate($file)
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return "Upload error code: " . $file['error'];
        }

        if ($file['size'] > self::$maxSize) {
            return "File is too large. Max 5MB allowed.";
        }

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, self::$allowedExtensions)) {
            return "Extension .$extension is not allowed. Use PDF, JPG, or PNG.";
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, self::$allowedMimeTypes)) {
            return "Invalid file type: $mimeType. Use PDF, JPG, or PNG.";
        }

        return true;
    }
}
