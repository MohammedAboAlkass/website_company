<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Support\SiteContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function index()
    {
        SiteContent::seo(SiteContent::page('contact')); // CMS row: hidden/draft = 404, SEO title/description
        return view('site.contact', ['info' => SiteContent::info(), 'faqs' => \App\Models\Faq::query()->published()->orderBy('sort_order')->orderBy('id')->limit(6)->get()]);
    }

    /** Stores the message in `contact_messages` (no e-mail is sent). CSRF + throttle come from the route / web group. */
    public function store(Request $request)
    {
        // honeypot: bots fill the hidden field; answer "ok" and store nothing
        if (trim((string) $request->input('company_site', '')) !== '') {
            return $this->done($request);
        }
        $types = ['contact', 'volunteer', 'partnership', 'media', 'inquiry', 'other'];
        $type = (string) ($request->input('type') ?: $request->input('topic') ?: 'inquiry');
        $request->merge(['type' => in_array($type, $types, true) ? $type : 'inquiry']);

        $v = Validator::make($request->all(), [
            'name' => ['required', 'string', 'min:3', 'max:150'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'phone' => ['required', 'string', 'max:30', 'regex:/^[+\d\s().-]{7,30}$/'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ], [
            'name.required' => \App\Support\SiteTexts::t('contact.msg.name_required'),
            'name.min' => \App\Support\SiteTexts::t('contact.msg.name_min'),
            'name.max' => \App\Support\SiteTexts::t('contact.msg.name_max'),
            'email.required' => \App\Support\SiteTexts::t('contact.msg.email_required'),
            'email.email' => \App\Support\SiteTexts::t('contact.msg.email_invalid'),
            'phone.required' => \App\Support\SiteTexts::t('contact.msg.phone_required'),
            'phone.regex' => \App\Support\SiteTexts::t('contact.msg.phone_invalid'),
            'message.required' => \App\Support\SiteTexts::t('contact.msg.message_required'),
            'message.min' => \App\Support\SiteTexts::t('contact.msg.message_min'),
            'message.max' => \App\Support\SiteTexts::t('contact.msg.message_max'),
        ]);
        if ($v->fails()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
            }

            return back()->withErrors($v)->withInput();
        }
        $d = $v->validated();
        // single-line fields: no CR / LF / control characters (header-injection safe if they are ever mailed)
        $line = fn (string $s): string => trim((string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', strip_tags($s)));
        $msg = ContactMessage::create([
            'type' => $request->input('type'),
            'name' => $line($d['name']),
            'email' => $d['email'],
            'phone' => $line($d['phone']),
            'subject' => isset($d['subject']) && $line((string) $d['subject']) !== '' ? $line((string) $d['subject']) : null,
            'message' => strip_tags($d['message']),
            'consent_given' => $request->boolean('consent', true),
            'is_read' => false,
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 255),
        ]);
        \App\Support\NotificationService::messageReceived($msg);

        return $this->done($request);
    }

    private function done(Request $request)
    {
        $msg = \App\Support\SiteTexts::t('contact.msg.success');
        if ($request->expectsJson()) {
            return response()->json(['ok' => true, 'message' => $msg]);
        }

        return redirect()->route('contact')->with('status', $msg);
    }
}
