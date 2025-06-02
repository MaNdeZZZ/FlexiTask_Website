// Load tasks for current user
// resources/js/data.js
import { get } from 'firebase/database';
import { auth, db } from '../firebase.js';

export async function loadTasksForCurrentUser() {
  console.log("Loading tasks for current user from Firebase");
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("No authenticated user");
      return [];
    }
    const userId = user.uid;
    const tasksRef = ref(db, `users/${userId}/tasks`);
    const snapshot = await get(tasksRef);
    if (snapshot.exists()) {
      const tasks = Object.values(snapshot.val() || {});
      console.log(`Loaded ${tasks.length} tasks for user`);
      return tasks;
    }
    console.log("No existing tasks found, returning empty array");
    return [];
  } catch (error) {
    console.error("Error loading tasks:", error);
    return [];
  }
}

// Save tasks to storage
import { set } from 'firebase/database';

export async function saveTasksToStorage(tasks, currentUser) {
  console.log("Saving tasks to Firebase...");
  if (!currentUser || !tasks) {
    console.error("Cannot save tasks, missing user or tasks");
    return;
  }
  try {
    const userId = currentUser.uid;
    const tasksRef = ref(db, `users/${userId}/tasks`);
    await set(tasksRef, tasks);
    console.log("Tasks saved for user:", userId);
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}

// Save completed tasks to storage
export async function saveCompletedTasksToStorage(completedTasks, currentUser) {
  console.log("Saving completed tasks to Firebase...");
  if (!currentUser || !completedTasks) {
    console.error("Cannot save completed tasks, missing user or tasks");
    return;
  }
  try {
    const userId = currentUser.uid;
    const completedTasksRef = ref(db, `users/${userId}/completedTasks`);
    await set(completedTasksRef, completedTasks);
    console.log("Completed tasks saved for user:", userId, completedTasks.length);
  } catch (error) {
    console.error("Error saving completed tasks:", error);
  }
}

export async function loadCompletedTasksForCurrentUser(currentUser) {
  console.log("Loading completed tasks for current user from Firebase");
  try {
    if (!currentUser) {
      console.log("No authenticated user");
      return [];
    }
    const userId = currentUser.uid;
    const completedTasksRef = ref(db, `users/${userId}/completedTasks`);
    const snapshot = await get(completedTasksRef);
    if (snapshot.exists()) {
      const completedTasks = Object.values(snapshot.val() || {});
      console.log(`Loaded ${completedTasks.length} completed tasks`);
      return completedTasks;
    }
    console.log("No completed tasks found, returning empty array");
    return [];
  } catch (error) {
    console.error("Error loading completed tasks:", error);
    return [];
  }
}