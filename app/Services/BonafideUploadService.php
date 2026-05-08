<?php

class BonafideUploaderService
{

    public function upload($file)
    {
        $dir =
            dirname(__DIR__,2)
            . "/public/storage/bonafide/";

        if (!is_dir($dir))
        {
            mkdir($dir,0777,true);
        }

        $name =
            time() . "_" . $file["name"];

        move_uploaded_file(
            $file["tmp_name"],
            $dir . $name
        );

        return $name;
    }

}