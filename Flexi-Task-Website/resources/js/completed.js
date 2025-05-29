// Function to get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

// Function to load completed tasks specific to current user
function loadCompletedTasksForCurrentUser() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return [];
    }
    
    const userId = currentUser.id || currentUser.userId || 'default';
    let completedTasks = [];
    
    // Try to load completed tasks from localStorage directly
    try {
        const completedTasksJson = localStorage.getItem(`completedTasks_${userId}`);
        if (completedTasksJson) {
            completedTasks = JSON.parse(completedTasksJson);
            console.log(`Loaded ${completedTasks.length} completed tasks from localStorage`);
            return completedTasks;
        }
    } catch (error) {
        console.error("Error loading completed tasks from localStorage:", error);
    }
    
    // Fallback to user object if not in localStorage
    if (currentUser.completedTasks && currentUser.completedTasks.length > 0) {
        console.log(`Loaded ${currentUser.completedTasks.length} completed tasks from user object`);
        return currentUser.completedTasks;
    }
    
    console.log("No completed tasks found");
    return [];
}

// Function to restore a task
function restoreTask(taskId, event) {
    // Prevent any default action or event bubbling that might cause redirection
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    console.log("Restoring task:", taskId);
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error("No current user found");
        showToastMessage("Error: User not found");
        return;
    }
    
    // Load both task lists for current user
    let completedTasks = [];
    let tasks = [];
    
    try {
        // Get user ID consistently
        const userId = currentUser.id || currentUser.userId || 'default';
        console.log("Using user ID:", userId);
        
        // Load completed tasks from localStorage directly first
        const completedTasksJson = localStorage.getItem(`completedTasks_${userId}`);
        if (completedTasksJson) {
            completedTasks = JSON.parse(completedTasksJson);
            console.log("Loaded completed tasks from localStorage:", completedTasks.length);
        } else if (currentUser.completedTasks) {
            // Fallback to user object if not in localStorage
            completedTasks = [...currentUser.completedTasks];
            console.log("Loaded completed tasks from user object:", completedTasks.length);
        }
        
        // Load active tasks from localStorage directly first
        const tasksJson = localStorage.getItem(`tasks_${userId}`);
        if (tasksJson) {
            tasks = JSON.parse(tasksJson);
            console.log("Loaded active tasks from localStorage:", tasks.length);
        } else if (currentUser.tasks) {
            // Fallback to user object if not in localStorage
            tasks = [...currentUser.tasks];
            console.log("Loaded active tasks from user object:", tasks.length);
        }
        
        // Find the task to restore
        const taskIndex = completedTasks.findIndex(t => t.id == taskId);
        console.log("Task index in completed tasks:", taskIndex);
        
        if (taskIndex !== -1) {
            // Get a clean copy of the task
            const taskToRestore = { ...completedTasks[taskIndex] };
            
            // Reset completion status
            taskToRestore.isCompleted = false;
            taskToRestore.completed = false;
            delete taskToRestore.completedDate;
            
            // Make sure the task has all required properties
            if (!taskToRestore.priority) taskToRestore.priority = 1;
            
            // Check if the task's date is in the past (overdue)
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day for comparison
            const taskDate = new Date(taskToRestore.date + 'T00:00:00');
            
            // Check if task date is in the past - making it overdue
            const isOverdue = taskDate < today;
            
            // If task date isn't set or is invalid, set it to today
            if (!taskToRestore.date || isNaN(taskDate.getTime())) {
                taskToRestore.date = today.toISOString().split('T')[0];
            }
            
            // Set default time if not present
            if (!taskToRestore.time) taskToRestore.time = "09:00";
            
            console.log("Task ready to restore:", taskToRestore);
            
            // Move from completed to active tasks
            tasks.push(taskToRestore);
            completedTasks.splice(taskIndex, 1);
            
            // Save tasks to localStorage directly
            localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
            localStorage.setItem(`completedTasks_${userId}`, JSON.stringify(completedTasks));
            console.log("Saved tasks to localStorage");
            
            // Update in user object if needed
            if ('tasks' in currentUser) {
                currentUser.tasks = tasks;
            }
            if ('completedTasks' in currentUser) {
                currentUser.completedTasks = completedTasks;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                console.log("Updated tasks in currentUser");
            }
            
            // Update in users array if that exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => 
                (u.email && currentUser.email && u.email === currentUser.email) || 
                (u.id && currentUser.id && u.id === currentUser.id)
            );
            
            if (userIndex >= 0) {
                if ('tasks' in users[userIndex]) {
                    users[userIndex].tasks = tasks;
                }
                if ('completedTasks' in users[userIndex]) {
                    users[userIndex].completedTasks = completedTasks;
                    localStorage.setItem('users', JSON.stringify(users));
                    console.log("Updated tasks in users array");
                }
            }
            
            // Show success message
            showToastMessage("Task restored successfully");
            
            // Re-render the completed tasks list without redirecting
            renderTasks();
        } else {
            console.error("Task not found in completed tasks");
            showToastMessage("Error: Task not found");
        }
    } catch (e) {
        console.error('Error restoring task:', e);
        showToastMessage("Error restoring task: " + e.message);
    }
    
    // Return false to ensure no navigation happens
    return false;
}

