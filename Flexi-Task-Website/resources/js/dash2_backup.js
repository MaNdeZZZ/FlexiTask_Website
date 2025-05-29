// Remove the import statement as we're loading Bootstrap via CDN
// import 'bootstrap';

// Task Management JavaScript

// Global variables
let tasks = [];
let currentTask = null;
let editMode = false;
let searchActive = false;
let searchTerm = '';
let filterActive = false;
let activeFilters = { priority: [1, 2, 3] };
let notificationWorker = null;

// Modal references
let addEditTaskModal = null;
let taskDetailsModal = null;
let deleteConfirmModal = null;
let saveConfirmModal = null;

// Fungsi initApp yang akan kita panggil saat DOM siap
function initApp() {
    console.log("Initializing dashboard application...");

    // 1. Inisialisasi semua modal terlebih dahulu
    initializeModals();

    // 2. Cek status autentikasi
    if (!checkAuthStatus()) {
        return; // Hentikan inisialisasi jika tidak terautentikasi
    }

    // 3. Muat data tugas (dari localStorage untuk saat ini)
    tasks = loadTasksForCurrentUser();

    // 4. Siapkan elemen UI
    setupProfileImage();
    displayUsername(); 
    setDefaultTaskDate();

    // 5. Pasang semua event listener
    setupEventListeners();

    // 6. Inisialisasi komponen lain seperti panel collapse
    initCollapsibles();

    // 7. Inisialisasi notifikasi
    initNotifications();

    // 8. Render tugas ke layar
    renderTasks();

    console.log("Dashboard initialization complete");
}

// Initialize the application - fixed to load AFTER bootstrap is available
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, waiting for Bootstrap...");
    
    // Ensure Bootstrap is fully loaded
    if (typeof bootstrap === 'undefined') {
        console.error("Bootstrap is not loaded! Loading functions will fail.");
        // Try to load it manually
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
        document.body.appendChild(script);
        
        script.onload = function() {
            console.log("Bootstrap loaded manually");
            setTimeout(initApp, 500);
        };
    } else {
        console.log("Bootstrap is loaded, initializing app");
        setTimeout(initApp, 100);
    }
});

// Initialize Bootstrap modals safely
function initializeModals() {
    console.log("Initializing modals...");
    
    try {
        const addEditTaskModalEl = document.getElementById('addEditTaskModal');
        const taskDetailsModalEl = document.getElementById('taskDetailsModal');
        const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
        const saveConfirmModalEl = document.getElementById('saveConfirmModal');
        
        if (addEditTaskModalEl) {
            addEditTaskModal = new bootstrap.Modal(addEditTaskModalEl);
            console.log("Add/Edit Task modal initialized");
        } else {
            console.error("Add/Edit Task modal element not found");
        }
        
        if (taskDetailsModalEl) {
            taskDetailsModal = new bootstrap.Modal(taskDetailsModalEl);
            console.log("Task Details modal initialized");
        } else {
            console.error("Task Details modal element not found");
        }
        
        if (deleteConfirmModalEl) {
            deleteConfirmModal = new bootstrap.Modal(deleteConfirmModalEl);
            console.log("Delete Confirm modal initialized");
        } else {
            console.error("Delete Confirm modal element not found");
        }
        
        if (saveConfirmModalEl) {
            saveConfirmModal = new bootstrap.Modal(saveConfirmModalEl);
            console.log("Save Confirm modal initialized");
        } else {
            console.error("Save Confirm modal element not found");
        }
    } catch (error) {
        console.error("Error initializing modals:", error);
    }
}

// Check if user is logged in
function checkAuthStatus() {
    console.log("Checking authentication status...");
    
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        console.log("User not authenticated, redirecting to login");
        window.location.href = '/login';
        return false;
    }
    
    // Log authentication details for debugging
    console.log("User authenticated:", currentUser.username || currentUser.email);
    
    return true;
}

// Get current user from session/localStorage
function getCurrentUser() {
    // In a Laravel app, we could check for a user session
    // For now, we'll check localStorage as a fallback
    try {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            return JSON.parse(userJson);
        }
        
        // Check if we have Laravel auth data available
        const userElement = document.getElementById('auth-user-data');
        if (userElement && userElement.dataset.user) {
            const userData = JSON.parse(userElement.dataset.user);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            return userData;
        }
        
        // For testing purposes, create a dummy user if none exists
        const dummyUser = { 
            id: 'test_user', 
            username: 'Test User', 
            email: 'test@example.com' 
        };
        localStorage.setItem('currentUser', JSON.stringify(dummyUser));
        return dummyUser;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}

