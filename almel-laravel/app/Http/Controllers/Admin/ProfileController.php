<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Audit;
use App\Support\AvatarManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/** «حسابي»: the signed-in user edits their own name, photo and password (never anybody else's). */
class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        return view('admin.profile.edit', ['user' => $request->user()]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'job_title' => ['nullable', 'string', 'max:120'],
        ], [
            'name.required' => 'حقل الاسم مطلوب.',
            'name.max' => 'الاسم طويل جداً.',
            'phone.max' => 'رقم الهاتف طويل جداً.',
            'job_title.max' => 'المسمى الوظيفي طويل جداً.',
        ]);

        $user = $request->user();
        $user->fill(['name' => trim($data['name']), 'phone' => $data['phone'] ?? null, 'job_title' => $data['job_title'] ?? null])->save();
        Audit::log('profile.update', 'تعديل الملف الشخصي', $user, ['type' => 'users']);

        return redirect()->route('admin.profile.edit')->with('success', 'تم حفظ بياناتك.');
    }

    /** Uploads / replaces the photo of the SIGNED-IN user (no user id is accepted from the request). */
    public function avatar(Request $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $file = $request->file('avatar');
        $err = AvatarManager::check($file instanceof \Illuminate\Http\UploadedFile ? $file : null);
        if ($err) {
            return $this->avatarFail($request, $err);
        }
        try {
            $r = AvatarManager::save($user, $file);
        } catch (\InvalidArgumentException $e) {
            return $this->avatarFail($request, $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return $this->avatarFail($request, 'تعذّر حفظ الصورة، حاول مرة أخرى.', 500);
        }
        Audit::log('profile.avatar', $r['had_avatar'] ? 'استبدال الصورة الشخصية' : 'رفع صورة شخصية', $user, [
            'type' => 'users', 'source_mime' => $r['source_mime'], 'source_kb' => (int) round($r['source_bytes'] / 1024), 'stored_kb' => (int) round($r['bytes'] / 1024),
        ]);
        $msg = 'تم حفظ صورتك الشخصية.';

        return $request->expectsJson()
            ? response()->json(['ok' => true, 'message' => $msg, 'data' => ['url' => $r['url']]])
            : redirect()->route('admin.profile.edit')->with('success', $msg);
    }

    public function avatarDestroy(Request $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $had = AvatarManager::remove($user);
        if ($had) {
            Audit::log('profile.avatar_remove', 'إزالة الصورة الشخصية', $user, ['type' => 'users']);
        }
        $msg = $had ? 'تمت إزالة صورتك الشخصية.' : 'لا توجد صورة شخصية لإزالتها.';

        return $request->expectsJson()
            ? response()->json(['ok' => true, 'message' => $msg, 'data' => ['url' => null]])
            : redirect()->route('admin.profile.edit')->with('success', $msg);
    }

    private function avatarFail(Request $request, string $message, int $status = 422): JsonResponse|RedirectResponse
    {
        return $request->expectsJson()
            ? response()->json(['message' => $message, 'errors' => ['avatar' => [$message]]], $status)
            : redirect()->route('admin.profile.edit')->withErrors(['avatar' => $message]);
    }

    public function password(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
        ], [
            'current_password.required' => 'أدخل كلمة المرور الحالية.',
            'password.required' => 'أدخل كلمة المرور الجديدة.',
            'password.confirmed' => 'تأكيد كلمة المرور غير مطابق.',
            'password.min' => 'كلمة المرور يجب ألا تقل عن 8 أحرف.',
            'password.letters' => 'كلمة المرور يجب أن تحتوي على حرف واحد على الأقل.',
            'password.numbers' => 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل.',
        ]);

        $user = $request->user();
        if (! Hash::check($request->input('current_password'), $user->password)) {
            return back()->withErrors(['current_password' => 'كلمة المرور الحالية غير صحيحة.']);
        }

        $user->password = $request->input('password');
        $user->setRememberToken(\Illuminate\Support\Str::random(60)); // invalidates "remember me" cookies of other devices
        $user->save();
        // every other browser / device of this account is signed out; the current session stays
        $out = \App\Support\UserSessions::revokeOthers((int) $user->id, $request->session()->getId());
        Audit::log('profile.password', 'تغيير كلمة المرور الشخصية', $user, ['type' => 'security', 'other_sessions_closed' => $out]);

        return redirect()->route('admin.profile.edit')->with('success', $out > 0 ? 'تم تغيير كلمة المرور، وأُنهيت جلساتك الأخرى على الأجهزة الأخرى.' : 'تم تغيير كلمة المرور.');
    }
}
