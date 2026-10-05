@php $__c = isset($exception) && method_exists($exception, 'getStatusCode') ? (int) $exception->getStatusCode() : 500; @endphp
@include('errors.page', [
  'code' => $__c, 'icon' => 'error', 'art' => 'server',
  'title' => 'الخدمة غير متاحة حاليًا',
  'lead' => 'حدثت مشكلة مؤقتة في الخادم. جرّب مرة أخرى بعد قليل.',
])
