<?php
session_start();
if (!isset($_SESSION['token'], $_SESSION['id'], $_SESSION['username'])) {
    header('Location: home.html');
    exit();
}

// Profile photo is set in login.php and stored in session favicon.icon
$username      = htmlspecialchars($_SESSION['username']);
$token         = $_SESSION['token'];
$userId        = $_SESSION['id'];
$profilePhoto  = isset($_SESSION['profilePhoto']) ? htmlspecialchars($_SESSION['profilePhoto']) : '';
$photoPath     = $profilePhoto
    ? "http://localhost:1000/uploads/$profilePhoto"
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Task Manager</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <style>
    .profile-photo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      cursor: pointer;
      margin-right: 10px;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="user-info">
      <label for="profile-upload" style="cursor: pointer;">
        <img id="profile-photo" src="<?= $photoPath ?>" alt="User Icon" class="profile-photo" />
      </label>
      <input type="file" id="profile-upload" accept="image/*" style="display: none;" />
      <span>Welcome, <?= $username ?></span>
    </div>

    <form method="post" action="logout.php">
      <button class="logout-btn">
        <i class="fas fa-sign-out-alt"></i>
        Logout
      </button>
    </form>
  </header>

  <div class="main-container">
    <aside class="sidebar">
      <button class="nav-btn"><i class="fas fa-plus-circle"></i> Add Task</button>
      <button class="nav-btn"><i class="fas fa-tasks"></i> Show Tasks</button>
    </aside>

    <div class="content-area">
      <section class="form-area" id="form-area" style="display: none;">
        <input id="title" placeholder="Task Title" />
        <textarea id="desc" placeholder="Task Description" rows="3" style="resize: vertical;"></textarea>
        <button id="addBtn">Add Task</button>
      </section>

      <main class="board" id="task-board">
        <div class="column">
          <h2>Important</h2>
          <div id="important-tasks">Loading…</div>
        </div>
        <div class="column">
          <h2>Incomplete</h2>
          <div id="incomplete-tasks">Loading…</div>
        </div>
        <div class="column">
          <h2>Complete</h2>
          <div id="complete-tasks">Loading…</div>
        </div>
      </main>
    </div>
  </div>

  <script>
    const BASE = "http://localhost:1000/api/v2";
    const AUTH = "http://localhost:1000/api/v1";
    const token = "<?= $token ?>";
    const userId = "<?= $userId ?>";

    // Sidebar toggles
    document.querySelector(".sidebar .nav-btn:first-child").addEventListener("click", () => {
      document.getElementById('form-area').style.display = 'flex';
      document.getElementById('task-board').style.display = 'none';
    });
    document.querySelector(".sidebar .nav-btn:last-child").addEventListener("click", () => {
      document.getElementById('form-area').style.display = 'none';
      document.getElementById('task-board').style.display = 'flex';
    });
    document.getElementById("addBtn").addEventListener("click", () => {
      setTimeout(() => {
        document.getElementById('form-area').style.display = 'none';
        document.getElementById('task-board').style.display = 'flex';
      }, 1000);
    });

    // Profile photo upload
    document.getElementById("profile-upload").addEventListener("change", async function () {
      const file = this.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("profilePhoto", file);
      formData.append("userId", userId);

      try {
        const response = await fetch(`${AUTH}/upload-photo`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });

        const result = await response.json();
        if (response.ok && result.profilePhoto) {
          document.getElementById("profile-photo").src = `http://localhost:1000/uploads/${result.profilePhoto}`;
          alert("Profile photo updated!");
        } else {
          alert("Upload failed: " + (result.message || "Unknown error"));
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload failed");
      }
    });
  </script>
  <script src="script.js"></script>
</body>
</html>