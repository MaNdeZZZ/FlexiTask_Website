// Variables
let isEditing = false;
const nameField = document.getElementById('nameField');
const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));

// Get user initials for default profile image
function getUserInitials(username) {
    if (!username) return '?';
    return username.charAt(0);
}

// Update profile image display
function updateProfileImageDisplay(imageUrl) {
    const profileImage = document.getElementById('profileImage');
    const defaultProfileImage = document.getElementById('defaultProfileImage');
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
            initialsSpan.textContent = getUserInitials(currentUser?.username);
        }
    }
}

// Toggle edit mode
function toggleEditMode() {
    isEditing = !isEditing;
    
    if (isEditing) {
        nameField.disabled = false;
        nameField.focus();
    } else {
        nameField.disabled = true;
        saveName();
    }
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

// Update current user
function updateCurrentUser(updatedUser) {
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
    const name = nameField.value.trim();
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
            
            showToast('Name updated successfully');
        }
    }
}

// Show image selection options
function showImageOptions() {
    imageModal.show();
}

// Handle image selection
function selectImage(source) {
    imageModal.hide();
    
    // In a web app, we would usually show a file picker
    if (source === 'gallery') {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = e.target.result;
                    
                    // Save image to current user
                    const currentUser = getCurrentUser();
                    if (currentUser) {
                        currentUser.profileImage = imageData;
                        updateCurrentUser(currentUser);
                        
                        // Update display
                        updateProfileImageDisplay(imageData);
                        showToast('Profile picture updated');
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click();
    } else {
        // For camera, we'd use MediaDevices API in a real app
        alert('Camera functionality requires secure context (HTTPS) and user permission');
    }
}

// Change password
function changePassword() {
    // Navigate to reset password page
    window.location.href = 'reset-password.html';
}

// Logout function
function logout() {
    logoutModal.show();
    
    // Set up the confirm button action
    document.getElementById('confirmLogoutBtn').onclick = function() {
        // Clear current user
        localStorage.removeItem('currentUser');
        
        // Clear remember me if set
        if (localStorage.getItem('rememberMe') === 'true') {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('email');
            localStorage.removeItem('password');
            localStorage.removeItem('rememberMeExpiry');
        }
        
        // Redirect to login page
        window.location.href = 'login.html';
    };
}

// Go back function
function goBack() {
    window.history.back();
}

// Show toast message
function showToast(message) {
    alert(message); // Simple alert for now, can be replaced with a proper toast
}

// Load saved data when page loads
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        // Set user email in the form
        const emailField = document.querySelector('input[type="email"]');
        if (emailField) {
            emailField.value = currentUser.email || '';
        }
        
        // Set username
        if (currentUser.username) {
            nameField.value = currentUser.username;
        }
        
        // Set profile image
        updateProfileImageDisplay(currentUser.profileImage);
    } else {
        // No user logged in, redirect to login
        window.location.href = 'login.html';
    }
});