// Load tasks for current user
function loadTasksForCurrentUser() {
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

// Set up profile image
function setupProfileImage() {
    console.log("Setting up profile image");
    
    const profileImageContainer = document.getElementById('headerProfileImage');
    if (!profileImageContainer) {
        console.error("Profile image container not found");
        return;
    }
    
    const currentUser = getCurrentUser();
    
    if (currentUser && currentUser.profileImage) {
        // If we have a profile image URL, show that
        profileImageContainer.innerHTML = `<img src="${currentUser.profileImage}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
        // Otherwise show an icon
        profileImageContainer.innerHTML = '<i class="bi bi-person-circle" style="font-size: 2rem; color: #6c757d;"></i>';
        profileImageContainer.style.backgroundColor = '#f8f9fa';
    }
}

// Set default task date to today
function setDefaultTaskDate() {
    const taskDateInput = document.getElementById('taskDate');
    if (taskDateInput) {
        const today = new Date();
        taskDateInput.value = today.toISOString().split('T')[0];
    }
    
    const taskTimeInput = document.getElementById('taskTime');
    if (taskTimeInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // Default to 30 minutes from now
        taskTimeInput.value = now.getHours().toString().padStart(2, '0') + ':' + 
                              now.getMinutes().toString().padStart(2, '0');
    }
}

// Set up all event listeners - FIXED version that properly attaches events
function setupEventListeners() {
    console.log("Setting up event listeners");
    
    // Add Task button
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Add Task button clicked");
            showAddTaskModal();
        });
    } else {
        console.error("Add Task button not found");
    }
    
    // Search and filter toggles - Direct click handlers
    const searchToggleBtn = document.getElementById('searchToggleBtn');
    if (searchToggleBtn) {
        searchToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Search toggle button clicked");
            toggleSearchPanel();
        });
    }
    
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    if (filterToggleBtn) {
        filterToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Filter toggle button clicked");
            toggleFilterPanel();
        });
    }
    
    // Overdue counter
    const overdueCounter = document.getElementById('overdueCounter');
    if (overdueCounter) {
        overdueCounter.addEventListener('click', function() {
            console.log("Overdue counter clicked");
            showOverdueTasks();
        });
    }
    
    // Back to today button
    const backToToday = document.getElementById('backToToday');
    if (backToToday) {
        backToToday.addEventListener('click', function() {
            console.log("Back to today clicked");
            showRegularTasksView();
        });
    }
    
    // Task management buttons
    attachEventListenerSafely('saveTaskBtn', 'click', saveTask);
    attachEventListenerSafely('confirmDeleteBtn', 'click', deleteCurrentTask);
    attachEventListenerSafely('confirmSaveBtn', 'click', confirmSave);
    attachEventListenerSafely('deleteTaskBtn', 'click', confirmDeleteTask);
    attachEventListenerSafely('editTaskBtn', 'click', editCurrentTask);
    
    // Search and filter inputs
    attachEventListenerSafely('searchInput', 'input', handleSearch);
    attachEventListenerSafely('clearSearchBtn', 'click', clearSearch);
    attachEventListenerSafely('applyFilterBtn', 'click', applyFilters);
    attachEventListenerSafely('resetFilterBtn', 'click', resetFilters);
    
    // Priority buttons
    const priorityButtons = document.querySelectorAll('.priority-btn');
    if (priorityButtons.length > 0) {
        priorityButtons.forEach(button => {
            button.addEventListener('click', function() {
                setPriority(this.dataset.priority);
            });
        });
    }
    
    // Notification toggle
    const enableNotification = document.getElementById('enableNotification');
    if (enableNotification) {
        enableNotification.addEventListener('change', function() {
            const notificationTimeContainer = document.getElementById('notificationTimeContainer');
            if (notificationTimeContainer) {
                notificationTimeContainer.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
    
    // Set up global task completion handler
    document.addEventListener('click', function(e) {
        const taskCheckbox = e.target.closest('.task-checkbox');
        if (taskCheckbox) {
            const taskCard = taskCheckbox.closest('.task-card');
            if (taskCard && taskCard.dataset.taskId) {
                toggleTaskCompletion(taskCard.dataset.taskId);
            }
        }
    });
}

// Safely attach an event listener (helper function)
function attachEventListenerSafely(elementId, event, handler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(event, handler);
    } else {
        console.warn(`Element with ID '${elementId}' not found for event '${event}'`);
    }
}

// Display username in the UI
function displayUsername() {
    const currentUser = getCurrentUser();
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay && currentUser) {
        usernameDisplay.textContent = currentUser.username || currentUser.name || 'User';
    }
}

// Initialize collapsible panels
function initCollapsibles() {
    // Set initial display state for panels
    const searchPanel = document.getElementById('searchPanel');
    const filterPanel = document.getElementById('filterPanel');
    
    if (searchPanel) searchPanel.style.display = 'none';
    if (filterPanel) filterPanel.style.display = 'none';
    
    // Setup click outside behavior to close panels
    document.addEventListener('click', function(event) {
        // If click is outside the panels and toggle buttons
        if (!event.target.closest('#searchPanel') && 
            !event.target.closest('#searchToggleBtn') && 
            !event.target.closest('#filterPanel') && 
            !event.target.closest('#filterToggleBtn')) {
            
            // Close panels if they're open
            if (searchPanel && searchPanel.style.display === 'block') {
                searchPanel.style.display = 'none';
            }
            if (filterPanel && filterPanel.style.display === 'block') {
                filterPanel.style.display = 'none';
            }
        }
    });
}

// Fixed: Toggle search panel visibility
function toggleSearchPanel() {
    console.log("Toggling search panel");
    
    const searchPanel = document.getElementById('searchPanel');
    const filterPanel = document.getElementById('filterPanel');
    const searchBtn = document.getElementById('searchToggleBtn');
    
    if (!searchPanel || !filterPanel) {
        console.error("Search or filter panel not found");
        return;
    }
    
    // Close filter panel if it's open
    filterPanel.style.display = 'none';
    
    // Toggle search panel
    searchPanel.style.display = searchPanel.style.display === 'block' ? 'none' : 'block';
    
    // Update button UI
    if (searchBtn) {
        searchBtn.classList.toggle('active', searchPanel.style.display === 'block');
    }
    
    // Focus on search input if panel is now visible
    if (searchPanel.style.display === 'block') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
    }
}

// Fixed: Toggle filter panel visibility
function toggleFilterPanel() {
    console.log("Toggling filter panel");
    
    const searchPanel = document.getElementById('searchPanel');
    const filterPanel = document.getElementById('filterPanel');
    const filterBtn = document.getElementById('filterToggleBtn');
    
    if (!searchPanel || !filterPanel) {
        console.error("Search or filter panel not found");
        return;
    }
    
    // Close search panel if it's open
    searchPanel.style.display = 'none';
    
    // Toggle filter panel
    filterPanel.style.display = filterPanel.style.display === 'block' ? 'none' : 'block';
    
    // Update button UI
    if (filterBtn) {
        filterBtn.classList.toggle('active', filterPanel.style.display === 'block');
    }
    
    // Update filter checkboxes if panel is now visible
    if (filterPanel.style.display === 'block') {
        updateFilterCheckboxes();
    }
}

// Update filter checkboxes based on current filters
function updateFilterCheckboxes() {
    console.log("Updating filter checkboxes");
    
    const highPriorityCheckbox = document.getElementById('filterPriorityHigh');
    const mediumPriorityCheckbox = document.getElementById('filterPriorityMedium');
    const lowPriorityCheckbox = document.getElementById('filterPriorityLow');
    
    if (highPriorityCheckbox) highPriorityCheckbox.checked = activeFilters.priority.includes(3);
    if (mediumPriorityCheckbox) mediumPriorityCheckbox.checked = activeFilters.priority.includes(2);
    if (lowPriorityCheckbox) lowPriorityCheckbox.checked = activeFilters.priority.includes(1);
}

// Fixed: Show the add task modal
function showAddTaskModal() {
    console.log("Opening Add Task modal");
    
    // Reset form and prepare for new task
    editMode = false;
    currentTask = null;
    
    // Update modal title
    const modalTitle = document.getElementById('addEditModalTitle');
    if (modalTitle) modalTitle.textContent = 'Add Task';
    
    // Reset form fields
    const taskForm = document.getElementById('taskForm');
    if (taskForm) taskForm.reset();
    
    // Reset priority
    setPriority(1);
    
    // Set default date and time
    setDefaultTaskDate();
    
    // Hide notification time container by default
    const notificationTimeContainer = document.getElementById('notificationTimeContainer');
    if (notificationTimeContainer) notificationTimeContainer.style.display = 'none';
    
    // Show the modal
    if (addEditTaskModal) {
        addEditTaskModal.show();
    } else {
        console.error("Modal not initialized");
        // Try to create and show the modal directly
        const modalElement = document.getElementById('addEditTaskModal');
        if (modalElement) {
            try {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            } catch (error) {
                console.error("Error showing modal:", error);
            }
        }
    }
}

// Set priority in the add/edit task form - FIXED for correct button outlines
function setPriority(priority) {
    // Update hidden input
    const priorityInput = document.getElementById('taskPriority');
    if (priorityInput) priorityInput.value = priority;
    
    // Update button UI
    const priorityButtons = document.querySelectorAll('.priority-btn');
    if (priorityButtons.length > 0) {
        priorityButtons.forEach(button => {
            // First, remove all active classes and reset to outline state
            button.classList.remove('active');
            button.classList.remove('btn-success', 'btn-warning', 'btn-danger');
            
            // Apply the correct outline color based on the button's own priority
            if (button.dataset.priority === '1') {
                button.classList.add('btn-outline-success');
                button.classList.remove('btn-outline-warning', 'btn-outline-danger');
            } else if (button.dataset.priority === '2') {
                button.classList.add('btn-outline-warning');
                button.classList.remove('btn-outline-success', 'btn-outline-danger');
            } else if (button.dataset.priority === '3') {
                button.classList.add('btn-outline-danger');
                button.classList.remove('btn-outline-success', 'btn-outline-warning');
            }
            
            // Add active class to selected button and apply solid color
            if (button.dataset.priority === priority.toString()) {
                button.classList.add('active');
                
                // Remove outline class for the selected button
                if (priority === '1' || priority === 1) {
                    button.classList.remove('btn-outline-success');
                    button.classList.add('btn-success');
                } else if (priority === '2' || priority === 2) {
                    button.classList.remove('btn-outline-warning');
                    button.classList.add('btn-warning');
                } else {
                    button.classList.remove('btn-outline-danger');
                    button.classList.add('btn-danger');
                }
            }
        });
    }
}

// Initialize notifications
function initNotifications() {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return;
    }
    
    // Check notification permission
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        // We'll ask for permission when user tries to enable notifications
    }
    
    // Start checking for notifications
    startNotificationChecker();
}

// Start notification checker
function startNotificationChecker() {
    // Clear any existing interval
    if (notificationWorker) {
        clearInterval(notificationWorker);
    }
    
    // Check for notifications every minute
    notificationWorker = setInterval(checkForDueNotifications, 60000);
    
    // Also check immediately
    checkForDueNotifications();
}

// Check for tasks that need notifications
function checkForDueNotifications() {
    // Only proceed if notification permission is granted
    if (Notification.permission !== 'granted') return;
    
    const now = new Date();
    
    // Check all tasks with notifications enabled
    tasks.filter(task => task.enableNotification || task.notification).forEach(task => {
        const taskDateTime = new Date(task.date + 'T' + (task.time || '00:00'));
        const notificationMinutes = parseInt(task.notificationTime || 30);
        
        // Calculate when notification should be sent
        const notificationTime = new Date(taskDateTime.getTime() - (notificationMinutes * 60000));
        
        // Check if it's time to send notification
        // Add a 2-minute buffer to catch notifications that might have been missed
        const timeDifference = now.getTime() - notificationTime.getTime();
        if (timeDifference >= 0 && timeDifference <= 120000) {
            sendNotification(task);
        }
    });
}

// Render tasks to the UI
function renderTasks() {
    console.log("Rendering tasks");
    
    // Get task containers
    const todayTasksList = document.getElementById('todayTasksList');
    const tomorrowTasksList = document.getElementById('tomorrowTasksList');
    const upcomingTasksContainer = document.getElementById('upcomingTasksContainer');
    const overdueTasksList = document.getElementById('overdueTasksList');
    
    // Clear existing content
    if (todayTasksList) todayTasksList.innerHTML = '';
    if (tomorrowTasksList) tomorrowTasksList.innerHTML = '';
    if (upcomingTasksContainer) upcomingTasksContainer.innerHTML = '';
    if (overdueTasksList) overdueTasksList.innerHTML = '';
    
    // Group tasks by date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Apply filters to tasks if search or filter is active
    let filteredTasks = tasks;
    
    if (searchActive || filterActive) {
        filteredTasks = tasks.filter(task => {
            // Skip completed tasks
            if (task.completed) return false;
            
            // Search term filter
            const matchesSearch = !searchActive || 
                task.title.toLowerCase().includes(searchTerm) || 
                (task.description && task.description.toLowerCase().includes(searchTerm));
            
            // Priority filter
            const matchesPriority = activeFilters.priority.includes(task.priority);
            
            return matchesSearch && matchesPriority;
        });
    } else {
        // Just filter out completed tasks
        filteredTasks = tasks.filter(task => !task.completed);
    }
    
    // Organize tasks by date
    const todayTasks = [];
    const pastTimeTodayTasks = [];
    const tomorrowTasks = [];
    const upcomingTasks = {};
    const overdueTasks = [];
    
    // Process each filtered task and categorize
    filteredTasks.forEach(task => {
        const taskDate = new Date(task.date + 'T00:00:00');
        const taskDateTime = new Date(task.date + 'T' + (task.time || '00:00'));
        
        // Check if task date is before yesterday (at least 1 day overdue)
        if (taskDate < yesterday) {
            overdueTasks.push(task);
            return;
        }
        
        // Check if task is for today but past its time
        if (taskDate.getFullYear() === today.getFullYear() &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getDate() === today.getDate() &&
            taskDateTime < now) {
            pastTimeTodayTasks.push(task);
            return;
        }
        
        // Check if task is for today (and not past time)
        if (taskDate.getFullYear() === today.getFullYear() &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getDate() === today.getDate()) {
            todayTasks.push(task);
            return;
        }
        
        // Check if task is for tomorrow
        if (taskDate.getFullYear() === tomorrow.getFullYear() &&
            taskDate.getMonth() === tomorrow.getMonth() &&
            taskDate.getDate() === tomorrow.getDate()) {
            tomorrowTasks.push(task);
            return;
        }
        
        // Otherwise, it's an upcoming task
        const dateKey = task.date;
        if (!upcomingTasks[dateKey]) {
            upcomingTasks[dateKey] = [];
        }
        upcomingTasks[dateKey].push(task);
    });
    
    // Sort all task lists by priority first, then by time
    function sortTasksByPriorityAndTime(taskList) {
        return taskList.sort((a, b) => {
            // Sort by priority first (higher priority comes first)
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            
            // If same priority, sort by time
            const timeA = new Date(a.date + 'T' + (a.time || '00:00'));
            const timeB = new Date(b.date + 'T' + (b.time || '00:00'));
            return timeA - timeB;
        });
    }
    
    // Apply sorting to all task lists
    sortTasksByPriorityAndTime(overdueTasks);
    sortTasksByPriorityAndTime(pastTimeTodayTasks);
    sortTasksByPriorityAndTime(todayTasks);
    sortTasksByPriorityAndTime(tomorrowTasks);
    
    // Also sort upcoming tasks
    for (const dateKey in upcomingTasks) {
        sortTasksByPriorityAndTime(upcomingTasks[dateKey]);
    }
    
    // Update overdue counter
    updateOverdueCounter(overdueTasks.length);
    
    // Render today's tasks - including those past their time but still today
    if (todayTasksList) {
        // First add past-time tasks
        pastTimeTodayTasks.forEach(task => {
            const card = createTaskCard(task, false, true);
            todayTasksList.appendChild(card);
        });
        
        // Then add upcoming tasks for today
        todayTasks.forEach(task => {
            todayTasksList.appendChild(createTaskCard(task));
        });
    }
    
    // Handle visibility of today section, header, and task list
    const todaySection = document.getElementById('todaySection');
    const todayHeader = document.querySelector('.today-header');
    if (todaySection) {
        const allTodayTasks = [...todayTasks, ...pastTimeTodayTasks];
        const hasOverdueTasks = overdueTasks.length > 0;
        
        // Always keep the section visible if there are overdue tasks
        todaySection.style.display = (allTodayTasks.length > 0 || hasOverdueTasks) ? 'block' : 'none';
        
        // Hide only the Today header text if no today tasks but have overdue tasks
        if (todayHeader && allTodayTasks.length === 0 && hasOverdueTasks) {
            todayHeader.style.display = 'none';
        } else if (todayHeader) {
            todayHeader.style.display = 'block';
        }
        
        // Hide tasks list when there are no today tasks
        if (allTodayTasks.length === 0 && todayTasksList) {
            todayTasksList.style.display = 'none';
        } else if (todayTasksList) {
            todayTasksList.style.display = 'block';
        }
    }
    
    // Render tomorrow's tasks
    if (tomorrowTasksList) {
        tomorrowTasks.forEach(task => {
            tomorrowTasksList.appendChild(createTaskCard(task));
        });
    }
    
    // Show/hide tomorrow section based on tasks
    const tomorrowSection = document.getElementById('tomorrowSection');
    if (tomorrowSection) {
        tomorrowSection.style.display = tomorrowTasks.length > 0 ? 'block' : 'none';
    }
    
    // Render upcoming tasks
    if (upcomingTasksContainer) {
        renderUpcomingTasks(upcomingTasksContainer, upcomingTasks);
    }
    
    // Render overdue tasks
    if (overdueTasksList) {
        overdueTasks.forEach(task => {
            overdueTasksList.appendChild(createTaskCard(task, true));
        });
    }
    
    // Show no tasks message if needed
    const noTasksMessage = document.getElementById('noTasksMessage');
    if (noTasksMessage) {
        const allTasksFiltered = [...todayTasks, ...pastTimeTodayTasks, ...tomorrowTasks, ...overdueTasks];
        for (const dateKey in upcomingTasks) {
            allTasksFiltered.push(...upcomingTasks[dateKey]);
        }
        
        if (allTasksFiltered.length === 0) {
            noTasksMessage.classList.remove('d-none');
            
            // Custom message for search/filter
            if (searchActive || filterActive) {
                const noTasksIcon = noTasksMessage.querySelector('.bi');
                const noTasksTitle = noTasksMessage.querySelector('h5');
                const noTasksText = noTasksMessage.querySelector('p');
                
                if (noTasksIcon) noTasksIcon.className = 'bi bi-search';
                if (noTasksTitle) noTasksTitle.textContent = 'No matching tasks found';
                if (noTasksText) noTasksText.textContent = 'Try different search terms or filters';
            } else {
                // Reset to default message
                const noTasksIcon = noTasksMessage.querySelector('.bi');
                const noTasksTitle = noTasksMessage.querySelector('h5');
                const noTasksText = noTasksMessage.querySelector('p');
                
                if (noTasksIcon) noTasksIcon.className = 'bi bi-calendar-x';
                if (noTasksTitle) noTasksTitle.textContent = 'No tasks today';
                if (noTasksText) noTasksText.textContent = 'Click the + button below to add a new task';
            }
        } else {
            noTasksMessage.classList.add('d-none');
        }
    }
}

// Update the overdue counter
function updateOverdueCounter(count) {
    const overdueCountElement = document.getElementById('overdueCount');
    if (overdueCountElement) {
        overdueCountElement.textContent = count.toString();
    }
    
    const overdueCounterContainer = document.getElementById('overdueCounterContainer');
    if (overdueCounterContainer) {
        overdueCounterContainer.style.display = count > 0 ? 'block' : 'none';
    }
}

// Show overdue tasks view
function showOverdueTasks() {
    console.log("Showing overdue tasks view");
    
    const regularTasksView = document.getElementById('regularTasksView');
    const overdueTasksView = document.getElementById('overdueTasksView');
    
    if (regularTasksView) regularTasksView.style.display = 'none';
    if (overdueTasksView) overdueTasksView.style.display = 'block';
}

// Show regular tasks view
function showRegularTasksView() {
    console.log("Showing regular tasks view");
    
    const regularTasksView = document.getElementById('regularTasksView');
    const overdueTasksView = document.getElementById('overdueTasksView');
    
    if (regularTasksView) regularTasksView.style.display = 'block';
    if (overdueTasksView) overdueTasksView.style.display = 'none';
}

// Create a task card element - IMPROVED to add days overdue for overdue tasks
function createTaskCard(task, isOverdue = false, isPastTime = false) {
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.dataset.taskId = task.id;
    
    // Add styling classes
    if (isOverdue) {
        taskCard.classList.add('overdue');
    } else if (isPastTime) {
        taskCard.classList.add('past-time');
    }
    
    // Create priority indicator for medium and high priorities
    let priorityIndicator = '';
    if (task.priority > 1) {
        const priorityClass = task.priority === 3 ? 'priority-high' : 'priority-medium';
        priorityIndicator = `<div class="${priorityClass}"></div>`;
    }
    
    // Create notification bell icon if notifications are enabled
    const notificationIcon = (task.enableNotification || task.notification) 
        ? `<div class="notification-bell ${isPastTime ? '' : 'active'}" title="Notification set for ${getNotificationText(task.notificationTime || 30)}">
             <i class="bi bi-bell-fill"></i>
           </div>`
        : '';
    
    // Calculate days overdue for tasks that are overdue
    let daysOverdueText = '';
    if (isOverdue) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(task.date + 'T00:00:00');
        const diffTime = Math.abs(today - taskDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
            daysOverdueText = `<div class="text-danger small fw-bold mt-1">${diffDays} day${diffDays > 1 ? 's' : ''} overdue</div>`;
        }
    }
    
    // Create task card HTML using template string for more consistent styling
    taskCard.innerHTML = `
        <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="task-info flex-grow-1">
                    <div class="d-flex align-items-center mb-1">
                        ${priorityIndicator}
                        <h6 class="mb-0">${task.title}</h6>
                    </div>
                    ${task.description ? `<p class="task-description small text-muted mb-1">${task.description}</p>` : ''}
                    <div class="task-time small ${isPastTime ? 'text-danger' : 'text-muted'}">${formatTime(task.time || '00:00')}</div>
                    ${daysOverdueText}
                </div>
                <div class="task-actions ms-3">
                    ${notificationIcon}
                    <div class="task-checkbox">
                        <i class="bi bi-circle"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add click handlers
    const checkbox = taskCard.querySelector('.task-checkbox');
    if (checkbox) {
        checkbox.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleTaskCompletion(task.id);
        });
    }
    
    // Add task details click handler for the whole card (except the checkbox)
    taskCard.addEventListener('click', function(e) {
        if (!e.target.closest('.task-checkbox')) {
            showTaskDetails(task.id);
        }
    });
    
    return taskCard;
}

