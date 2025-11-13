<?php
// Test end-to-end creation of category with multiple etiquetas & especialidades.
// Usage: php scripts/test_create_categoria.php

function resolveBase() {
    $candidates = [
        'http://localhost/apiticket',
        'http://localhost:81/apiticket'
    ];
    foreach ($candidates as $c) {
        $ch = curl_init($c . '/categoria_ticket');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        $resp = curl_exec($ch);
        $ok = $resp !== false && curl_getinfo($ch, CURLINFO_HTTP_CODE) < 500;
        curl_close($ch);
        if ($ok) return $c;
    }
    return $candidates[0];
}

function postJson($url, $data) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    $resp = curl_exec($ch);
    if ($resp === false) {
        throw new Exception('cURL error: ' . curl_error($ch));
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
        throw new Exception('cURL error: ' . curl_error($ch));
    }
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, json_decode($resp, true)];
}

try {
    $base = resolveBase();
    echo "USING_BASE=$base\n";
    $rand = substr(md5(uniqid('', true)), 0, 6);

    // Create two etiquetas
    $etiquetaIds = [];
    for ($i=1; $i<=2; $i++) {
        $nombre = "CatTestEtiqueta_{$i}_$rand";
        list($code, $data) = postJson("$base/etiqueta", ['nombre' => $nombre]);
        if ($code >=200 && $code <300 && isset($data['id_etiqueta'])) {
            $etiquetaIds[] = (int)$data['id_etiqueta'];
            echo "Etiqueta $i creada ID=".$data['id_etiqueta']." nombre=$nombre\n";
        } else {
            throw new Exception('Fallo creando etiqueta '.$i.' HTTP='.$code.' Resp='.json_encode($data));
        }
    }

    // Create two especialidades (temporary category 1, SLA 1)
    $especialidadIds = [];
    for ($i=1; $i<=2; $i++) {
        $nombre = "CatTestEspecialidad_{$i}_$rand";
        list($code, $data) = postJson("$base/especialidad", ['nombre' => $nombre, 'id_sla' => 1, 'id_categoria' => 1]);
        if ($code >=200 && $code <300 && isset($data['id_especialidad'])) {
            $especialidadIds[] = (int)$data['id_especialidad'];
            echo "Especialidad $i creada ID=".$data['id_especialidad']." nombre=$nombre\n";
        } else {
            throw new Exception('Fallo creando especialidad '.$i.' HTTP='.$code.' Resp='.json_encode($data));
        }
    }

    // Create category with arrays
    $catNombre = 'CategoriaMulti_' . $rand;
    $payload = [
        'nombre' => $catNombre,
        'id_sla' => 1,
        'etiquetas' => $etiquetaIds,
        'especialidades' => $especialidadIds
    ];
    list($codeCat, $dataCat) = postJson("$base/categoria_ticket", $payload);
    if ($codeCat < 200 || $codeCat >= 300 || empty($dataCat['id_categoria'])) {
        throw new Exception('Fallo creando categoria HTTP='.$codeCat.' Resp='.json_encode($dataCat));
    }
    $idCat = (int)$dataCat['id_categoria'];
    echo "Categoria creada ID=$idCat nombre=$catNombre\n";

    // Fetch category detail
    list($codeDetail, $catDetail) = getJson("$base/categoria_ticket/$idCat");
    if ($codeDetail < 200 || $codeDetail >= 300) throw new Exception('Fallo obteniendo detalle categoria');

    // Validate etiquetas association
    $etqIdsFound = [];
    if (isset($catDetail['etiquetas']) && is_array($catDetail['etiquetas'])) {
        foreach ($catDetail['etiquetas'] as $e) { if (isset($e['id_etiqueta'])) $etqIdsFound[] = (int)$e['id_etiqueta']; }
    }
    // Validate especialidades association
    $espIdsFound = [];
    if (isset($catDetail['especialidades']) && is_array($catDetail['especialidades'])) {
        foreach ($catDetail['especialidades'] as $e) { if (isset($e['id_especialidad'])) $espIdsFound[] = (int)$e['id_especialidad']; }
    }

    $missingEtq = array_diff($etiquetaIds, $etqIdsFound);
    $missingEsp = array_diff($especialidadIds, $espIdsFound);

    echo 'ETIQUETAS_SENT=' . json_encode($etiquetaIds) . "\n";
    echo 'ETIQUETAS_FOUND=' . json_encode($etqIdsFound) . "\n";
    echo 'ESPECIALIDADES_SENT=' . json_encode($especialidadIds) . "\n";
    echo 'ESPECIALIDADES_FOUND=' . json_encode($espIdsFound) . "\n";

    $okEtq = empty($missingEtq);
    $okEsp = empty($missingEsp);
    echo 'ASSOC_ETIQUETAS_STATUS=' . ($okEtq ? 'OK' : 'MISSING_' . json_encode(array_values($missingEtq))) . "\n";
    echo 'ASSOC_ESPECIALIDADES_STATUS=' . ($okEsp ? 'OK' : 'MISSING_' . json_encode(array_values($missingEsp))) . "\n";

    if (!$okEtq || !$okEsp) {
        exit(2);
    }

    echo "Todo correcto: categoría y asociaciones creadas.\n";
    exit(0);
} catch (Exception $ex) {
    echo 'ERROR: ' . $ex->getMessage() . "\n";
    exit(99);
}
