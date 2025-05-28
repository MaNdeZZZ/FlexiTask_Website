<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FlexiTask - Task Management</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Font - Lexend -->
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <!-- Custom CSS -->
    @vite(['resources/css/dash2.css', 'resources/js/dash2.js'])
</head>
<body>
    <div class="container-fluid p-0">
        <div class="main-container">
            <div class="header-section">
                <!-- Header with logo and profile - Updated with larger sizes -->
                <div class="d-flex justify-content-between align-items-center header-padding">
                    <div class="d-flex align-items-center">
                        <img src="public/images/logo_FLXT.png" alt="FlexiTask Logo" height="55" width="55" id="logoImg">
                    </div>
                <div>
                    <div class="profile-pic" id="profilePic" onclick="window.location.href='profile.html'" style="cursor: pointer;">
                        <!-- Diganti dari img tag menjadi struktur div yang dapat menampung icon -->
                        <div id="headerProfileImage" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Username display -->
            <div class="text-center">
                <p class="fw-semibold">Welcome, <span id="usernameDisplay">User</span>!</p>
                <p class="fw-semibold">Let's turn your ideas into action!</p>
            </div>
            
            <!-- Search and Filter Icons -->
            <div class="search-filter-icons d-flex justify-content-end">
                <button class="icon-button me-2" id="searchToggleBtn" title="Search tasks">
                    <i class="bi bi-search"></i>
                </button>
                <button class="icon-button" id="filterToggleBtn" title="Filter tasks">
                    <i class="bi bi-funnel"></i>
                </button>
            </div>
            
            <!-- Collapsible Search Panel -->
            <div id="searchPanel" class="search-panel collapse">
                <div class="search-box">
                    <input type="text" id="searchInput" class="search-input" placeholder="Search tasks...">
                    <button id="clearSearchBtn" class="clear-search-btn">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
            </div>
            
            <!-- Collapsible Filter Panel -->
            <div id="filterPanel" class="filter-panel collapse">
                <div class="filter-options">
                    <div class="filter-header">Filter by Priority</div>
                    <div class="filter-item">
                        <input type="checkbox" id="filterPriorityHigh" class="filter-checkbox">
                        <label for="filterPriorityHigh">High Priority</label>
                    </div>
                    <div class="filter-item">
                        <input type="checkbox" id="filterPriorityMedium" class="filter-checkbox">
                        <label for="filterPriorityMedium">Medium Priority</label>
                    </div>
                    <div class="filter-item">
                        <input type="checkbox" id="filterPriorityLow" class="filter-checkbox">
                        <label for="filterPriorityLow">Low Priority</label>
                    </div>
                    <div class="d-flex justify-content-between mt-2">
                        <button id="resetFilterBtn" class="btn btn-sm btn-outline-secondary">Reset</button>
                        <button id="applyFilterBtn" class="btn btn-sm btn-success">Apply</button>
                    </div>
                </div>
            </div>
            
            <hr class="m-0" style="height: 1px; background-color: #6c757d;">
            </div>

            
            <!-- Task Content Area -->
            <div class="task-container">
                <div id="taskContainer">
                    <!-- Today's Tasks Section -->
                    <div id="regularTasksView">
                        <!-- No Tasks Message (initially hidden) -->
                        <div id="noTasksMessage" class="text-center py-5 d-none">
                            <i class="bi bi-calendar-x" style="font-size: 3rem; color: #6c757d;"></i>
                            <h5 class="mt-3 text-secondary">No tasks today</h5>
                            <p class="text-muted">Click the + button below to add a new task</p>
                        </div>
                        
                        <!-- Today Section (will be hidden when empty) -->
                        <div id="todaySection">
                            <!-- Combined header row with Today label and Overdue counter -->
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="date-header today-header">Today</div>
                                <div id="overdueCounterContainer">
                                    <div id="overdueCounter" class="overdue-counter">
                                        <i class="bi bi-exclamation-triangle-fill"></i>
                                        <span>Overdue: <span id="overdueCount">0</span></span>
                                    </div>
                                </div>
                            </div>
                            <div id="todayTasksList"></div>
                        </div>
                        
                        <!-- Tomorrow's Tasks Section (will be hidden when empty) -->
                        <div id="tomorrowSection">
                            <div class="date-header">Tomorrow</div>
                            <div id="tomorrowTasksList"></div>
                        </div>
                        
                        <!-- Upcoming Tasks Section - Will be populated dynamically -->
                        <div id="upcomingTasksContainer"></div>
                    </div>
                    
                    <!-- Overdue Tasks Section (initially hidden) -->
                    <div id="overdueTasksView" style="display: none;">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="date-header text-white" style="background-color: #dc3545;">Overdue Tasks</div>
                            <button id="backToToday" class="btn btn-sm btn-link">
                                <i class="bi bi-arrow-left"></i> Back to Today
                            </button>
                        </div>
                        <div id="overdueTasksList"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bottom Navigation Bar -->
