document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const verifyPassword = document.getElementById('verifyPasswordInput').value;

    // Validasi dasar
    if (!email || !password || !verifyPassword) {
        alert('Please fill all fields');
        return;
    }

    if (password !== verifyPassword) {
        alert('Passwords do not match');
        return;
    }

    const passwordValidationResult = validatePassword(password);
    if (passwordValidationResult) {
        alert(passwordValidationResult);
        return;
    }

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
            },
            body: JSON.stringify({
                email: email,
                password: password,
                password_confirmation: verifyPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Registration successful! Welcome, ${email}!`);
            window.location.href = "/login";
        } else {
            alert(data.error || "Registration failed.");
        }
    } catch (error) {
        console.error(error);
        alert("An error occurred. Please try again.");
    }
});

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

document.querySelector('.btn-google').addEventListener('click', async function () {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;

        alert("Google Sign-Up Berhasil!\nWelcome, " + user.displayName);
        window.location.href = "/dash2";
    } catch (error) {
        console.error("Google Sign-Up Error:", error); // ✅ Tampilkan detail error di console
        alert("Gagal mendaftar dengan Google.");
    }
});


