<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Assistant Chatbot</title>

    {{-- Lexend Font --}}
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600&display=swap" rel="stylesheet">

    {{-- Bootstrap & Icons --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">

    {{-- Custom CSS --}}
    @vite(['resources/css/chatbot.css', 'resources/js/chatbot.js'])

    <style>
        .chat-area {
            padding-bottom: 100px; /* ruang cukup di atas input dan navbar */
        }
        .input-area {
            bottom: 56px !important;
        }
    </style>

    {{-- Vite JS --}}
    @vite(['resources/css/chatbot.css', 'resources/js/chatbot.js'])
</head>
<body>
    <div class="main-container">
        <!-- Header -->
        <div class="header-section">
            <div class="d-flex justify-content-between align-items-center header-padding">
                <div class="d-flex align-items-center">
                    <img src="{{ asset('images/logo_FLXT.png') }}" alt="FlexiTask Logo" height="55" width="55">
                </div>
                <div>
                    <div class="profile-pic" onclick="window.location.href='{{ url('/profile') }}'">
                        <div id="profileImage" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"></div>
                    </div>
                </div>
            </div>
            <div class="chat-prompt">Ask anything regarding your task!</div>
            <hr class="m-0">
        </div>

        <!-- Chat -->
        <div class="chat-area" id="chat-area"></div>

        <!-- Input -->
        <div class="input-area d-flex align-items-center">
            <button class="circle-button me-2" id="new-chat">
                <i class="bi bi-plus-circle"></i>
            </button>
            <input type="text" class="form-control message-input flex-grow-1" id="message-input" placeholder="Ask about your tasks...">
            <button class="circle-button ms-2" id="send-button">
                <i class="bi bi-send"></i>
            </button>
        </div>
    </div>

    <!-- Bottom Nav -->
    <nav class="navbar fixed-bottom bg-white shadow-lg">
        <div class="container">
            <div class="row w-100">
                <div class="col-4 text-center">
                    <a href="{{ url('/chatbot') }}" class="bottom-nav-link active">
                        <i class="bi bi-robot"></i>
                        <span class="small">Assistant</span>
                    </a>
                </div>
                <div class="col-4 text-center">
                    <a href="{{ url('/dash2') }}" class="bottom-nav-link">
                        <i class="bi bi-house"></i>
                        <span class="small">Home</span>
                    </a>
                </div>
                <div class="col-4 text-center">
                    <a href="{{ url('/completed') }}" class="bottom-nav-link">
                        <i class="bi bi-check-circle"></i>
                        <span class="small">Completed</span>
                    </a>
                </div>
            </div>
        </div>
    </nav>

    {{-- Bootstrap JS --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
