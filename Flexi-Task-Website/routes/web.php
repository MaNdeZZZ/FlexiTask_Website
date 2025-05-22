<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('auth.signin-signup');
});

Route::get('/login', function () {
    return view('auth.login'); 
});


Route::get('/register', function () {
    return view('auth.register'); 
});

Route::get('/signin-signup', function () {
    return view('auth.signin-signup');
});
