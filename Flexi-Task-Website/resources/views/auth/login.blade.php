<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In</title>
    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>

    <!-- Bootstrap & Fonts -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">

    <!-- Custom CSS -->
    @vite('resources/css/login.css')
    <!-- Firebase App (core SDK) -->
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
<!-- Firebase Auth -->
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>

<script>
    // Firebase config dari Firebase Console (Project Settings > General)
    const firebaseConfig = {
            apiKey: "AIzaSyDAhcqyzf8x1FXd0Zqka12t_NQaoCEWD44",
            authDomain: "flexi-task-5d512.firebaseapp.com",
            projectId: "flexi-task-5d512",
            appId: "1:161145697554:web:23d9c0c67426e92a97afcb",
    };

    firebase.initializeApp(firebaseConfig);
</script>

</head>
<body>
    <!-- Decorative Background -->
    <div class="decoration decoration-blob"></div>
    <div class="floating-circle circle-1"></div>
    <div class="floating-circle circle-2"></div>
    <div class="floating-circle circle-3"></div>
    <div class="floating-circle circle-4"></div>

    <div class="container mt-4">
        <!-- App Bar -->
        <nav class="navbar navbar-light bg-transparent">
            <div class="container-fluid">
                <div class="d-flex align-items-center">
                    <a href="{{ url('/signin-signup') }}" class="btn">
                        <i class="bi bi-arrow-left"></i>
                    </a>
                    <h1 class="navbar-brand mb-0 h1 fw-bold">Sign In</h1>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="container custom-container my-4">
            <div class="row">
                <!-- Left Column -->
                <div class="col-md-5 d-flex flex-column justify-content-center">
                    <h1 class="fw-bold fs-1">Welcome Back</h1>
                    <p class="text-secondary mb-4">Hey! Good to see you back</p>
                    <div class="text-center">
                        <img src="{{ asset('images/young.svg') }}" alt="Welcome" class="forgot-password-image img-fluid">
                    </div>
                </div>

                <!-- Right Column -->
                <div class="col-md-7 d-flex flex-column justify-content-center">
                    <form id="loginForm" style="margin-top: 10rem;">
                        <div class="mb-4">
                            <div class="input-group">
                                <span class="input-group-text bg-white">
                                    <i class="bi bi-envelope"></i>
                                </span>
                                <input type="email" class="form-control py-2" id="email" placeholder="Enter your email" required>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="input-group">
                                <span class="input-group-text bg-white">
                                    <i class="bi bi-lock"></i>
                                </span>
                                <input type="password" class="form-control py-2" id="password" placeholder="Enter your password" required>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between mb-4">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="rememberMe">
                                <label class="form-check-label" for="rememberMe">
                                    Remember me
                                </label>
                            </div>
                            <div>
                                <a href="#" class="text-secondary text-decoration-none">Forgot Password?</a>
                            </div>
                        </div>

                        <div class="mb-3">
                            <button type="submit" class="btn btn-login w-100 py-2 rounded-3 shadow-sm">Login</button>
                        </div>

                        <div>
                            <button type="button" class="btn btn-google w-100 py-2 rounded-3 shadow-sm">
                                <div class="d-flex align-items-center justify-content-center">
                                    <img src="{{ asset('images/Logo Google.svg') }}" alt="Google" height="24">
                                    <span class="ms-3">Sign in with Google</span>
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    @vite('resources/js/login.js')
</body>
</html>
