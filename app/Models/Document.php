<?php

require_once __DIR__ . "/../core/Model.php";

class Document extends Model
{

    public function upload($student_id, $file_name, $file_path)
    {
        $stmt = $this->db->prepare("
            INSERT INTO documents
            (student_id, file_name, file_path, created_at)
            VALUES
            (:student_id, :file_name, :file_path, NOW())
        ");

        return $stmt->execute([
            ":student_id" => $student_id,
            ":file_name" => $file_name,
            ":file_path" => $file_path
        ]);
    }


    public function getByUserId($student_id)
    {
        $stmt = $this->db->prepare("
            SELECT *
            FROM documents
            WHERE student_id = :student_id
        ");

        $stmt->execute([
            ":student_id" => $student_id
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

}