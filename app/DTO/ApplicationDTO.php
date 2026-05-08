<?php

class ApplicationDTO
{
    public $id;
    public $student_id;
    public $document_id;
    public $purpose;

    public $status;

    public $clerk_id;
    public $hod_id;
    public $principal_id;

    public $certificate_file;

    public $created_at;

    public function __construct($data = [])
    {
        $this->id = $data['id'] ?? null;

        $this->student_id = $data['student_id'] ?? null;
        $this->document_id = $data['document_id'] ?? null;
        $this->purpose = $data['purpose'] ?? null;

        $this->status = $data['status'] ?? null;

        $this->clerk_id = $data['clerk_id'] ?? null;
        $this->hod_id = $data['hod_id'] ?? null;
        $this->principal_id = $data['principal_id'] ?? null;

        $this->certificate_file = $data['certificate_file'] ?? null;

        $this->created_at = $data['created_at'] ?? null;
    }

    public function toArray()
    {
        return [
            "id" => $this->id,
            "student_id" => $this->student_id,
            "document_id" => $this->document_id,
            "purpose" => $this->purpose,
            "status" => $this->status,
            "clerk_id" => $this->clerk_id,
            "hod_id" => $this->hod_id,
            "principal_id" => $this->principal_id,
            "certificate_file" => $this->certificate_file,
            "created_at" => $this->created_at
        ];
    }
}