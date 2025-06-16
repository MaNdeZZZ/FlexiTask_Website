<<<<<<< HEAD
import './bootstrap';
=======
// resources/js/app.js
import { generateTaskId } from './modules/utils.js';
import { query, where, getDocs } from 'firebase/firestore';
import {
    checkAuthStatus  // ✅ DITAMBAHKAN kembali agar tidak error
} from './modules/auth.js';
import {
    loadTasksForCurrentUser,
    saveTasksToStorage,
    loadCompletedTasksForCurrentUser,
    saveCompletedTasksToStorage
} from './modules/data.js';
import { db, auth } from './firebase.js';
import { collection, onSnapshot, doc, updateDoc  } from 'firebase/firestore';
import {
    initializeModals,
    renderTasks,
    displayUsername,
    setupProfileImage,
    showAddTaskModal,
    editCurrentTask,
    showTaskDetails,
    toggleSearchPanel,
    toggleFilterPanel,
    showOverdueTasks,
    showRegularTasksView,
    setPriority
} from './modules/ui.js';
import {
    saveTask as logicSaveTask,
    deleteTaskById as logicDeleteTask,
    toggleTaskCompletion as logicToggleTask
} from './modules/task.js';
import { initNotifications } from './modules/notifications.js';
import { loadFirstIncompleteTaskForCurrentUser } from './modules/data.js';

function renderIncompleteTasks() {
    
    if (!Array.isArray(tasks)) {
        console.warn('⚠️ tasks is not an array');
        return;
    }

    const incompleteTasks = tasks.filter(task => !task.isCompleted);

    console.log("🎯 Rendering all incomplete tasks:", incompleteTasks.length);

    renderTasks(
        incompleteTasks,
        false,    // ⛔ Tidak sedang search
        '',       // Kosongkan keyword
        filterActive,
        activeFilters
    );
}

async function loadIncompleteTasksForCurrentUser() {
    console.log("Loading INCOMPLETE tasks from Firestore");
    try {
        const currentUser = auth.currentUser || getCurrentUser();
        if (!currentUser) {
            console.warn("❌ No current user found");
            return [];
        }

        const tasksRef = collection(db, `users/${currentUser.uid}/tasks`);
        const q = query(tasksRef, where("isCompleted", "==", false));
        const snapshot = await getDocs(q);
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`✅ Loaded ${tasks.length} incomplete tasks`);
        return tasks;
    } catch (err) {
        console.error("❌ Error loading incomplete tasks:", err);
        return [];
    }
}




console.log('✅ app.js loaded');

// ✅ Override getCurrentUser untuk ambil dari localStorage
function getCurrentUser() {
    try {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (!user || !user.uid) {
            console.warn("⚠️ No valid user found in localStorage.");
            return null;
        }
        console.log("✅ Retrieved user from localStorage:", user);
        return user;
    } catch (e) {
        console.error("💥 Error parsing user from localStorage:", e);
        return null;
    }
}

    function setupCompletionUI() {
    document.getElementById('taskContainer')?.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.task-checkbox');
        if (checkbox) {
            const taskCard = e.target.closest('.task-card');
            if (!taskCard) return;
            selectedCompleteTaskId = taskCard.dataset.taskId;
            const modal = new bootstrap.Modal(document.getElementById("completeConfirmModal"));
            modal.show();
        }
    });

