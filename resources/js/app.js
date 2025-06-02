// Modul utilitas
import { generateTaskId } from './modules/utils.js'; 

// Modul otentikasi dan data
import { checkAuthStatus, getCurrentUser } from './modules/auth.js';
import { 
    loadTasksForCurrentUser, 
    saveTasksToStorage,
    loadCompletedTasksForCurrentUser,
    saveCompletedTasksToStorage 
} from './modules/data.js';
// resources/js/app.js
import { db, auth } from './firebase.js';
import { onValue, ref } from 'firebase/database';

// Modul UI (impor semua yang dibutuhkan oleh event listeners)
import {
    initializeModals, renderTasks, displayUsername, setupProfileImage,
    showAddTaskModal, editCurrentTask, showTaskDetails,
    toggleSearchPanel, toggleFilterPanel, // Impor fungsi toggle panel
    showOverdueTasks, showRegularTasksView, setPriority // Impor fungsi ganti tampilan
    //resetFilterCheckboxes // Anda mungkin perlu ini jika ada di ui.js
} from './modules/ui.js';

// Modul logika tugas
import { saveTask as logicSaveTask, deleteTaskById as logicDeleteTask, toggleTaskCompletion as logicToggleTask } from './modules/task.js';

// Modul notifikasi
import { initNotifications } from './modules/notifications.js';

