<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password</title>

    <!-- CDN & Fonts -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600&display=swap" rel="stylesheet">

    <!-- Custom CSS via Vite -->
    @vite(['resources/css/forgot-password.css', 'resources/js/forgot-password.js'])
</head>
<body>

    <!-- Background decoration -->
    <div class="bg-decoration bg-shape-1"></div>
    <div class="bg-decoration bg-shape-2"></div>
    <div class="floating-element element-1"></div>
    <div class="floating-element element-2"></div>
    <div class="floating-element element-3"></div>

    <!-- Header -->
    <nav class="navbar navbar-light bg-transparent">
        <div class="container-fluid app-container">
            <div class="d-flex align-items-center">
                <button class="btn" onclick="window.history.back()">
                    <i class="bi bi-arrow-left fs-4"></i>
                </button>
                <h5 class="mb-0 ms-2 fw-bold">Forgot Password</h5>
            </div>
        </div>
    </nav>

    <!-- Main -->
    <div class="container app-container">

        <!-- Loading -->
        <div class="step card p-4" id="loadingStep">
            <div class="card-body d-flex flex-column align-items-center my-3">
                <div class="spinner-border text-primary mb-3" role="status"></div>
                <p>Processing your request...</p>
            </div>
        </div>

        <!-- Email Verification -->
        <div class="step active-step card p-4" id="emailVerificationStep">
            <div class="card-body p-0">
                <div class="row g-0">
                    <div class="col-md-5 left-column">
                        <img src="{{ asset('images/bored.svg') }}" alt="Forgot Password" class="forgot-password-image">
                        <h1 class="mb-0 fs-3 text-center">Reset Password</h1>
                    </div>
                    <div class="vertical-divider d-none d-md-block"></div>
                    <div class="col-md-6 right-column">
                        <p class="text-secondary mb-4">Enter your email address and we'll send you a link to reset your password.</p>
                        <form id="resetPasswordForm">
                            <div class="mb-3">
                                <label for="emailInput" class="form-label">Email address</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                                    <input type="email" class="form-control" id="emailInput" placeholder="Enter your email address" required>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-custom py-3 w-100 mt-4">Send Reset Link</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Email Sent -->
        <div class="step card p-4" id="emailSentStep">
            <div class="card-body d-flex flex-column align-items-center text-center">
                <i class="bi bi-envelope-check text-success" style="font-size: 5rem;"></i>
                <h2 class="my-3">Check Your Email</h2>
                <p class="text-secondary mb-3" aria-live="polite">We've sent a password reset link to your email address.</p>
                <button class="btn btn-custom py-3 w-100 mt-4" onclick="window.history.back()">Return to Login</button>
            </div>
        </div>

        <!-- Error -->
        <div class="step card p-4" id="errorStep">
            <div class="card-body d-flex flex-column align-items-center text-center">
                <i class="bi bi-exclamation-circle text-danger" style="font-size: 5rem;"></i>
                <h2 class="my-3">Error</h2>
                <p class="text-secondary mb-3" id="errorMessage" aria-live="polite">Something went wrong.</p>
                <button class="btn btn-custom py-3 w-100 mt-4" onclick="resetForm()">Try Again</button>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