document.getElementById("confirmCompleteBtn")?.addEventListener("click", async () => {
  if (!selectedCompleteTaskId || !currentUser) return;

  const uid = currentUser.uid;

  // ✅ DIDEFINISIKAN DI AWAL
  const modalEl = document.getElementById("completeConfirmModal");
  const modalInstance = bootstrap.Modal.getInstance(modalEl);

  try {
    const taskRef = doc(db, `users/${uid}/tasks/${selectedCompleteTaskId}`);
    await updateDoc(taskRef, {
      isCompleted: true,
      completed: true,
      completedDate: new Date().toISOString()
    });

    selectedCompleteTaskId = null;
    renderIncompleteTasks();
  } catch (err) {
    console.error("❌ Failed to complete task:", err);
  } finally {
    // ✅ DI SINI modalInstance SUDAH TERDEFINISI
    if (modalInstance) modalInstance.hide();
  }
});

}


    let tasks = [];
    let completedTasks = [];
    let currentUser = null;
    let modals = {};
    let currentTask = null;
    let editMode = false;
    let searchTerm = '';
    let searchActive = false;
    let filterActive = false;
    let selectedCompleteTaskId = null;
    let activeFilters = { priority: [1, 2, 3] };

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOMContentLoaded fired');


    function showLoadingState() {
        const loadingDiv = document.getElementById('loading');
        const mainContent = document.querySelector('.main-container');
        if (loadingDiv && mainContent) {
            loadingDiv.classList.remove('hidden');
            mainContent.classList.remove('visible');
        }
    }

    function hideLoadingState() {
        const loadingDiv = document.getElementById('loading');
        const mainContent = document.querySelector('.main-container');
        if (loadingDiv && mainContent) {
            loadingDiv.classList.add('hidden');
            mainContent.classList.add('visible');
        }
    }

    async function initApp() {
        try {
            console.log('🚀 Starting app initialization...');
            showLoadingState();

            if (window.location.pathname === '/login') {
                console.log('ℹ️ On login page, skipping auth check');
                hideLoadingState();
                return;
            }

            const isAuthenticated = await checkAuthStatus();
            if (!isAuthenticated) {
                console.log('❌ Auth check failed, redirecting to login');
                window.location.href = '/login';
                return;
            }

            console.log('✅ Auth check passed');
            currentUser = auth.currentUser || getCurrentUser();
            if (!currentUser) {
                console.error('❌ No current user found after auth check');
                window.location.href = '/login';
                return;
            }

            tasks = await loadIncompleteTasksForCurrentUser();
            completedTasks = await loadCompletedTasksForCurrentUser(currentUser);

            const firstIncomplete = await loadFirstIncompleteTaskForCurrentUser();
            console.log('🧰 First incomplete task:', firstIncomplete);

            modals = initializeModals();

            if (!modals || !modals.addEditTaskModal) {
                console.error('❌ Failed to initialize modals');
                alert('Error: Could not initialize app properly. Please refresh the page.');
                return;
            }

            setupProfileImage(currentUser);
            displayUsername(currentUser);
            if (window.location.pathname === '/dash2' || window.location.pathname === '/dashboard') {
                setupAllEventListeners();
            } else {
                console.log("⏭️ Skipping setupAllEventListeners() on non-dashboard page:", window.location.pathname);
            }

            // ❌ Jangan renderTasks() di sini karena bisa terlalu cepat, langsung pakai:
            renderIncompleteTasks();

            setupCompletionUI();

            initNotifications(tasks, modals);

            console.log('📦 Rendering initial incomplete tasks...');
            renderIncompleteTasks(); // ✅ Langsung render saat data selesai di-load

            setupRealtimeListener(); // ✅ Setup real-time update terakhir

            console.log('🎉 App initialization complete!');
            hideLoadingState();
        } catch (error) {
            console.error('💥 Error initializing app:', error);
            hideLoadingState();
        }
    }


    function handleEditTask() {
        if (!currentTask) return;
        editMode = true;
        editCurrentTask(currentTask, modals);
    }

    async function handleToggleCompletion(taskId) {
        const { tasks: updatedTasks, completedTasks: updatedCompletedTasks } = await logicToggleTask(taskId, tasks, completedTasks, currentUser);
        tasks = updatedTasks;
        completedTasks = updatedCompletedTasks;
        await saveTasksToStorage(tasks, currentUser);
        await saveCompletedTasksToStorage(completedTasks, currentUser);
        renderIncompleteTasks(); // atau renderTasks(filteredTasks) jika pakai search

    }

    function setupAllEventListeners() {
        console.log('✅ setupAllEventListeners started');

        // Tambah task
        document.getElementById('addTaskBtn')?.addEventListener('click', () => {
            showAddTaskModal(modals);
        });

        // Simpan task
        document.getElementById('saveTaskBtn')?.addEventListener('click', async () => {
            const saveBtn = document.getElementById('saveTaskBtn');
            if (!saveBtn) return;
            saveBtn.disabled = true;

            const form = document.getElementById('taskForm');
            const formData = new FormData(form);
            if (!formData.get('title').trim()) {
                alert('Please enter a task title.');
                saveBtn.disabled = false;
                return;
            }

            const modalEl = document.getElementById('addEditTaskModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modalInstance.hide();

            try {
                tasks = await logicSaveTask(formData, tasks, currentTask, editMode, currentUser);
                await saveTasksToStorage(tasks, currentUser);
                editMode = false;
                currentTask = null;
                renderIncompleteTasks();
            } catch (err) {
                console.error("❌ Error saving task:", err);
            } finally {
                saveBtn.disabled = false;
            }
        });

        // Konfirmasi delete
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', async () => {
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            if (!confirmBtn || !currentTask) return;

            confirmBtn.disabled = true;
            modals.deleteConfirmModal?.hide();

            try {
                tasks = await logicDeleteTask(currentTask.id, tasks, currentUser);
                await saveTasksToStorage(tasks, currentUser);
                currentTask = null;
                renderIncompleteTasks();
            } catch (err) {
                console.error("❌ Error deleting task:", err);
            } finally {
                confirmBtn.disabled = false;
            }
        });

        // Edit task
        document.getElementById('editTaskBtn')?.addEventListener('click', () => {
            if (currentTask) {
                editMode = true;
                editCurrentTask(currentTask, modals);
            }
        });

        // Klik task card
        document.getElementById('taskContainer')?.addEventListener('click', (e) => {
            const taskCard = e.target.closest('.task-card');
            if (!taskCard) return;

            const taskId = taskCard.dataset.taskId;
            if (e.target.closest('.task-checkbox')) {
                const modalEl = document.getElementById("completeConfirmModal");
                const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modalInstance.hide();
            } else if (!taskCard.closest('#overdueTasksList')) {
                const foundTask = showTaskDetails(taskId, tasks, modals);
                if (foundTask) currentTask = foundTask;
            }
        });

        // Tombol delete di modal task detail
        document.getElementById('deleteTaskBtn')?.addEventListener('click', () => {
            if (!currentTask) return;
            modals.taskDetailsModal?.hide();
            modals.deleteConfirmModal?.show();
        });

        // Search
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            searchTerm = e.target.value.trim().toLowerCase();
            searchActive = searchTerm !== '';

            const clearBtn = document.getElementById('clearSearchBtn');
            if (clearBtn) clearBtn.style.display = searchActive ? 'block' : 'none';

            if (searchActive) {
                const filteredTasks = tasks.filter(task =>
                    !task.isCompleted &&
                    (
                        task.title.toLowerCase().includes(searchTerm) ||
                        (task.description && task.description.toLowerCase().includes(searchTerm))
                    )
                );
                renderTasks(filteredTasks);
            } else {
                renderIncompleteTasks();
            }
        });

        // Clear search
        document.getElementById('clearSearchBtn')?.addEventListener('click', () => {
            searchTerm = '';
            searchActive = false;
            document.getElementById('searchInput').value = '';
            document.getElementById('clearSearchBtn').style.display = 'none';
            renderIncompleteTasks();
        });

        // Filter
        document.getElementById('applyFilterBtn')?.addEventListener('click', () => {
            const highPrio = document.getElementById('filterPriorityHigh')?.checked;
            const medPrio = document.getElementById('filterPriorityMedium')?.checked;
            const lowPrio = document.getElementById('filterPriorityLow')?.checked;

            const priorities = [];
            if (highPrio) priorities.push(3);
            if (medPrio) priorities.push(2);
            if (lowPrio) priorities.push(1);

            activeFilters.priority = priorities.length > 0 ? priorities : [1, 2, 3];
            filterActive = priorities.length !== 3;
            renderIncompleteTasks();
        });

        document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
            activeFilters = { priority: [1, 2, 3] };
            filterActive = false;
            renderIncompleteTasks();
        });

        // Toggle search & filter panel
        document.getElementById('searchToggleBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchPanel();
        });

        document.getElementById('filterToggleBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFilterPanel(activeFilters);
        });

        document.getElementById('overdueCounter')?.addEventListener('click', () => {
            showOverdueTasks();
        });

        document.getElementById('backToToday')?.addEventListener('click', () => {
            showRegularTasksView();
        });

        // Tombol prioritas (dalam modal)
        document.querySelectorAll('#addEditTaskModal .priority-btn').forEach(button => {
            button.addEventListener('click', function () {
                setPriority(this.dataset.priority);
            });
        });

        // Tambahkan tombol logout ke header
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'btn btn-outline-danger ms-2';
        logoutBtn.addEventListener('click', async () => {
            try {
                await auth.signOut();
                await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });
                window.location.href = '/login';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Failed to log out.');
            }
        });
    }


    function setupRealtimeListener() {
        const userId = currentUser.uid;
        const tasksCollection = collection(db, `users/${userId}/tasks`);

        onSnapshot(tasksCollection, (snapshot) => {
            console.log("📡 Firebase tasks snapshot triggered");

            // ✅ Update global tasks
            tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            console.log("📦 Loaded tasks from Firestore:", tasks);

            // ✅ Pastikan langsung render ulang
            renderIncompleteTasks();
        });
        
        if (isFirstSnapshot) {
            console.log("🎯 Rendering tasks after first snapshot");
            renderIncompleteTasks();
            isFirstSnapshot = false;
        }

        const completedTasksCollection = collection(db, `users/${userId}/completed_tasks`);
        onSnapshot(completedTasksCollection, (snapshot) => {
            completedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        });
    }

    
    
    initApp();
});
>>>>>>> Bakudapa
