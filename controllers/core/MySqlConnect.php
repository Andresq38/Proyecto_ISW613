<?php

use Psr\Log\LoggerInterface;
class MySqlConnect {
	private $result;
	private $sql;
	private $username;
	private $password;
	private $host;
	private $dbname;
	private $link;

	private $log;
	
	public function __construct() {
		// Parametros de conexión
		$this->username = Config::get('DB_USERNAME');
		$this->password = Config::get('DB_PASSWORD');
		$this->host = Config::get('DB_HOST');
		$this->dbname = Config::get('DB_DBNAME');
		//Instancia Log
		$this->log = new Logger();
	}
	/**
	 * Establecer la conexión
	 */
	public function connect() {
		try {
			$this->link = new mysqli ( $this->host, $this->username, $this->password, $this->dbname );
			
		} catch ( Exception $e ) {
			handleException($e);
		}
	}
	/**
	 * Ejecutar una setencia SQL tipo SELECT
	 * @param $sql - string sentencia SQL
	 * @param $resultType - tipo de formato del resultado (obj,asoc,num)
	 * @return $resultType
	 */
	//
	public function executeSQL($sql,$resultType="obj") {
		$lista = NULL;
		try {
			$this->connect();	
			if ($result = $this->link->query ( $sql )) {
				for($num_fila = $result->num_rows - 1; $num_fila >= 0; $num_fila --) {
					$result->data_seek ( $num_fila );
					switch ($resultType){
						case "obj":
							$lista [] = mysqli_fetch_object ( $result );
							break;
						case "asoc":
							$lista [] = mysqli_fetch_assoc( $result );
							break;
						case "num":
							$lista [] = mysqli_fetch_row( $result );
							break;
						default:
							$lista [] = mysqli_fetch_object ( $result );
							break;
					}
					
					
				}
			} else {
				handleException($this->link->error);
				throw new \Exception('Error: Falló la ejecución de la sentencia'.$this->link->errno.' '.$this->link->error);
			}
			$this->link->close();
			return $lista;
		} catch ( Exception $e ) {
			handleException($e);
		}
	}

	/**
	 * Ejecutar SELECT usando prepared statements
	 * @param string $sql Consulta con placeholders '?'
	 * @param string $types Cadena de tipos para bind_param (ej: 'is')
	 * @param array $params Valores a enlazar
	 * @param string $resultType Formato del resultado (obj, asoc, num)
	 * @return array|null
	 */
	public function executePrepared($sql, $types = "", $params = [], $resultType = "obj") {
		$lista = NULL;
		try {
			$this->connect();
			$stmt = $this->link->prepare($sql);
			if (!$stmt) {
				throw new \Exception('Error al preparar la sentencia: ' . $this->link->error);
			}
			if (!empty($types) && !empty($params)) {
				$stmt->bind_param($types, ...$params);
			}
			$stmt->execute();
			$result = $stmt->get_result();
			if ($result) {
				while ($row = $result->fetch_assoc()) {
					switch ($resultType) {
						case "obj":
							$lista[] = (object)$row;
							break;
						case "asoc":
							$lista[] = $row;
							break;
						case "num":
							$lista[] = array_values($row);
							break;
						default:
							$lista[] = (object)$row;
					}
				}
			}
			$stmt->close();
			$this->link->close();
			return $lista;
		} catch ( Exception $e ) {
			handleException($e);
		}
	}

	/**
	 * Ejecutar INSERT/UPDATE/DELETE usando prepared statements
	 * @return int número de filas afectadas
	 */
	public function executePrepared_DML($sql, $types = "", $params = []) {
		try {
			$this->connect();
			$stmt = $this->link->prepare($sql);
			if (!$stmt) {
				throw new \Exception('Error al preparar la sentencia: ' . $this->link->error);
			}
			if (!empty($types) && !empty($params)) {
				$stmt->bind_param($types, ...$params);
			}
			$stmt->execute();
			$affected = $stmt->affected_rows;
			$stmt->close();
			$this->link->close();
			return $affected;
		} catch ( Exception $e ) {
			handleException($e);
		}
	}

	/**
	 * Ejecutar INSERT usando prepared statements y devolver el último ID insertado
	 * @return int último id insertado
	 */
	public function executePrepared_DML_last($sql, $types = "", $params = []) {
		try {
			$this->connect();
			$stmt = $this->link->prepare($sql);
			if (!$stmt) {
				throw new \Exception('Error al preparar la sentencia: ' . $this->link->error);
			}
			if (!empty($types) && !empty($params)) {
				$stmt->bind_param($types, ...$params);
			}
			$stmt->execute();
			$lastId = $this->link->insert_id;
			$stmt->close();
			$this->link->close();
			return $lastId;
		} catch ( Exception $e ) {
			handleException($e);
		}
	}
	/**
	 * Ejecutar una setencia SQL tipo INSERT,UPDATE
	 * @param $sql - string sentencia SQL
	 * @return $num_result - numero de resultados de la ejecución
	 */
	//
	public function executeSQL_DML($sql) {
		$num_results = 0;
		$lista = NULL;
		try {
			$this->connect();
			if ($result = $this->link->query ( $sql )) {
				$num_results = mysqli_affected_rows ( $this->link );
			}
			$this->link->close ();
			return $num_results;
		} catch ( Exception $e ) {
			/* $this->log->error("File: ".$e->getFile()." - line: ".$e->getLine()." - Code: ".$e->getCode()." - Message: ".$e->getMessage());
			throw new \Exception('Error: ' . $e->getMessage()); */
			handleException($e);
		}
	}
	/**
	 * Ejecutar una setencia SQL tipo INSERT,UPDATE
	 * @param $sql - string sentencia SQL
	 * @return $num_result- último id insertado
	 */
	//
	public function executeSQL_DML_last($sql) {
		$num_results = 0;
		$lista = NULL;
		try {
			$this->connect();
			if ($result = $this->link->query ( $sql )) {
				$num_results =$this->link->insert_id;
				
			}
			
			$this->link->close ();
			return $num_results;
		} catch ( Exception $e ) {
			handleException($e);
		}
	}
}
