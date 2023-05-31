<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: *");

class APIAuthenticator
{
    private $validToken;

    public function __construct($validToken)
    {
        $this->validToken = $validToken;
    }

    public function authenticate()
    {
        $authorizationHeader = $this->getAuthorizationHeader();
        $this->validateToken($authorizationHeader);
    }

    private function getAuthorizationHeader()
    {

        if (!isset($_SERVER['HTTP_APIKEY'])) {
            throw new Exception('API anahtarı eksik.');
        }
    
        return $_SERVER['HTTP_APIKEY'];
    }

    private function validateToken($token)
    {
        if ($token !== $this->validToken) {
            throw new Exception('Doğrulama başarısız.');
        }
    }
}
?>