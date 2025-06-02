<?php

namespace App\Http\Controllers;

use App\Services\FirebaseService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    protected FirebaseService $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6|same:password_confirmation',
        ]);

        try {
            $user = $this->firebase->createUser($request->email, $request->password);
            return response()->json(['message' => 'User registered', 'uid' => $user->uid], 201);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        try {
            $signInResult = $this->firebase->signInUser($request->email, $request->password);
            return response()->json([
                'message' => 'Login successful',
                'idToken' => $signInResult->idToken(),
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
    }
}
