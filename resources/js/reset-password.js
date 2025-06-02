// Handle form submission
document.getElementById('password-reset-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // Enable HTML5 validation UI
    const form = event.target;
    form.classList.add('was-validated');
    
    // If form is not valid, return early
    if (!form.checkValidity()) {
        return;
    }
    
    const email = document.getElementById('email').value.trim();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const token = new URLSearchParams(window.location.search).get('token');
    
    // Custom validation
    if (!email) {
        showError('Please enter your email address');
        document.getElementById('email').focus();
        return;
    }
    
    if (!newPassword) {
        showError('Please enter a new password');
        document.getElementById('new-password').focus();
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match');
        document.getElementById('confirm-password').focus();
        return;
    }
    
    // Validate token exists
    if (!token) {
        showError('Invalid password reset link. Please request a new one.');
        return;
    }
    
    // Password strength validation (using the validatePassword function from register.js if available)
    if (typeof validatePassword === 'function') {
        const validationResult = validatePassword(newPassword);
        if (validationResult) {
            showError(validationResult);
            document.getElementById('new-password').focus();
            return;
        }
    }
    
    // Disable submit button
    const submitButton = document.querySelector('#password-reset-form button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
    }
    
    // Show loading indicator
    showLoadingIndicator(true);
    
    try {
        const response = await fetch('/api/password-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token,
                email,
                newPassword
            })
        });
        
        // Parse response
        let data = {};
        try {
            data = await response.json();
        } catch (e) {
            // If JSON parsing fails, continue with empty data
        }
        
        if (!response.ok) {
            // Handle different error status codes
            if (response.status === 400 || response.status === 401) {
                throw new Error(data.message || 'Link reset tidak valid atau sudah kadaluarsa');
            } else if (response.status === 500) {
                throw new Error(data.message || 'Terjadi kesalahan server, coba lagi nanti');
            } else {
                throw new Error(data.message || 'Gagal mereset password');
            }
        }
        
        // Update email display for success message
        document.getElementById('email-display').textContent = email;
        
        // Success - show verification sent screen
        showLoadingIndicator(false);
        showVerificationSent();
        
        // Auto-redirect after 5 seconds (optional UX improvement)
        setTimeout(() => {
            goBack();
        }, 5000);
        
    } catch (error) {
        // Show error message
        showLoadingIndicator(false);
        showError(error.message);
        
    } finally {
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
});

// Show error message using Bootstrap Toast
function showError(message) {
    // Create toast container if it doesn't exist
    if (!document.querySelector('.toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toastContainer = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-bg-danger border-0';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

// Show/hide loading indicator
function showLoadingIndicator(show) {
    document.getElementById('loading-screen').classList.toggle('d-none', !show);
    document.getElementById('loading-screen').classList.toggle('d-flex', show);
    document.getElementById('reset-form').classList.toggle('d-none', show);
}

// Show verification sent screen
function showVerificationSent() {
    document.getElementById('reset-form').classList.add('d-none');
    document.getElementById('verification-sent').classList.remove('d-none');
}

// Go back function
function goBack() {
    // In a real app, this would navigate to the previous page
    window.history.back();
    // Fallback if there's no history
    setTimeout(() => {
        window.location.href = 'profile.html'; // Adjust as needed
    }, 100);
}