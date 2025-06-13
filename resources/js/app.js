// resources/js/app.js
import { generateTaskId } from './modules/utils.js';
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
import { collection, onSnapshot } from 'firebase/firestore';
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
    if (!tasks || tasks.length === 0) {
        console.warn('⚠️ No tasks to render yet.');
        return;
    }

    const incompleteTasks = tasks.filter(task => !task.isCompleted);

    renderTasks(
        incompleteTasks,
        searchActive,
        searchTerm,
        filterActive,
        activeFilters
    );
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



document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOMContentLoaded fired');

    let tasks = [];
    let completedTasks = [];
    let currentUser = null;
    let modals = {};
    let currentTask = null;
    let editMode = false;
    let searchTerm = '';
    let searchActive = false;
    let filterActive = false;
    let activeFilters = { priority: [1, 2, 3] };

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

            tasks = await loadTasksForCurrentUser();
            completedTasks = await loadCompletedTasksForCurrentUser(currentUser);
            
            const firstIncomplete = await loadFirstIncompleteTaskForCurrentUser();
            console.log('🧰 First incomplete task:', firstIncomplete);

            console.log('📊 Data loaded, initializing modals...');
            modals = initializeModals();

            if (!modals || !modals.addEditTaskModal) {
                console.error('❌ Failed to initialize modals');
                alert('Error: Could not initialize app properly. Please refresh the page.');
                return;
            }

            console.log('✅ Modals initialized successfully');
            setupProfileImage(currentUser);
            displayUsername(currentUser);

            console.log('🔗 Setting up event listeners...');
            setupAllEventListeners();

            initNotifications(tasks, modals);
            const incompleteTasks = tasks.filter(task => task.isCompleted === false);
            renderTasks(incompleteTasks);
            setupRealtimeListener();

            if (document.getElementById('taskContainer')) {
                await renderIncompleteTasks();
            }

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

        document.getElementById('addTaskBtn').addEventListener('click', () => {
            showAddTaskModal(modals);
        });

    document.getElementById('saveTaskBtn').addEventListener('click', async () => {
        const saveBtn = document.getElementById('saveTaskBtn');
        saveBtn.disabled = true; // ✅ Cegah klik ganda

        const form = document.getElementById('taskForm');
        const formData = new FormData(form);
        if (!formData.get('title').trim()) {
            alert('Please enter a task title.');
            saveBtn.disabled = false; // Re-enable jika gagal
            return;
        }

        const modalEl = document.getElementById('addEditTaskModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide(); // ✅ Langsung tutup modal

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


    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        confirmBtn.disabled = true;

        if (!currentTask) {
            confirmBtn.disabled = false;
            return;
        }

        modals.deleteConfirmModal.hide(); // ✅ Tutup modal segera

        try {
            tasks = await logicDeleteTask(currentTask.id, tasks, currentUser);
            await saveTasksToStorage(tasks, currentUser);
            currentTask = null;
            renderTasks(
                tasks.filter(task => !task.isCompleted),
                searchActive,
                searchTerm,
                filterActive,
                activeFilters
            );
        } catch (err) {
            console.error("❌ Error deleting task:", err);
        } finally {
            confirmBtn.disabled = false;
        }
    });


        document.getElementById('editTaskBtn').addEventListener('click', () => {
            handleEditTask();
        });

        function handleShowDetails(taskId) {
            const foundTask = showTaskDetails(taskId, tasks, modals);
            if (foundTask) {
                currentTask = foundTask;
            }
        }

        const taskContainer = document.getElementById('taskContainer');
        if (taskContainer) {
            taskContainer.addEventListener('click', (e) => {
                const taskCard = e.target.closest('.task-card');
                if (!taskCard) return;
                const taskId = taskCard.dataset.taskId;

                if (e.target.closest('.task-checkbox')) {
                    handleToggleCompletion(taskId);
                    return;
                }
                if (!taskCard.closest('#overdueTasksList')) {
                    handleShowDetails(taskId);
                }
            });
        } else {
            console.warn("Element with ID 'taskContainer' not found for task card event delegation.");
        }

        document.getElementById('deleteTaskBtn').addEventListener('click', () => {
            if (!currentTask) {
                console.error('No task selected for deletion');
                return;
            }
            if (modals.taskDetailsModal) modals.taskDetailsModal.hide();
            if (modals.deleteConfirmModal) modals.deleteConfirmModal.show();
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            searchTerm = e.target.value.trim().toLowerCase();
            searchActive = searchTerm !== '';

            const clearBtn = document.getElementById('clearSearchBtn');
            if (clearBtn) clearBtn.style.display = searchActive ? 'block' : 'none';

            const filteredTasks = tasks.filter(task =>
                !task.isCompleted &&
                (
                    task.title.toLowerCase().includes(searchTerm) ||
                    (task.description && task.description.toLowerCase().includes(searchTerm))
                )
            );

            renderTasks(filteredTasks);
        });


        document.getElementById('clearSearchBtn').addEventListener('click', () => {
            searchTerm = '';
            searchActive = false;
            document.getElementById('searchInput').value = '';

            const clearBtn = document.getElementById('clearSearchBtn');
            if (clearBtn) clearBtn.style.display = 'none';

            renderIncompleteTasks(); // Tampilkan ulang semua task incomplete
        });


        document.getElementById('applyFilterBtn').addEventListener('click', () => {
            const highPrio = document.getElementById('filterPriorityHigh').checked;
            const medPrio = document.getElementById('filterPriorityMedium').checked;
            const lowPrio = document.getElementById('filterPriorityLow').checked;

            const priorities = [];
            if (highPrio) priorities.push(3);
            if (medPrio) priorities.push(2);
            if (lowPrio) priorities.push(1);

            activeFilters.priority = priorities.length > 0 ? priorities : [1, 2, 3];
            filterActive = priorities.length !== 3;
            renderIncompleteTasks(); // atau renderTasks(filteredTasks) jika pakai search

        });

        document.getElementById('resetFilterBtn').addEventListener('click', () => {
            activeFilters = { priority: [1, 2, 3] };
            filterActive = false;
            renderIncompleteTasks(); // atau renderTasks(filteredTasks) jika pakai search

        });

        document.getElementById('searchToggleBtn').addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchPanel();
        });

        document.getElementById('filterToggleBtn').addEventListener('click', (e) => {
            e.preventDefault();
            toggleFilterPanel(activeFilters);
        });

        document.getElementById('overdueCounter').addEventListener('click', () => {
            showOverdueTasks();
        });

        document.getElementById('backToToday').addEventListener('click', () => {
            showRegularTasksView();
        });

        const priorityButtons = document.querySelectorAll('#addEditTaskModal .priority-btn');
        priorityButtons.forEach(button => {
            button.addEventListener('click', function() {
                setPriority(this.dataset.priority);
            });
        });

        const addTaskBtnFallback = document.getElementById('addTaskBtn');
        if (addTaskBtnFallback && !addTaskBtnFallback.hasAttribute('data-listener-added')) {
            console.log('🔄 Adding fallback event listener for Add Task button');
            addTaskBtnFallback.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🆘 Fallback Add Task handler triggered');

                const modal = document.getElementById('addEditTaskModal');
                if (modal) {
                    const bootstrapModal = new bootstrap.Modal(modal);
                    const form = document.getElementById('taskForm');
                    if (form) form.reset();

                    const today = new Date().toISOString().split('T')[0];
                    const taskDate = document.getElementById('taskDate');
                    if (taskDate) taskDate.value = today;

                    const now = new Date();
                    now.setHours(now.getHours() + 1);
                    const timeString = now.toTimeString().slice(0, 5);
                    const taskTime = document.getElementById('taskTime');
                    if (taskTime) taskTime.value = timeString;

                    const modalTitle = document.getElementById('addEditModalTitle');
                    if (modalTitle) modalTitle.textContent = 'Add New Task';

                    bootstrapModal.show();
                    console.log('✅ Fallback modal shown');
                } else {
                    console.error('❌ Modal element not found');
                    alert('Error: Could not open task form');
                }
            });
            addTaskBtnFallback.setAttribute('data-listener-added', 'true');
        }

        // Add logout button
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
        document.querySelector('.header-padding').appendChild(logoutBtn);
    }

    function setupRealtimeListener() {
        const userId = currentUser.uid;
        const tasksCollection = collection(db, `users/${userId}/tasks`);
        onSnapshot(tasksCollection, (snapshot) => {
        console.log("📡 Firebase tasks snapshot triggered");
        
        tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("📦 Loaded tasks from Firestore:", tasks);

        const incompleteTasks = tasks.filter(task => !task.isCompleted);
        console.log("📋 Filtered incomplete tasks:", incompleteTasks);

        renderIncompleteTasks();
        });


        const completedTasksCollection = collection(db, `users/${userId}/completed_tasks`);
        onSnapshot(completedTasksCollection, (snapshot) => {
            completedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        });
    }

    
    initApp();
});