// Render upcoming tasks
function renderUpcomingTasks(container, upcomingTasks) {
    if (!container) return;
    
    // Sort dates
    const dates = Object.keys(upcomingTasks).sort();
    
    dates.forEach(dateString => {
        const tasks = upcomingTasks[dateString];
        if (tasks.length === 0) return;
        
        // Create date section
        const dateSection = document.createElement('div');
        dateSection.className = 'date-section';
        
        // Create date header
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';
        
        // Format date
        dateHeader.textContent = formatDate(dateString);
        
        // Create tasks list
        const tasksList = document.createElement('div');
        tasksList.className = 'tasks-list';
        
        // Add tasks to list
        tasks.forEach(task => {
            const taskCard = createTaskCard(task);
            tasksList.appendChild(taskCard);
        });
        
        // Add elements to container
        dateSection.appendChild(dateHeader);
        dateSection.appendChild(tasksList);
        
        container.appendChild(dateSection);
    });
}

// Handle search input
function handleSearch(e) {
    const input = e.target;
    const clearBtn = document.getElementById('clearSearchBtn');
    
    searchTerm = input.value.trim().toLowerCase();
    searchActive = searchTerm !== '';
    
    // Show/hide clear button based on search input
    if (clearBtn) {
        clearBtn.style.display = searchTerm ? 'block' : 'none';
    }
    
    // Update search button state
    const searchBtn = document.getElementById('searchToggleBtn');
    if (searchBtn) {
        searchBtn.classList.toggle('active', searchActive);
    }
    
    renderTasks();
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.style.display = 'none';
    
    searchTerm = '';
    searchActive = false;
    
    // Update search button state
    const searchBtn = document.getElementById('searchToggleBtn');
    if (searchBtn) {
        searchBtn.classList.remove('active');
    }
    
    renderTasks();
}

