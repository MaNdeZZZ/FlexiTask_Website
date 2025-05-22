class AuthService {
    // Check if remember me credentials exist and are still valid
    static async hasValidRememberMeCredentials() {
        const rememberMe = localStorage.getItem('rememberMe') === 'true';

        if (!rememberMe) {
            return false;
        }

        // Check expiration
        const expiryTime = parseInt(localStorage.getItem('rememberMeExpiry') || '0');
        if (!expiryTime) {
            return false;
        }

        const now = Date.now();
        if (now > expiryTime) {
            // Clear expired credentials
            localStorage.setItem('rememberMe', 'false');
            localStorage.removeItem('email');
            localStorage.removeItem('password');
            localStorage.removeItem('rememberMeExpiry');
            return false;
        }

        // Make sure we have the required credentials
        const email = localStorage.getItem('email');
        const password = localStorage.getItem('password');
        return email && email.length > 0 && password && password.length > 0;
    }

    // Get saved email
    static getSavedEmail() {
        return localStorage.getItem('email');
    }

    // Get saved password
    static getSavedPassword() {
        return localStorage.getItem('password');
    }
    
    // Save credentials with remember me
    static saveCredentials(email, password, rememberMe) {
        if (rememberMe) {
            // Set expiry for 30 days
            const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('email', email);
            localStorage.setItem('password', password);
            localStorage.setItem('rememberMeExpiry', expiryTime.toString());
        } else {
            localStorage.setItem('rememberMe', 'false');
            localStorage.removeItem('email');
            localStorage.removeItem('password');
            localStorage.removeItem('rememberMeExpiry');
        }
    }

    // Authenticate user against stored users
    static authenticateUser(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Set current user
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        
        return false;
    }

    // Get current user
    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    }
}

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Get form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate inputs
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    // Authenticate user
    if (!AuthService.authenticateUser(email, password)) {
        alert('Invalid email or password');
        return;
    }
    
    // Use AuthService to save credentials
    AuthService.saveCredentials(email, password, rememberMe);
    
    if (rememberMe) {
        console.log("Credentials saved. Expiry time:", localStorage.getItem('rememberMeExpiry'));
    } else {
        console.log("Remember me not checked, credentials cleared");
    }
    
    // Perform login (redirect to dashboard)
    window.location.href = 'dash2.html';
});

// Check if user credentials are stored on page load
window.addEventListener('DOMContentLoaded', async function() {
    if (await AuthService.hasValidRememberMeCredentials()) {
        // Pre-fill the form fields with saved credentials
        document.getElementById('email').value = AuthService.getSavedEmail() || '';
        document.getElementById('password').value = AuthService.getSavedPassword() || '';
        document.getElementById('rememberMe').checked = true;
        
        // Authenticate user with saved credentials
        const email = AuthService.getSavedEmail();
        const password = AuthService.getSavedPassword();
        
        if (AuthService.authenticateUser(email, password)) {
            // Auto navigate to dashboard with a small delay
            setTimeout(function() {
                window.location.href = 'dash2.html';
            }, 500);
        }
    }
});

// Google Sign-In Button
document.querySelector('.btn-google').addEventListener('click', function() {
    // Implement Google Sign-In functionality
    // This would typically use the Google OAuth API
    console.log('Google Sign-In clicked');
    alert('Google Sign-In functionality would be implemented here');
});

// Add this testing function after the existing scripts
function testAuthService() {
    console.log('=== Auth Service Testing ===');
    
    // Test 1: Check if credentials exist
    AuthService.hasValidRememberMeCredentials().then(valid => {
        console.log('Valid credentials exist:', valid);
        if (valid) {
            console.log('Saved email:', AuthService.getSavedEmail());
            console.log('Credentials expiry:', new Date(parseInt(localStorage.getItem('rememberMeExpiry'))));
        }
    });

    // Test 2: Display localStorage contents
    console.log('Current localStorage state:');
    console.log('- rememberMe:', localStorage.getItem('rememberMe'));
    console.log('- email:', localStorage.getItem('email'));
    console.log('- password exists:', localStorage.getItem('password') ? 'Yes' : 'No');
    console.log('- expiry date:', localStorage.getItem('rememberMeExpiry') ? 
        new Date(parseInt(localStorage.getItem('rememberMeExpiry'))) : 'Not set');
}

// You can call this from browser console with: testAuthService()
// Or uncomment this line to run on page load:
// window.addEventListener('load', testAuthService);