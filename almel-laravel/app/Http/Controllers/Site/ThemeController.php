<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Support\SiteTheme;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** /site-theme/{name}.css — the public stylesheets derived for the chosen «مظهر الموقع» (see App\Support\SiteTheme). */
class ThemeController extends Controller
{
    public function css(Request $request, string $name)
    {
        $file = SiteTheme::FILES[$name] ?? null;
        if ($file === null) {
            abort(404);
        }
        if (! SiteTheme::isActive() || ($name === 'hero' && ! SiteTheme::heroFollows())) {
            return redirect(asset('assets/site/css/'.$file), 302)->header('Cache-Control', 'no-cache');
        }
        $css = SiteTheme::render($name);
        if ($css === null) {
            abort(404);
        }
        $current = hash_equals(SiteTheme::hash($name), (string) $request->query('v', ''));
        $res = new Response($css, 200, [
            'Content-Type' => 'text/css; charset=UTF-8',
            'Cache-Control' => $current ? 'public, max-age=31536000, immutable' : 'no-cache',
        ]);
        $res->setEtag(md5($css));
        $res->isNotModified($request);

        return $res;
    }
}
