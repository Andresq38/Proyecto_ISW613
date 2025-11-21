<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'controllers/core/MySqlConnect.php';
require_once 'models/AsignacionModel.php';

$model = new AsignacionModel();
echo "AsignacionModel cargado correctamente\n";

$tickets = $model->getTicketsPendientes();
echo "Tickets pendientes encontrados: " . count($tickets) . "\n";
print_r($tickets);
