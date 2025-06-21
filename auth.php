<?php
session_start();
if (!isset($_SESSION['token']) || !isset($_SESSION['id']) || !isset($_SESSION['username'])) {
    header("Location: login.php");
    exit();
}
?>