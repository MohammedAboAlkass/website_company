<?php
/**
 * أداة الطوارئ لإصلاح وفحص حساب المدير وقاعدة البيانات
 * Emergency Admin Fix & Diagnostic Tool
 */

define('LARAVEL_START', microtime(true));

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::capture();
$response = $kernel->handle($request);

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

$action = $_GET['action'] ?? '';
$msg = '';
$msgType = 'info';

// 1. إجراء إعادة تعيين / إنشاء الحساب
if ($action === 'fix') {
    try {
        $email = 'admin@shamal-society.org';
        $pass = 'password';

        $user = User::withTrashed()->where('email', $email)->first();
        if (!$user) {
            $user = new User();
            $user->email = $email;
        }

        $user->name = 'محمد أبو الكاس';
        $user->role = 'admin';
        $user->status = 'active';
        $user->password = Hash::make($pass);
        $user->email_verified_at = now();
        $user->deleted_at = null;
        $user->save();

        // تجربة فحص كلمة المرور فوراً
        $verify = Hash::check($pass, $user->password);

        if ($verify) {
            $msg = "✅ تم تحديث وتفعيل الحساب بنجاح 100%! <br><strong>البريد:</strong> $email <br><strong>كلمة المرور:</strong> $pass";
            $msgType = 'success';
        } else {
            $msg = "⚠️ تم الحفظ ولكن فحص التشفير فشل!";
            $msgType = 'danger';
        }
    } catch (\Throwable $e) {
        $msg = "❌ خطأ أثناء التحديث: " . htmlspecialchars($e->getMessage());
        $msgType = 'danger';
    }
}

// 2. تسجيل دخول فوري مباشر (Auto-Login)
if ($action === 'autologin') {
    try {
        $user = User::where('role', 'admin')->where('status', 'active')->first();
        if ($user) {
            Auth::login($user, true);
            header('Location: /admin');
            exit;
        } else {
            $msg = "❌ لم يتم العثور على حساب مدير نشط للدخول المباشر. اضغط على زر الإصلاح أولاً.";
            $msgType = 'danger';
        }
    } catch (\Throwable $e) {
        $msg = "❌ خطأ: " . htmlspecialchars($e->getMessage());
        $msgType = 'danger';
    }
}

// 3. فحص الاتصال وقراءة المستخدمين
$dbConnected = false;
$dbName = '';
$usersList = [];
$dbError = '';

try {
    $dbName = DB::connection()->getDatabaseName();
    $dbConnected = true;
    $usersList = DB::table('users')->select('id', 'name', 'email', 'role', 'status', 'password', 'deleted_at')->get();
} catch (\Throwable $e) {
    $dbError = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>أداة الطوارئ — فحص حسابات لوحة التحكم</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 30px; line-height: 1.6; }
        .card { max-width: 900px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); border: 1px solid #334155; }
        h1 { margin-top: 0; color: #38bdf8; font-size: 24px; border-bottom: 1px solid #334155; padding-bottom: 15px; }
        .alert { padding: 15px; border-radius: 8px; margin-bottom: 20px; font-weight: 500; }
        .alert-success { background: #064e3b; color: #6ee7b7; border: 1px solid #059669; }
        .alert-danger { background: #7f1d1d; color: #fca5a5; border: 1px solid #dc2626; }
        .alert-info { background: #0c4a6e; color: #7dd3fc; border: 1px solid #0284c7; }
        .btn { display: inline-block; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; cursor: pointer; border: none; font-size: 15px; }
        .btn-primary { background: #f59e0b; color: #000; }
        .btn-primary:hover { background: #d97706; }
        .btn-success { background: #10b981; color: #fff; margin-inline-start: 10px; }
        .btn-success:hover { background: #059669; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; background: #0f172a; border-radius: 8px; overflow: hidden; }
        th, td { padding: 10px 14px; text-align: right; border-bottom: 1px solid #334155; font-size: 14px; }
        th { background: #1e293b; color: #94a3b8; }
        .badge { padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge-active { background: #065f46; color: #34d399; }
        .badge-other { background: #7c2d12; color: #fb923c; }
        .actions { margin: 25px 0; display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
    </style>
</head>
<body>

<div class="card">
    <h1>🔧 أداة فحص وإصلاح حسابات لوحة التحكم (Emergency Admin Tool)</h1>

    <?php if ($msg): ?>
        <div class="alert alert-<?= $msgType ?>"><?= $msg ?></div>
    <?php endif; ?>

    <div class="alert alert-info">
        <strong>حالة الاتصال بقاعدة البيانات:</strong>
        <?php if ($dbConnected): ?>
            <span style="color: #4ade80;">متصل بنجاح 🟢</span> (القاعدة الحالية: <code><?= htmlspecialchars($dbName) ?></code>)
        <?php else: ?>
            <span style="color: #f87171;">فشل الاتصال 🔴</span> (الخطأ: <?= htmlspecialchars($dbError) ?>)
        <?php endif; ?>
    </div>

    <div class="actions">
        <a href="?action=fix" class="btn btn-primary">⚡ إصلاح / تفعيل حساب المدير فوراً (admin@shamal-society.org / password)</a>
        <a href="?action=autologin" class="btn btn-success">🔑 تسجيل الدخول المباشر إلى لوحة التحكم فوراً</a>
        <a href="/admin/login" class="btn" style="background: #334155; color: #fff;">الانتقال لصفحة تسجيل الدخول العادية</a>
    </div>

    <h3>📋 قائمة المستخدمين المسجلين حالياً في قاعدة البيانات:</h3>
    <?php if (count($usersList) > 0): ?>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>الاسم</th>
                    <th>البريد الإلكتروني</th>
                    <th>الدور (Role)</th>
                    <th>الحالة (Status)</th>
                    <th>نوع الهاش</th>
                    <th>محذوف؟</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($usersList as $u): ?>
                    <tr>
                        <td><?= $u->id ?></td>
                        <td><?= htmlspecialchars($u->name) ?></td>
                        <td><strong><?= htmlspecialchars($u->email) ?></strong></td>
                        <td><span class="badge badge-active"><?= htmlspecialchars($u->role) ?></span></td>
                        <td>
                            <span class="badge <?= $u->status === 'active' ? 'badge-active' : 'badge-other' ?>">
                                <?= htmlspecialchars($u->status) ?>
                            </span>
                        </td>
                        <td>
                            <?php if (str_starts_with($u->password, '$2y$')): ?>
                                <span style="color: #4ade80;">Bcrypt سليم (<?= strlen($u->password) ?> حرف)</span>
                            <?php else: ?>
                                <span style="color: #f87171;">❌ غير صالح (<?= htmlspecialchars(substr($u->password, 0, 15)) ?>...)</span>
                            <?php endif; ?>
                        </td>
                        <td><?= $u->deleted_at ? '<span style="color:#f87171;">نعم محذوف</span>' : '<span style="color:#4ade80;">لا (نشط)</span>' ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php else: ?>
        <p style="color: #f87171;">⚠️ لا يوجد أي مستخدم في جدول users!</p>
    <?php endif; ?>

    <p style="margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 10px;">
        💡 تنبيه أمني: بعد التأكد من تسجيل دخولك بنجاح، يرجى حذف هذا الملف (<code>public/emergency-admin.php</code>) لحماية السيرفر.
    </p>
</div>

</body>
</html>
