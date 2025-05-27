<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up</title>

    <!-- Bootstrap & Fonts -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Custom CSS & JS via Vite -->
    @vite(['resources/css/register.css', 'resources/js/register.js'])
</head>
<body>
    <!-- Decorative Elements -->
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
                        <div class="mb-4">
                            <h2 class="header-text">Get Started</h2>
                            <p class="subtitle-text">Start making To-Do-List by Sign up!</p>
                        </div>
                        <div class="text-center mb-4">
                            <img src="{{ asset('images/1-support-team.svg') }}" alt="Register Image" class="forgot-password-image img-fluid">
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

                            <!-- Register Button -->
                            <div class="mb-3">
                                <button type="submit" class="register-btn">Register</button>
                            </div>

                            <!-- Google Sign-up Button -->
                            <div class="mb-3">
                                <button type="button" class="google-btn" onclick="handleGoogleSignUp()">
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

    <!-- Verification Sent Screen -->
    <div class="container mt-4 d-none" id="verificationSentScreen">
        <div class="row justify-content-center">
            <div class="col-md-8 form-container">
                <div class="card p-4 text-center">
                    <div class="card-body d-flex flex-column align-items-center">
                        <i class="bi bi-envelope-check text-success" style="font-size: 5rem;"></i>
                        <h2 class="my-3">Verify Your Email</h2>
                        <p class="text-secondary mb-3" aria-live="polite">
                            We've sent a verification link to <span id="emailDisplay"></span>.
                            Please check your inbox and follow the instructions to verify your account.
                        </p>
                        <p class="fw-medium mb-4">You won't be able to login until your email is verified.</p>
                        <div class="d-flex gap-3">
                            <button class="btn btn-outline-secondary py-2" onclick="resendVerificationEmail()">
                                <i class="bi bi-arrow-repeat me-2"></i>Resend Email
                            </button>
                            <button class="btn btn-success py-2" onclick="window.location.href='{{ url('/login') }}'">
                                Go to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
