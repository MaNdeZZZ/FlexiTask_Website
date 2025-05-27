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
    
    // Return user's completed tasks or empty array if none
    return currentUser.completedTasks || [];
}

// Function to render tasks from current user
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
                    <button class="restore-btn" onclick="restoreTask('${task.id}')">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                </div>
            </div>
        `;
        taskListContainer.appendChild(taskCard);
    });
}

// Function to restore a task
function restoreTask(taskId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Load both task lists for current user
    let completedTasks = currentUser.completedTasks || [];
    let tasks = currentUser.tasks || [];
    
    try {
        // Find the task to restore
        const taskIndex = completedTasks.findIndex(t => t.id == taskId);
        
        if (taskIndex !== -1) {
            const taskToRestore = { ...completedTasks[taskIndex] };
            
            // Reset completion status
            taskToRestore.isCompleted = false;
            delete taskToRestore.completedDate;
            
            // Make sure the task has all required properties
            if (!taskToRestore.priority) taskToRestore.priority = 1;
            
            // Check if the task's date is in the past (overdue)
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day for comparison
            const taskDate = new Date(taskToRestore.date + 'T00:00:00');
            
            // Check if task date is in the past - making it overdue
            const isOverdue = taskDate < today;
            
            // If task date is overdue, we keep it as is so it appears in the overdue list
            // If task date isn't set or is invalid, set it to today
            if (!taskToRestore.date || isNaN(taskDate.getTime())) {
                taskToRestore.date = today.toISOString().split('T')[0];
            }
            
            // Set default time if not present
            if (!taskToRestore.time) taskToRestore.time = "09:00";
            
            // Move from completed to active tasks
            tasks.push(taskToRestore);
            completedTasks.splice(taskIndex, 1);
            
            // Update user's task lists
            currentUser.tasks = tasks;
            currentUser.completedTasks = completedTasks;
            
            // Save back to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update in users array
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            
            if (userIndex >= 0) {
                users[userIndex].tasks = tasks;
                users[userIndex].completedTasks = completedTasks;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Re-render the completed tasks list
            renderTasks();
        }
    } catch (e) {
        console.error('Error restoring task:', e);
    }
}

// Show toast message
function showToastMessage(message) {
    alert(message); // Simple implementation using alert. Can be replaced with a bootstrap toast
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