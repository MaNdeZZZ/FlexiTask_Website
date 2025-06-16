<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqChatController extends Controller
{
public function ask(Request $request)
{
    $userMessage = $request->input('message');
    $groqKey = env('GROQ_API_KEY');

    if (!$groqKey) {
        Log::error('GROQ_API_KEY not found in .env');
        return response()->json(['reply' => 'Server configuration error.'], 500);
    }

    try {
        $response = Http::withToken($groqKey)->post('https://api.groq.com/openai/v1/chat/completions', [
            'model' => 'llama3-70b-8192',
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful task assistant.'],
                ['role' => 'user', 'content' => $userMessage],
            ],
        ]);

        if ($response->failed()) {
            Log::error('Groq API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return response()->json(['reply' => '⚠️ Assistant service is currently unavailable.'], 500);
        }

        $json = $response->json();

        // ✅ Tambahkan log ini
        Log::debug('🔥 Full Groq Response:', ['groq_response' => $json]);

        if (!isset($json['choices'][0]['message']['content'])) {
            Log::warning('⚠️ Invalid Groq response structure', $json);
            return response()->json(['reply' => '⚠️ Invalid response format from assistant.'], 500);
        }

        return response()->json(['reply' => $json['choices'][0]['message']['content']]);

    } catch (\Throwable $e) {
        Log::error('❌ Exception during Groq chat', ['error' => $e->getMessage()]);
        return response()->json(['reply' => '⚠️ Unexpected server error.'], 500);
    }
}


}
