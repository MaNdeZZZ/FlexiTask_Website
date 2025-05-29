import { getCurrentUser } from './auth.js';
// Load tasks for current user
export function loadTasksForCurrentUser() {
    console.log("Loading tasks for current user");
    
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return [];
        
        const userId = currentUser.id || currentUser.userId || 'default';
        const tasksJson = localStorage.getItem(`tasks_${userId}`);
        
        if (tasksJson) {
            const loadedTasks = JSON.parse(tasksJson);
            console.log(`Loaded ${loadedTasks.length} tasks for user`);
            return loadedTasks;
        }
        
        console.log("No existing tasks found, returning empty array");
        return [];
    } catch (error) {
        console.error("Error loading tasks:", error);
        return [];
    }
}

// Save tasks to storage
export function saveTasksToStorage(tasks, currentUser) {
    console.log("Saving tasks to storage...");
    if (!currentUser) {
        console.error("Cannot save tasks, current user not provided to saveTasksToStorage.");
        return;
    }
    if (!tasks) { // Tambahkan pengecekan untuk tasks
        console.error("Cannot save tasks, tasks array not provided to saveTasksToStorage.");
        return;
    }

    const userId = currentUser.id || currentUser.userId || 'default';
    localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
    console.log("Tasks saved for user:", userId); // Tambahkan log
}

// Save completed tasks to storage
export function saveCompletedTasksToStorage(completedTasks, currentUser) {
    console.log("Saving completed tasks to storage...");
    if (!currentUser) {
        console.error("Cannot save completed tasks, current user not provided to saveCompletedTasksToStorage.");
        return;
    }
    if (!completedTasks) {
        console.error("Cannot save completed tasks, completedTasks array not provided to saveCompletedTasksToStorage.");
        return;
    }

    const userId = currentUser.id || currentUser.userId || 'default';
    localStorage.setItem(`completedTasks_${userId}`, JSON.stringify(completedTasks));
    console.log("Completed tasks saved for user:", userId, completedTasks.length);
}

// Load completed tasks for current user
export function loadCompletedTasksForCurrentUser(currentUser) {
    console.log("Loading completed tasks for current user");
    
    try {
        if (!currentUser) return [];
        
        const userId = currentUser.id || currentUser.userId || 'default';
        const completedTasksJson = localStorage.getItem(`completedTasks_${userId}`);
        
        if (completedTasksJson) {
            const loadedCompletedTasks = JSON.parse(completedTasksJson);
            console.log(`Loaded ${loadedCompletedTasks.length} completed tasks for user`);
            return loadedCompletedTasks;
        }
        
        console.log("No existing completed tasks found, returning empty array");
        return [];
    } catch (error) {
        console.error("Error loading completed tasks:", error);
        return [];
    }
}