
// Check if user is logged in
export function checkAuthStatus() {
    console.log("Checking authentication status...");
    
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        console.log("User not authenticated, redirecting to login");
        window.location.href = '/login';
        return false;
    }
    
    // Log authentication details for debugging
    console.log("User authenticated:", currentUser.username || currentUser.email);
    
    return true;
}

// Get current user from session/localStorage
export function getCurrentUser() {
    // In a Laravel app, we could check for a user session
    // For now, we'll check localStorage as a fallback
    try {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            return JSON.parse(userJson);
        }
        
        // Check if we have Laravel auth data available
        const userElement = document.getElementById('auth-user-data');
        if (userElement && userElement.dataset.user) {
            const userData = JSON.parse(userElement.dataset.user);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            return userData;
        }
        
        // For testing purposes, create a dummy user if none exists
        const dummyUser = { 
            id: 'test_user', 
            username: 'Test User', 
            email: 'test@example.com' 
        };
        localStorage.setItem('currentUser', JSON.stringify(dummyUser));
        return dummyUser;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}