console.log('✅ app.js loaded');
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOMContentLoaded fired');
    // --- STATE APLIKASI ---
    // Semua data utama aplikasi disimpan di sini. Tidak ada lagi variabel global!
    let tasks = [];
    let completedTasks = []; // Jika Anda melacaknya
    let currentUser = null;
    let modals = {};
    let currentTask = null; // Untuk melacak tugas yang sedang dilihat/diedit
    let editMode = false;

    // --- STATE UNTUK SEARCH & FILTER ---
    // Simpan juga state ini di dalam scope utama agar bisa diakses
    let searchTerm = '';
    let searchActive = false;
    let filterActive = false;
    let activeFilters = { priority: [1, 2, 3] };

    // --- INISIALISASI ---
   function initApp() {
        if (!checkAuthStatus()) {
            window.location.href = '/login';
            return;
        }

        currentUser = getCurrentUser();
        tasks = loadTasksForCurrentUser();
        completedTasks = loadCompletedTasksForCurrentUser(currentUser);
        // Inisialisasi modals dan simpan instance-nya
        modals = initializeModals();

        // Setup UI awal
        setupProfileImage(currentUser);
        displayUsername(currentUser);

        // Pasang semua event listener
        setupAllEventListeners();

        // Mulai notifikasi
        initNotifications(tasks, modals);

        // Render tugas pertama kali
        renderTasks(tasks, searchActive, searchTerm, filterActive, activeFilters);
    }

    // --- HANDLER UNTUK AKSI ---
    function handleEditTask() {
        if (!currentTask) return; 
        // 1. app.js mengubah state
        editMode = true;
        // 2. app.js memanggil fungsi UI dengan data yang relevan
        editCurrentTask(currentTask, modals);
    }
        
    async function handleToggleCompletion(taskId) {
    const { tasks: updatedTasks, completedTasks: updatedCompletedTasks } = await logicToggleTask(taskId, tasks, completedTasks, currentUser);
    tasks = updatedTasks;
    completedTasks = updatedCompletedTasks;
    await saveTasksToStorage(tasks, currentUser);
    await saveCompletedTasksToStorage(completedTasks, currentUser);
    renderTasks(tasks, searchActive, searchTerm, filterActive, activeFilters);
    }


    // --- EVENT LISTENERS ---
    function setupAllEventListeners() {
        console.log('✅ setupAllEventListeners started');
        // Contoh: Tombol "Add Task"
        //   document.getElementById('addTaskBtn').addEventListener('click', () => {
        //     editMode = false;
        //     currentTask = null;
        //     showAddTaskModal(modals); // Panggil fungsi dari ui.js
        // });
        const addTaskBtn = document.getElementById('addTaskBtn');
        console.log('🔍 Looking for #addTaskBtn', addTaskBtn);
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', (e) => {
                console.log('🎯 Add Task button clicked!');
                console.log('📱 Event target:', e.target);
                console.log('🔧 Modals object:', modals);
                
                try {
                    editMode = false;
                    currentTask = null;
                    console.log('🎨 Calling showAddTaskModal...');
                    showAddTaskModal(modals);
                    console.log('✅ showAddTaskModal called successfully');
                } catch (error) {
                    console.error('💥 Error in Add Task handler:', error);
                    alert('Error opening task form. Please try again.');
                }
            });
        } else {
            console.warn("Element with ID 'addTaskBtn' not found for Add Task button event listener.");
        }

        // Contoh: Tombol "Save Task" di dalam modal
        document.getElementById('saveTaskBtn').addEventListener('click', async () => {
        const form = document.getElementById('taskForm');
        const formData = new FormData(form);
        if (!formData.get('title').trim()) {
            alert("Please enter a task title.");
            return;
        }
        tasks = await logicSaveTask(formData, tasks, currentTask, editMode, currentUser);
        await saveTasksToStorage(tasks, currentUser);
        editMode = false;
        currentTask = null;
        renderTasks(tasks, searchActive, searchTerm, filterActive, activeFilters);
        modals.addEditTaskModal.hide();
        });

        // Contoh: Tombol "Delete Task"
        document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        if (!currentTask) return;
        tasks = await logicDeleteTask(currentTask.id, tasks, currentUser);
        await saveTasksToStorage(tasks, currentUser);
        currentTask = null;
        renderTasks(tasks, searchActive, searchTerm, filterActive, activeFilters);
        modals.deleteConfirmModal.hide();
        });

        // Tombol Edit Task (di modal detail)
        document.getElementById('editTaskBtn').addEventListener('click', () => {
            handleEditTask();
        });
        
        function handleShowDetails(taskId) {
            // Panggil fungsi UI untuk menampilkan modal, ia akan mengembalikan data task
            const foundTask = showTaskDetails(taskId, tasks, modals);

            // app.js yang memperbarui state 'currentTask'  
            if (foundTask) {
                currentTask = foundTask;
            }
        }

        // Event delegation untuk semua aksi pada task card
        //const taskContainer = document.getElementById('regularTasksView');
        const taskContainer = document.getElementById('taskContainer');
        if (taskContainer) {
            taskContainer.addEventListener('click', (e) => {
                const taskCard = e.target.closest('.task-card');
                if (!taskCard) return; // Keluar jika yang diklik bukan bagian dari task card
                const taskId = taskCard.dataset.taskId;
                // Aksi: Menyelesaikan tugas (klik checkbox)
                if (e.target.closest('.task-checkbox')) {
                    handleToggleCompletion(taskId);
                    return;
                }
                if (taskCard.closest('#overdueTasksList')) {
                    // Mungkin Anda ingin aksi berbeda atau tidak sama sekali untuk klik kartu overdue
                    // Untuk saat ini, kita biarkan agar ceklisnya berfungsi
                } else {
                    // Aksi: Menampilkan detail tugas (klik di mana saja pada kartu)
                    handleShowDetails(taskId);
                }
            });
        } else {
            console.warn("Element with ID 'regularTasksView' not found for task card event delegation.");
        }

        // Fix: Add event listener for Delete Task button in task details modal
        document.getElementById('deleteTaskBtn').addEventListener('click', () => {
            if (!currentTask) {
                console.error("No task selected for deletion");
                return;
            }
            // Hide task details modal and show delete confirmation modal
            if (modals.taskDetailsModal) modals.taskDetailsModal.hide();
            if (modals.deleteConfirmModal) modals.deleteConfirmModal.show();
        });

        //Search Input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            // Perbarui state pencarian
            searchTerm = e.target.value.trim().toLowerCase();
            searchActive = searchTerm !== '';
        
            // Show clear button when search has text
            const clearBtn = document.getElementById('clearSearchBtn');
            if (clearBtn) clearBtn.style.display = searchActive ? 'block' : 'none';
        
            // Render ulang UI dengan state baru
            renderTasks(tasks, searchActive, searchTerm, filterActive, activeFilters);
        });

        // Tombol Clear Search
        document.getElementById('clearSearchBtn').addEventListener('click', () => {
            searchTerm = '';
            searchActive = false;
            document.getElementById('searchInput').value = '';
            
            // Hide clear button
            const clearBtn = document.getElementById('clearSearchBtn');
            if (clearBtn) clearBtn.style.display = 'none';
            
            renderTasks(tasks, searchActive, searchTerm, filterActive, activeFilters);
        });
    
        // Tombol "Apply Filter"
        document.getElementById('applyFilterBtn').addEventListener('click', () => {
            // Dapatkan nilai dari checkbox filter
            const highPrio = document.getElementById('filterPriorityHigh').checked;
            const medPrio = document.getElementById('filterPriorityMedium').checked;
            const lowPrio = document.getElementById('filterPriorityLow').checked;
        
            const priorities = [];
            if (highPrio) priorities.push(3);
            if (medPrio) priorities.push(2);
            if (lowPrio) priorities.push(1);
        
            // Perbarui state filter
            activeFilters.priority = priorities.length > 0 ? priorities : [1, 2, 3];
            filterActive = priorities.length !== 3;
        
            // Render ulang UI
            renderTasks(tasks, searchActive, searchTerm, filterActive, activeFilters);
        });

        // Tombol Reset Filter
        document.getElementById('resetFilterBtn').addEventListener('click', () => {
            activeFilters = { priority: [1, 2, 3] };
            filterActive = false;
            // Anda mungkin perlu memanggil fungsi dari ui.js untuk mereset checkbox
            // if (typeof resetFilterCheckboxes === 'function') resetFilterCheckboxes();
            renderTasks(tasks, searchActive, searchTerm, filterActive, activeFilters);
        });

        //Toggle Panel Search & Filter
        document.getElementById('searchToggleBtn').addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchPanel();
        });
        document.getElementById('filterToggleBtn').addEventListener('click', (e) => {
            e.preventDefault();
            toggleFilterPanel(activeFilters);
        });

        //Navigasi Tampilan Overdue dan Back to Today
        document.getElementById('overdueCounter').addEventListener('click', () => {
            showOverdueTasks();
        });
        document.getElementById('backToToday').addEventListener('click', () => {
            showRegularTasksView();
        });

        // Event listener untuk tombol prioritas di modal
        const priorityButtons = document.querySelectorAll('#addEditTaskModal .priority-btn');
            priorityButtons.forEach(button => {
                button.addEventListener('click', function() {
                setPriority(this.dataset.priority);
            });
        });
        // 🆘 FALLBACK: Jika modul UI gagal, buat handler manual
