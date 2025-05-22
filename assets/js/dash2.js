// Task Management JavaScript

// Global variables
let tasks = [];
let currentTask = null;
let editMode = false;

// Global variables for search and filter
let searchActive = false;
let searchTerm = '';
let filterActive = false;
let activeFilters = {
    priority: [1, 2, 3] // Default: show all priorities
};

// Global variable for notifications
let notificationWorker = null;

// DOM Elements
const addEditTaskModal = new bootstrap.Modal(document.getElementById('addEditTaskModal'));
const taskDetailsModal = new bootstrap.Modal(document.getElementById('taskDetailsModal'));
const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
const saveConfirmModal = new bootstrap.Modal(document.getElementById('saveConfirmModal'));

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // Redirect to login if no user is logged in
        window.location.href = 'login.html';
        return;
    }

    // Display username
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = currentUser.username || 'User';
    }

    // Load profile image if available
    loadProfileImage();
});

// Get current logged in user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

// Load profile image - metode yang diperbaiki
function loadProfileImage() {
    const currentUser = getCurrentUser();
    const profileImgContainer = document.getElementById('headerProfileImage');
    
    if (currentUser && currentUser.profileImage) {
        // Jika ada gambar profil, tampilkan sebagai img
        profileImgContainer.innerHTML = `<img src="${currentUser.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        // Jika tidak ada gambar profil, tampilkan ikon person
        profileImgContainer.innerHTML = `<i class="bi bi-person-circle" style="font-size: 40px; color: #6c757d;"></i>`;
        profileImgContainer.style.backgroundColor = '#f8f9fa';
    }
}

// Save tasks for current user
function saveTasksForCurrentUser(tasksList) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    // Update the user's tasks
    currentUser.tasks = tasksList;
    
    // Update current user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Also update in users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex >= 0) {
        users[userIndex].tasks = tasksList;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    return true;
}

// Load tasks for current user
function loadTasksForCurrentUser() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    // Return user's tasks or empty array if none
    return currentUser.tasks || [];
}

// Save completed tasks for current user
function saveCompletedTasksForCurrentUser(completedTasksList) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    // Update the user's completed tasks
    currentUser.completedTasks = completedTasksList;
    
    // Update current user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Also update in users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex >= 0) {
        users[userIndex].completedTasks = completedTasksList;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    return true;
}

// Load completed tasks for current user
function loadCompletedTasksForCurrentUser() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    // Return user's completed tasks or empty array if none
    return currentUser.completedTasks || [];
}

// Initialize the application
function initApp() {
    // Load tasks
    tasks = loadTasksForCurrentUser();
    
    // Original event listeners
    document.getElementById('addTaskBtn').addEventListener('click', showAddTaskModal);
    document.getElementById('saveTaskBtn').addEventListener('click', saveTask);
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteCurrentTask);
    document.getElementById('confirmSaveBtn').addEventListener('click', confirmSave);
    document.getElementById('deleteTaskBtn').addEventListener('click', confirmDeleteTask);
    document.getElementById('editTaskBtn').addEventListener('click', editCurrentTask);
    document.getElementById('backToToday').addEventListener('click', showRegularTasksView);
    document.getElementById('overdueCounter').addEventListener('click', showOverdueTasks);
    
    // Search and filter event listeners
    document.getElementById('searchToggleBtn').addEventListener('click', toggleSearchPanel);
    document.getElementById('filterToggleBtn').addEventListener('click', toggleFilterPanel);
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);
    document.getElementById('applyFilterBtn').addEventListener('click', applyFilters);
    document.getElementById('resetFilterBtn').addEventListener('click', resetFilters);
    
    // Set up priority buttons
    const priorityButtons = document.querySelectorAll('.priority-btn');
    priorityButtons.forEach(button => {
        button.addEventListener('click', function() {
            setPriority(this.dataset.priority);
        });
    });
    
    // Set up notification toggle
    document.getElementById('enableNotification').addEventListener('change', function() {
        document.getElementById('notificationTimeContainer').style.display = 
            this.checked ? 'block' : 'none';
    });
    
    // Set today's date as default for new tasks
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    document.getElementById('taskDate').value = dateString;
    
    // Initialize Bootstrap collapse elements
    initCollapsibles();
    
    // Initialize notification system
    initNotifications();
    
    // Set up profile image
    setupProfileImage();
    
    // Render tasks
    renderTasks();
}

// New function to set up profile image consistently
function setupProfileImage() {
    const profileImg = document.getElementById('headerProfileImage');
    if (!profileImg) return; // Skip if element doesn't exist
    
    const currentUser = getCurrentUser();
    
    if (currentUser && currentUser.profileImage) {
        // Jika ada gambar profil, tampilkan sebagai img
        profileImg.innerHTML = `<img src="${currentUser.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        // Jika tidak ada gambar profil, tampilkan ikon person
        profileImg.innerHTML = `<i class="bi bi-person-circle" style="font-size: 40px; color: #6c757d;"></i>`;
        profileImg.style.backgroundColor = '#f8f9fa';
    }
}

