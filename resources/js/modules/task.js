// // resources/js/modules/task.js
// import { generateTaskId } from "./utils.js";
// import { setDoc, doc, deleteDoc } from 'firebase/firestore';
// import { db } from '../firebase.js';

// export async function saveTask(formData, tasks, currentTask, isEditMode, currentUser) {
//     const taskData = {
//         id: isEditMode && currentTask ? currentTask.id : generateTaskId(),
//         title: formData.get('title').trim(),
//         description: formData.get('description').trim(),
//         priority: parseInt(formData.get('priority') || '1'),
//         date: formData.get('date'),
//         time: formData.get('time'),
//         enableNotification: formData.get('enableNotification') === 'on',
//         notificationTime: parseInt(formData.get('notificationTime') || 30),
//         completed: isEditMode && currentTask ? currentTask.completed : false,
//         createdAt: isEditMode && currentTask ? currentTask.createdAt : new Date().toISOString(),
//     };
//     taskData.notification = taskData.enableNotification;

//     try {
//         const userId = currentUser.uid;
//         const taskRef = doc(db, `users/${userId}/tasks`, taskData.id);
//         await setDoc(taskRef, taskData);

//         let updatedTasks;
//         if (isEditMode && currentTask) {
//             updatedTasks = tasks.map(t => (t.id === taskData.id ? taskData : t));
//         } else {
//             updatedTasks = [...tasks, taskData];
//         }
//         return updatedTasks;
//     } catch (error) {
//         console.error("Error saving task to Firestore:", error);
//         return tasks;
//     }
// }

// export async function toggleTaskCompletion(taskId, tasks, completedTasks, currentUser) {
//     const taskToComplete = tasks.find(t => t.id === taskId);
//     if (!taskToComplete) return { tasks, completedTasks };

//     try {
//         const userId = currentUser.uid;
//         await deleteDoc(doc(db, `users/${userId}/tasks`, taskId));
//         const newCompletedTask = {
//             ...taskToComplete,
//             completed: true,
//             completedDate: new Date().toLocaleDateString()
//         };
//         await setDoc(doc(db, `users/${userId}/completed_tasks`, taskId), newCompletedTask);

//         const newTasks = tasks.filter(t => t.id !== taskId);
//         const newCompletedTasks = [...completedTasks, newCompletedTask];
//         return { tasks: newTasks, completedTasks: newCompletedTasks };
//     } catch (error) {
//         console.error("Error toggling task completion:", error);
//         return { tasks, completedTasks };
//     }
// }

// export async function deleteTaskById(taskId, tasks, currentUser) {
//     try {
//         const userId = currentUser.uid;
//         await deleteDoc(doc(db, `users/${userId}/tasks`, taskId));
//         return tasks.filter(t => t.id !== taskId);
//     } catch (error) {
//         console.error("Error deleting task:", error);
//         return tasks;
//     }
// }

import { generateTaskId } from "./utils.js";
import { setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

// 🔥 SIMPAN / EDIT TASK
export async function saveTask(formData, tasks, currentTask, isEditMode, currentUser) {
    const taskData = {
        id: isEditMode && currentTask ? currentTask.id : generateTaskId(),
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        priority: parseInt(formData.get('priority') || '1'),
        date: formData.get('date'),
        time: formData.get('time'),
        hasNotification: formData.get('enableNotification') === 'on',
        notificationMinutesBefore: parseInt(formData.get('notificationTime') || 30),
        isCompleted: isEditMode && currentTask ? currentTask.isCompleted : false,
        createdAt: isEditMode && currentTask ? currentTask.createdAt : new Date().toISOString(),
    };

    try {
        const userId = currentUser.uid;
        const taskRef = doc(db, `users/${userId}/tasks`, taskData.id);
        await setDoc(taskRef, taskData);

        let updatedTasks;
        if (isEditMode && currentTask) {
            updatedTasks = tasks.map(t => (t.id === taskData.id ? taskData : t));
        } else {
            updatedTasks = [...tasks, taskData];
        }
        return updatedTasks;
    } catch (error) {
        console.error("Error saving task to Firestore:", error);
        return tasks;
    }
}

// 🔥 TOGGLE TASK COMPLETION
export async function toggleTaskCompletion(taskId, tasks, completedTasks, currentUser) {
    const taskToComplete = tasks.find(t => t.id === taskId);
    if (!taskToComplete) return { tasks, completedTasks };

    try {
        const userId = currentUser.uid;
        await deleteDoc(doc(db, `users/${userId}/tasks`, taskId));

        const newCompletedTask = {
            ...taskToComplete,
            isCompleted: true,
            completedDate: new Date().toLocaleDateString()
        };

        await setDoc(doc(db, `users/${userId}/completed_tasks`, taskId), newCompletedTask);

        const newTasks = tasks.filter(t => t.id !== taskId);
        const newCompletedTasks = [...completedTasks, newCompletedTask];
        return { tasks: newTasks, completedTasks: newCompletedTasks };
    } catch (error) {
        console.error("Error toggling task completion:", error);
        return { tasks, completedTasks };
    }
}

// 🔥 DELETE TASK
export async function deleteTaskById(taskId, tasks, currentUser) {
    try {
        const userId = currentUser.uid;
        await deleteDoc(doc(db, `users/${userId}/tasks`, taskId));
        return tasks.filter(t => t.id !== taskId);
    } catch (error) {
        console.error("Error deleting task:", error);
        return tasks;
    }
}
