// resources/js/modules/data.js
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

export async function loadTasksForCurrentUser() {
    console.log("Loading tasks for current user from Firestore");
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log("No authenticated user");
            return [];
        }
        const userId = user.uid;
        const tasksCollection = collection(db, `users/${userId}/tasks`);
        const querySnapshot = await getDocs(tasksCollection);
        const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Loaded ${tasks.length} tasks for user`);
        return tasks;
    } catch (error) {
        console.error("Error loading tasks:", error);
        return [];
    }
}

export async function saveTasksToStorage(tasks, currentUser) {
    console.log("Saving tasks to Firestore...");
    if (!currentUser || !tasks) {
        console.error("Cannot save tasks, missing user or tasks");
        return;
    }
    try {
        const userId = currentUser.uid;
        for (const task of tasks) {
            const taskRef = doc(db, `users/${userId}/tasks`, task.id);
            await setDoc(taskRef, task);
        }
        console.log("Tasks saved for user:", userId);
    } catch (error) {
        console.error("Error saving tasks:", error);
    }
}

export async function saveCompletedTasksToStorage(completedTasks, currentUser) {
    console.log("Saving completed tasks to Firestore...");
    if (!currentUser || !completedTasks) {
        console.error("Cannot save completed tasks, missing user or tasks");
        return;
    }
    try {
        const userId = currentUser.uid;
        for (const task of completedTasks) {
            const taskRef = doc(db, `users/${userId}/completed_tasks`, task.id);
            await setDoc(taskRef, task);
        }
        console.log("Completed tasks saved for user:", userId, completedTasks.length);
    } catch (error) {
        console.error("Error saving completed tasks:", error);
    }
}

export async function loadCompletedTasksForCurrentUser(currentUser) {
    console.log("Loading completed tasks for current user from Firestore");
    try {
        if (!currentUser) {
            console.log("No authenticated user");
            return [];
        }
        const userId = currentUser.uid;
        const completedTasksCollection = collection(db, `users/${userId}/completed_tasks`);
        const querySnapshot = await getDocs(completedTasksCollection);
        const completedTasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Loaded ${completedTasks.length} completed tasks`);
        return completedTasks;
    } catch (error) {
        console.error("Error loading completed tasks:", error);
        return [];
    }
    
}
export async function loadSpecificIncompleteTask(userId, taskId) {
    console.log(`🔍 Loading specific task ${taskId} for user ${userId}`);
    try {
        const taskRef = doc(db, `users/${userId}/tasks/${taskId}`);
        const taskSnap = await getDoc(taskRef);

        if (!taskSnap.exists()) {
            console.warn(`❌ Task ${taskId} not found`);
            return null;
        }

        const taskData = taskSnap.data();
        if (taskData.isCompleted === false) {
            console.log(`✅ Task ${taskId} is incomplete`);
            return { id: taskSnap.id, ...taskData };
        } else {
            console.log(`ℹ️ Task ${taskId} is already completed`);
            return null;
        }
    } catch (error) {
        console.error("💥 Error loading specific task:", error);
        return null;
    }
}
import { query, where } from 'firebase/firestore';

export async function loadFirstIncompleteTaskForCurrentUser() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.warn("❌ No logged-in user found");
            return null;
        }

        const tasksRef = collection(db, `users/${user.uid}/tasks`);
        const q = query(tasksRef, where("isCompleted", "==", false));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("ℹ️ No incomplete tasks found for current user");
            return null;
        }

        const firstDoc = querySnapshot.docs[0];
        console.log(`✅ Found incomplete task: ${firstDoc.id}`);
        return { id: firstDoc.id, ...firstDoc.data() };
    } catch (error) {
        console.error("💥 Error fetching first incomplete task:", error);
        return null;
    }
}