// Apply filters
function applyFilters() {
    // Get filter values
    const highPriorityCheckbox = document.getElementById('filterPriorityHigh');
    const mediumPriorityCheckbox = document.getElementById('filterPriorityMedium');
    const lowPriorityCheckbox = document.getElementById('filterPriorityLow');
    
    const priorities = [];
    
    if (highPriorityCheckbox && highPriorityCheckbox.checked) priorities.push(3);
    if (mediumPriorityCheckbox && mediumPriorityCheckbox.checked) priorities.push(2);
    if (lowPriorityCheckbox && lowPriorityCheckbox.checked) priorities.push(1);
    
    // If none selected, select all
    if (priorities.length === 0) {
        priorities.push(1, 2, 3);
    }
    
    // Update active filters
    activeFilters.priority = priorities;
    filterActive = !isDefaultFilter();
    
    // Update filter button state
    const filterBtn = document.getElementById('filterToggleBtn');
    if (filterBtn) {
        filterBtn.classList.toggle('active', filterActive);
    }
    
    // Close filter panel
    const filterPanel = document.getElementById('filterPanel');
    if (filterPanel) filterPanel.style.display = 'none';
    
    // Apply filters
    renderTasks();
}

// Reset filters
function resetFilters() {
    // Reset checkboxes
    const highPriorityCheckbox = document.getElementById('filterPriorityHigh');
    const mediumPriorityCheckbox = document.getElementById('filterPriorityMedium');
    const lowPriorityCheckbox = document.getElementById('filterPriorityLow');
    
    if (highPriorityCheckbox) highPriorityCheckbox.checked = true;
    if (mediumPriorityCheckbox) mediumPriorityCheckbox.checked = true;
    if (lowPriorityCheckbox) lowPriorityCheckbox.checked = true;
    
    // Reset active filters
    activeFilters.priority = [1, 2, 3];
    filterActive = false;
    
    // Update filter button state
    const filterBtn = document.getElementById('filterToggleBtn');
    if (filterBtn) {
        filterBtn.classList.remove('active');
    }
    
    // Update UI
    renderTasks();
}

