<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Table `projects` (schema: database/sql/schema.sql) */
class Project extends Model
{
    use SoftDeletes;

    protected $table = 'projects';
    protected $fillable = [
        'program_id',
        'governorate_id',
        'slug',
        'title',
        'summary',
        'description',
        'location_text',
        'status',
        'is_featured',
        'cover_media_id',
        'cover_alt',
        'badge_text',
        'badge_tone',
        'badge_icon',
        'beneficiaries_count',
        'show_funding',
        'funding_goal',
        'funding_raised',
        'progress_percent',
        'start_date',
        'end_date',
        'seo_title',
        'seo_description',
        'sort_order',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'show_funding' => 'boolean',
            'funding_goal' => 'decimal:2',
            'funding_raised' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
            'published_at' => 'datetime',
        ];
    }

    // ---- Relationships ----

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    public function governorate(): BelongsTo
    {
        return $this->belongsTo(Governorate::class, 'governorate_id');
    }

    public function cover(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'cover_media_id');
    }

    public function facts(): HasMany
    {
        return $this->hasMany(ProjectFact::class, 'project_id')->orderBy('sort_order');
    }

    public function components(): HasMany
    {
        return $this->hasMany(ProjectComponent::class, 'project_id')->orderBy('sort_order');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class, 'project_id')->orderBy('sort_order');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(ProjectUpdate::class, 'project_id');
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'project_id');
    }

    public function galleryItems(): HasMany
    {
        return $this->hasMany(GalleryItem::class, 'project_id')->orderBy('sort_order');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'project_id')->orderBy('sort_order');
    }

    public const STATUSES = ['draft', 'active', 'urgent', 'paused', 'completed'];

    /** Everything that is not a draft is public. */
    public function scopeVisible($query)
    {
        return $query->where('status', '!=', 'draft');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
