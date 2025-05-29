import { getCurrentUser } from './modules/auth.js';
import * as taskManager from './modules/taskManager.js';

// Global variables
let tasks = [];
let completedTasks = [];
let currentTask = null;
let editMode = false;

// DOM Elements
const taskContainer = document.getElementById('taskContainer');
const addTaskBtn = document.getElementById('addTaskBtn');
const addEditTaskModal = new bootstrap.Modal(document.getElementById('addEditTaskModal'));
const taskForm = document.getElementById('taskForm');
const taskDetailsModal = new bootstrap.Modal(document.getElementById('taskDetailsModal'));
const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '/login';
        return;
    }

    // Load initial data
    await loadTasks();
    
    // Set up real-time listeners
    setupTaskListeners();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set default date for new tasks
    setDefaultTaskDate();
});

// Load tasks
async function loadTasks() {
    try {
        tasks = await taskManager.loadTasksForCurrentUser();
        completedTasks = await taskManager.loadCompletedTasksForCurrentUser();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToastMessage('Error loading tasks');
    }
}

// Set up real-time listeners
function setupTaskListeners() {
    // Listen for changes in active tasks
    taskManager.subscribeToTasks(newTasks => {
        tasks = newTasks;
        renderTasks();
    });

    // Listen for changes in completed tasks
    taskManager.subscribeToCompletedTasks(newCompletedTasks => {
        completedTasks = newCompletedTasks;
        renderTasks();
    });
}

// Set up event listeners
function setupEventListeners() {
    // Add Task button
    addTaskBtn.addEventListener('click', showAddTaskModal);

    // Task form submission
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleTaskSubmit();
    });

    // Priority buttons
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const priority = parseInt(btn.dataset.priority);
            setPriority(priority);
        });
    });

    // Notification toggle
    document.getElementById('enableNotification').addEventListener('change', (e) => {
        const container = document.getElementById('notificationTimeContainer');
        container.style.display = e.target.checked ? 'block' : 'none';
    });
}

// Handle task form submission
async function handleTaskSubmit() {
    try {
        const formData = new FormData(taskForm);
        const taskData = {
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            priority: parseInt(formData.get('priority') || '1'),
            date: formData.get('date'),
            time: formData.get('time'),
            enableNotification: formData.get('enableNotification') === 'on',
            notificationTime: parseInt(formData.get('notificationTime') || '30')
        };

        if (editMode && currentTask) {
            await taskManager.updateTask(currentTask.id, taskData);
        } else {
            await taskManager.saveTask(taskData);
        }

        addEditTaskModal.hide();
        taskForm.reset();
        showToastMessage(editMode ? 'Task updated successfully' : 'Task added successfully');
    } catch (error) {
        console.error('Error saving task:', error);
        showToastMessage('Error saving task');
    }
}

// Show add task modal
function showAddTaskModal() {
    editMode = false;
    currentTask = null;
    document.getElementById('addEditModalTitle').textContent = 'Add Task';
    taskForm.reset();
    setPriority(1);
    setDefaultTaskDate();
    document.getElementById('notificationTimeContainer').style.display = 'none';
    addEditTaskModal.show();
}

// Show edit task modal
function showEditTaskModal(task) {
    editMode = true;
    currentTask = task;
    document.getElementById('addEditModalTitle').textContent = 'Edit Task';
    
    // Fill form with task data
    taskForm.title.value = task.title;
    taskForm.description.value = task.description || '';
    taskForm.date.value = task.date;
    taskForm.time.value = task.time;
    taskForm.enableNotification.checked = task.enableNotification || false;
    setPriority(task.priority || 1);
    
    const notificationContainer = document.getElementById('notificationTimeContainer');
    notificationContainer.style.display = task.enableNotification ? 'block' : 'none';
    if (task.notificationTime) {
        taskForm.notificationTime.value = task.notificationTime;
    }
    
    addEditTaskModal.show();
}

// Set priority
function setPriority(priority) {
    document.getElementById('taskPriority').value = priority;
    document.querySelectorAll('.priority-btn').forEach(btn => {
        const btnPriority = parseInt(btn.dataset.priority);
        btn.classList.toggle('active', btnPriority === priority);
    });
}

