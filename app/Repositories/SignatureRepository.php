<?php

require_once __DIR__ . "/../models/Signature.php";

class SignatureRepository
{
    private $model;

    public function __construct()
    {
        $this->model = new Signature();
    }


    public function save($staff_id, $file)
    {
        return $this->model->save(
            $staff_id,
            $file
        );
    }

}