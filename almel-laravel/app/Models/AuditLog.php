<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Table `audit_logs` (schema: database/sql/schema.sql). Insert-only trail written by App\Support\Audit; /admin/audit-logs is read-only.
 * properties (JSON): type, changes { field: {old, new} }, plus context of the action (never passwords / tokens).
 */
class AuditLog extends Model
{
    protected $table = 'audit_logs';
    public const UPDATED_AT = null;
    protected $fillable = [
        'user_id',
        'action',
        'subject_type',
        'subject_id',
        'subject_label',
        'description',
        'properties',
        'ip_address',
        'user_agent',
    ];

    /** key => [Arabic label, icon, action prefixes (the part before the first dot)] */
    public const MODULES = [
        'auth' => ['الدخول والأمان', 'login', ['auth', 'security', 'profile']],
        'news' => ['الأخبار', 'newspaper', ['article']],
        'tags' => ['الوسوم', 'sell', ['tag']],
        'projects' => ['المشاريع', 'volunteer_activism', ['project']],
        'activities' => ['الأنشطة الميدانية', 'event_available', ['activity']],
        'stories' => ['قصص الميدان', 'format_quote', ['story']],
        'gallery' => ['معرض الصور', 'photo_library', ['gallery']],
        'media' => ['مكتبة الوسائط', 'perm_media', ['media']],
        'partners' => ['الشركاء', 'handshake', ['partner']],
        'faq' => ['الأسئلة الشائعة', 'help', ['faq']],
        'appeal' => ['النداء والإعلانات', 'campaign', ['appeal', 'announcement']],
        'pages' => ['الصفحات والقوائم', 'web', ['pages', 'page', 'menu', 'hero', 'impact', 'homepage']],
        'messages' => ['الرسائل والنشرة', 'inbox', ['messages', 'newsletter']],
        'users' => ['المستخدمون والأدوار', 'manage_accounts', ['user', 'role']],
        'settings' => ['الإعدادات والصيانة', 'settings', ['settings', 'maintenance']],
        'backup' => ['النسخ الاحتياطي', 'backup', ['backup']],
        'reports' => ['التقارير والسجل', 'monitoring', ['reports', 'audit']],
    ];

    /** Verb (last part of the action) => Arabic label + tone */
    public const VERBS = [
        'login' => ['تسجيل دخول', 'info'], 'login_failed' => ['دخول فاشل', 'danger'], 'logout' => ['تسجيل خروج', 'neutral'],
        'create' => ['إضافة', 'info'], 'upload' => ['رفع', 'info'], 'update' => ['تعديل', 'warn'], 'rename' => ['تعديل', 'warn'],
        'delete' => ['حذف', 'danger'], 'bulk-delete' => ['حذف جماعي', 'danger'], 'merge' => ['دمج', 'warn'],
        'publish' => ['نشر', 'info'], 'unpublish' => ['إلغاء النشر', 'neutral'], 'visibility' => ['إظهار / إخفاء', 'neutral'],
        'show' => ['إظهار', 'neutral'], 'hide' => ['إخفاء', 'neutral'], 'enable' => ['تفعيل', 'info'], 'disable' => ['تعطيل', 'warn'],
        'reorder' => ['ترتيب', 'neutral'], 'move' => ['نقل', 'neutral'], 'export' => ['تصدير', 'neutral'], 'download' => ['تنزيل', 'neutral'],
        'restore' => ['استعادة', 'warn'], 'assign' => ['تعيين', 'warn'], 'password' => ['كلمة المرور', 'warn'], 'password_reset' => ['إعادة تعيين كلمة المرور', 'warn'],
        'toggle' => ['تبديل', 'neutral'], 'handle' => ['معالجة', 'neutral'], 'status' => ['تغيير الحالة', 'warn'], 'bulk-status' => ['تغيير حالة جماعي', 'warn'],
        'session' => ['الجلسات', 'warn'], 'twofa' => ['التحقق بخطوتين', 'warn'], 'constants' => ['الثوابت', 'warn'], 'bar' => ['شريط الإعلانات', 'warn'],
        'restore_failed' => ['استعادة فاشلة', 'danger'], 'restore_denied' => ['استعادة مرفوضة', 'danger'],
    ];

    /** @return array{0:string,1:string} [Arabic label, tone] for an action key such as article.create */
    public static function verb(string $action): array
    {
        $rest = str_contains($action, '.') ? substr($action, strrpos($action, '.') + 1) : $action;
        if (isset(self::VERBS[$action])) {
            return self::VERBS[$action];
        }

        return self::VERBS[$rest] ?? [$rest !== '' ? $rest : $action, 'neutral'];
    }

    /** Module key of an action key (the first part before the dot, mapped through MODULES). */
    public static function moduleOf(string $action): string
    {
        $prefix = explode('.', $action)[0];
        foreach (self::MODULES as $key => [, , $prefixes]) {
            if (in_array($prefix, $prefixes, true)) {
                return $key;
            }
        }

        return 'other';
    }

    protected function casts(): array
    {
        return [
            'properties' => 'array',
        ];
    }

    // ---- Relationships ----

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
