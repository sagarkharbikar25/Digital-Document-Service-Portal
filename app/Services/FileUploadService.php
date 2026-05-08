<?php

class FileUploadService
{

    public function upload($file, $dir)
    {
        if (!is_dir($dir))
        {
            mkdir($dir,0777,true);
        }

        $fileName =
            time() . "_" . basename($file["name"]);

        $path = $dir . $fileName;

        move_uploaded_file(
            $file["tmp_name"],
            $path
        );

        return $fileName;
    }

}