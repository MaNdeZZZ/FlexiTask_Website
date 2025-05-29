// Auth Module
let currentUser = null;

// Initialize auth state listener
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        };
        // Store in localStorage for persistence
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        // User is signed out
        currentUser = null;
        localStorage.removeItem('currentUser');
    }
});

// Get current user
export function getCurrentUser() {
    if (currentUser) return currentUser;
    
    // Try to get from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        return currentUser;
    }
    
    return null;
}

// Sign in with email and password
export async function signInWithEmail(email, password) {
    try {
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        return result.user;
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
}

// Sign in with Google
export async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        return result.user;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
}

// Sign out
export async function signOut() {
    try {
        await firebase.auth().signOut();
        currentUser = null;
        localStorage.removeItem('currentUser');
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

// Register with email and password
export async function registerWithEmail(email, password) {
    try {
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        return result.user;
    } catch (error) {
        console.error('Error registering:', error);
        throw error;
    }
}

// Check if user is authenticated
export function isAuthenticated() {
    return !!getCurrentUser();
}

// Get user profile data
export async function getUserProfile() {
    const user = getCurrentUser();
    if (!user) return null;

    try {
        const doc = await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .get();

        if (doc.exists) {
            return doc.data();
        }

        // If profile doesn't exist, create it
        const profileData = {
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .set(profileData);

        return profileData;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
}

// Update user profile
export async function updateUserProfile(profileData) {
    const user = getCurrentUser();
    if (!user) throw new Error('No user logged in');

    try {
        await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .update({
                ...profileData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        // Update local user data
        currentUser = { ...currentUser, ...profileData };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        return currentUser;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}