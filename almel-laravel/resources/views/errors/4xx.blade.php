@php $__c = isset($exception) && method_exists($exception, 'getStatusCode') ? (int) $exception->getStatusCode() : 400; @endphp
@include('errors.page', [
  'code' => $__c, 'icon' => 'report', 'art' => 'explore', 'retry' => false,
  'title' => $__c === 405 ? 'طريقة الطلب غير مسموحة' : 'تعذّر تنفيذ الطلب',
  'lead' => $__c === 405 ? 'هذا العنوان لا يقبل طريقة الإرسال المستخدمة. ارجع إلى الصفحة الرئيسية وتابع من هناك.' : 'لم نتمكن من تنفيذ هذا الطلب. تأكّد من الرابط أو ارجع إلى الصفحة الرئيسية.',
])
