<?php
echo "=== Prueba de Endpoints de Tickets ===\n\n";

function testEndpoint($url, $method = 'GET', $data = null) {
    echo "Probando $method $url\n";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    if ($method !== 'GET') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    
    $headers = ['Content-Type: application/json'];
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Código de respuesta: $httpCode\n";
    echo "Respuesta:\n";
    echo json_encode(json_decode($response), JSON_PRETTY_PRINT) . "\n\n";
}

$base = "http://localhost/apiticket";

echo "1. Listar todos los tickets:\n";
testEndpoint("$base/ticket");

echo "2. Obtener ticket específico (ID: 100001):\n";
testEndpoint("$base/ticket/100001");

echo "3. Obtener tickets por técnico (ID: 1):\n";
testEndpoint("$base/ticket/getTicketByTecnico/1");

echo "4. Obtener ticket completo (ID: 100001):\n";
testEndpoint("$base/ticket/getTicketCompletoById/100001");