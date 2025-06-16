<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Kreait\Firebase\Factory;

class FirestoreController extends Controller
{
    protected $firestore;

    public function __construct()
    {
        $this->firestore = (new Factory)
            ->withServiceAccount(config('services.firebase.credentials'))
            ->createFirestore()
            ->database();
    }

    // 🚀 Simpan / update user data di Firestore
    public function setUser($uid, Request $request)
    {
        $docRef = $this->firestore->collection('users')->document($uid);
        $docRef->set([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'created_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'User data saved to Firestore']);
    }

    // 🚀 Ambil data user dari Firestore
    public function getUser($uid)
    {
        $docRef = $this->firestore->collection('users')->document($uid);
        $snapshot = $docRef->snapshot();

        if ($snapshot->exists()) {
            return response()->json(['success' => true, 'data' => $snapshot->data()]);
        } else {
            return response()->json(['success' => false, 'message' => 'User not found']);
        }
    }

    // 🚀 Hapus data user dari Firestore
    public function deleteUser($uid)
    {
        $docRef = $this->firestore->collection('users')->document($uid);
        $docRef->delete();

        return response()->json(['success' => true, 'message' => 'User deleted from Firestore']);
    }
}
