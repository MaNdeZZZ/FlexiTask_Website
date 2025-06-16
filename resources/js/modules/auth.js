// auth.js
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase.js';



export function checkAuthStatus() {
    console.log("🔍 Checking authentication status...");
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Unsubscribe after the first callback to prevent memory leaks
            unsubscribe();
            
            if (!user) {
                console.log("ℹ️ User not authenticated");
                resolve(false);
            } else {
                console.log("✅ User authenticated:", user.email);
                resolve(true);
            }
        }, (error) => {
            console.error("💥 Error checking auth status:", error);
            reject(error);
        });
    });
}

export function getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
        return {
            id: user.uid,
            username: user.displayName || user.email,
            email: user.email
        };
    }
    return null;
}