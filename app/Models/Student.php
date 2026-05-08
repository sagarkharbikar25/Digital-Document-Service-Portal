<?php

require_once __DIR__ . "/../core/Model.php";

class Student extends Model
{

    public function create($user_id, $roll_no, $branch, $year, $phone)
    {
        $stmt = $this->db->prepare("
            INSERT INTO students
            (user_id, roll_no, branch, year, phone)
            VALUES
            (:user_id, :roll_no, :branch, :year, :phone)
        ");

        return $stmt->execute([
            ":user_id" => $user_id,
            ":roll_no" => $roll_no,
            ":branch" => $branch,
            ":year" => $year,
            ":phone" => $phone
        ]);
    }


    public function findByUserId($user_id)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM students WHERE user_id = :user_id
        ");

        $stmt->execute([
            ":user_id" => $user_id
        ]);

        return $stmt->fetch();
    }

}