<?php

require_once "database.class.php";
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

class UserController {
    private $database;

    public function __construct() {
        $this->database = new Database();
    }

    public function handleRequest() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $fullname = $_POST['fullname'] ?? '';
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';

            try {
                if (empty($fullname) || empty($email) || empty($password)) {
                    throw new Exception('Eksik parametreler.');
                }

                $user = $this->emailCheck($email);

                if (!$user) {
                    $user = $this->createUser($fullname, $email, $password);
                    $response = array('success' => true, 'data' => $user);
                } else {
                    $response = array('success' => false, 'error' => 'E-posta zaten kullanılıyor.');
                }
            } catch (Exception $e) {
                $response = array('success' => false, 'error' => $e->getMessage());
            }

            echo json_encode($response);
        }
    }

    private function getUser(int $id) {
        $user = $this->database->getRow("SELECT * FROM user WHERE id = ?", [$id]);
        
        if (!$user) {
            throw new Exception('Kullanıcı bulunamadı.');
        }

        return $user;
    }

    private function createUser(string $fullname, string $email, string $password) {
        $insertId = $this->database->Insert("INSERT INTO user (fullname, email, password, createdAt) VALUES (?, ?, ?, ?)", [
            $fullname, $email, $password, date("Y-m-d H:i:s")
        ]);

        if (!$insertId) {
            throw new Exception('Kullanıcı oluşturulamadı.');
        }

        return $this->getUser($insertId);
    }

    private function emailCheck(string $email) {
        $user = $this->database->getRow("SELECT * FROM user WHERE email = ?", [$email]);

        return $user;
    }
}

$userController = new UserController();
$userController->handleRequest();

?>
