<?php

require_once __DIR__ . "/../core/Model.php";

class User extends Model
{

    public function create($name, $email, $password, $role)
    {
    try
    {
        $stmt = $this->db->prepare("
            INSERT INTO users
            (name, email, password, role)
            VALUES
            (:name, :email, :password, :role)
        ");

        $stmt->execute([
            ":name" => $name,
            ":email" => $email,
            ":password" => $password,
            ":role" => $role
        ]);

        return true;
    }
    catch (PDOException $e)
    {
        if ($e->getCode() == 23505)
        {
            echo json_encode([
                "status" => "error",
                "message" => "Email already exists"
            ]);
            exit;
        }

        throw $e;
    }
    }

    public function findByEmail($email)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM users WHERE email = :email
        ");

        $stmt->execute([
            ":email" => $email
        ]);

        return $stmt->fetch();
    }


    public function findById($id)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM users WHERE id = :id
        ");

        $stmt->execute([
            ":id" => $id
        ]);

        return $stmt->fetch();
    }

}