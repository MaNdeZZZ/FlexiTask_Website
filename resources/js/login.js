// resources/js/login.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "flexi-task-5d512.firebaseapp.com",
    projectId: "flexi-task-5d512",
    storageBucket: "flexi-task-5d512.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

function saveUserToLocal(user) {
    const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "",
    };

    localStorage.setItem("currentUser", JSON.stringify(userData));
    console.log("✅ User saved to localStorage:", userData);
}


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
    .then(() => console.log('✅ Persistence set to local'))
    .catch(error => console.error('💥 Error setting persistence:', error));

async function handleLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        saveUserToLocal(user);

        const idToken = await user.getIdToken();

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'Accept': 'application/json' // Ensure server returns JSON
            },
            body: JSON.stringify({ token: idToken })
        });

        // Check if response is OK
        // if (!response.ok) {
        //     const text = await response.text();
        //     console.error(`❌ Server returned ${response.status}: ${text}`);
        //     throw new Error(`Server error: ${response.status} ${response.statusText}`);
        // }

        // const data = await response.json();

        // if (data.success) {
        //     console.log('✅ User authenticated:', user.email);
        //     window.location.href = '/dash2';
        // } else {
        //     console.error('❌ Login failed:', data.error);
        //     alert('Login failed: ' + (data.error || 'Unknown error'));
        // }
        const data = await response.json();

        if (data.success) {
            console.log('✅ User authenticated:', user.email);
            window.location.href = '/dash2';
        } else {
            console.error(`❌ Login failed (${response.status}):`, data.error);
            alert('Login failed: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('💥 Login error:', error);
        alert('Login failed: ' + error.message);
    }
}

async function handleGoogleSignIn() {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;
        saveUserToLocal(user);

        const idToken = await user.getIdToken();

        const response = await fetch('/google-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'Accept': 'application/json' // Ensure server returns JSON
            },
            body: JSON.stringify({ token: idToken })
        });

        // Check if response is OK
        if (!response.ok) {
            const text = await response.text();
            console.error(`❌ Server returned ${response.status}: ${text}`);
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            console.log('✅ Google Sign-In successful:', user.email);
            window.location.href = '/dash2';
        } else {
            console.error('❌ Google Sign-In failed:', data.error);
            alert('Google Sign-In failed: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('💥 Google Sign-In error:', error);
        alert('Google Sign-In failed: ' + error.message);
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await handleLogin(email, password);
});

document.querySelector('.btn-google').addEventListener('click', async () => {
    await handleGoogleSignIn();
});