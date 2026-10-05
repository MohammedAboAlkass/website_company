@if($home['projects']->count())
    <!-- ================= PROJECTS (from the database) ================= -->
    <section id="projects" class="bg-sand py-20 md:py-28">
      <div class="mx-auto max-w-page px-5 md:px-8">
        <div class="reveal mx-auto max-w-2xl text-center">
          <p class="eyebrow justify-center"><span class="material-symbols-outlined">cases</span>{{ \App\Support\HomeSections::t('projects', 'eyebrow') }}</p>
          <h2 class="section-title">{{ \App\Support\HomeSections::t('projects', 'title') }}</h2>
          <p class="section-lead">{{ \App\Support\HomeSections::t('projects', 'lead') }}</p>
        </div>

        <div id="project-filters" class="chip-bar reveal mt-9 justify-center" role="group" aria-label="{{ \App\Support\SiteTexts::t('project.filter_label') }}">
          <button type="button" class="chip is-on" data-filter="all" aria-pressed="true"><span class="material-symbols-outlined">auto_awesome</span>{{ \App\Support\SiteTexts::t('programs.list.all') }}<span class="chip-count">{{ $home['projects']->count() }}</span></button>
          @foreach($home['projectChips'] as $c)
          <button type="button" class="chip" data-filter="{{ $c['slug'] }}" aria-pressed="false"><span class="material-symbols-outlined">{{ $c['icon'] }}</span>{{ $c['label'] }}<span class="chip-count">{{ $c['count'] }}</span></button>
          @endforeach
        </div>

        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" id="project-grid">
          @foreach($home['projects'] as $p)
          @include('partials.site.project-card', ['p' => $p, 'delay' => ($loop->index % 4) * 0.08])
          @endforeach
        </div>
        @if($home['projectsTotal'] > $home['projects']->count())
        <div class="mt-12 flex justify-center">
          <a href="{{ route('projects.index') }}" class="btn btn-forest h-14 px-8 text-[16px]">{{ \App\Support\HomeSections::t('projects', 'button') }}<span class="material-symbols-outlined btn-arrow text-[20px]" aria-hidden="true">arrow_back</span></a>
        </div>
        @endif
      </div>
    </section>
@endif