// Initialize notification system
function initNotifications() {
    // Check if browser supports notifications
    if ('Notification' in window) {
        // Request permission for notifications
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
        
        // Start checking for notifications
        startNotificationChecker();
    }
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
    tasks.filter(task => task.enableNotification).forEach(task => {
        const taskDateTime = new Date(task.date + 'T' + task.time);
        const notificationMinutes = parseInt(task.notificationTime);
        
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

// Send notification for a task
function sendNotification(task) {
    // Create notification content
    const notificationTitle = "FlexiTask Reminder";
    const notificationOptions = {
        body: `Task: ${task.title} - Due at ${formatTime(task.time)}`,
        icon: 'assets/images/logo_FLXT.png',
        vibrate: [100, 50, 100],
        data: {
            taskId: task.id,
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: 'View Task'
            }
        ]
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
        
        // Log notification sent
        console.log(`Notification sent for task: ${task.title}`);
        
        // Animate the bell icon on the task card
        animateNotificationBell(task.id);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Animate the notification bell on a task card
function animateNotificationBell(taskId) {
    const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
    if (taskCard) {
        const bell = taskCard.querySelector('.notification-bell');
        if (bell) {
            bell.classList.add('animate');
            setTimeout(() => {
                bell.classList.remove('animate');
            }, 1000);
        }
    }
}

// Initialize Bootstrap collapsible elements
function initCollapsibles() {
    // We're manually controlling the collapse behavior
    document.addEventListener('click', function(event) {
        // Close panels when clicking outside
        if (!event.target.closest('#searchPanel') && 
            !event.target.closest('#searchToggleBtn') && 
            !event.target.closest('#filterPanel') && 
            !event.target.closest('#filterToggleBtn')) {
            
            const searchPanel = document.getElementById('searchPanel');
            const filterPanel = document.getElementById('filterPanel');
            
            // Only close if they're open
            if (searchPanel.classList.contains('show') || filterPanel.classList.contains('show')) {
                // Remove 'show' class to hide the panels
                searchPanel.classList.remove('show');
                filterPanel.classList.remove('show');
                
                // Update button states
                document.getElementById('searchToggleBtn').classList.remove('active');
                document.getElementById('filterToggleBtn').classList.remove('active');
            }
        }
    });
}

// Toggle search panel visibility
function toggleSearchPanel() {
    const searchPanel = document.getElementById('searchPanel');
    const filterPanel = document.getElementById('filterPanel');
    const searchBtn = document.getElementById('searchToggleBtn');
    const filterBtn = document.getElementById('filterToggleBtn');
    
    // Close filter panel if it's open
    filterPanel.classList.remove('show');
    filterBtn.classList.remove('active');
    
    // Toggle search panel
    if (searchPanel.classList.contains('show')) {
        searchPanel.classList.remove('show');
        searchBtn.classList.remove('active');
    } else {
        searchPanel.classList.add('show');
        searchBtn.classList.add('active');
        document.getElementById('searchInput').focus();
    }
}

// Toggle filter panel visibility
function toggleFilterPanel() {
    const searchPanel = document.getElementById('searchPanel');
    const filterPanel = document.getElementById('filterPanel');
    const searchBtn = document.getElementById('searchToggleBtn');
    const filterBtn = document.getElementById('filterToggleBtn');
    
    // Close search panel if it's open
    searchPanel.classList.remove('show');
    searchBtn.classList.remove('active');
    
    // Toggle filter panel
    if (filterPanel.classList.contains('show')) {
        filterPanel.classList.remove('show');
        filterBtn.classList.remove('active');
    } else {
        filterPanel.classList.add('show');
        filterBtn.classList.add('active');
        
        // Set checkboxes based on current filter state
        updateFilterCheckboxes();
    }
}

// Update filter checkboxes based on current active filters
function updateFilterCheckboxes() {
    document.getElementById('filterPriorityHigh').checked = activeFilters.priority.includes(3);
    document.getElementById('filterPriorityMedium').checked = activeFilters.priority.includes(2);
    document.getElementById('filterPriorityLow').checked = activeFilters.priority.includes(1);
}

// Handle search input
function handleSearch() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    
    searchTerm = input.value.trim().toLowerCase();
    searchActive = searchTerm !== '';
    
    // Show/hide clear button based on search input
    if (searchTerm) {
        clearBtn.style.display = 'block';
        document.getElementById('searchToggleBtn').classList.add('active');
    } else {
        clearBtn.style.display = 'none';
        document.getElementById('searchToggleBtn').classList.remove('active');
    }
    
    renderTasks();
}

// Clear search input
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearchBtn').style.display = 'none';
    searchTerm = '';
    searchActive = false;
    document.getElementById('searchToggleBtn').classList.remove('active');
    renderTasks();
}

// Apply selected filters
function applyFilters() {
    // Get selected priority filters
    activeFilters.priority = [];
    
    if (document.getElementById('filterPriorityHigh').checked) {
        activeFilters.priority.push(3);
    }
    if (document.getElementById('filterPriorityMedium').checked) {
        activeFilters.priority.push(2);
    }
    if (document.getElementById('filterPriorityLow').checked) {
        activeFilters.priority.push(1);
    }
    
    // If none selected, select all
    if (activeFilters.priority.length === 0) {
        activeFilters.priority = [1, 2, 3];
    }
    
    filterActive = !isDefaultFilter();
    
    // Update filter button state
    document.getElementById('filterToggleBtn').classList.toggle('active', filterActive);
    
    // Hide filter panel
    document.getElementById('filterPanel').classList.remove('show');
    
    renderTasks();
}

// Reset filters to default
function resetFilters() {
    activeFilters.priority = [1, 2, 3];
    filterActive = false;
    
    // Update checkboxes
    document.getElementById('filterPriorityHigh').checked = true;
    document.getElementById('filterPriorityMedium').checked = true;
    document.getElementById('filterPriorityLow').checked = true;
    
    // Update filter button state
    document.getElementById('filterToggleBtn').classList.remove('active');
    
    renderTasks();
}

// Check if current filter is the default (showing all priorities)
function isDefaultFilter() {
    return activeFilters.priority.length === 3 && 
           activeFilters.priority.includes(1) && 
           activeFilters.priority.includes(2) && 
           activeFilters.priority.includes(3);
}

// Handle task completion toggle
function toggleTaskCompletion(taskId) {
    const taskIndex = tasks.findIndex(t => t.id == taskId);
    
    if (taskIndex !== -1) {
        const task = tasks[taskIndex];
        
        // Remove task from tasks list
        tasks.splice(taskIndex, 1);
        saveTasksForCurrentUser(tasks);
        
        // Add to completed tasks with completion date
        const completedTask = { ...task, isCompleted: true, completedDate: new Date().toLocaleDateString() };
        const completedTasks = loadCompletedTasksForCurrentUser();
        completedTasks.push(completedTask);
        saveCompletedTasksForCurrentUser(completedTasks);
        
        // Re-render tasks
        renderTasks();
    }
}

// Generate a unique ID for tasks
function generateTaskId() {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

// Show the add task modal
function showAddTaskModal() {
    editMode = false;
    document.getElementById('addEditModalTitle').textContent = 'Add Task';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    setPriority(1);
    
    const today = new Date();
    document.getElementById('taskDate').value = today.toISOString().split('T')[0];
    document.getElementById('taskTime').value = '09:00';
    
    document.getElementById('enableNotification').checked = false;
    document.getElementById('notificationTimeContainer').style.display = 'none';
    
    addEditTaskModal.show();
}

// Set priority in the task form
function setPriority(priority) {
    const priorityInput = document.getElementById('taskPriority');
    priorityInput.value = priority;
    
    // Update button styling
    const buttons = document.querySelectorAll('.priority-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.priority === priority) {
            btn.classList.add('active');
        }
    });
}

// Save a task
function saveTask() {
    const form = document.getElementById('taskForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;
    const date = document.getElementById('taskDate').value;
    const time = document.getElementById('taskTime').value;
    const enableNotification = document.getElementById('enableNotification').checked;
    const notificationTime = enableNotification ? document.getElementById('notificationTime').value : null;
    
    if (editMode && currentTask) {
        // Update existing task
        currentTask.title = title;
        currentTask.description = description;
        currentTask.priority = parseInt(priority);
        currentTask.date = date;
        currentTask.time = time;
        currentTask.enableNotification = enableNotification;
        currentTask.notificationTime = notificationTime;
        
        // Find and update task in the array
        const taskIndex = tasks.findIndex(t => t.id === currentTask.id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = currentTask;
        }
        
        // Check if notification settings have changed
        const originalNotification = tasks.find(t => t.id === currentTask.id)?.enableNotification;
        if (originalNotification !== enableNotification) {
            console.log('Notification setting changed, would update Firebase');
        }
    } else {
        // Create new task
        const newTask = {
            id: generateTaskId(),
            title: title,
            description: description,
            priority: parseInt(priority),
            date: date,
            time: time,
            enableNotification: enableNotification,
            notificationTime: notificationTime,
            isCompleted: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        
        if (enableNotification) {
            console.log('New task with notification, would register with Firebase');
        }
    }
    
    // Save tasks to storage
    saveTasksForCurrentUser(tasks);
    
    // After saving to storage, restart notification checker to catch new or modified tasks
    startNotificationChecker();
    
    // Close modal and refresh tasks
    addEditTaskModal.hide();
    renderTasks();
}

// Confirm task deletion
function confirmDeleteTask() {
    taskDetailsModal.hide();
    deleteConfirmModal.show();
}

// Delete the current task
function deleteCurrentTask() {
    if (currentTask) {
        tasks = tasks.filter(t => t.id !== currentTask.id);
        saveTasksForCurrentUser(tasks);
        renderTasks();
    }
    
    deleteConfirmModal.hide();
}

// Edit the current task
function editCurrentTask() {
    if (!currentTask) return;
    
    editMode = true;
    document.getElementById('addEditModalTitle').textContent = 'Edit Task';
    document.getElementById('taskTitle').value = currentTask.title;
    document.getElementById('taskDescription').value = currentTask.description || '';
    setPriority(currentTask.priority.toString());
    document.getElementById('taskDate').value = currentTask.date;
    document.getElementById('taskTime').value = currentTask.time;
    
    document.getElementById('enableNotification').checked = currentTask.enableNotification;
    document.getElementById('notificationTimeContainer').style.display = 
        currentTask.enableNotification ? 'block' : 'none';
    
    if (currentTask.enableNotification) {
        document.getElementById('notificationTime').value = currentTask.notificationTime;
    }
    
    taskDetailsModal.hide();
    addEditTaskModal.show();
}

// Show the task details modal
function showTaskDetails(taskId) {
    const task = tasks.find(t => t.id == taskId);
    if (!task) return;
    
    currentTask = task;
    
    const detailsBody = document.getElementById('taskDetailsBody');
    detailsBody.innerHTML = `
        <div class="mb-3">
            <h5>${task.title}</h5>
        </div>
        ${task.description ? `<div class="mb-3">${task.description}</div>` : ''}
        <div class="mb-3">
            <span class="badge ${getPriorityBadgeClass(task.priority)}">
                ${getPriorityText(task.priority)}
            </span>
        </div>
        <div class="mb-3">
            <strong>Date:</strong> ${formatDate(task.date)}
        </div>
        <div class="mb-3">
            <strong>Time:</strong> ${formatTime(task.time)}
        </div>
        ${task.enableNotification ? `
            <div class="mb-3">
                <strong>Notification:</strong> ${getNotificationText(task.notificationTime)}
            </div>
        ` : ''}
    `;
    
    taskDetailsModal.show();
}

// Confirm save changes
function confirmSave() {
    saveConfirmModal.hide();
    saveTask();
}

// Render tasks
function renderTasks() {
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
            // Search term filter
            const matchesSearch = !searchActive || 
                task.title.toLowerCase().includes(searchTerm) || 
                (task.description && task.description.toLowerCase().includes(searchTerm));
            
            // Priority filter
            const matchesPriority = activeFilters.priority.includes(task.priority);
            
            return matchesSearch && matchesPriority;
        });
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
        const taskDateTime = new Date(task.date + 'T' + task.time);
        
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
            const timeA = new Date(a.date + 'T' + a.time);
            const timeB = new Date(b.date + 'T' + b.time);
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
    
    // Render Today's tasks - including those past their time but still today
    const todayTasksList = document.getElementById('todayTasksList');
    todayTasksList.innerHTML = '';
    
    // First add past-time tasks
    pastTimeTodayTasks.forEach(task => {
        const card = createTaskCard(task, false, true);
        todayTasksList.appendChild(card);
    });
    
    // Then add upcoming tasks for today
    todayTasks.forEach(task => {
        todayTasksList.appendChild(createTaskCard(task));
    });
    
    // Render Tomorrow's tasks
    const tomorrowTasksList = document.getElementById('tomorrowTasksList');
    tomorrowTasksList.innerHTML = '';
    tomorrowTasks.forEach(task => {
        tomorrowTasksList.appendChild(createTaskCard(task));
    });
    
    // Render Upcoming tasks
    const upcomingTasksContainer = document.getElementById('upcomingTasksContainer');
    upcomingTasksContainer.innerHTML = '';
    
    const upcomingDates = Object.keys(upcomingTasks).sort();
    upcomingDates.forEach(dateKey => {
        if (dateKey !== today.toISOString().split('T')[0] && 
            dateKey !== tomorrow.toISOString().split('T')[0]) {
            
            const dateSection = document.createElement('div');
            dateSection.className = 'upcoming-section';
            
            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            dateHeader.textContent = formatDate(dateKey);
            
            const tasksList = document.createElement('div');
            tasksList.className = 'upcoming-tasks-list';
            
            upcomingTasks[dateKey].forEach(task => {
                tasksList.appendChild(createTaskCard(task));
            });
            
            dateSection.appendChild(dateHeader);
            dateSection.appendChild(tasksList);
            upcomingTasksContainer.appendChild(dateSection);
        }
    });
    
    // Render Overdue tasks (at least 1 day old)
    const overdueTasksList = document.getElementById('overdueTasksList');
    overdueTasksList.innerHTML = '';
    overdueTasks.forEach(task => {
        overdueTasksList.appendChild(createTaskCard(task, true));
    });
    
    // Update overdue counter
    const overdueCount = document.getElementById('overdueCount');
    overdueCount.textContent = overdueTasks.length;
    
    const overdueCounterContainer = document.getElementById('overdueCounterContainer');
    
    // Simplified logic: Always show overdue counter if there are overdue tasks
    if (overdueTasks.length > 0) {
        overdueCounterContainer.style.display = 'block';
    } else {
        overdueCounterContainer.style.display = 'none';
    }
    
    // Show or hide sections based on their content
    const noTasksMessage = document.getElementById('noTasksMessage');
    const todaySection = document.getElementById('todaySection');
    const tomorrowSection = document.getElementById('tomorrowSection');
    
    // For today's tasks, consider both regular and past-time tasks
    const allTodayTasks = [...todayTasks, ...pastTimeTodayTasks];
    if (allTodayTasks.length === 0) {
        document.getElementById('todayTasksList').style.display = 'none';
        document.querySelector('#todaySection .date-header').style.display = 'none';
        
        if (overdueTasks.length === 0) {
            todaySection.style.display = 'none';
        }
    } else {
        todaySection.style.display = 'block';
        document.getElementById('todayTasksList').style.display = 'block';
        document.querySelector('#todaySection .date-header').style.display = 'block';
    }
    
    if (tomorrowTasks.length === 0) {
        tomorrowSection.style.display = 'none';
    } else {
        tomorrowSection.style.display = 'block';
    }
    
    // Show empty state only if there are no tasks at all
    const allTasksFiltered = [...allTodayTasks, ...tomorrowTasks, ...overdueTasks];
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
            
            noTasksIcon.className = 'bi bi-search';
            noTasksTitle.textContent = 'No matching tasks found';
            noTasksText.textContent = 'Try different search terms or filters';
        } else {
            // Reset to default message
            const noTasksIcon = noTasksMessage.querySelector('.bi');
            const noTasksTitle = noTasksMessage.querySelector('h5');
            const noTasksText = noTasksMessage.querySelector('p');
            
            noTasksIcon.className = 'bi bi-calendar-x';
            noTasksTitle.textContent = 'No tasks today';
            noTasksText.textContent = 'Click the + button below to add a new task';
        }
    } else {
        noTasksMessage.classList.add('d-none');
    }
}

