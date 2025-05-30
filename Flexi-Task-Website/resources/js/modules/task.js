import { generateTaskId } from "./utils.js";

// Save task
export function saveTask(formData, tasks, currentTask, isEditMode) {
    // const isEditMode = !currentTask;
    const taskData = {
        id: isEditMode && currentTask ? currentTask.id : generateTaskId(),
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        priority: parseInt(formData.get('priority') || '1'),
        date: formData.get('date'),
        time: formData.get('time'),
        enableNotification: formData.get('enableNotification') === 'on', // FormData mengirim 'on' untuk checkbox
        notificationTime: parseInt(formData.get('notificationTime') || 30),
        completed: isEditMode && currentTask ? currentTask.completed : false,
        createdAt: isEditMode && currentTask ? currentTask.createdAt  : new Date().toISOString(),
    };
    taskData.notification = taskData.enableNotification;// Set notification same as enableNotificatio

    let updatedTasks;
    if (isEditMode && currentTask) { // Pastikan currentTask ada saat editMode true
        updatedTasks = tasks.map(t => (t.id === taskData.id ? taskData : t));
    } else {
        updatedTasks = [...tasks, taskData];
    }
    return updatedTasks; // Kembalikan array yang sudah diperbarui
}

// Toggle task completion - FIXED to move tasks to completed tasks list
export function toggleTaskCompletion(taskId, tasks, completedTasks) {
    const taskToComplete = tasks.find(t => t.id === taskId);
    if (!taskToComplete) {
        return {tasks, completedTasks}; // Task not found, return unchanged arrays
    }

    const newTasks = tasks.filter(t => t.id !== taskId); // Remove from tasks

    const newCompletedTask = {
        ...taskToComplete,
        completed: true,
        completedDate: new Date().toLocaleDateString() // Add completion date
    };

    const newCompletedTasks = [...completedTasks, newCompletedTask];

    // Simpan ke localStorage di sini atau di app.js
    // Untuk saat ini, kita kembalikan saja datanya
    return {
        tasks: newTasks,
        completedTasks: newCompletedTasks
    };
}
    
// Delete current task
export function deleteTaskById(taskId, tasks) {
    return tasks.filter(t => t.id !== taskId); // mengembalikan array baru tanpa task yang dihapus
}
