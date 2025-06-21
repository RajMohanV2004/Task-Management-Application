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
        "email"    => $_POST["email"],
        "password" => $_POST["password"]
    ];
    $response = callApi("http://localhost:1000/api/v1/sign-up", $data);

    if ($response === false) {
        $error = "Cannot connect to backend (cURL error).";
    } else {
        $result = json_decode($response, true);
        if (!empty($result["message"]) && $result["message"] === "SignIn Successfully") {
            header("Location: login.php");
            exit();
        } else {
            $error = $result["message"] ?? "Unexpected response from server.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Sign Up</title>
  <link rel="stylesheet" href="signup.css" />
</head>
<body>
  <div class="signup-container">
    <div class="signup-card">
      <h2>Sign Up</h2>
      <?php if (!empty($error)): ?>
        <div class="error-message"><?= htmlspecialchars($error) ?></div>
      <?php endif; ?>
      <form method="post" class="signup-form">
        <input name="username" type="text" placeholder="Username" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Sign Up</button>
      </form>
      <p class="login-link">Already have an account? <a href="login.php">Log in</a></p>
    </div>
  </div>
</body>
</html>
