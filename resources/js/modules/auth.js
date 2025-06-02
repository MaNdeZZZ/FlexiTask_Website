// resources/js/auth.js
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase.js';

export function checkAuthStatus() {
  console.log("Checking authentication status...");
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("User not authenticated, redirecting to login");
        window.location.href = '/login';
        resolve(false);
      } else {
        console.log("User authenticated:", user.email);
        resolve(true);
      }
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