// Check if current filter is the default (showing all priorities)
function isDefaultFilter() {
    return activeFilters.priority.length === 3 && 
           activeFilters.priority.includes(1) && 
           activeFilters.priority.includes(2) && 
           activeFilters.priority.includes(3);
}

// Save task
function saveTask() {
    console.log("Saving task");
    
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskPriorityInput = document.getElementById('taskPriority');
    const taskDateInput = document.getElementById('taskDate');
    const taskTimeInput = document.getElementById('taskTime');
    const enableNotificationInput = document.getElementById('enableNotification');
    const notificationTimeInput = document.getElementById('notificationTime');
    
    if (!taskTitleInput || !taskDateInput || !taskTimeInput) {
        console.error("Required form fields not found");
        return;
    }
    
    // Validate form
    if (!taskTitleInput.value.trim()) {
        alert("Please enter a task title");
        return;
    }
    
    if (!taskDateInput.value) {
        alert("Please select a date");
        return;
    }
    
    if (!taskTimeInput.value) {
        alert("Please select a time");
        return;
    }
    
    // Create task object
    const task = {
        id: editMode && currentTask ? currentTask.id : generateTaskId(),
        title: taskTitleInput.value.trim(),
        description: taskDescriptionInput ? taskDescriptionInput.value.trim() : '',
        priority: parseInt(taskPriorityInput ? taskPriorityInput.value : '1'),
        date: taskDateInput.value,
        time: taskTimeInput.value,
        completed: editMode && currentTask ? currentTask.completed : false,
        enableNotification: enableNotificationInput && enableNotificationInput.checked,
        notification: enableNotificationInput && enableNotificationInput.checked,
        notificationTime: notificationTimeInput ? parseInt(notificationTimeInput.value) : 30,
        createdAt: editMode && currentTask ? currentTask.createdAt : new Date().toISOString()
    };
    
    // Add or update task
    if (editMode && currentTask) {
        // Update existing task
        const index = tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
            tasks[index] = task;
        }
    } else {
        // Add new task
        tasks.push(task);
    }
    
    // Save tasks
    saveTasksToStorage();
    
    // Hide modal
    if (addEditTaskModal) {
        addEditTaskModal.hide();
    }
    
    // Update UI
    renderTasks();
    
    // Restart notification checker to handle new or updated task
    startNotificationChecker();
}

