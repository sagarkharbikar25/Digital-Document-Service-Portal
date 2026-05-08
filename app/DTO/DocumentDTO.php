<?php

class DocumentDTO
{
    public $id;
    public $student_id;
    public $file_name;
    public $file_path;
    public $file_type;
    public $created_at;

    public function __construct($data = [])
    {
        $this->id = $data['id'] ?? null;

        $this->student_id = $data['student_id'] ?? null;

        $this->file_name = $data['file_name'] ?? null;
        $this->file_path = $data['file_path'] ?? null;
        $this->file_type = $data['file_type'] ?? null;

        $this->created_at = $data['created_at'] ?? null;
    }

    public function toArray()
    {
        return [
            "id" => $this->id,
            "student_id" => $this->student_id,
            "file_name" => $this->file_name,
            "file_path" => $this->file_path,
            "file_type" => $this->file_type,
            "created_at" => $this->created_at
        ];
    }
}