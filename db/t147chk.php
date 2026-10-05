<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$bad=[]; $n=0;
foreach (app('router')->getRoutes() as $r) {
  $mw = $r->gatherMiddleware();
  $has = false; foreach ($mw as $m) { if (is_string($m) && str_starts_with($m,'perm')) $has = true; }
  $name = $r->getName(); if (!$name) continue;
  if (!str_starts_with($name,'admin.')) continue;
  $n++;
  $req = App\Support\Permissions::required($name);
  if ($req === null || $req === 'super' || $req === false) $bad[] = $name.' => '.var_export($req,true);
}
echo "admin routes: $n\n";
foreach ($bad as $b) echo "SUPER/UNMAPPED: $b\n";
foreach (['admin.announcements.index','admin.announcements.store','admin.announcements.bar','admin.announcements.toggle','admin.announcements.reorder','admin.announcements.destroy','admin.appeal','admin.appeals.update','admin.appeals.image','admin.editor.media','admin.partners.logo'] as $x) echo $x.' => '.json_encode(App\Support\Permissions::required($x))."\n";