// Function to render tasks from current user - Update to pass the event to restoreTask
function renderTasks() {
    const taskListContainer = document.getElementById('taskListContainer');
    const emptyState = document.getElementById('emptyState');
    
    // Load completed tasks for current user
    const completedTasks = loadCompletedTasksForCurrentUser();
    
    // Clear existing content
    taskListContainer.innerHTML = '';
    
    if (completedTasks.length === 0) {
        emptyState.classList.remove('d-none');
        return;
    }
    
    emptyState.classList.add('d-none');
    
    // Create task cards
    completedTasks.forEach((task, index) => {
        const taskCard = document.createElement('div');
        taskCard.className = 'card task-card';
        taskCard.innerHTML = `
            <div class="card-body p-3">
                <div class="d-flex justify-content-between">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center">
                            ${task.priority > 1 ? `<div class="priority-${task.priority === 3 ? 'high' : 'medium'}"></div>` : ''}
                            <h6 class="completed-title">${task.title}</h6>
                        </div>
                        ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                        <p class="completion-date">Completed on ${task.completedDate}</p>
                    </div>
                    <button class="restore-btn" data-task-id="${task.id}">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                </div>
            </div>
        `;
        taskListContainer.appendChild(taskCard);
        
        // Add event listener to the restore button
        const restoreBtn = taskCard.querySelector('.restore-btn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', function(e) {
                restoreTask(this.dataset.taskId, e);
            });
        }
    });
}

// Function to show toast message - Improved implementation for more consistent display
function showToastMessage(message) {
    console.log("Showing toast message:", message);
    
    // Create a toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        // Position toast higher on the screen (40% from top instead of bottom)
        toastContainer.className = 'position-fixed top-40 end-0 p-3';
        toastContainer.style.top = '82%'; // Position higher on screen
        toastContainer.style.transform = 'translateY(-50%)';
        toastContainer.style.zIndex = '9999'; // Higher z-index to ensure visibility
        document.body.appendChild(toastContainer);
    }
    
    // Create a unique ID for the toast
    const toastId = 'toast-' + Date.now();
    
    // Create toast HTML with more visible styling
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-success border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-check-circle me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    // Add toast to container
    toastContainer.innerHTML += toastHtml;
    
    // Get the toast element
    const toastElement = document.getElementById(toastId);
    
    // Try multiple methods to show the toast to ensure it appears
    try {
        // Method 1: Use Bootstrap Toast if available
        if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
            const toastOptions = { 
                animation: true,
                autohide: true,
                delay: 3000
            };
            const toast = new bootstrap.Toast(toastElement, toastOptions);
            
            // Ensure the toast is in the DOM before showing it
            setTimeout(() => {
                toast.show();
            }, 100);
        } else {
            // Method 2: Manual fallback if Bootstrap is not available
            toastElement.classList.add('show');
            setTimeout(() => {
                toastElement.classList.remove('show');
                setTimeout(() => {
                    if (toastElement.parentNode) {
                        toastElement.parentNode.removeChild(toastElement);
                    }
                }, 300);
            }, 3000);
        }
    } catch (error) {
        // Method 3: Last resort fallback - simple alert
        console.error("Error showing toast:", error);
        alert(message);
    }
    
    // Clean up toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    });
    
    // Ensure toast is removed after a timeout even if the hidden event doesn't fire
    setTimeout(() => {
        if (toastElement.parentNode) {
            toastElement.parentNode.removeChild(toastElement);
        }
    }, 5000);
}

// Navigation function
function goBack() {
    window.location.href = 'dash2.html';
}

// Go to profile page
function goToProfile() {
    window.location.href = 'profile.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load completed tasks and render the UI
    console.log("Initializing completed tasks page");
    renderTasks();
    
    // Setup profile image
    setupProfileImage();
});

// Setup profile image function
function setupProfileImage() {
    const profileImgContainer = document.getElementById('profileImage');
    const currentUser = getCurrentUser();
    
    if (currentUser && currentUser.profileImage) {
        // Jika ada gambar profil, tampilkan sebagai img
        profileImgContainer.innerHTML = `<img src="${currentUser.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        // Jika tidak ada gambar profil, tampilkan ikon person
        profileImgContainer.innerHTML = `<i class="bi bi-person-circle" style="font-size: 40px; color: #6c757d;"></i>`;
        profileImgContainer.style.backgroundColor = '#f8f9fa';
    }
}