const addTaskBtnFallback = document.getElementById('addTaskBtn');
if (addTaskBtnFallback && !addTaskBtnFallback.hasAttribute('data-listener-added')) {
    console.log('🔄 Adding fallback event listener for Add Task button');
    
    addTaskBtnFallback.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🆘 Fallback Add Task handler triggered');
        
        // Manual modal handling jika modul UI tidak tersedia
        const modal = document.getElementById('addEditTaskModal');
        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            
            // Reset form
            const form = document.getElementById('taskForm');
            if (form) form.reset();
            
            // Set default values
            const today = new Date().toISOString().split('T')[0];
            const taskDate = document.getElementById('taskDate');
            if (taskDate) taskDate.value = today;
            
            const now = new Date();
            now.setHours(now.getHours() + 1);
            const timeString = now.toTimeString().slice(0, 5);
            const taskTime = document.getElementById('taskTime');
            if (taskTime) taskTime.value = timeString;
            
            // Update title
            const modalTitle = document.getElementById('addEditModalTitle');
            if (modalTitle) modalTitle.textContent = 'Add New Task';
            
            // Show modal
            bootstrapModal.show();
            console.log('✅ Fallback modal shown');
        } else {
            console.error('❌ Modal element not found');
            alert('Error: Could not open task form');
        }
    });
    
    addTaskBtnFallback.setAttribute('data-listener-added', 'true');
}
    }



    function setupRealtimeListener() {
    const tasksRef = ref(db, `users/${currentUser.uid}/tasks`);
    onValue(tasksRef, (snapshot) => {
        tasks = snapshot.exists() ? Object.values(snapshot.val()) : [];
        renderTasks(tasks, searchActive, searchTerm, filterActive, activeFilters);
    });

    const completedTasksRef = ref(db, `users/${currentUser.uid}/completedTasks`);
    onValue(completedTasksRef, (snapshot) => {
        completedTasks = snapshot.exists() ? Object.values(snapshot.val()) : [];
    });
    }
    // --- MULAI APLIKASI ---
    // async function initApp() {
    //     try {
    //         console.log('🚀 Starting app initialization...');
            
    //         if (!await checkAuthStatus()) {
    //             console.log('❌ Auth check failed, redirecting to login');
    //             window.location.href = '/login';
    //             return;
    //         }
            
    //         console.log('✅ Auth check passed');
    //         currentUser = auth.currentUser || getCurrentUser();
    //         tasks = await loadTasksForCurrentUser();
    //         completedTasks = await loadCompletedTasksForCurrentUser(currentUser);
            
    //         console.log('📊 Data loaded, initializing modals...');
    //         modals = initializeModals();
            
    //         if (!modals || !modals.addEditTaskModal) {
    //             console.error('❌ Failed to initialize modals');
    //             alert('Error: Could not initialize app properly. Please refresh the page.');
    //             return;
    //         }
            
    //         console.log('✅ Modals initialized successfully');
    //         setupProfileImage(currentUser);
    //         displayUsername(currentUser);
            
    //         console.log('🔗 Setting up event listeners...');
    //         setupAllEventListeners();
            
    //         initNotifications(tasks, modals);
    //         renderTasks(tasks, searchActive, searchTerm, filterActive, activeFilters);
    //         setupRealtimeListener();
            
    //         console.log('🎉 App initialization complete!');
            
    //     } catch (error) {
    //         console.error('💥 Error initializing app:', error);
    //         alert('An error occurred while loading the app. Please refresh the page.');
    //     }
    // }
    initApp();
});