<?php
// Simple verification script: creates a random etiqueta and especialidad, then fetches lists to confirm persistence.
// Usage: php scripts/test_create_etiqueta_especialidad.php

function resolveBase() {
    $candidates = [
        'http://localhost/apiticket',
        'http://localhost:81/apiticket'
    ];
    foreach ($candidates as $c) {
        // quick GET to etiqueta list to see if reachable
        $url = $c . '/etiqueta';
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        $resp = curl_exec($ch);
        $ok = $resp !== false && curl_getinfo($ch, CURLINFO_HTTP_CODE) < 500;
        curl_close($ch);
        if ($ok) return $c;
    }
    return $candidates[0]; // fallback
}

function postJson($url, $data) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    $resp = curl_exec($ch);
    if ($resp === false) {
        throw new Exception('cURL error: '. curl_error($ch));
    }
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, json_decode($resp, true)];
}

function getJson($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $resp = curl_exec($ch);
    if ($resp === false) {
        throw new Exception('cURL error: '. curl_error($ch));
    }
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, json_decode($resp, true)];
}

try {
    $base = resolveBase();
    echo "USING_BASE=$base\n";
    $rand = substr(md5(uniqid('', true)), 0, 6);
    $etqNombre = 'TestEtiqueta_' . $rand;
    $espNombre = 'TestEspecialidad_' . $rand;

    echo "Creating etiqueta: $etqNombre\n";
    list($codeE, $dataE) = postJson("$base/etiqueta", [ 'nombre' => $etqNombre ]);
    if ($codeE >= 200 && $codeE < 300 && isset($dataE['id_etiqueta'])) {
        echo "Etiqueta creada ID=".$dataE['id_etiqueta']."\n";
    } else {
        echo "Fallo creando etiqueta. HTTP=$codeE Response=".json_encode($dataE)."\n";
        exit(1);
    }

    echo "Creating especialidad: $espNombre\n";
    // Use SLA 1 and categoria 1 as test defaults (adjust if needed)
    list($codeS, $dataS) = postJson("$base/especialidad", [ 'nombre' => $espNombre, 'id_sla' => 1, 'id_categoria' => 1 ]);
    if ($codeS >= 200 && $codeS < 300 && isset($dataS['id_especialidad'])) {
        echo "Especialidad creada ID=".$dataS['id_especialidad']."\n";
    } else {
        echo "Fallo creando especialidad. HTTP=$codeS Response=".json_encode($dataS)."\n";
        exit(1);
    }

    // Fetch lists to verify presence
    list($codeListEt, $listEt) = getJson("$base/etiqueta");
    list($codeListEsp, $listEsp) = getJson("$base/especialidad");

    $etqFound = false; $espFound = false;
    if (is_array($listEt)) {
        foreach ($listEt as $row) { if (isset($row['nombre']) && $row['nombre'] === $etqNombre) { $etqFound = true; break; } }
    }
    if (is_array($listEsp)) {
        foreach ($listEsp as $row) { if (isset($row['nombre']) && $row['nombre'] === $espNombre) { $espFound = true; break; } }
    }

    echo "Verificacion etiqueta en listado: ".($etqFound ? 'OK' : 'NO ENCONTRADA')."\n";
    echo "Verificacion especialidad en listado: ".($espFound ? 'OK' : 'NO ENCONTRADA')."\n";

    if (!$etqFound || !$espFound) {
        echo "Alguna creación no se reflejó en el listado. Revisar controladores o base de datos.\n";
        exit(2);
    }

    echo "Todo correcto.\n";
} catch (Exception $ex) {
    echo 'ERROR: '.$ex->getMessage()."\n";
    exit(99);
}
