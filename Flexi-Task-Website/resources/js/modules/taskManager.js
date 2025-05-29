// Task Manager Module
import { getCurrentUser } from './auth.js';

// Get current user's tasks collection reference
function getUserTasksCollection() {
    const user = getCurrentUser();
    if (!user) throw new Error('No user logged in');
    return firebase.firestore().collection('users').doc(user.uid).collection('tasks');
}

// Get current user's completed tasks collection reference
function getUserCompletedTasksCollection() {
    const user = getCurrentUser();
    if (!user) throw new Error('No user logged in');
    return firebase.firestore().collection('users').doc(user.uid).collection('completedTasks');
}

// Load tasks for current user
export async function loadTasksForCurrentUser() {
    try {
        const tasksCollection = getUserTasksCollection();
        const snapshot = await tasksCollection.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error loading tasks:", error);
        return [];
    }
}

// Load completed tasks for current user
export async function loadCompletedTasksForCurrentUser() {
    try {
        const completedTasksCollection = getUserCompletedTasksCollection();
        const snapshot = await completedTasksCollection.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error loading completed tasks:", error);
        return [];
    }
}

// Save new task
export async function saveTask(taskData) {
    try {
        const tasksCollection = getUserTasksCollection();
        const docRef = await tasksCollection.add({
            ...taskData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id, ...taskData };
    } catch (error) {
        console.error("Error saving task:", error);
        throw error;
    }
}

// Update existing task
export async function updateTask(taskId, taskData) {
    try {
        const tasksCollection = getUserTasksCollection();
        await tasksCollection.doc(taskId).update({
            ...taskData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: taskId, ...taskData };
    } catch (error) {
        console.error("Error updating task:", error);
        throw error;
    }
}

// Delete task
export async function deleteTask(taskId) {
    try {
        const tasksCollection = getUserTasksCollection();
        await tasksCollection.doc(taskId).delete();
    } catch (error) {
        console.error("Error deleting task:", error);
        throw error;
    }
}

// Complete task (move to completed tasks)
export async function completeTask(taskId) {
    try {
        const tasksCollection = getUserTasksCollection();
        const completedTasksCollection = getUserCompletedTasksCollection();
        
        // Get task data
        const taskDoc = await tasksCollection.doc(taskId).get();
        if (!taskDoc.exists) throw new Error('Task not found');
        
        const taskData = taskDoc.data();
        
        // Add to completed tasks
        await completedTasksCollection.add({
            ...taskData,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Delete from active tasks
        await tasksCollection.doc(taskId).delete();
    } catch (error) {
        console.error("Error completing task:", error);
        throw error;
    }
}

// Restore task (move back to active tasks)
export async function restoreTask(taskId) {
    try {
        const tasksCollection = getUserTasksCollection();
        const completedTasksCollection = getUserCompletedTasksCollection();
        
        // Get completed task data
        const taskDoc = await completedTasksCollection.doc(taskId).get();
        if (!taskDoc.exists) throw new Error('Task not found');
        
        const taskData = taskDoc.data();
        
        // Remove completed status
        const { completedAt, ...restoredTask } = taskData;
        
        // Add back to active tasks
        await tasksCollection.add({
            ...restoredTask,
            restoredAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Delete from completed tasks
        await completedTasksCollection.doc(taskId).delete();
    } catch (error) {
        console.error("Error restoring task:", error);
        throw error;
    }
}

// Subscribe to tasks changes
export function subscribeToTasks(callback) {
    const user = getCurrentUser();
    if (!user) return () => {};

    const tasksCollection = getUserTasksCollection();
    return tasksCollection.onSnapshot(snapshot => {
        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(tasks);
    });
}

// Subscribe to completed tasks changes
export function subscribeToCompletedTasks(callback) {
    const user = getCurrentUser();
    if (!user) return () => {};

    const completedTasksCollection = getUserCompletedTasksCollection();
    return completedTasksCollection.onSnapshot(snapshot => {
        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(tasks);
    });
} 