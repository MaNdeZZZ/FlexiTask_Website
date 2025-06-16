<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
<<<<<<< HEAD
=======
use Illuminate\Support\Facades\Route;
>>>>>>> Bakudapa

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
<<<<<<< HEAD
=======

Route::get('/signin-signup', function () {
    return view('signin-signup');
});
>>>>>>> Bakudapa
