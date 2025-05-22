<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FlexiTask - Task Management</title>

    <!-- Bootstrap CDN & Google Fonts -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Custom CSS & JS via Vite -->
    @vite(['resources/css/dash2.css', 'resources/js/dash2.js'])
</head>
<body>
    
    
    <!-- Contoh perubahan path gambar -->
    <img src="{{ asset('images/logo_FLXT.png') }}" alt="FlexiTask Logo" height="55" width="55">

    <!-- Contoh perubahan href halaman Laravel -->
    <a href="{{ url('/chatbot') }}" class="bottom-nav-link">
        <i class="bi bi-robot"></i><span class="small">Assistant</span>
    </a>
    <a href="{{ url('/completed') }}" class="bottom-nav-link">
        <i class="bi bi-check-circle"></i><span class="small">Completed</span>
    </a>

    <!-- Tambahkan semua bagian HTML dari dash2.html di antara body -->
    {{-- Untuk menjaga kerapian dan fokus, saya bisa bantu masukkan seluruh konten jika kamu ingin file blade-nya dalam 1 bagian utuh --}}

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