// Generate a unique ID for tasks
function generateTaskId() {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

// Save tasks to storage
function saveTasksToStorage() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userId = currentUser.id || currentUser.userId || 'default';
    localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
}

// Show task details
function showTaskDetails(taskId) {
    console.log("Showing task details for task:", taskId);
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        console.error("Task not found:", taskId);
        return;
    }
    
    currentTask = task;
    
    // Update modal content
    const taskDetailsTitle = document.getElementById('taskDetailsTitle');
    const taskDetailsBody = document.getElementById('taskDetailsBody');
    
    if (taskDetailsTitle) {
        taskDetailsTitle.textContent = task.title;
    }
    
    if (taskDetailsBody) {
        // Create priority badge
        let priorityBadge = '';
        if (task.priority === 3) {
            priorityBadge = '<span class="badge bg-danger">High Priority</span>';
        } else if (task.priority === 2) {
            priorityBadge = '<span class="badge bg-warning text-dark">Medium Priority</span>';
        } else {
            priorityBadge = '<span class="badge bg-success">Low Priority</span>';
        }
        
        // Build HTML content
        taskDetailsBody.innerHTML = `
            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>${priorityBadge}</div>
                    <div><small class="text-muted">Date: ${formatDate(task.date)}</small></div>
                </div>
                <div class="mb-2"><strong>Time:</strong> ${formatTime(task.time || '00:00')}</div>
                <div class="task-description">
                    ${task.description ? task.description : '<em>No description provided</em>'}
                </div>
                ${(task.enableNotification || task.notification) ? 
                  `<div class="mt-3"><strong>Notification:</strong> ${getNotificationText(task.notificationTime || 30)}</div>` : ''}
            </div>
        `;
    }
    
    // Show modal
    if (taskDetailsModal) {
        taskDetailsModal.show();
    } else {
        console.error("Task details modal not initialized");
    }
}

