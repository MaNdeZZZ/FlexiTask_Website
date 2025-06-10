import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase.js"; // Pastikan Anda punya file ini

document.getElementById('password-reset-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();

    if (!email) {
        showError("Please enter your email address");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        document.getElementById('email-display').textContent = email;
        showVerificationSent(); // Tampilkan pesan sukses
    } catch (error) {
        console.error("Error:", error);
        showError(error.message);
    }
});

function showVerificationSent() {
    document.getElementById('reset-form').classList.add('d-none');
    document.getElementById('verification-sent').classList.remove('d-none');
}

function showError(message) {
    alert(message); // Bisa diganti dengan toast seperti sebelumnya
}
