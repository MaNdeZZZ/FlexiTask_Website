
// Generate a unique ID for tasks
export function generateTaskId() {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

// Helper function to format date
export function formatDate(dateString) {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to format time with AM/PM
export function formatTime(timeString) {
    // Parse the time string (HH:MM format)
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Format with AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Helper function to get notification time text
export function getNotificationText(minutes) {
    const mins = parseInt(minutes);
    
    // Special cases for testing options
    switch(mins) {
        case 1:
            return '30 seconds before';
        case 2:
            return '1 minute before';
        case 5:
            return '5 minutes before';
    }
    
    // Regular cases
    if (mins < 60) {
        return `${mins} minute${mins !== 1 ? 's' : ''} before`;
    } else if (mins === 60) {
        return '1 hour before';
    } else if (mins < 1440) {
        return `${Math.floor(mins / 60)} hours before`;
    } else if (mins === 1440) {
        return '1 day before';
    } else if (mins === 2880) {
        return '2 days before';
    } else if (mins === 10080) {
        return '1 week before';
    } else {
        return `${Math.floor(mins / 1440)} days before`;
    }
}