// Toggle task completion - FIXED to move tasks to completed tasks list
function toggleTaskCompletion(taskId) {
    console.log("Toggling completion for task:", taskId);
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
        console.error("Task not found:", taskId);
        return;
    }
    
    // Get the task to be completed
    const task = tasks[taskIndex];
    
    // Remove task from tasks array
    tasks.splice(taskIndex, 1);
    
    // Add to completed tasks with completion date
    const completedTask = { 
        ...task, 
        isCompleted: true, 
        completed: true,
        completedDate: new Date().toLocaleDateString() 
    };
    
    // Get current user to access completed tasks
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Get completed tasks array or create if doesn't exist
    let completedTasks = [];
    
    // Try to load existing completed tasks
    try {
        const userId = currentUser.id || currentUser.userId || 'default';
        const completedTasksJson = localStorage.getItem(`completedTasks_${userId}`);
        if (completedTasksJson) {
            completedTasks = JSON.parse(completedTasksJson);
        }
        
        // If user has completedTasks property, use that as well
        if (currentUser.completedTasks) {
            // Merge with any existing completed tasks from localStorage
            currentUser.completedTasks.forEach(ct => {
                if (!completedTasks.some(t => t.id === ct.id)) {
                    completedTasks.push(ct);
                }
            });
        }
    } catch (error) {
        console.error("Error loading completed tasks:", error);
    }
    
    // Add the newly completed task
    completedTasks.push(completedTask);
    
    // Save to localStorage
    try {
        const userId = currentUser.id || currentUser.userId || 'default';
        localStorage.setItem(`completedTasks_${userId}`, JSON.stringify(completedTasks));
        
        // Also update in currentUser if that property exists
        if (currentUser.hasOwnProperty('completedTasks')) {
            currentUser.completedTasks = completedTasks;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update in users array if that exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === currentUser.id || u.email === currentUser.email);
            if (userIndex >= 0) {
                users[userIndex].completedTasks = completedTasks;
                localStorage.setItem('users', JSON.stringify(users));
            }
        }
    } catch (error) {
        console.error("Error saving completed tasks:", error);
    }
    
    // Save the updated tasks array
    saveTasksToStorage();
    
    // Render tasks to update the UI
    renderTasks();
}

