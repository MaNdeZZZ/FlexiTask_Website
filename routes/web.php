<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FirestoreController;
use App\Http\Controllers\GroqChatController;


Route::get('/', function () {
    return view('auth.signin-signup');
});

Route::get('/login', function () {
    return view('auth.login');
})->name('login');

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
})->middleware('auth')->name('dash2');

Route::get('/forgot-password', function () {
    return view('forgot-password');
});



Route::get('/profile', function () {
    return view('profile');
});

Route::get('/reset-password', function () {
    return view('reset-password');
});



Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/google-auth', [AuthController::class, 'googleAuth']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');
Route::get('/test-json', [AuthController::class, 'test']);
Route::get('/dash2', function () {
    return view('dash2'); // Pastikan file resources/views/dash2.blade.php ada
});


Route::post('/firestore/set-user/{uid}', [FirestoreController::class, 'setUser']);
Route::get('/firestore/get-user/{uid}', [FirestoreController::class, 'getUser']);
Route::delete('/firestore/delete-user/{uid}', [FirestoreController::class, 'deleteUser']);

Route::post('/api/groq-chat', [GroqChatController::class, 'ask']);

Route::get('/test-groq', function () {
    return response()->json(['reply' => 'Groq API test OK']);
});
