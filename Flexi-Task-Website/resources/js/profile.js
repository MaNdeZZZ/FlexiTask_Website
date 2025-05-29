// Variables
let isEditing = false;
let nameField = null;
let imageModal = null;
let logoutModal = null;

// Initialize the page and components
document.addEventListener('DOMContentLoaded', function() {
    console.log("Profile page loaded");
    
    // Initialize fields
    nameField = document.getElementById('nameField');
    
    // Initialize modals
    initializeModals();
    
    // Load user data
    loadUserData();
    
    // Set up event listeners
    setupEventListeners();
});

// Initialize Bootstrap modals
function initializeModals() {
    console.log("Initializing modals");
    try {
        const imageModalElement = document.getElementById('imageModal');
        const logoutModalElement = document.getElementById('logoutModal');
        
        if (imageModalElement) {
            imageModal = new bootstrap.Modal(imageModalElement);
            console.log("Image modal initialized");
        } else {
            console.error("Image modal element not found");
        }
        
        if (logoutModalElement) {
            logoutModal = new bootstrap.Modal(logoutModalElement);
            console.log("Logout modal initialized");
        } else {
            console.error("Logout modal element not found");
        }
    } catch (error) {
        console.error("Error initializing modals:", error);
    }
}

// Set up event listeners
function setupEventListeners() {
    console.log("Setting up event listeners");
    
    // Confirm logout button
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', performLogout);
        console.log("Logout confirmation button listener attached");
    } else {
        console.error("Logout confirmation button not found");
    }
    
    // Edit name icon
    const editNameIcon = document.querySelector('.edit-icon');
    if (editNameIcon) {
        editNameIcon.addEventListener('click', toggleEditMode);
        console.log("Edit name icon listener attached");
    } else {
        console.error("Edit name icon not found");
    }
    
    // Edit picture button - Direct event instead of using onclick attribute
    const editPictureBtn = document.querySelector('.edit-picture-btn');
    if (editPictureBtn) {
        editPictureBtn.addEventListener('click', function() {
            showImageOptions();
        });
        console.log("Edit picture button listener attached");
    } else {
        console.error("Edit picture button not found");
    }
    
    // Change password button
    const changePasswordBtn = document.querySelector('.action-button:not(.destructive)');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', changePassword);
        console.log("Change password button listener attached");
    } else {
        console.error("Change password button not found");
    }
    
    // Logout button
    const logoutBtn = document.querySelector('.action-button.destructive');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
        console.log("Logout button listener attached");
    } else {
        console.error("Logout button not found");
    }
    
    // Add direct event handlers for image selection buttons in the modal
    const cameraBtn = document.querySelector('.list-group-item:nth-child(1)');
    const galleryBtn = document.querySelector('.list-group-item:nth-child(2)');
    
    if (cameraBtn) {
        cameraBtn.addEventListener('click', function() {
            console.log("Camera button clicked");
            selectImage('camera');
        });
    }
    
    if (galleryBtn) {
        galleryBtn.addEventListener('click', function() {
            console.log("Gallery button clicked");
            selectImage('gallery');
        });
    }
    
    // Name field blur event (save when focus is lost)
    if (nameField) {
        nameField.addEventListener('blur', function() {
            if (isEditing) {
                toggleEditMode(); // This will save the name
            }
        });
    }
}

// Get user initials for default profile image
function getUserInitials(username) {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
}

// Update profile image display
function updateProfileImageDisplay(imageUrl) {
    console.log("Updating profile image display:", imageUrl ? "Has image" : "No image");
    
    const profileImage = document.getElementById('profileImage');
    const defaultProfileImage = document.getElementById('defaultProfileImage');
    
    if (!profileImage || !defaultProfileImage) {
        console.error("Profile image elements not found");
        return;
    }
    
    const currentUser = getCurrentUser();
    
    if (imageUrl) {
        // Show actual image
        profileImage.src = imageUrl;
        profileImage.style.display = 'block';
        defaultProfileImage.style.display = 'none';
    } else {
        // Show default image with initials
        profileImage.style.display = 'none';
        defaultProfileImage.style.display = 'flex';
        
        // Set initials
        const initialsSpan = defaultProfileImage.querySelector('.default-profile-initials');
        if (initialsSpan) {
            initialsSpan.textContent = getUserInitials(currentUser?.username || currentUser?.name);
        }
    }
}

