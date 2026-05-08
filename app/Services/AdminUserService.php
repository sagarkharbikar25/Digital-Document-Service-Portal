<?php
require_once __DIR__ . '/../Repositories/StaffRepository.php';
class AdminUserService
{
    private $staffRepository;

    public function __construct()
    {
        $this->staffRepository = new StaffRepository();
    }

    public function getAllUsers()
    {
        return $this->staffRepository->getAll();
    }

    public function createUser($data)
    {
        return $this->staffRepository->create($data);
    }

    public function deleteUser($id)
    {
        return $this->staffRepository->delete($id);
    }
}