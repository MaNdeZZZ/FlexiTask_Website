document.addEventListener('DOMContentLoaded', async function () {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    // Pre-fill if Remember Me was used
    if (localStorage.getItem('rememberMe') === 'true') {
        emailInput.value = localStorage.getItem('email') || '';
        passwordInput.value = localStorage.getItem('password') || '';
        rememberMeCheckbox.checked = true;
    }

    // Handle form submission (email + password)
    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberMeCheckbox.checked;

        if (!email || !password) {
            alert('Please enter email and password.');
            return;
        }

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Save credentials if Remember Me
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('email', email);
                    localStorage.setItem('password', password);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('email');
                    localStorage.removeItem('password');
                }

                alert("Login berhasil!");
                window.location.href = "/dash2";
            } else {
                alert("Login gagal: " + (data.error || "Email atau password salah."));
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Terjadi kesalahan saat login.");
        }
    });

    // 🔐 Google Sign-In
    document.querySelector('.btn-google').addEventListener('click', async function () {
        const provider = new firebase.auth.GoogleAuthProvider();

        try {
            const result = await firebase.auth().signInWithPopup(provider);
            const user = result.user;

            alert("Google Sign-In Berhasil!\nWelcome, " + user.displayName);

            // Redirect langsung (tanpa perlu panggil backend untuk sekarang)
            window.location.href = "/dash2";

            // (Opsional) Kirim idToken ke backend Laravel jika ingin verifikasi
            // const idToken = await user.getIdToken();
            // await fetch('/google-auth', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute("content")
            //     },
            //     body: JSON.stringify({ token: idToken })
            // });

        } catch (error) {
            console.error("Google Sign-In Error:", error);
            alert("Gagal login dengan Google.");
        }
    });
});
