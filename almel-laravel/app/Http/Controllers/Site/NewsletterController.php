<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/** Footer newsletter form: stores the e-mail only (CSRF + honeypot + throttle in routes). No e-mail is ever sent. */
class NewsletterController extends Controller
{
    public function store(Request $request)
    {
        $json = $request->expectsJson() || $request->ajax();
        // honeypot: bots fill the hidden field; answer as if it worked, store nothing
        if (trim((string) $request->input('company_site', '')) !== '') {
            return $this->reply($request, $json, true, \App\Support\SiteTexts::t('news.msg.ok'));
        }
        $v = Validator::make($request->all(), [
            'email' => ['required', 'email:rfc', 'max:255'],
        ], [
            'email.required' => \App\Support\SiteTexts::t('news.msg.email_required'),
            'email.email' => \App\Support\SiteTexts::t('news.msg.email_invalid'),
            'email.max' => \App\Support\SiteTexts::t('news.msg.email_max'),
        ]);
        if ($v->fails()) {
            return $this->reply($request, $json, false, $v->errors()->first(), 422);
        }
        $email = Str::lower(trim((string) $request->input('email')));
        // The answer is identical for a new, an already subscribed and a returning address (no e-mail enumeration).
        $ok = \App\Support\SiteTexts::t('news.msg.success');
        $row = NewsletterSubscriber::query()->where('email', $email)->first();
        if ($row) {
            if ($row->status !== 'subscribed') {
                $row->forceFill(['status' => 'subscribed', 'subscribed_at' => now(), 'unsubscribed_at' => null])->save();
            }

            return $this->reply($request, $json, true, $ok);
        }
        $new = NewsletterSubscriber::query()->create([
            'email' => $email,
            'status' => 'subscribed',
            'unsubscribe_token' => Str::random(40),
            'subscribed_at' => now(),
        ]);
        \App\Support\NotificationService::newsletterJoined($new->email);

        return $this->reply($request, $json, true, $ok);
    }

    private function reply(Request $request, bool $json, bool $ok, string $msg, int $status = 200)
    {
        if ($json) {
            return response()->json($ok ? ['ok' => true, 'message' => $msg] : ['ok' => false, 'message' => $msg], $status);
        }

        return redirect()->back()->with('newsletter', $msg);
    }
}
