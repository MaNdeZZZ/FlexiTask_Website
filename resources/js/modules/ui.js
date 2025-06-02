import { formatDate, formatTime, getNotificationText } from "./utils.js";

// Initialize Bootstrap modals safely
// ✅ PASTIKAN fungsi ini ada dan benar:
export function initializeModals() {
    try {
        console.log('🎭 Initializing modals...');
        
        const addEditTaskModal = new bootstrap.Modal(document.getElementById('addEditTaskModal'));
        const taskDetailsModal = new bootstrap.Modal(document.getElementById('taskDetailsModal'));
        const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        const saveConfirmModal = new bootstrap.Modal(document.getElementById('saveConfirmModal'));
        
        const modals = {
            addEditTaskModal,
            taskDetailsModal,
            deleteConfirmModal,
            saveConfirmModal
        };
        
        console.log('✅ All modals initialized:', Object.keys(modals));
        return modals;
        
    } catch (error) {
        console.error('💥 Error initializing modals:', error);
        return null;
    }
}

// Set up profile image
export function setupProfileImage(currentUser) {
    console.log("Setting up profile image");
    
    const profileImageContainer = document.getElementById('headerProfileImage');
    if (!profileImageContainer) {
        console.error("Profile image container not found");
        return;
    }
    
    // const currentUser = getCurrentUser();
    
    if (currentUser && currentUser.profileImage) {
        // If we have a profile image URL, show that
        profileImageContainer.innerHTML = `<img src="${currentUser.profileImage}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
        // Otherwise show an icon
        profileImageContainer.innerHTML = '<i class="bi bi-person-circle" style="font-size: 2rem; color: #6c757d;"></i>';
        profileImageContainer.style.backgroundColor = '#f8f9fa';
    }
}

// Display username in the UI
export function displayUsername(currentUser) {
    // const currentUser = getCurrentUser();
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay && currentUser) {
        usernameDisplay.textContent = currentUser.username || currentUser.name || 'User';
    }
}

// Set default task date to today
export function setDefaultTaskDate() {
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

// Initialize collapsible panels
export function initCollapsibles() {
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
export function toggleSearchPanel() {
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
export function toggleFilterPanel(currentActiveFilters) {
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
        updateFilterCheckboxes(currentActiveFilters);
    }
}

// Update filter checkboxes based on current filters
export function updateFilterCheckboxes(currentActiveFilters) {
    console.log("Updating filter checkboxes with:", currentActiveFilters);
    
    const highPriorityCheckbox = document.getElementById('filterPriorityHigh');
    const mediumPriorityCheckbox = document.getElementById('filterPriorityMedium');
    const lowPriorityCheckbox = document.getElementById('filterPriorityLow');

    // Tambahkan pengecekan untuk memastikan argumen tidak undefined
    if (!currentActiveFilters || !currentActiveFilters.priority) {
        console.error("activeFilters or activeFilters.priority is undefined in updateFilterCheckboxes");
        // Set ke default atau jangan lakukan apa-apa jika tidak ada filter yang valid
        if (highPriorityCheckbox) highPriorityCheckbox.checked = true;
        if (mediumPriorityCheckbox) mediumPriorityCheckbox.checked = true;
        if (lowPriorityCheckbox) lowPriorityCheckbox.checked = true;
        return;
    }
    // Gunakan 'currentActiveFilters' yang diterima dari argumen
    if (highPriorityCheckbox) highPriorityCheckbox.checked = currentActiveFilters.priority.includes(3);
    if (mediumPriorityCheckbox) mediumPriorityCheckbox.checked = currentActiveFilters.priority.includes(2);
    if (lowPriorityCheckbox) lowPriorityCheckbox.checked = currentActiveFilters.priority.includes(1);
}

// Fixed: Show the add task modal
export function showAddTaskModal(modals) {
    console.log("Opening Add Task modal");
    
    
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
    if (modals && modals.addEditTaskModal) {
        modals.addEditTaskModal.show();
    } else {
        console.error("addEditTaskModal instance not found in modals object or modals object not provided.");
                // Fallback jika perlu, tapi idealnya modals selalu ada
        // const modalElement = document.getElementById('addEditTaskModal');
        // if (modalElement) {
        //     try {
        //         const fallbackModal = new bootstrap.Modal(modalElement);
        //         fallbackModal.show();
        //     } catch (error) {
        //         console.error("Error showing fallback modal:", error);
        //     }
        // }
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
export function setPriority(priority) {
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

// Update the overdue counter
export function updateOverdueCounter(count) {
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
export function showOverdueTasks() {
    console.log("Showing overdue tasks view");
    
    const regularTasksView = document.getElementById('regularTasksView');
    const overdueTasksView = document.getElementById('overdueTasksView');
    
    if (regularTasksView) regularTasksView.style.display = 'none';
    if (overdueTasksView) overdueTasksView.style.display = 'block';
}

// Show regular tasks view
export function showRegularTasksView() {
    console.log("Showing regular tasks view");
    
    const regularTasksView = document.getElementById('regularTasksView');
    const overdueTasksView = document.getElementById('overdueTasksView');
    
    if (regularTasksView) regularTasksView.style.display = 'block';
    if (overdueTasksView) overdueTasksView.style.display = 'none';
}

// Create a task card element - IMPROVED to add days overdue for overdue tasks
export function createTaskCard(task, isOverdue = false, isPastTime = false) {
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
    // const checkbox = taskCard.querySelector('.task-checkbox');
    // if (checkbox) {
    //     checkbox.addEventListener('click', function(e) {
    //         e.stopPropagation();
    //         toggleTaskCompletion(task.id);
    //     });
    // }
    
    // // Add task details click handler for the whole card (except the checkbox)
    // taskCard.addEventListener('click', function(e) {
    //     if (!e.target.closest('.task-checkbox')) {
    //         showTaskDetails(task.id);
    //     }
    // });
    
    return taskCard;
}

// Render upcoming tasks
export function renderUpcomingTasks(container, upcomingTasks) {
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

// Render tasks to the UI
export function renderTasks(tasks, searchActive, searchTerm, filterActive, activeFilters) {
    console.log("Rendering tasks");
    console.log("Rendering tasks with args:", { tasks, searchActive, searchTerm, filterActive, activeFilters });
    
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
    // let filteredTasks = tasks;
    let filteredTasks;
    
    if (searchActive || filterActive) {
        filteredTasks = tasks.filter(task => {
            if (task.completed) return false;

            const matchesSearch = !searchActive || 
                task.title.toLowerCase().includes(searchTerm) || 
                (task.description && task.description.toLowerCase().includes(searchTerm));

            const matchesPriority = activeFilters.priority.includes(task.priority); 

            return matchesSearch && matchesPriority;
        });
    } else {
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

// Show task details
export function showTaskDetails(taskId, tasks, modals) {
    console.log("Showing task details for task:", taskId);
    console.log('Tasks in showTaskDetails:', tasks);
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        console.error("Task not found:", taskId);
        return null; // Kembalikan null jika task tidak ditemukan
    }
    
    // currentTask = task;
    
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
    // if (taskDetailsModal) {
    //     taskDetailsModal.show();
    // } else {
    //     console.error("Task details modal not initialized");
    // }
    
    if (modals.taskDetailsModal) {
        modals.taskDetailsModal.show();
    }
    return task; // Kembalikan task yang  ditemukan agar app.js bisa mengelola state.
}

// Edit current task
export function editCurrentTask(task, modals) {
    console.log("Preparing to edit task:", task?.id);
    
    if (!task) {
        console.error("No valid task provided to edit");
        return;
    }
    
    // Update modal title
    document.getElementById('addEditModalTitle').textContent = 'Edit Task';
    
    // Fill form with task data
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskDateInput = document.getElementById('taskDate');
    const taskTimeInput = document.getElementById('taskTime');
    const enableNotificationInput = document.getElementById('enableNotification');
    const notificationTimeContainer = document.getElementById('notificationTimeContainer');
    const notificationTimeInput = document.getElementById('notificationTime');
    
    taskTitleInput.value = task.title || '';
    taskDescriptionInput.value = task.description || '';
    taskDateInput.value = task.date;
    taskTimeInput.value = task.time || '00:00';
    enableNotificationInput.checked = task.enableNotification || task.notification || false;
    
    
    // Show/hide notification time container
    notificationTimeContainer.style.display = enableNotificationInput.checked ? 'block' : 'none';
    
    // Set notification time
    if (task.notificationTime || task.notificationTime === 0) {
        notificationTimeInput.value = task.notificationTime.toString();
    }

    // Set priority
    setPriority(task.priority || 1);

    if (modals && modals.taskDetailsModal) modals.taskDetailsModal.hide();
    if (modals && modals.addEditTaskModal) modals.addEditTaskModal.show();
}