// Create a task card element
function createTaskCard(task, isOverdue = false, isPastTime = false) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.taskId = task.id;
    
    // Add styling classes
    if (isOverdue) {
        card.classList.add('overdue');
    } else if (isPastTime) {
        card.classList.add('past-time');
    }
    
    let priorityIndicator = '';
    if (task.priority > 1) {
        const priorityClass = task.priority === 3 ? 'priority-high' : 'priority-medium';
        priorityIndicator = `<div class="${priorityClass}"></div>`;
    }
    
    // Create notification bell icon if notifications are enabled
    const notificationIcon = task.enableNotification 
        ? `<div class="notification-bell ${isPastTime ? '' : 'active'}" title="Notification set for ${getNotificationText(task.notificationTime)}">
             <i class="bi bi-bell-fill"></i>
           </div>`
        : '';
    
    card.innerHTML = `
        <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="task-info flex-grow-1">
                    <div class="d-flex align-items-center mb-1">
                        ${priorityIndicator}
                        <h6 class="mb-0">${task.title}</h6>
                    </div>
                    ${task.description ? `<p class="task-description small text-muted mb-1">${task.description}</p>` : ''}
                    <div class="task-time small ${isPastTime ? 'text-danger' : 'text-muted'}">${formatTime(task.time)}</div>
                </div>
                <div class="task-actions ms-3">
                    ${notificationIcon}
                    <div class="task-checkbox" onclick="toggleTaskCompletion('${task.id}')">
                        <i class="bi bi-circle"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add click event to show details
    card.addEventListener('click', function(e) {
        // Don't show details if clicking on the checkbox or bell icon
        if (!e.target.closest('.task-checkbox') && !e.target.closest('.notification-bell')) {
            showTaskDetails(task.id);
        }
    });
    
    return card;
}

// Show overdue tasks view
function showOverdueTasks() {
    document.getElementById('regularTasksView').style.display = 'none';
    document.getElementById('overdueTasksView').style.display = 'block';
}

// Show regular tasks view
function showRegularTasksView() {
    document.getElementById('regularTasksView').style.display = 'block';
    document.getElementById('overdueTasksView').style.display = 'none';
}

// Helper function to format date
function formatDate(dateString) {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to format time - improve it to show AM/PM format
function formatTime(timeString) {
    // Parse the time string (HH:MM format)
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Format with AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Helper function to get priority badge class
function getPriorityBadgeClass(priority) {
    switch(parseInt(priority)) {
        case 3: return 'bg-danger';
        case 2: return 'bg-warning';
        default: return 'bg-success';
    }
}

// Helper function to get priority text
function getPriorityText(priority) {
    switch(parseInt(priority)) {
        case 3: return 'High Priority';
        case 2: return 'Medium Priority';
        default: return 'Low Priority';
    }
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
        return `${mins / 60} hours before`;
    } else if (mins === 1440) {
        return '1 day before';
    } else if (mins === 2880) {
        return '2 days before';
    } else if (mins === 10080) {
        return '1 week before';
    } else {
        return `${mins / 1440} days before`;
    }
}

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
