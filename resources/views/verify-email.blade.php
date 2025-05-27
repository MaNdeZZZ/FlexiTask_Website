<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Email - FlexiTask</title>

    <!-- CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Custom CSS via Vite -->
    @vite(['resources/css/register.css', 'resources/js/verify-email.js'])
</head>
<body>
    <!-- Decorative elements -->
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

    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-8 form-container">

                <!-- Loading Screen -->
                <div class="card p-4 text-center" id="loadingScreen">
                    <div class="card-body d-flex flex-column align-items-center">
                        <div class="spinner-border text-success mb-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <h2 class="my-3">Verifying Your Email</h2>
                        <p class="text-secondary">Please wait while we verify your email address...</p>
                    </div>
                </div>

                <!-- Success Screen -->
                <div class="card p-4 text-center d-none" id="successScreen">
                    <div class="card-body d-flex flex-column align-items-center">
                        <i class="bi bi-check-circle-fill text-success" style="font-size: 5rem;"></i>
                        <h2 class="my-3">Email Verified!</h2>
                        <p class="text-secondary mb-4">Your email has been successfully verified. You can now login to your account.</p>
                        <button class="btn btn-success py-2 px-4" onclick="window.location.href='{{ url('/login') }}'">
                            Go to Login
                        </button>
                    </div>
                </div>

                <!-- Error Screen -->
                <div class="card p-4 text-center d-none" id="errorScreen">
                    <div class="card-body d-flex flex-column align-items-center">
                        <i class="bi bi-exclamation-circle-fill text-danger" style="font-size: 5rem;"></i>
                        <h2 class="my-3">Verification Failed</h2>
                        <p class="text-secondary mb-2" id="errorMessage">
                            The verification link is invalid or has expired.
                        </p>
                        <p class="mb-4">Please try registering again or contact support if the problem persists.</p>
                        <div class="d-flex gap-3">
                            <button class="btn btn-outline-secondary py-2" onclick="window.location.href='{{ url('/register') }}'">
                                Register Again
                            </button>
                            <button class="btn btn-primary py-2" onclick="window.location.href='{{ url('/login') }}'">
                                Go to Login
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Bootstrap Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
