<?php

require_once __DIR__ . "/../core/Model.php";

class Staff extends Model
{

    public function create($user_id, $role)
    {
        $stmt = $this->db->prepare("
            INSERT INTO staff (user_id, role)
            VALUES (:user_id, :role)
        ");

        return $stmt->execute([
            ":user_id" => $user_id,
            ":role" => $role
        ]);
    }

}