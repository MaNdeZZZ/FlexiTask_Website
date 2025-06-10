<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(Auth::class, function ($app) {
            $credentialsPath = storage_path('app/firebase_credentials.json');
            
            if (!file_exists($credentialsPath)) {
                Log::warning('⚠️ Firebase credentials file not found: ' . $credentialsPath);
                return null; // Jangan throw exception
            }

            $factory = (new Factory)
                ->withServiceAccount($credentialsPath)
                ->withProjectId('flexi-task-5d512');

            return $factory->createAuth();
        });
    }
}
