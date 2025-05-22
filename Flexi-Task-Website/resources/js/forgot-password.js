document.addEventListener('DOMContentLoaded', function() {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const emailVerificationStep = document.getElementById('emailVerificationStep');
    const emailSentStep = document.getElementById('emailSentStep');
    const loadingStep = document.getElementById('loadingStep');
    const errorStep = document.getElementById('errorStep');
    const errorMessage = document.getElementById('errorMessage');
    const emailInput = document.getElementById('emailInput');
    const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');

    // Add aria-live to email sent message
    document.querySelector('#emailSentStep p').setAttribute('aria-live', 'polite');

    function showStep(stepToShow) {
        // Hide all steps
        [emailVerificationStep, loadingStep, emailSentStep, errorStep].forEach(step => {
            step.classList.remove('active-step');
        });
        // Show the requested step
        stepToShow.classList.add('active-step');
    }

    function resetForm() {
        emailInput.value = '';
        showStep(emailVerificationStep);
    }

    // Make it accessible outside
    window.resetForm = resetForm;

    resetPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        if (!email) return;
        
        // Show loading state
        showStep(loadingStep);
        
        // Disable submit button to prevent multiple submissions
        submitBtn.disabled = true;
        
        try {
            const res = await fetch('/api/password-reset-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!res.ok) {
                // Safely parse JSON with error handling
                let errorData = { message: 'Email tidak terdaftar' };
                try {
                    errorData = await res.json();
                } catch (parseError) {
                    console.error('Error parsing JSON response:', parseError);
                }
                
                errorMessage.textContent = errorData.message || 'Email tidak terdaftar';
                showStep(errorStep);
                return;
            }

            // Success case (status 200-299)
            showStep(emailSentStep);
            
        } catch (err) {
            console.error('Network error:', err);
            errorMessage.textContent = 'Gagal terhubung ke server';
            showStep(errorStep);
        } finally {
            // Re-enable the submit button regardless of outcome
            submitBtn.disabled = false;
        }
    });
});