<?php
class Database
{   
    private $MYSQL_HOST;
    private $MYSQL_PORT;
    private $MYSQL_USER;
    private $MYSQL_PASS;
    private $MYSQL_DB;
    private $CHARSET;
    private $COLLATION;
    private $pdo = null;
    private $stmt = null;

    private function ConnectDB()
    {
        $SQL = "mysql:host=$this->MYSQL_HOST;dbname=$this->MYSQL_DB;port=$this->MYSQL_PORT";
        try {
            $this->pdo = new \PDO($SQL, $this->MYSQL_USER, $this->MYSQL_PASS);
            $this->pdo->exec(
                "SET NAMES '" .
                    $this->CHARSET .
                    "' COLLATE '" .
                    $this->COLLATION .
                    "'"
            );
            $this->pdo->exec("SET CHARACTER SET '" . $this->CHARSET . "'");
            $this->pdo->setAttribute(
                \PDO::ATTR_ERRMODE,
                \PDO::ERRMODE_EXCEPTION
            );
            $this->pdo->setAttribute(
                \PDO::ATTR_DEFAULT_FETCH_MODE,
                \PDO::FETCH_OBJ
            );
        } catch (\PDOException $e) {
            die("PDO ile veritabanına ulaşılamadı" . $e->getMessage());
        }
    }

    public function __construct()
    {
        $this->loadEnvVariables();
        $this->ConnectDB();
    }

    private function loadEnvVariables()
    {
        $envVariables = parse_ini_file('.env');

        $this->MYSQL_HOST = $envVariables['DB_HOST'];
        $this->MYSQL_PORT = $envVariables['DB_PORT'];
        $this->MYSQL_USER = $envVariables['DB_USER'];
        $this->MYSQL_PASS = $envVariables['DB_PASSWORD'];
        $this->MYSQL_DB = $envVariables['DB_NAME'];
        $this->CHARSET = $envVariables['DB_CHARSET'];
        $this->COLLATION = $envVariables['DB_COLLATION'];
    }

    private function myQuery($query, $params = null)
    {
        if (is_null($params)) {
            $this->stmt = $this->pdo->query($query);
        } else {
            $this->stmt = $this->pdo->prepare($query);
            $this->stmt->execute($params);
        }
        return $this->stmt;
    }

    public function getRows($query, $params = null)
    {
        try {
            return $this->myQuery($query, $params)->fetchAll();
        } catch (\PDOException $e) {
            die($e->getMessage());
        }
    }

    public function getRow($query, $params = null)
    {
        try {
            return $this->myQuery($query, $params)->fetch();
        } catch (\PDOException $e) {
            die($e->getMessage());
        }
    }

    public function getColumn($query, $params = null)
    {
        try {
            return $this->myQuery($query, $params)->fetchColumn();
        } catch (\PDOException $e) {
            die($e->getMessage());
        }
    }

    public function Insert($query, $params = null)
    {
        try {
            $this->myQuery($query, $params);
            return $this->pdo->lastInsertId();
        } catch (\PDOException $e) {
            die($e->getMessage());
        }
    }

    public function Update($query, $params = null)
    {
        try {
            return $this->myQuery($query, $params)->rowCount();
        } catch (\PDOException $e) {
            die($e->getMessage());
        }
    }

    public function Delete($query, $params = null)
    {
        return $this->Update($query, $params);
    }
}
?>
