<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth;

class FirebaseService
{
    protected Auth $auth;

    public function __construct()
    {
        $factory = (new Factory)
            ->withServiceAccount(storage_path('app/firebase_credentials.json'))
            ->withProjectId('flexi-task-5d512');

        $this->auth = $factory->createAuth();
    }

    public function createUser(string $email, string $password)
    {
        return $this->auth->createUserWithEmailAndPassword($email, $password);
    }

    public function signInUser(string $email, string $password)
    {
        return $this->auth->signInWithEmailAndPassword($email, $password);
    }

    public function getAuth(): Auth
    {
        return $this->auth;
    }
}