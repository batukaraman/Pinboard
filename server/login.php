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
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';

            try {
                if ( empty($email) || empty($password)) {
                    throw new Exception('Eksik parametreler.');
                }

                $user = $this->authCheck($email, $password);

                if ($user) {
                    unset($user->password);
                    $response = array('success' => true, 'massage' => 'Doğrulama başarılı.', 'data' => $user);
                } else {
                    $response = array('success' => false, 'massage' => 'Doğrulama başarısız.');
                }
            } catch (Exception $e) {
                $response = array('success' => false, 'massage' => $e->getMessage());
            }

            echo json_encode($response);
        }
    }

    private function authCheck(string $email, string $password) {
        $user = $this->database->getRow("SELECT * FROM user WHERE email = ? AND password = ?", [$email, $password]);

        if ($user) {
            return $user;
        } else {
            throw new Exception('Doğrulama başarısız.');
        }
    }
}

$userController = new UserController();
$userController->handleRequest();

?>