<?php
namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Kreait\Firebase\Auth as FirebaseAuth;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Exception\Auth\InvalidToken;

class AuthController extends Controller
{
    protected $firebaseAuth;
    // protected $firestore;

    public function __construct()
    {
        $credentialsPath = storage_path('app/firebase_credentials.json');
        
        // Check if credentials file exists and is readable
        if (!file_exists($credentialsPath)) {
            \Log::error('Firebase credentials file not found at: ' . $credentialsPath);
            throw new \RuntimeException('Firebase credentials file not found');
        }

        $factory = (new Factory)
            ->withServiceAccount($credentialsPath)
            ->withProjectId('flexi-task-5d512');

        $this->firebaseAuth = $factory->createAuth();
        // $this->firestore = $factory->createFirestore()->database();
    }

//coba baru
    public function login(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        try {
            $idToken = $request->input('token');
            $verifiedIdToken = $this->firebaseAuth->verifyIdToken($idToken);
            $uid = $verifiedIdToken->claims()->get('sub');

            // 🔥 Query Firestore REST API
            $projectId = 'flexi-task-5d512';
            $url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/users/$uid";

            // Gunakan idToken sebagai Bearer token
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $idToken,
                'Accept' => 'application/json'
            ])->get($url);

            // if ($response->successful()) {
            //     $data = $response->json();
            //     return response()->json([
            //         'success' => true,
            //         'user' => $data
            //     ]);
            // } else {
            //     \Log::error('Firestore REST API error: ' . $response->body());
            //     return response()->json([
            //         'success' => false,
            //         'error' => 'User not found or Firestore error'
            //     ], $response->status());
            // }
            if ($response->successful()) {
                $data = $response->json();

                // 🔥 Parse fields ke bentuk JSON normal
                $userData = [];
                if (isset($data['fields'])) {
                    foreach ($data['fields'] as $key => $value) {
                        $userData[$key] = reset($value);
                    }
                }

                return response()->json([
                    'success' => true,
                    'user' => $userData
                ]);
            } elseif ($response->status() == 404) {
                // 🔥 Document Firestore belum ada → login tetap sukses, user null
                return response()->json([
                    'success' => true,
                    'user' => null
                ]);
            } else {
                \Log::error('Firestore REST API error: ' . $response->body());
                return response()->json([
                    'success' => false,
                    'error' => 'Firestore error'
                ], $response->status());
            }
        } catch (InvalidToken $e) {
            \Log::error('Invalid Firebase token: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Invalid Firebase token'], 401);
        } catch (\Exception $e) {
            \Log::error('Firebase login error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

//yang utama
    // public function login(Request $request)
    // {
    //     $request->validate([
    //         'token' => 'required|string',
    //     ]);

    //     try {
    //         $idToken = $request->input('token');
    //         $verifiedIdToken = $this->firebaseAuth->verifyIdToken($idToken);
    //         $uid = $verifiedIdToken->claims()->get('sub');

    //         // Ambil user dari Firestore (koleksi "users")
    //         $userDoc = $this->firestore->collection('users')->document($uid)->snapshot();

    //         if ($userDoc->exists()) {
    //             $userData = $userDoc->data();

    //             return response()->json([
    //                 'success' => true,
    //                 'user' => $userData
    //             ], 200);
    //         } else {
    //             return response()->json([
    //                 'success' => false,
    //                 'error' => 'User not found in Firestore'
    //             ], 404);
    //         }
    //     } catch (InvalidToken $e) {
    //         \Log::error('Invalid Firebase token: ' . $e->getMessage());
    //         return response()->json(['success' => false, 'error' => 'Invalid Firebase token'], 401);
    //     } catch (\Exception $e) {
    //         \Log::error('Firebase login error: ' . $e->getMessage());
    //         return response()->json(['success' => false, 'error' => 'Server error: ' . $e->getMessage()], 500);
    //     }
    // }

    public function test()
    {
        $path = storage_path('app/firebase_credentials.json');
        if (!is_readable($path)) {
            return 'File not readable!';
        }

        $content = file_get_contents($path);
        return response($content);
    }

    public function googleAuth(Request $request)
    {
        return $this->login($request);
    }

    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6|same:password_confirmation',
        ]);

        try {
            $user = $this->firebaseAuth->createUser([
                'email' => $request->email,
                'password' => $request->password,
            ]);

            return response()->json(['message' => 'User registered', 'uid' => $user->uid], 201);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function logout(Request $request)
    {
        // Tidak perlu Auth::logout() karena kita tidak pakai Laravel Auth
        return response()->json(['success' => true], 200);
    }
}