<nav class="navbar fixed-bottom bg-white shadow-lg">
    <div class="container">
        <div class="row w-100">
            <div class="col-4 text-center">
                <a href="#" class="bottom-nav-link" id="assistantBtn">
                    <i class="bi bi-robot"></i>
                    <span class="small">Assistant</span>
                </a>
            </div>
            <div class="col-4 text-center">
                <a href="#" class="bottom-nav-link active" id="addTaskBtn">
                    <i class="bi bi-plus-circle-fill"></i>
                    <span class="small">Add Task</span>
                </a>
            </div>
            <div class="col-4 text-center">
                <a href="#" class="bottom-nav-link" id="completedBtn">
                    <i class="bi bi-check-circle"></i>
                    <span class="small">Completed</span>
                </a>
            </div>
        </div>
    </div>
</nav>
    
    <!-- Task Details Modal -->
    <div class="modal fade" id="taskDetailsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="taskDetailsTitle">Task Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="taskDetailsBody">
                    <!-- Will be populated dynamically -->
                </div>
                <div class="modal-footer" id="taskDetailsFooter">
                    <button type="button" class="btn btn-outline-danger" id="deleteTaskBtn">Delete</button>
                    <button type="button" class="btn btn-outline-primary" id="editTaskBtn">Edit</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Add/Edit Task Modal -->
    <div class="modal fade" id="addEditTaskModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="addEditModalTitle">Add Task</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="taskForm">
                        <div class="mb-3">
                            <label for="taskTitle" class="form-label">Task Title</label>
                            <input type="text" class="form-control" id="taskTitle" required>
                        </div>
                        <div class="mb-3">
                            <label for="taskDescription" class="form-label">Description/Note</label>
                            <textarea class="form-control" id="taskDescription" rows="2"></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Priority Level</label>
                            <div class="d-flex justify-content-between">
                                <button type="button" class="priority-btn btn btn-outline-success" data-priority="1">Low</button>
                                <button type="button" class="priority-btn btn btn-outline-warning" data-priority="2">Medium</button>
                                <button type="button" class="priority-btn btn btn-outline-danger" data-priority="3">High</button>
                            </div>
                            <input type="hidden" id="taskPriority" value="1">
                        </div>
                        <div class="mb-3">
                            <label for="taskDate" class="form-label">Date</label>
                            <input type="date" class="form-control" id="taskDate" required>
                        </div>
                        <div class="mb-3">
                            <label for="taskTime" class="form-label">Time</label>
                            <input type="time" class="form-control" id="taskTime" required>
                        </div>
                        <div class="mb-3 form-check form-switch">
                            <input type="checkbox" class="form-check-input" id="enableNotification">
                            <label class="form-check-label" for="enableNotification">Enable Notification</label>
                        </div>
                        <div class="mb-3" id="notificationTimeContainer" style="display: none;">
                            <label for="notificationTime" class="form-label">Notify me</label>
                            <select class="form-select" id="notificationTime">
                                <option value="1">30 seconds before (testing)</option>
                                <option value="2">1 minute before (testing)</option>
                                <option value="5">5 minutes before (testing)</option>
                                <option value="15">15 minutes before</option>
                                <option value="30">30 minutes before</option>
                                <option value="60">1 hour before</option>
                                <option value="180">3 hours before</option>
                                <option value="1440" selected>1 day before</option>
                                <option value="2880">2 days before</option>
                                <option value="10080">1 week before</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-success" id="saveTaskBtn">Save</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Deletion</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this task?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Save Confirmation Modal -->
    <div class="modal fade" id="saveConfirmModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Save Changes</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Do you want to save your changes?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-success" id="confirmSaveBtn">Save</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
