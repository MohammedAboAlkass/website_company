@if (request()->is('admin', 'admin/*'))
  @include('admin.status.404')
@else
  @include('errors.page', [
    'code' => 404, 'icon' => 'explore_off', 'art' => 'explore', 'retry' => false,
    'title' => 'لم نجد هذه الصفحة',
    'lead' => 'ربما نُقلت الصفحة أو تغيّر رابطها، أو أن العنوان كُتب بشكل غير صحيح. جرّب أحد الأقسام أدناه.',
  ])
@endif
