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

// Save user data to localStorage
function saveUser(email, password, username) {
    // Get existing users or initialize empty array
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    const existingUserIndex = users.findIndex(user => user.email === email);
    
    // Create user object
    const user = {
        email: email,
        password: password,
        username: username,
        profileImage: null,
        tasks: [] // Initialize empty task list for new users
    };
    
    // Update or add user
    if (existingUserIndex >= 0) {
        users[existingUserIndex] = user;
    } else {
        users.push(user);
    }
    
    // Save back to localStorage
    localStorage.setItem('users', JSON.stringify(users));
}

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
    
    // Save user data
    saveUser(email, password, extractedUsername);
    
    alert(`Registration successful! Welcome, ${extractedUsername}!`);
    
    // Redirect to login page
    window.location.href = "login.html";
});