// Set default task date
function setDefaultTaskDate() {
    const taskDateInput = document.getElementById('taskDate');
    const taskTimeInput = document.getElementById('taskTime');
    
    const now = new Date();
    taskDateInput.value = now.toISOString().split('T')[0];
    
    // Set time to next 30 minutes
    now.setMinutes(now.getMinutes() + 30);
    taskTimeInput.value = now.toTimeString().slice(0, 5);
}

// Render tasks
function renderTasks() {
    // Sort tasks by date and time
    const sortedTasks = [...tasks].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    // Group tasks by date
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const todayTasks = sortedTasks.filter(task => task.date === today);
    const tomorrowTasks = sortedTasks.filter(task => task.date === tomorrow);
    const upcomingTasks = sortedTasks.filter(task => task.date > tomorrow);
    const overdueTasks = sortedTasks.filter(task => task.date < today);

    // Render each section
    renderTaskSection('todayTasksList', todayTasks, 'Today');
    renderTaskSection('tomorrowTasksList', tomorrowTasks, 'Tomorrow');
    renderTaskSection('upcomingTasksContainer', upcomingTasks, 'Upcoming');
    renderTaskSection('overdueTasksList', overdueTasks, 'Overdue');

    // Update counters
    updateTaskCounters(todayTasks, tomorrowTasks, upcomingTasks, overdueTasks);
}

// Render task section
function renderTaskSection(containerId, tasks, title) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = `<div class="text-center py-3 text-muted">No ${title.toLowerCase()} tasks</div>`;
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="task-item ${task.priority === 3 ? 'high-priority' : task.priority === 2 ? 'medium-priority' : ''}" 
             data-task-id="${task.id}">
            <div class="task-content" onclick="showTaskDetails('${task.id}')">
                <div class="task-title">${task.title}</div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-meta">
                    <span class="task-time">${task.time}</span>
                    ${task.priority === 3 ? '<span class="badge bg-danger">High</span>' : 
                      task.priority === 2 ? '<span class="badge bg-warning">Medium</span>' : 
                      '<span class="badge bg-success">Low</span>'}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-sm btn-outline-success" onclick="completeTask('${task.id}')">
                    <i class="bi bi-check-lg"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="editTask('${task.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('${task.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Update task counters
function updateTaskCounters(todayTasks, tomorrowTasks, upcomingTasks, overdueTasks) {
    document.getElementById('overdueCount').textContent = overdueTasks.length;
    // Add more counters as needed
}

// Show task details
async function showTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const modalBody = document.getElementById('taskDetailsBody');
    modalBody.innerHTML = `
        <h5>${task.title}</h5>
        ${task.description ? `<p class="mt-3">${task.description}</p>` : ''}
        <div class="mt-3">
            <strong>Date:</strong> ${task.date}<br>
            <strong>Time:</strong> ${task.time}<br>
            <strong>Priority:</strong> ${task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}<br>
            ${task.enableNotification ? `<strong>Notification:</strong> ${task.notificationTime} minutes before` : ''}
        </div>
    `;

    currentTask = task;
    taskDetailsModal.show();
}

// Complete task
async function completeTask(taskId) {
    try {
        await taskManager.completeTask(taskId);
        showToastMessage('Task completed successfully');
    } catch (error) {
        console.error('Error completing task:', error);
        showToastMessage('Error completing task');
    }
}

// Edit task
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        showEditTaskModal(task);
    }
}

// Delete task
async function deleteTask(taskId) {
    try {
        await taskManager.deleteTask(taskId);
        showToastMessage('Task deleted successfully');
    } catch (error) {
        console.error('Error deleting task:', error);
        showToastMessage('Error deleting task');
    }
}

// Show toast message
function showToastMessage(message) {
    // Implement your toast notification here
    alert(message); // Temporary solution
}

// Export functions for onclick handlers
window.showTaskDetails = showTaskDetails;
window.completeTask = completeTask;
window.editTask = editTask;
window.deleteTask = deleteTask; 