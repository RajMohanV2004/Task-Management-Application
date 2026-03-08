const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const User = require("../models/user");
const { authenticateToken } = require("../auth");

// Create task
router.post("/create-task", authenticateToken, async (req, res) => {
    try {
        const { title, desc } = req.body;
        if (!title || !desc)
            return res.status(400).json({ message: "Title and description are required" });

        const newTask = new Task({ title, desc, user: req.user.id });
        await newTask.save();

        await User.findByIdAndUpdate(req.user.id, { $push: { tasks: newTask._id } });

        return res.status(201).json({ message: "Task created successfully", data: newTask });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get all tasks for logged-in user
router.get("/get-all-tasks", authenticateToken, async (req, res) => {
    try {
        const userId = req.headers["id"] || req.user.id;
        const userData = await User.findById(userId).populate({
            path: "tasks",
            options: { sort: { createdAt: -1 } }
        });
        if (!userData) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ data: userData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Update task (title, desc, important, complete)
router.put("/update-task/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const task = await Task.findByIdAndUpdate(id, updates, { new: true });
        if (!task) return res.status(404).json({ message: "Task not found" });
        return res.status(200).json({ message: "Task updated successfully", data: task });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Toggle complete
router.put("/update-complete-task/:id", authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        task.complete = !task.complete;
        await task.save();
        return res.status(200).json({ message: "Task completion toggled", data: task });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Toggle important
router.put("/update-important-task/:id", authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        task.important = !task.important;
        await task.save();
        return res.status(200).json({ message: "Task importance toggled", data: task });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Delete task
router.delete("/delete-task/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        await User.findByIdAndUpdate(req.user.id, { $pull: { tasks: id } });
        return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
