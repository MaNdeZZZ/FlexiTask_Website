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

Route::get('/chatbot', function () {
    return view('chatbot');
});

Route::get('/completed', function () {
    return view('completed');
});

Route::get('/dash2', function () {
    return view('dash2');
});

Route::get('/forgot-password', function () {
    return view('forgot-password');
});

Route::get('/profile', function () {
    return view('profile');
});

Route::get('/reset-password', function () {
    return view('reset-password');
});

