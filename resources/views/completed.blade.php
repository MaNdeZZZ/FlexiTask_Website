<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Completed Tasks</title>

    <!-- Bootstrap & Google Fonts -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600&display=swap" rel="stylesheet">

    <!-- Custom Styles via Vite -->
    @vite(['resources/css/completed.css', 'resources/js/completed.js'])
</head>
<body>
    <div class="container-fluid p-0">
        <div class="main-container">
            <!-- Header -->
            <div class="header-section">
                <div class="d-flex justify-content-between align-items-center header-padding">
                    <div class="d-flex align-items-center">
                        <!-- <button class="btn p-0 me-3" onclick="goBack()">
                            <i class="bi bi-arrow-left"></i>
                        </button> -->
                        <img src="{{ asset('images/logo_FLXT.png') }}" alt="FlexiTask Logo" height="55" width="55">
                    </div>
                    <div>
                        <div class="profile-pic" onclick="window.location.href='{{ url('/profile') }}'">
                            <div id="profileImage" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"></div>
                        </div>
                    </div>
                </div>

                <div class="text-center">
                    <p class="fw-semibold">Completed Task</p>
                </div>

                <hr class="m-0" style="height: 1px; background-color: #6c757d;">
            </div>

            <!-- Task list -->
            <div class="task-container">
                <div id="taskListContainer"></div>
                <div id="emptyState" class="empty-state d-none">
                    <i class="bi bi-check-circle-outline"></i>
                    <h5 class="mt-3">No completed tasks yet</h5>
                    <p>Completed tasks will appear here</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Navigation -->
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
                    <a href="{{ url('/dash2') }}" class="bottom-nav-link">
                        <i class="bi bi-house"></i>
                        <span class="small">Home</span>
                    </a>
                </div>
                <div class="col-4 text-center">
                    <a href="{{ url('/completed') }}" class="bottom-nav-link active">
                        <i class="bi bi-check-circle"></i>
                        <span class="small">Completed</span>
                    </a>
                </div>
            </div>
        </div>
    </nav>
    <!-- Modal Konfirmasi Restore -->
<div class="modal fade" id="restoreConfirmModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Restore Task</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        Are you sure you want to restore this task?
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button id="confirmRestoreBtn" type="button" class="btn btn-primary">Yes, Restore</button>
      </div>
    </div>
  </div>
</div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
        