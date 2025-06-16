<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Font - Lexend -->
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <!-- Custom Styles via Vite -->
    @vite(['resources/css/profile.css', 'resources/js/profile.js'])
</head>
<body>
    <div class="container-fluid p-0">
        <div class="profile-container">
            <!-- Header with back button and title -->
            <div class="profile-header d-flex align-items-center">
                <button class="btn p-0 me-3" onclick="window.location.href='/dash2'">
                    <i class="bi bi-arrow-left"></i>
                </button>
                <h5 class="mb-0 fw-bold">Profile</h5>
            </div>
            
            <!-- Main content -->
            <div class="px-4 pb-4">
                <!-- Profile picture section -->
                <div class="text-center mb-4">
                    <div class="profile-picture-container">
                        <div id="profileImageContainer" class="profile-picture">
                            <img id="profileImage" src="assets/images/logo.png" alt="Profile Picture" class="profile-picture" style="display: none;">
                            <div id="defaultProfileImage" class="default-profile-container">
                                <span class="default-profile-initials">?</span>
                            </div>
                        </div>
                        <div class="edit-picture-btn" onclick="showImageOptions()">
                            <i class="fas fa-camera"></i>
                        </div>
                    </div>
                </div>
                
                <!-- Personal Information section -->
                <div class="section-header">
                    <h5 class="fw-bold">Personal Information</h5>
                    <div class="edit-icon" onclick="toggleEditMode()">
                        <i class="fas fa-edit"></i>
                    </div>
                </div>
                
                <!-- Name field -->
                <div class="form-field">
                    <div class="input-group">
                        <span class="input-group-text border-0 bg-transparent">
                            <i class="fas fa-user"></i>
                        </span>
                        <input type="text" id="nameField" class="form-control border-0" value="John Doe" placeholder="Name" disabled>
                    </div>
                </div>
                
                <!-- Email field (non-editable) -->
                <div class="form-field disabled">
                    <div class="input-group">
                        <span class="input-group-text border-0 bg-transparent">
                            <i class="fas fa-envelope"></i>
                        </span>
                        <input type="email" class="form-control border-0" value="john.doe@example.com" placeholder="Email (Non-editable)" disabled>
                    </div>
                </div>
                
                <!-- Account section -->
                <h5 class="fw-bold mt-4 mb-3">Account</h5>
                
                <!-- Change Password button -->
                <div class="action-button" onclick="changePassword()">
                    <i class="fas fa-lock me-3"></i>
                    <span>Change Password</span>
                    <i class="fas fa-chevron-right ms-auto"></i>
                </div>
                
                <!-- Logout button -->
                <div class="action-button destructive" onclick="logout()">
                    <i class="fas fa-sign-out-alt me-3"></i>
                    <span>Log Out</span>
                    <i class="fas fa-chevron-right ms-auto"></i>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Image selection modal -->
    <div class="modal fade" id="imageModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Select Profile Picture</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="list-group">
                        <button class="list-group-item list-group-item-action" onclick="selectImage('camera')">
                            <i class="fas fa-camera me-3"></i> Take a photo
                        </button>
                        <button class="list-group-item list-group-item-action" onclick="selectImage('gallery')">
                            <i class="fas fa-images me-3"></i> Choose from gallery
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Logout confirmation modal -->
    <div class="modal fade" id="logoutModal" tabindex="-1" aria-labelledby="logoutModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="logoutModalLabel">Confirm Logout</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to log out?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmLogoutBtn">Logout</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS and Popper.js -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/profile.js"></script>
</body>
</html>