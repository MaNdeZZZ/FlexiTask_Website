// resources/js/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "flexi-task-5d512.firebaseapp.com",
    projectId: "flexi-task-5d512",
    storageBucket: "flexi-task-5d512.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
try {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('💥 Error initializing Firebase:', error);
    throw error;
}

export const db = getFirestore(app);
export const auth = getAuth(app);

async function initializeAuthPersistence() {
    try {
        await setPersistence(auth, browserLocalPersistence);
        console.log('✅ Persistence set to local');
    } catch (error) {
        console.error('💥 Error setting auth persistence:', error);
        throw error;
    }
}

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('✅ User is signed in:', user.uid);
    } else {
        console.log('ℹ️ No user is signed in');
    }
});

initializeAuthPersistence();