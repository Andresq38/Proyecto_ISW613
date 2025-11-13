<?php
// Quick check: count categories via HTTP API and print result clearly
$candidates = [
    'http://localhost/apiticket/categoria_ticket',
    'http://localhost:81/apiticket/categoria_ticket'
];

function fetchJson($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $resp = curl_exec($ch);
    if ($resp === false) {
        $err = curl_error($ch);
        curl_close($ch);
        throw new Exception('cURL error: ' . $err);
    }
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code < 200 || $code >= 300) {
        throw new Exception('HTTP status ' . $code);
    }
    $data = json_decode($resp, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON decode error: ' . json_last_error_msg());
    }
    return $data;
}

try {
    $data = null;
    $lastErr = null;
    foreach ($candidates as $url) {
        try {
            $data = fetchJson($url);
            $base = $url;
            break;
        } catch (Exception $e) {
            $lastErr = $e;
        }
    }
    if ($data === null) {
        throw $lastErr ?: new Exception('No se pudo consultar ningún endpoint');
    }
    if (is_array($data)) {
        $count = count($data);
    } elseif (isset($data['data']) && is_array($data['data'])) {
        $count = count($data['data']);
    } else {
        $count = 0;
    }
    echo "URL=$base\n";
    echo "CATEGORIES_COUNT=$count\n";
    echo $count >= 3 ? "STATUS=OK (>=3)\n" : "STATUS=LOW (<3)\n";
} catch (Exception $e) {
    echo 'ERROR=' . $e->getMessage() . "\n";
    exit(1);
}
