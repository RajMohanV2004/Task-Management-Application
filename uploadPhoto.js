const express = require("express");
const multer = require("multer");
const path = require("path");
const { authenticateToken } = require("./auth");
const router = express.Router();
const User = require("../models/user");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, "profile-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage: storage });

// Match frontend field name: profilePhoto
router.post("/upload-photo", authenticateToken, upload.single("profilePhoto"), async (req, res) => {
    if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    // Save filename to MongoDB user profile
    await User.findByIdAndUpdate(req.user.id, {
      profilePhoto: req.file.filename
    });

    return res.status(200).json({
        message: "Photo uploaded successfully",
        profilePhoto: req.file.filename,
      });
  } catch (error) {
    console.error("DB update error:", error);
    return res.status(500).json({ message: "Failed to update user profile" });
  }
});

module.exports = router;
