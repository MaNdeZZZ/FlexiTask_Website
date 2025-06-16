<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change Password</title>

    <!-- CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Custom Styles via Vite -->
    @vite(['resources/css/reset-password.css', 'resources/js/reset-password.js'])
</head>
<body>
    <!-- Decorative circles -->
    <div class="decorative-circle circle-1"></div>
    <div class="decorative-circle circle-2"></div>
    <div class="decorative-circle circle-3"></div>

    <!-- Header -->
    <nav class="navbar navbar-light bg-transparent">
        <div class="container-fluid app-container">
            <div class="d-flex align-items-center">
                <button class="btn" onclick="window.location.href='/profile'">
                    <i class="bi bi-arrow-left fs-4"></i>
                </button>
                <h5 class="mb-0 ms-2 fw-bold">Change Password</h5>
            </div>
        </div>
    </nav>

    

    <!-- Main content -->
    <div class="container app-container">
        <!-- Loading -->
        <div id="loading-screen" class="text-center spinner-container d-none d-flex flex-column align-items-center justify-content-center" aria-live="polite">
            <div class="spinner-border mb-3" role="status"><span class="visually-hidden">Loading...</span></div>
            <p>Processing your request...</p>
        </div>

        <!-- Reset Form -->
        <div id="reset-form" class="card p-4">
            <div class="card-body">
                <h1 class="mb-2 fs-3">Change Your Password</h1>
                <p class="text-secondary mb-4">Enter your email and new password. A verification link will be sent to your email.</p>
                
                <form id="password-reset-form" novalidate>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email Address</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                            <input type="email" class="form-control" id="email" placeholder="Enter your email address" required>
                        </div>
                        <div class="invalid-feedback">Please enter a valid email address.</div>
                    </div>

                    <div class="mb-3">
                        <label for="new-password" class="form-label">New Password</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-lock"></i></span>
                            <input type="password" class="form-control" id="new-password" placeholder="Enter your new password" required>
                        </div>
                        <div class="invalid-feedback">Password is required.</div>
                    </div>

                    <div class="mb-4">
                        <label for="confirm-password" class="form-label">Confirm New Password</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-lock"></i></span>
                            <input type="password" class="form-control" id="confirm-password" placeholder="Confirm your new password" required>
                        </div>
                        <div class="invalid-feedback">Passwords do not match.</div>
                    </div>

                    <button type="submit" class="btn btn-custom py-3 w-100 mt-4">Send Verification Link</button>
                </form>
            </div>
        </div>

        <!-- Verification Sent -->
        <div id="verification-sent" class="card p-4 text-center d-none" aria-live="polite">
            <div class="card-body d-flex flex-column align-items-center">
                <i class="bi bi-envelope-check text-success" style="font-size: 5rem;"></i>
                <h2 class="my-3">Verification Email Sent!</h2>
                <p class="text-secondary mb-3">We've sent a verification link to <span id="email-display"></span>.</p>
                <p class="fw-medium mb-4">Once verified, you can use your new password to sign in.</p>
                <button class="btn btn-custom py-3 w-100 mt-4" onclick="goBack()">Back to Profile</button>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
