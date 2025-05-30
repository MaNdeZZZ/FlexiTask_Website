import { formatTime } from './utils.js';        // <- Impor formatTime dari utils.js
import { showTaskDetails } from './ui.js';      // <- showTaskDetails tetap dari ui.js

let notificationWorker = null; // Worker untuk notifikasi

// Initialize notifications
export function initNotifications(tasks, modals) {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return;
    }
    // Check notification permission
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        // Izin akan diminta saat pengguna mengaktifkan notif di form
    }
    
    // Start checking for notifications
    startNotificationChecker(tasks, modals);
}

// Start notification checker
function startNotificationChecker(tasks, modals) {
    // Clear any existing interval
    if (notificationWorker) {
        clearInterval(notificationWorker);
    }
    
    // Check for notifications every minute
    notificationWorker = setInterval(() => checkForDueNotifications(tasks, modals), 60000);
}

// Check for tasks that need notifications
function checkForDueNotifications(tasks, modals) {
    // Only proceed if notification permission is granted
    if (Notification.permission !== 'granted') return;
    
    const now = new Date();
    
    // Check all tasks with notifications enabled
    tasks.filter(task => task.enableNotification || task.notification).forEach(task => {
        const taskDateTime = new Date(task.date + 'T' + (task.time || '00:00'));
        const notificationMinutes = parseInt(task.notificationTime || 30);
        // Calculate when notification should be sent
        const notificationTime = new Date(taskDateTime.getTime() - (notificationMinutes * 60000));
        
        // Check if it's time to send notification
        // Add a 2-minute buffer to catch notifications that might have been missed
        const timeDifference = now.getTime() - notificationTime.getTime();
        if (timeDifference >= 0 && timeDifference <= 120000) {
            sendNotification(task, tasks, modals);
        }
    });
}

// Send notification for a task
export function sendNotification(task, allTasks, modals) {
    // Check if notifications are supported and permission is granted
    if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
    }
    // Create notification content
    const notificationTitle = "FlexiTask Reminder";
    const notificationOptions = {
        body: `Task: ${task.title} - Due at ${formatTime(task.time || '00:00')}`,
        icon: '/images/logo_FLXT.png',
        vibrate: [100, 50, 100]
    };
    
    try {
        // Send the notification
        const notification = new Notification(notificationTitle, notificationOptions);
        
        // Handle notification click
        notification.onclick = function() {
            window.focus();
            showTaskDetails(task.id, allTasks, modals);
            notification.close();
        };
        
        console.log(`Notification sent for task: ${task.title}`);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}