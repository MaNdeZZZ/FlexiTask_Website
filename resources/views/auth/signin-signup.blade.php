<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FlexiTask - Sign In or Sign Up</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Google Font - Lexend -->
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

    <!-- Custom CSS via Vite -->
    @vite('resources/css/signin-signup.css')
</head>
<body>
    <div class="decoration circle-1"></div>
    <div class="decoration circle-2"></div>
    <div class="decoration square"></div>
    <div class="decoration dot-pattern"></div>
    <div class="wave"></div>

    <div class="container py-5 main-content">
        <div class="row flex-grow-1">
            <div class="col-md-8 col-lg-6 mx-auto d-flex flex-column">
                <!-- Logo Section -->
                <div class="mt-4 flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                    <div class="logo-container">
                        <img src="{{ asset('images/logo_FLXT.png') }}" alt="FlexiTask Logo">
                    </div>
                    <p class="tagline">Turn Ideas Into Actions</p>
                </div>

                <!-- Buttons Section -->
                <div class="flex-grow-2 d-flex flex-column mt-5">
                    <a href="{{ url('/login') }}" class="btn btn-custom">
                        <i class="fas fa-sign-in-alt"></i>
                        Sign In
                    </a>

                    <a href="{{ url('/register') }}" class="btn btn-custom">
                        <i class="fas fa-user-plus"></i>
                        Sign Up
                    </a>
                </div>

                <!-- Footer -->
                <div class="flex-grow-1 d-flex align-items-end justify-content-center">
                    <p class="footer">© 2025 FlexiTask - All rights reserved</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
