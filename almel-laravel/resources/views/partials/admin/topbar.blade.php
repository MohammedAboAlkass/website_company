<header class="topbar" id="topbar">
  <span>{{ auth()->user()->name }}</span>
  <form method="POST" action="{{ route('admin.logout') }}">@csrf<button type="submit">خروج</button></form>
</header>
