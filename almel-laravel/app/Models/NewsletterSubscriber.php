<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Table `newsletter_subscribers` (schema: database/sql/schema.sql) */
class NewsletterSubscriber extends Model
{
    protected $table = 'newsletter_subscribers';
    protected $fillable = [
        'email',
        'status',
        'unsubscribe_token',
        'subscribed_at',
        'unsubscribed_at',
    ];

    protected function casts(): array
    {
        return [
            'subscribed_at' => 'datetime',
            'unsubscribed_at' => 'datetime',
        ];
    }
}
