// Function to go back to previous page
function goBack() {
    window.history.back();
}

// Function to handle Google Sign-Up
function handleGoogleSignUp() {
    // This would be implemented with Google OAuth
    alert('Google sign-up functionality would be implemented here');
}

// Extract username from email
function extractUsernameFromEmail(email) {
    if (email.includes('@')) {
        return email.split('@')[0];
    }
    return email;
}

// Check if user email already exists
function isEmailRegistered(email) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.some(user => user.email === email);
}

// Generate a verification token
function generateVerificationToken() {
    const tokenLength = 64;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    for (let i = 0; i < tokenLength; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return token;
}

// Show verification sent screen
function showVerificationSentScreen(email) {
    // Hide registration form
    document.getElementById('registerForm').closest('.container').classList.add('d-none');
    
    // Update email display
    document.getElementById('emailDisplay').textContent = email;
    
    // Show verification screen
    document.getElementById('verificationSentScreen').classList.remove('d-none');
}

// Save user data to localStorage with verification status
function saveUser(email, password, username) {
    // Get existing users or initialize empty array
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    const existingUserIndex = users.findIndex(user => user.email === email);
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
    
    // Create user object
    const user = {
        email: email,
        password: password,
        username: username,
        profileImage: null,
        tasks: [], // Initialize empty task list for new users
        verified: false,
        verificationToken: verificationToken,
        verificationExpiry: tokenExpiry
    };
    
    // Update or add user
    if (existingUserIndex >= 0) {
        users[existingUserIndex] = user;
    } else {
        users.push(user);
    }
    
    // Save back to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    return verificationToken;
}

// Simulated function to send verification email
function sendVerificationEmail(email, token) {
    console.log('Verification link would be sent to:', email);
    console.log('Verification link:', `${window.location.origin}/verify-email.html?token=${token}&email=${encodeURIComponent(email)}`);
    
    // In a real app, this would make an API call to send an email
    // For this demo, we'll just simulate success
    return true;
}

// Resend verification email
function resendVerificationEmail() {
    const email = document.getElementById('emailDisplay').textContent;
    if (!email) return;
    
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (user && !user.verified) {
        // Generate new token
        const newToken = generateVerificationToken();
        user.verificationToken = newToken;
        user.verificationExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
        
        // Update user
        localStorage.setItem('users', JSON.stringify(users));
        
        // Send new verification email
        if (sendVerificationEmail(email, newToken)) {
            alert('A new verification email has been sent.');
        } else {
            alert('Failed to send verification email. Please try again later.');
        }
    }
}

// Make function available globally
window.resendVerificationEmail = resendVerificationEmail;

// Validate password strength
function validatePassword(password) {
    let hasUppercase = /[A-Z]/.test(password);
    let hasDigit = /[0-9]/.test(password);

    if (!hasUppercase && !hasDigit) {
        return 'Password must contain at least one uppercase letter and one number';
    } else if (!hasUppercase) {
        return 'Password must contain at least one uppercase letter';
    } else if (!hasDigit) {
        return 'Password must contain at least one number';
    }
    return '';
}

// Form submission
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const verifyPassword = document.getElementById('verifyPasswordInput').value;
    
    // Basic validation
    if (!email || !password || !verifyPassword) {
        alert('Please fill all fields');
        return;
    }

    if (password !== verifyPassword) {
        alert('Passwords do not match');
        return;
    }

    // Validate password strength
    const passwordValidationResult = validatePassword(password);
    if (passwordValidationResult) {
        alert(passwordValidationResult);
        return;
    }

    // Check if email already registered
    if (isEmailRegistered(email)) {
        alert('This email is already registered. Please use a different email or login.');
        return;
    }

    // Extract username from email
    const extractedUsername = extractUsernameFromEmail(email);
    
    // Save user data with verification token
    const verificationToken = saveUser(email, password, extractedUsername);
    
    // Send verification email
    if (sendVerificationEmail(email, verificationToken)) {
        // Show verification sent screen
        showVerificationSentScreen(email);
    } else {
        alert('Failed to send verification email. Please try again.');
    }
});