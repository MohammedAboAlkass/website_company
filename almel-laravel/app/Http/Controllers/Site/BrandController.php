<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Support\SiteSettings;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** /brand/logo and /brand/favicon: serve the logo / favicon stored (as a data-URI) in the settings org.logo / org.favicon. */
class BrandController extends Controller
{
    public function logo(Request $request): Response
    {
        return $this->serve('org.logo', $request);
    }

    public function favicon(Request $request): Response
    {
        return $this->serve('org.favicon', $request);
    }

    private function serve(string $key, Request $request): Response
    {
        $a = SiteSettings::brandAsset($key);
        if (! $a) {
            abort(404);
        }
        [$mime, $bin] = $a;
        $etag = '"'.md5($bin).'"';
        $headers = [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=86400',
            'ETag' => $etag,
            'X-Content-Type-Options' => 'nosniff',
            // an SVG opened directly can never run script
            'Content-Security-Policy' => "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        ];
        if ($request->headers->get('If-None-Match') === $etag) {
            return response('', 304, $headers);
        }

        return response($bin, 200, $headers);
    }
}
