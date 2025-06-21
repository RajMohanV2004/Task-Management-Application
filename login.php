<?php
session_start();

function callApi($url, $payload) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    $resp = curl_exec($ch);
    if (curl_errno($ch)) {
        curl_close($ch);
        return false;
    }
    curl_close($ch);
    return $resp;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = [
        "username" => $_POST["username"],
        "password" => $_POST["password"]
    ];

    $response = callApi("http://localhost:1000/api/v1/log-in", $data);

    if ($response === false) {
        $error = "Cannot connect to backend (cURL error).";
    } else {
        $result = json_decode($response, true);
        if (!empty($result["token"]) && !empty($result["id"])) {
            // Store session variables including profile photo
            $_SESSION["token"] = $result["token"];
            $_SESSION["id"] = $result["id"];
            $_SESSION["username"] = $_POST["username"];
            $_SESSION["profilePhoto"] = $result["profilePhoto"] ?? ''; // Store the profile photo

            // Redirect to the home page after successful login
            header("Location: index.php");
            exit();
        } else {
            $error = $result["message"] ?? "Invalid login credentials.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Log In</title>
  <link rel="stylesheet" href="login.css" />
</head>
<body>
  <div class="login-container">
    <div class="login-card">
      <h2>Log In</h2>
      <?php if (!empty($error)): ?>
        <div class="error-message"><?= htmlspecialchars($error) ?></div>
      <?php endif; ?>
      <form method="post" class="login-form">
        <input name="username" type="text" placeholder="Username" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Log In</button>
      </form>
      <p class="signup-link">Don't have an account? <a href="signup.php">Sign up</a></p>
    </div>
  </div>
</body>
</html>
