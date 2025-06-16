import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase.js"; // Pastikan Anda punya file ini

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDAhcqyzf8x1FXd0Zqka12t_NQaoCEWD44",
    authDomain: "flexi-task-5d512.firebaseapp.com",
    projectId: "flexi-task-5d512",
    appId: "1:161145697554:web:23d9c0c67426e92a97afcb",
};




// Elemen DOM
const resetPasswordForm = document.getElementById('resetPasswordForm');
const emailInput = document.getElementById('emailInput');
const loadingStep = document.getElementById('loadingStep');
const emailSentStep = document.getElementById('emailSentStep');
const errorStep = document.getElementById('errorStep');
const emailVerificationStep = document.getElementById('emailVerificationStep');
const errorMessage = document.getElementById('errorMessage');
const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');

// Event kirim email reset
resetPasswordForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!email) {
        showError("Please enter your email address");
        return;
    }

    showStep(loadingStep);
    submitBtn.disabled = true;

    try {
        await sendPasswordResetEmail(auth, email);
        localStorage.setItem('resetEmail', email); // Optional: simpan email yang dikirim

        // Update tampilan email yang ditampilkan (jika ada)
        const emailDisplay = document.getElementById('email-display');
        if (emailDisplay) {
            emailDisplay.textContent = email;
        }

        showStep(emailSentStep);
    } catch (error) {
        console.error("Firebase Error:", error);
        showError(error.message || "Something went wrong.");
        showStep(errorStep);
    } finally {
        submitBtn.disabled = false;
    }
});

// Fungsi untuk menampilkan satu step dan menyembunyikan lainnya
function showStep(stepToShow) {
    [emailVerificationStep, loadingStep, emailSentStep, errorStep].forEach(step => {
        step.classList.remove('active-step');
    });
    stepToShow.classList.add('active-step');
}