document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    
    // Validate parameters
    if (!token || !email) {
        showScreen('errorScreen');
        document.getElementById('errorMessage').textContent = 'Invalid verification link. Missing required parameters.';
        return;
    }
    
    // Attempt to verify the email
    verifyEmail(email, token);
});

// Show specific screen (loading, success, error)
function showScreen(screenId) {
    // Hide all screens
    document.getElementById('loadingScreen').classList.add('d-none');
    document.getElementById('successScreen').classList.add('d-none');
    document.getElementById('errorScreen').classList.add('d-none');
    
    // Show requested screen
    document.getElementById(screenId).classList.remove('d-none');
}

// Verify email with token
function verifyEmail(email, token) {
    // In a real application, this would make an API call to verify the token
    // For this demo, we'll use localStorage
    
    try {
        // Get users from localStorage
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Find the user with matching email
        const userIndex = users.findIndex(user => user.email === email);
        
        if (userIndex === -1) {
            throw new Error('User not found');
        }
        
        const user = users[userIndex];
        
        // Check if already verified
        if (user.verified) {
            showScreen('successScreen');
            return;
        }
        
        // Check token validity
        if (user.verificationToken !== token) {
            throw new Error('Invalid verification token');
        }
        
        // Check if token has expired
        if (user.verificationExpiry < Date.now()) {
            throw new Error('Verification link has expired');
        }
        
        // Mark as verified
        user.verified = true;
        
        // Clear verification data for security
        delete user.verificationToken;
        delete user.verificationExpiry;
        
        // Update user in storage
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Show success
        setTimeout(() => {
            showScreen('successScreen');
        }, 1500); // Show loading for a moment for better UX
        
    } catch (error) {
        console.error('Verification error:', error);
        document.getElementById('errorMessage').textContent = error.message || 'Verification failed';
        showScreen('errorScreen');
    }
}
