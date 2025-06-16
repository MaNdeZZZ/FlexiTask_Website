<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up</title>
 
    <!-- Bootstrap & Font -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">

    <!-- Custom CSS via Vite -->
    @vite('resources/css/register.css')
    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>

    <script>
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
    <!-- Background Decoration -->
    <div class="bg-shape bg-shape-top"></div>
    <div class="bg-shape bg-shape-bottom"></div>
    <div class="floating-dot dot-1"></div>
    <div class="floating-dot dot-2"></div>
    <div class="floating-dot dot-3"></div>
    <div class="floating-dot dot-4"></div>
    <div class="floating-dot dot-5"></div>
    <div class="floating-dot dot-6"></div>
    <div class="decorative-ring ring-1"></div>
    <div class="decorative-ring ring-2"></div>

    <div class="container mt-4">
        <!-- App Bar -->
        <nav class="navbar navbar-light bg-transparent">
            <div class="container-fluid">
                <div class="d-flex align-items-center">
                    <a href="{{ url('/signin-signup') }}" class="btn">
                        <i class="bi bi-arrow-left"></i>
                    </a>
                    <h1 class="navbar-brand mb-0 h1 fw-bold">Sign Up</h1>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="row justify-content-center">
            <div class="col-md-10 form-container">
                <div class="row">
                    <!-- Left Column -->
                    <div class="col-md-5 d-flex flex-column justify-content-center">
                        <h2 class="header-text">Get Started</h2>
                        <p class="subtitle-text">Start making To-Do-List by Sign up!</p>
                        <div class="text-center mb-4">
                            <img src="{{ asset('images/1-support-team.svg') }}" alt="Support" class="forgot-password-image img-fluid">
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div class="col-md-7 d-flex flex-column justify-content-center">
                        <form id="registerForm" style="margin-top: 10rem;">
                            <div class="mb-3 input-icon-wrapper">
                                <span class="input-icon"><i class="bi bi-envelope"></i></span>
                                <input type="email" class="form-control" id="emailInput" placeholder="Enter your email" required>
                            </div>

                            <div class="mb-3 input-icon-wrapper">
                                <span class="input-icon"><i class="bi bi-lock"></i></span>
                                <input type="password" class="form-control" id="passwordInput" placeholder="Enter your password" required>
                            </div>

                            <div class="mb-3 input-icon-wrapper">
                                <span class="input-icon"><i class="bi bi-lock"></i></span>
                                <input type="password" class="form-control" id="verifyPasswordInput" placeholder="Verify your password" required>
                            </div>

                            <div class="mb-3">
                                <button type="submit" class="register-btn">Register</button>
                            </div>

                            <div class="mb-3">
                                <button type="button" class="btn-google">
                                    <img src="{{ asset('images/Logo Google.svg') }}" alt="Google" class="google-logo">
                                    Sign up with Google
                                </button>

                            </div>
                        </form>
                    </div>
                </div>          
            </div>
        </div>
    </div>

    <!-- JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    @vite('resources/js/register.js')
</body>
</html>