// Confirm delete task
function confirmDeleteTask() {
    console.log("Confirming task deletion");
    
    if (!currentTask) {
        console.error("No current task to delete");
        return;
    }
    
    // Hide task details modal
    if (taskDetailsModal) {
        taskDetailsModal.hide();
    }
    
    // Show delete confirmation modal
    if (deleteConfirmModal) {
        deleteConfirmModal.show();
    } else {
        console.error("Delete confirmation modal not initialized");
    }
}

// Delete current task
function deleteCurrentTask() {
    console.log("Deleting task:", currentTask?.id);
    
    if (!currentTask) {
        console.error("No current task to delete");
        return;
    }
    
    // Remove task from array
    tasks = tasks.filter(t => t.id !== currentTask.id);
    
    // Save tasks
    saveTasksToStorage();
    
    // Hide delete confirmation modal
    if (deleteConfirmModal) {
        deleteConfirmModal.hide();
    }
    
    // Update UI
    renderTasks();
    
    // Clear current task
    currentTask = null;
}

// Edit current task
function editCurrentTask() {
    console.log("Editing task:", currentTask?.id);
    
    if (!currentTask) {
        console.error("No current task to edit");
        return;
    }
    
    // Set edit mode
    editMode = true;
    
    // Update modal title
    const modalTitle = document.getElementById('addEditModalTitle');
    if (modalTitle) modalTitle.textContent = 'Edit Task';
    
    // Fill form with task data
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskDateInput = document.getElementById('taskDate');
    const taskTimeInput = document.getElementById('taskTime');
    const enableNotificationInput = document.getElementById('enableNotification');
    const notificationTimeInput = document.getElementById('notificationTime');
    
    if (taskTitleInput) taskTitleInput.value = currentTask.title;
    if (taskDescriptionInput) taskDescriptionInput.value = currentTask.description || '';
    if (taskDateInput) taskDateInput.value = currentTask.date;
    if (taskTimeInput) taskTimeInput.value = currentTask.time || '00:00';
    if (enableNotificationInput) enableNotificationInput.checked = currentTask.enableNotification || currentTask.notification || false;
    
    // Set priority
    setPriority(currentTask.priority || 1);
    
    // Show/hide notification time container
    const notificationTimeContainer = document.getElementById('notificationTimeContainer');
    if (notificationTimeContainer) {
        notificationTimeContainer.style.display = (currentTask.enableNotification || currentTask.notification) ? 'block' : 'none';
    }
    
    // Set notification time
    if (notificationTimeInput && (currentTask.notificationTime || currentTask.notificationTime === 0)) {
        notificationTimeInput.value = currentTask.notificationTime.toString();
    }
    
    // Hide task details modal
    if (taskDetailsModal) {
        taskDetailsModal.hide();
    }
    
    // Show edit modal
    if (addEditTaskModal) {
        addEditTaskModal.show();
    } else {
        console.error("Add/Edit modal not initialized");
    }
}

// Confirm save changes
function confirmSave() {
    console.log("Confirming save changes");
    
    // Implementation depends on your app's flow
    // For now, we'll just call saveTask
    saveTask();
}

// Send notification for a task
function sendNotification(task) {
    // Check if notifications are supported and permission is granted
    if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
    }
    
    // Create notification content
    const notificationTitle = "FlexiTask Reminder";
    const notificationOptions = {
        body: `Task: ${task.title} - Due at ${formatTime(task.time || '00:00')}`,
        icon: '/images/logo_FLXT.png',
        vibrate: [100, 50, 100]
    };
    
    try {
        // Send the notification
        const notification = new Notification(notificationTitle, notificationOptions);
        
        // Handle notification click
        notification.onclick = function() {
            window.focus();
            showTaskDetails(task.id);
            notification.close();
        };
        
        console.log(`Notification sent for task: ${task.title}`);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Helper function to format date
function formatDate(dateString) {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to format time with AM/PM
function formatTime(timeString) {
    // Parse the time string (HH:MM format)
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Format with AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Helper function to get notification time text
function getNotificationText(minutes) {
    const mins = parseInt(minutes);
    
    // Special cases for testing options
    switch(mins) {
        case 1:
            return '30 seconds before';
        case 2:
            return '1 minute before';
        case 5:
            return '5 minutes before';
    }
    
    // Regular cases
    if (mins < 60) {
        return `${mins} minute${mins !== 1 ? 's' : ''} before`;
    } else if (mins === 60) {
        return '1 hour before';
    } else if (mins < 1440) {
        return `${Math.floor(mins / 60)} hours before`;
    } else if (mins === 1440) {
        return '1 day before';
    } else if (mins === 2880) {
        return '2 days before';
    } else if (mins === 10080) {
        return '1 week before';
    } else {
        return `${Math.floor(mins / 1440)} days before`;
    }
}