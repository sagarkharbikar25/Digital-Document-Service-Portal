<?php

require_once __DIR__ . "/../core/Model.php";

class Signature extends Model
{

    public function save($staff_id, $file)
    {
        $stmt = $this->db->prepare("
            INSERT INTO signatures
            (staff_id, file_path)
            VALUES
            (:staff_id, :file)
        ");

        return $stmt->execute([
            ":staff_id" => $staff_id,
            ":file" => $file
        ]);
    }

}