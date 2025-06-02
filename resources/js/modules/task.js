import { generateTaskId } from "./utils.js";

// Save task
// resources/js/task.js
import { set, ref, push } from 'firebase/database';
import { db } from '../firebase.js';

export async function saveTask(formData, tasks, currentTask, isEditMode, currentUser) {
  const taskData = {
    id: isEditMode && currentTask ? currentTask.id : generateTaskId(),
    title: formData.get('title').trim(),
    description: formData.get('description').trim(),
    priority: parseInt(formData.get('priority') || '1'),
    date: formData.get('date'),
    time: formData.get('time'),
    enableNotification: formData.get('enableNotification') === 'on',
    notificationTime: parseInt(formData.get('notificationTime') || 30),
    completed: isEditMode && currentTask ? currentTask.completed : false,
    createdAt: isEditMode && currentTask ? currentTask.createdAt : new Date().toISOString(),
  };
  taskData.notification = taskData.enableNotification;

  try {
    const userId = currentUser.uid;
    const taskRef = isEditMode && currentTask 
      ? ref(db, `users/${userId}/tasks/${currentTask.id}`)
      : push(ref(db, `users/${userId}/tasks`));
    await set(taskRef, taskData);

    let updatedTasks;
    if (isEditMode && currentTask) {
      updatedTasks = tasks.map(t => (t.id === taskData.id ? taskData : t));
    } else {
      updatedTasks = [...tasks, taskData];
    }
    return updatedTasks;
  } catch (error) {
    console.error("Error saving task to Firebase:", error);
    return tasks;
  }
}

// Toggle task completion - FIXED to move tasks to completed tasks list
import { remove } from 'firebase/database';

export async function toggleTaskCompletion(taskId, tasks, completedTasks, currentUser) {
  const taskToComplete = tasks.find(t => t.id === taskId);
  if (!taskToComplete) return { tasks, completedTasks };

  try {
    const userId = currentUser.uid;
    // Hapus dari tasks
    await remove(ref(db, `users/${userId}/tasks/${taskId}`));
    // Tambahkan ke completedTasks
    const newCompletedTask = {
      ...taskToComplete,
      completed: true,
      completedDate: new Date().toLocaleDateString()
    };
    await set(ref(db, `users/${userId}/completedTasks/${taskId}`), newCompletedTask);

    const newTasks = tasks.filter(t => t.id !== taskId);
    const newCompletedTasks = [...completedTasks, newCompletedTask];
    return { tasks: newTasks, completedTasks: newCompletedTasks };
  } catch (error) {
    console.error("Error toggling task completion:", error);
    return { tasks, completedTasks };
  }
}
    
// Delete current task

export async function deleteTaskById(taskId, tasks, currentUser) {
  try {
    const userId = currentUser.uid;
    await remove(ref(db, `users/${userId}/tasks/${taskId}`));
    return tasks.filter(t => t.id !== taskId);
  } catch (error) {
    console.error("Error deleting task:", error);
    return tasks;
  }
}
