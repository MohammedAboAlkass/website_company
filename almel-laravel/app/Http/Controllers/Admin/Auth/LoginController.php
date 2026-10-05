<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Audit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    private const MAX_ATTEMPTS = 5;
    /** failed attempts allowed per IP address (any e-mail) inside DECAY_SECONDS: blocks password spraying across many e-mails */
    private const MAX_ATTEMPTS_PER_IP = 20;
    private const DECAY_SECONDS = 60;

    public function showLoginForm(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            if ($user->isActive() && $user->canAccessAdmin()) {
                return redirect()->route('admin.dashboard');
            }
            // Signed in but not allowed in: drop the session so the form can be used again.
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('admin.login');
        }

        return view('admin.auth.login');
    }

    public function login(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'أدخل بريدك الإلكتروني.',
            'email.email' => 'صيغة البريد غير صحيحة، مثال: name@example.org',
            'email.max' => 'البريد الإلكتروني طويل جداً.',
            'password.required' => 'أدخل كلمة المرور.',
        ]);
        if ($validator->fails()) {
            return back()->withErrors($validator)->onlyInput('email');
        }

        $email = Str::lower(trim($request->input('email')));
        $key = 'admin-login|'.$email.'|'.$request->ip();
        $ipKey = 'admin-login-ip|'.$request->ip();

        if (RateLimiter::tooManyAttempts($ipKey, self::MAX_ATTEMPTS_PER_IP)) {
            return back()->withErrors([
                'email' => 'محاولات دخول فاشلة كثيرة من هذا الجهاز. أعد المحاولة بعد '.RateLimiter::availableIn($ipKey).' ثانية.',
            ])->onlyInput('email');
        }

        if (RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($key);

            return back()->withErrors([
                'email' => 'محاولات دخول كثيرة. أعد المحاولة بعد '.$seconds.' ثانية.',
            ])->onlyInput('email');
        }

        $credentials = ['email' => $email, 'password' => $request->input('password'), 'status' => 'active'];

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $user = Auth::user();
            if (! $user->canAccessAdmin()) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                RateLimiter::hit($key, self::DECAY_SECONDS);
                RateLimiter::hit($ipKey, self::DECAY_SECONDS);

                return back()->withErrors(['email' => 'ليس لهذا الحساب صلاحية الدخول إلى لوحة التحكم.'])->onlyInput('email');
            }

            RateLimiter::clear($key);
            $request->session()->regenerate();
            $user->forceFill(['last_login_at' => now()])->saveQuietly();
            Audit::log('auth.login', 'تسجيل دخول إلى لوحة التحكم', $user, ['type' => 'security'], $user->id);

            return redirect()->intended(route('admin.dashboard'));
        }

        RateLimiter::hit($key, self::DECAY_SECONDS);
        RateLimiter::hit($ipKey, self::DECAY_SECONDS);
        $existing = User::where('email', $email)->first();
        Audit::log('auth.login_failed', 'محاولة دخول فاشلة', $existing, ['type' => 'security', 'email' => $email], $existing?->id);
        // repeated failures (3 within the 60 s window): tell users who may view the audit log, once per window
        $tries = RateLimiter::attempts($key);
        if ($tries >= 3 && \Illuminate\Support\Facades\Cache::add('notif-login-failed|'.$key, 1, self::DECAY_SECONDS) && \Illuminate\Support\Facades\Cache::add('notif-login-failed-ip|'.$request->ip(), 1, 300)) {
            \App\Support\NotificationService::loginFailed($email, $tries, $request->ip());
        }

        return back()->withErrors([
            'email' => 'بيانات الدخول غير صحيحة أو أن الحساب غير مفعّل.',
        ])->onlyInput('email');
    }

    public function logout(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if ($user) {
            Audit::log('auth.logout', 'تسجيل خروج من لوحة التحكم', $user, ['type' => 'security'], $user->id);
        }
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login')->with('status', 'تم تسجيل الخروج بنجاح.');
    }
}
