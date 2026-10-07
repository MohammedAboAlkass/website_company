<?php

$publicPath = getcwd();

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

$filePath = $publicPath . $uri;

if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    
    // Static assets to cache aggressively
    $cacheExts = [
        'woff2' => 'font/woff2',
        'woff'  => 'font/woff',
        'ttf'   => 'font/ttf',
        'otf'   => 'font/otf',
        'css'   => 'text/css; charset=UTF-8',
        'js'    => 'application/javascript; charset=UTF-8',
        'png'   => 'image/png',
        'jpg'   => 'image/jpeg',
        'jpeg'  => 'image/jpeg',
        'webp'  => 'image/webp',
        'svg'   => 'image/svg+xml',
        'ico'   => 'image/x-icon',
        'gif'   => 'image/gif',
        'mp4'   => 'video/mp4',
    ];

    if (isset($cacheExts[$ext])) {
        $mtime = filemtime($filePath);
        $etag = sprintf('"%x-%x"', $mtime, filesize($filePath));

        header('Content-Type: ' . $cacheExts[$ext]);
        header('Cache-Control: public, max-age=31536000, immutable');
        header('ETag: ' . $etag);
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $mtime) . ' GMT');
        header('Access-Control-Allow-Origin: *');

        if ((isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) ||
            (isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) && strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']) >= $mtime)) {
            http_response_code(304);
            exit;
        }

        header('Content-Length: ' . filesize($filePath));
        readfile($filePath);
        exit;
    }

    return false;
}

require_once $publicPath . '/index.php';