// Toggle edit mode
function toggleEditMode() {
    console.log("Toggling edit mode");
    
    if (!nameField) {
        nameField = document.getElementById('nameField');
        if (!nameField) {
            console.error("Name field not found");
            return;
        }
    }
    
    isEditing = !isEditing;
    
    if (isEditing) {
        // Enable editing
        nameField.disabled = false;
        nameField.focus();
        console.log("Edit mode enabled");
    } else {
        // Disable editing and save
        nameField.disabled = true;
        saveName();
        console.log("Edit mode disabled, name saved");
    }
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

// Update current user
function updateCurrentUser(updatedUser) {
    console.log("Updating current user data");
    
    // Save to currentUser
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === updatedUser.email);
    
    if (userIndex >= 0) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Save name
function saveName() {
    if (!nameField) {
        nameField = document.getElementById('nameField');
        if (!nameField) {
            console.error("Name field not found");
            return;
        }
    }
    
    const name = nameField.value.trim();
    console.log("Saving name:", name);
    
    if (name) {
        const currentUser = getCurrentUser();
        if (currentUser) {
            currentUser.username = name;
            updateCurrentUser(currentUser);
            
            // Update default profile image initials
            const initialsSpan = document.querySelector('.default-profile-initials');
            if (initialsSpan) {
                initialsSpan.textContent = getUserInitials(name);
            }
            
            // Update profile image in dashboard and other places
            setupProfileImage();
            
            showToast('Name updated successfully');
        }
    }
}

// Show image selection options
function showImageOptions() {
    console.log("Showing image options");
    
    if (!imageModal) {
        // Try to reinitialize the modal
        try {
            const imageModalElement = document.getElementById('imageModal');
            if (imageModalElement) {
                imageModal = new bootstrap.Modal(imageModalElement);
                console.log("Image modal reinitialized");
            }
        } catch (error) {
            console.error("Error reinitializing image modal:", error);
        }
    }
    
    if (imageModal) {
        imageModal.show();
        console.log("Image modal shown");
    } else {
        console.error("Image modal not initialized");
        alert("Could not open image selection. Please try again.");
    }
}

// Handle image selection
function selectImage(source) {
    console.log("selectImage function called with source:", source);
    
    if (imageModal) {
        imageModal.hide();
        console.log("Image modal hidden");
    }
    
    if (source === 'gallery') {
        console.log("Opening file picker for gallery option");
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        // Set up event handler for when a file is selected
        fileInput.addEventListener('change', function(event) {
            console.log("File selected:", event.target.files.length > 0);
            const file = event.target.files[0];
            if (file) {
                processSelectedImage(file);
            }
        });
        
        // Trigger file selection dialog
        fileInput.click();
    } else if (source === 'camera') {
        console.log("Attempting to access camera");
        // Check if camera is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("Camera access not supported in this browser");
            showToast("Camera access is not supported in your browser");
            return;
        }
        
        // Create a camera UI container
        createCameraUI();
    }
}

// Process a selected image file
function processSelectedImage(file) {
    console.log("Processing selected image:", file.name);
    
    if (!file || !file.type.startsWith('image/')) {
        showToast("Please select a valid image file");
        return;
    }
    
    // Create a FileReader to read the image
    const reader = new FileReader();
    
    // Set up the FileReader onload event
    reader.onload = function(e) {
        const imageData = e.target.result;
        console.log("Image successfully loaded");
        saveProfileImage(imageData);
    };
    
    // Handle errors
    reader.onerror = function() {
        console.error("FileReader error:", reader.error);
        showToast("Error processing image file");
    };
    
    // Read the file as a data URL
    reader.readAsDataURL(file);
}

// Save profile image to user data
function saveProfileImage(imageData) {
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast("User not found");
        return;
    }
    
    // Save image to user profile
    currentUser.profileImage = imageData;
    updateCurrentUser(currentUser);
    
    // Update UI
    updateProfileImageDisplay(imageData);
    setupProfileImage();
    
    // Show success message
    showToast("Profile picture updated successfully");
}

