<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FlexiTask Dashboard</title>

    {{-- CDN Bootstrap & Icons --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600&display=swap" rel="stylesheet">

    {{-- Vite CSS & JS --}}
    @vite(['resources/css/app.css', 'resources/js/app.js']) 
</head>
<body>
<!-- HEADER -->
        <div class="header-section">
            <div class="d-flex justify-content-between align-items-center header-padding">
                <div class="d-flex align-items-center">
                    <img src="{{ asset('images/logo_FLXT.png') }}" alt="FlexiTask Logo" height="55" width="55">
                </div>
                <div>
                    <div class="profile-pic" onclick="window.location.href='{{ url('/profile') }}'">
                        <div id="headerProfileImage"></div>
                    </div>
                </div>
            </div>

            <!-- 🔍 Search Input -->
            <div class="px-3 pt-2 pb-1">
                <div class="input-group">
                    <input id="searchInput" type="text" class="form-control" placeholder="Search tasks...">
                    <button id="clearSearchBtn" class="btn btn-outline-secondary" type="button" style="display:none;">×</button>
                </div>
            </div>

            <hr class="m-0">
        </div>


            <!-- TASK CONTAINER -->
            <div id="taskContainer" class="p-3 overflow-auto"></div>
        </div>

        <!-- BOTTOM NAV -->
        <nav class="navbar fixed-bottom bg-white shadow-lg">
            <div class="container">
                <div class="row w-100">
                    <div class="col-4 text-center">
                        <a href="{{ url('/chatbot') }}" class="bottom-nav-link">
                            <i class="bi bi-robot"></i>
                            <span class="small">Assistant</span>
                        </a>
                    </div>
                    <div class="col-4 text-center">
                        <a href="{{ url('/dash2') }}" class="bottom-nav-link active">
                            <i class="bi bi-house"></i>
                            <span class="small">Home</span>
                        </a>
                    </div>
                    <div class="col-4 text-center">
                        <a href="{{ url('/completed') }}" class="bottom-nav-link">
                            <i class="bi bi-check-circle"></i>
                            <span class="small">Completed</span>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
        <!-- Add/Edit Task Modal -->
<div class="modal fade" id="addEditTaskModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 id="addEditModalTitle" class="modal-title">Add Task</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <form id="taskForm">
            <div class="mb-3">
                <label for="taskTitle" class="form-label">Title</label>
                <input type="text" class="form-control" id="taskTitle" name="title" required>
            </div>
            <div class="mb-3">
                <label for="taskDescription" class="form-label">Description</label>
                <textarea class="form-control" id="taskDescription" name="description" rows="2"></textarea>
            </div>
            <div class="mb-3">
                <label>Date</label>
                <input type="date" class="form-control" id="taskDate" name="date" required>
            </div>
            <div class="mb-3">
                <label>Time</label>
                <input type="time" class="form-control" id="taskTime" name="time" required>
            </div>
            <div class="mb-3">
                <label>Priority</label>
                <div class="d-flex gap-2">
                <button type="button" class="priority-btn btn btn-outline-success" data-priority="1">Low</button>
                <button type="button" class="priority-btn btn btn-outline-warning" data-priority="2">Medium</button>
                <button type="button" class="priority-btn btn btn-outline-danger" data-priority="3">High</button>
                </div>
                <input type="hidden" id="taskPriority" name="priority" value="1">
            </div>
            <div class="mb-3 form-check form-switch">
                <input type="checkbox" class="form-check-input" id="enableNotification" name="enableNotification">
                <label class="form-check-label" for="enableNotification">Enable Notification</label>
            </div>
            <div class="mb-3" id="notificationTimeContainer" style="display: none;">
                <label for="notificationTime" class="form-label">Notify me</label>
                <select class="form-select" id="notificationTime" name="notificationTime">
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="1440" selected>1 day before</option>
                </select>
            </div>
            </form>

      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-success" id="saveTaskBtn">Save</button>
      </div>
    </div>
  </div>
</div>

<!-- Task Details Modal -->
<div class="modal fade" id="taskDetailsModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 id="taskDetailsTitle" class="modal-title">Task Details</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div id="taskDetailsBody" class="modal-body"></div>
      <div class="modal-footer">
        <button class="btn btn-outline-danger" id="deleteTaskBtn">Delete</button>
        <button class="btn btn-outline-primary" id="editTaskBtn">Edit</button>
        <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<!-- Confirm Delete Modal -->
<div class="modal fade" id="deleteConfirmModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Confirm Delete</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">Are you sure you want to delete this task?</div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
      </div>
    </div>
  </div>
</div>

<!-- Confirm Save Modal -->
<div class="modal fade" id="saveConfirmModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Confirm Save</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">Do you want to save changes?</div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-success" id="confirmSaveBtn">Save</button>
      </div>
    </div>
  </div>
</div>

    </div>




<button id="addTaskBtn"
        class="btn btn-primary rounded-circle shadow-lg position-fixed"
        style="bottom: 80px; right: 20px; z-index: 1050; width: 60px; height: 60px; font-size: 24px;">
    <i class="bi bi-plus-lg"></i>
</button>
<div class="modal" id="completeConfirmModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Complete Task</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        Are you sure you want to mark this task as completed?
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button id="confirmCompleteBtn" type="button" class="btn btn-success">Yes, Mark as Completed</button>
      </div>
    </div>
  </div>
</div>



    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
