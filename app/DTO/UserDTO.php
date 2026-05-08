<?php

class UserDTO
{
    public $id;
    public $name;
    public $email;
    public $password;
    public $role;
    public $created_at;

    public function __construct($data = [])
    {
        $this->id = $data['id'] ?? null;
        $this->name = $data['name'] ?? null;
        $this->email = $data['email'] ?? null;
        $this->password = $data['password'] ?? null;
        $this->role = $data['role'] ?? null;
        $this->created_at = $data['created_at'] ?? null;
    }

    public function toArray()
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "email" => $this->email,
            "password" => $this->password,
            "role" => $this->role,
            "created_at" => $this->created_at
        ];
    }
}