<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeAdmin extends Command
{
    protected $signature = 'almel:make-admin {email : البريد الإلكتروني} {--name= : الاسم (اختياري)} {--password= : كلمة المرور (تُطلب إن لم تُمرَّر)}';

    protected $description = 'Create or update an admin account (role admin, status active) with a hashed password';

    public function handle(): int
    {
        $email = mb_strtolower(trim((string) $this->argument('email')));
        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address.');

            return self::FAILURE;
        }

        $password = $this->option('password');
        if ($password === null || $password === '') {
            $password = (string) $this->secret('Password (min 8 characters)');
            $confirm = (string) $this->secret('Confirm password');
            if ($password !== $confirm) {
                $this->error('Passwords do not match.');

                return self::FAILURE;
            }
        }
        if (mb_strlen($password) < 8) {
            $this->error('Password must be at least 8 characters.');

            return self::FAILURE;
        }

        $user = User::withTrashed()->where('email', $email)->first();
        $created = false;
        if (! $user) {
            $user = new User();
            $user->email = $email;
            $user->name = $this->option('name') ?: 'مدير النظام';
            $created = true;
        } elseif ($this->option('name')) {
            $user->name = $this->option('name');
        }

        if ($user->trashed()) {
            $user->restore();
        }

        $user->role = 'admin';
        $user->status = 'active';
        $user->password = $password; // hashed by the model cast
        if (! $user->email_verified_at) {
            $user->email_verified_at = now();
        }
        $user->save();

        $this->info(($created ? 'Created' : 'Updated').' admin #'.$user->id.' <'.$user->email.'> (role=admin, status=active).');

        return self::SUCCESS;
    }
}
