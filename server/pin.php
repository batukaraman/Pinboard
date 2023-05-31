<?php
require_once 'database.class.php';
// require_once 'auth.php';

class PinController {
    private $database;
    private $authenticator;

    public function __construct() {
        $this->database = new Database();
        $this->setCorsHeaders();
        header('Content-Type: application/json');
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            // Preflight talebine yanıt ver
            $this->setCorsHeaders();
            http_response_code(200);
            exit();
        }
        // $envVariables = parse_ini_file('.env');
        // $validToken = $envVariables['API_KEY'];
        // $this->authenticator = new APIAuthenticator($validToken);
    }

    public function handleRequest() {
        try {
            // $this->authenticator->authenticate();

            switch ($_SERVER['REQUEST_METHOD']) {
                case 'GET':
                    if (isset($_GET['pinId'])) {
                        $pinId = $_GET['pinId'];
                        $this->getPin($pinId);
                    } else {
                        $this->getAllPins();
                    }
                    break;
                case 'POST':
                    $this->createPin();
                    break;
                case 'PUT':
                    $this->updatePin();
                    break;
                case 'DELETE':
                    header('Content-Type: application/json');
                    $this->deletePin();
                    break;
                default:
                    $this->sendErrorResponse('Geçersiz istek', 400);
            }
        } catch (Exception $e) {
            $this->sendErrorResponse($e->getMessage(), 401);
        }
    }

    function setCorsHeaders() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
        header("Access-Control-Allow-Headers: *");
    }
    private function sendErrorResponse($message, $statusCode) {
        $response = ['success' => false, 'error' => $message];
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }

    private function getPin($pinId) {
        try {
            $query = 'SELECT pin.id, pin.publish, pin.content, pin.url, pin.positionX, pin.positionY, pin.userId, type.name AS typeName, type.color AS typeColor
                      FROM pin
                      INNER JOIN type ON pin.typeId = type.id
                      WHERE pin.id = ?';
            $params = [$pinId];
            $pin = $this->database->getRow($query, $params);

            if (!$pin) {
                throw new Exception('Pin bulunamadı');
            }

            $response = ['success' => true, 'data' => $pin];
            http_response_code(200);
        } catch (Exception $e) {
            $response = ['success' => false, 'error' => $e->getMessage()];
            http_response_code(404);
        }

        header('Content-Type: application/json');
        echo json_encode($response);
    }

    private function getAllPins() {
        try {
            $query = 'SELECT pin.id, pin.publish, pin.content, pin.url, pin.positionX, pin.positionY, pin.userId, type.name AS typeName, type.color AS typeColor
                      FROM pin
                      INNER JOIN type ON pin.typeId = type.id';
            $pins = $this->database->getRows($query);
            $response = ['success' => true, 'data' => $pins];
            http_response_code(200);
        } catch (Exception $e) {
            $response = ['success' => false, 'error' => $e->getMessage()];
            http_response_code(500);
        }

        header('Content-Type: application/json');
        echo json_encode($response);
    }

    private function createPin() {
        try {
            $postData = json_decode(file_get_contents('php://input'), true);

            $requiredFields = ['typeId', 'content', 'url', 'positionX', 'positionY', 'userId'];

            foreach ($requiredFields as $field) {
                if (!isset($postData[$field])) {
                    throw new Exception('Eksik parametreler');
                }
            }

            $publish = isset($postData['publish']) ? filter_var($postData['publish'], FILTER_VALIDATE_BOOLEAN) : false;
            $typeId = $postData['typeId'];
            $content = $postData['content'];
            $url = $postData['url'];
            $positionX = $postData['positionX'];
            $positionY = $postData['positionY'];
            $userId = $postData['userId'];

            $query = 'INSERT INTO pin (publish, typeId, content, url, positionX, positionY, userId) VALUES (?, ?, ?, ?, ?, ?, ?)';
            $params = [$publish, $typeId, $content, $url, $positionX, $positionY, $userId];
            $pinId = $this->database->Insert($query, $params);

            $response = ['success' => true, 'id' => $pinId];
            http_response_code(201);
        } catch (Exception $e) {
            $response = ['success' => false, 'error' => $e->getMessage()];
            http_response_code(400);
        }

        header('Content-Type: application/json');
        echo json_encode($response);
    }

    private function updatePin() {
        try {
            $putData = json_decode(file_get_contents('php://input'), true);

            $pinId = isset($_GET['pinId']) ? $_GET['pinId'] : null;
            if (empty($pinId)) {
                throw new Exception('Pin ID eksik');
            }

            $requiredFields = ['content', 'url', 'positionX', 'positionY', 'userId', 'typeId'];
            foreach ($requiredFields as $field) {
                if (!isset($putData[$field]) || empty($putData[$field])) {
                    throw new Exception('Eksik parametreler');
                }
            }

            $publish = isset($putData['publish']) ? filter_var($putData['publish'], FILTER_VALIDATE_BOOLEAN) : false;
            $typeId = $putData['typeId'];
            $content = $putData['content'];
            $url = $putData['url'];
            $positionX = $putData['positionX'];
            $positionY = $putData['positionY'];
            $userId = $putData['userId'];

            $query = 'UPDATE pin SET publish = ?, typeId = ?, content = ?, url = ?, positionX = ?, positionY = ?, userId = ? WHERE id = ?';
            $params = [$publish, $typeId, $content, $url, $positionX, $positionY, $userId, $pinId];
            $this->database->Update($query, $params);

            $response = ['success' => true];
            http_response_code(200);
        } catch (Exception $e) {
            $response = ['success' => false, 'error' => $e->getMessage()];
            http_response_code(400);
        }

        header('Content-Type: application/json');
        echo json_encode($response);
    }

    private function deletePin() {
        try {
            $pinId = isset($_GET['pinId']) ? $_GET['pinId'] : null;
            if (empty($pinId)) {
                throw new Exception('Pin ID eksik');
            }

            $query = 'DELETE FROM pin WHERE id = ?';
            $params = [$pinId];
            $this->database->Delete($query, $params);

            $response = ['success' => true];
            http_response_code(200);
        } catch (Exception $e) {
            $response = ['success' => false, 'error' => $e->getMessage()];
            http_response_code(400);
        }

        header('Content-Type: application/json');
        echo json_encode($response);
    }
}

$pinController = new PinController();
$pinController->handleRequest();

?>