// Create camera UI for taking a photo
function createCameraUI() {
    // Create a modal for the camera
    const cameraModal = document.createElement('div');
    cameraModal.className = 'modal fade';
    cameraModal.id = 'cameraModal';
    cameraModal.setAttribute('tabindex', '-1');
    cameraModal.setAttribute('aria-hidden', 'true');
    
    // Create camera modal content
    cameraModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Take a Photo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <div class="camera-container position-relative">
                        <video id="camera-preview" autoplay playsinline style="width: 100%; max-height: 300px; background: #000; border-radius: 8px;"></video>
                        <canvas id="camera-canvas" style="display: none; width: 100%; max-height: 300px; border-radius: 8px;"></canvas>
                        <div id="camera-overlay" class="position-absolute top-50 start-50 translate-middle" style="display: none; color: white; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px;">
                            <span>Photo Captured!</span>
                        </div>
                    </div>
                    <div class="mt-3 d-flex justify-content-center">
                        <button id="capture-btn" class="btn btn-primary me-2">
                            <i class="fas fa-camera me-1"></i> Capture
                        </button>
                        <button id="retry-btn" class="btn btn-secondary me-2" style="display: none;">
                            <i class="fas fa-redo me-1"></i> Retry
                        </button>
                        <button id="save-photo-btn" class="btn btn-success" style="display: none;">
                            <i class="fas fa-check me-1"></i> Use Photo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add the camera modal to the body
    document.body.appendChild(cameraModal);
    
    // Initialize the modal
    const bsModal = new bootstrap.Modal(cameraModal);
    bsModal.show();
    
    // Camera stream variable
    let stream = null;
    
    // Start the camera when the modal is shown
    cameraModal.addEventListener('shown.bs.modal', function() {
        startCamera();
    });
    
    // Clean up when the modal is hidden
    cameraModal.addEventListener('hidden.bs.modal', function() {
        stopCamera();
        cameraModal.remove();
    });
    
    // Function to start the camera
    function startCamera() {
        const video = document.getElementById('camera-preview');
        
        // Request camera access with preferred settings
        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user', // Use front camera if available
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        })
        .then(function(mediaStream) {
            stream = mediaStream;
            video.srcObject = mediaStream;
            video.play();
        })
        .catch(function(error) {
            showToast("Error accessing camera: " + error.message);
            bsModal.hide();
        });
    }
    
    // Function to stop the camera
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }
    
    // Set up capture button
    const captureBtn = document.getElementById('capture-btn');
    const retryBtn = document.getElementById('retry-btn');
    const savePhotoBtn = document.getElementById('save-photo-btn');
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    const overlay = document.getElementById('camera-overlay');
    
    captureBtn.addEventListener('click', function() {
        // Draw the current video frame to the canvas
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame onto the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Hide video and capture button, show canvas and save/retry buttons
        video.style.display = 'none';
        captureBtn.style.display = 'none';
        canvas.style.display = 'block';
        retryBtn.style.display = 'inline-block';
        savePhotoBtn.style.display = 'inline-block';
        
        // Show overlay briefly
        overlay.style.display = 'block';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 1000);
    });
    
    retryBtn.addEventListener('click', function() {
        // Hide canvas and save/retry buttons, show video and capture button
        video.style.display = 'block';
        captureBtn.style.display = 'inline-block';
        canvas.style.display = 'none';
        retryBtn.style.display = 'none';
        savePhotoBtn.style.display = 'none';
    });
    
    savePhotoBtn.addEventListener('click', function() {
        // Get the image data from the canvas
        const imageData = canvas.toDataURL('image/jpeg');
        
        // First stop the camera stream to release the device
        stopCamera();
        
        // Hide the modal immediately
        bsModal.hide();
        
        // Remove the modal from the DOM
        setTimeout(() => {
            if (document.body.contains(cameraModal)) {
                document.body.removeChild(cameraModal);
            }
        }, 300);
        
        // Save the image after modal is hidden to prevent UI freezing
        setTimeout(() => {
            saveProfileImage(imageData);
        }, 100);
    });
}

// Replace the changePassword function to redirect to reset-password page
function changePassword() {
    console.log("Redirecting to password reset page");
    window.location.href = '/reset-password';
}

// Logout function
function logout() {
    console.log("Opening logout confirmation");
    
    if (!logoutModal) {
        // Try to reinitialize the modal
        try {
            const logoutModalElement = document.getElementById('logoutModal');
            if (logoutModalElement) {
                logoutModal = new bootstrap.Modal(logoutModalElement);
            }
        } catch (error) {
            console.error("Error reinitializing logout modal:", error);
        }
    }
    
    // Show the modal
    if (logoutModal) {
        logoutModal.show();
    } else {
        console.error("Logout modal not initialized");
        
        // Fallback direct confirmation
        if (confirm('Are you sure you want to log out?')) {
            performLogout();
        }
    }
}

// Perform actual logout
function performLogout() {
    console.log("Performing logout");
    
    // Clear current user
    localStorage.removeItem('currentUser');
    
    // Clear remember me if set
    if (localStorage.getItem('rememberMe') === 'true') {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('email');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMeExpiry');
    }
    
    // Hide modal if it exists
    if (logoutModal) {
        logoutModal.hide();
    }
    
    // Redirect to login page - using Laravel route
    window.location.href = '/login';
}

// Show toast message
function showToast(message) {
    console.log("Showing toast:", message);
    
    // Try to use Bootstrap toast if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
        // Create a toast container if it doesn't exist
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
            toastContainer.style.zIndex = '11';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        // Add toast to container
        toastContainer.innerHTML += toastHtml;
        
        // Initialize and show toast
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
        toast.show();
        
        // Remove toast after it's hidden
        toastElement.addEventListener('hidden.bs.toast', function() {
            this.remove();
        });
    } else {
        // Fallback to alert
        alert(message);
    }
}

// Load saved user data
function loadUserData() {
    console.log("Loading user data");
    
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        // Set user email in the form
        const emailField = document.querySelector('input[type="email"]');
        if (emailField) {
            emailField.value = currentUser.email || '';
        }
        
        // Set username
        if (!nameField) {
            nameField = document.getElementById('nameField');
        }
        if (nameField) {
            nameField.value = currentUser.username || currentUser.name || '';
        }
        
        // Set profile image
        updateProfileImageDisplay(currentUser.profileImage);
    } else {
        console.warn("No user data found, redirecting to login");
        // No user logged in, redirect to login
        window.location.href = '/login';
    }
}

// For Laravel CSRF token handling
function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

// Go back function
function goBack() {
    window.history.back();
}