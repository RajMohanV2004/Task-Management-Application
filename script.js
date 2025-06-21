document.addEventListener("DOMContentLoaded", () => {
    const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
        "id": userId
    };

    // Function to load tasks from the backend
    const loadTasks = async () => {
        try {
            const res = await fetch(`${BASE}/get-all-tasks`, { headers });
            if (!res.ok) throw new Error((await res.json()).message);
            const { data: userData } = await res.json();
            const tasks = userData.tasks || [];

            // Split tasks into important, incomplete, and complete tasks
            const imp = tasks.filter(t => t.important && !t.complete);
            const incom = tasks.filter(t => !t.complete && !t.important);
            const comp = tasks.filter(t => t.complete);

            renderColumn("important-tasks", imp, "No important tasks.", true);
            renderColumn("incomplete-tasks", incom, "No incomplete tasks.", true);
            renderColumn("complete-tasks", comp, "No complete tasks.", true);
        } catch (err) {
            alert("Error loading tasks: " + err.message);
        }
    };

    // Function to render tasks in a specific column
    function renderColumn(containerId, list, emptyMsg, showCompleteBtn) {
        const container = document.getElementById(containerId);
        container.innerHTML = "";
        if (!list.length) {
            container.textContent = emptyMsg;
            return;
        }

        list.forEach(t => {
            const card = document.createElement("div");
            card.className = "task";
            card.draggable = true;
            card.dataset.id = t._id;

            let html = `
                <strong>${t.title}</strong>
                <p>${t.desc}</p>
                <div class="task-buttons">
            `;

            // Only show complete button if allowed
            if (showCompleteBtn) {
                html += `<button class="complete-btn" title="Mark Complete/Incomplete">✅</button>`;
            }

            // Show important button for non-complete tasks
            if (!t.complete) {
                html += `<button class="imp-btn" title="Mark/Unmark Important">⭐</button>`;
            }

            // Only show edit button for non-complete tasks
            if (!t.complete) {
                html += `<button class="edit-btn" title="Edit Task">✏️</button>`;
            }

            // Show delete button for all
            html += `<button class="delete-btn" title="Delete Task">🗑️</button>`;

            html += `</div>`;

            card.innerHTML = html;

            // Drag Events
            card.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", t._id);
                setTimeout(() => card.style.display = "none", 0);
            });

            card.addEventListener("dragend", () => {
                card.style.display = "block";
            });

            // Button Events
            card.querySelector(".complete-btn")?.addEventListener("click", async (e) => {
                e.stopPropagation();
                await fetch(`${BASE}/update-complete-task/${t._id}`, { method: "PUT", headers });
                loadTasks();
            });

            card.querySelector(".imp-btn")?.addEventListener("click", async (e) => {
                e.stopPropagation();
                await fetch(`${BASE}/update-important-task/${t._id}`, { method: "PUT", headers });
                loadTasks();
            });

            card.querySelector(".edit-btn")?.addEventListener("click", async (e) => {
                e.stopPropagation();

                // Create input fields for title and description
                const titleInput = document.createElement("input");
                titleInput.value = t.title;

                const descInput = document.createElement("textarea");
                descInput.value = t.desc;
                descInput.style.width = "100%";
                descInput.style.height = "100px";

                // Replace current title and description with input fields
                card.querySelector("strong").textContent = "Edit Title:"; // Update the title prompt
                card.querySelector("p").replaceWith(descInput); // Replace the description with a textarea
                card.querySelector("strong").replaceWith(titleInput); // Replace the strong (title) with an input field

                // Add Save/Cancel buttons
                const saveBtn = document.createElement("button");
                saveBtn.textContent = "Save";
                saveBtn.classList.add("save-btn");

                const cancelBtn = document.createElement("button");
                cancelBtn.textContent = "Cancel";
                cancelBtn.classList.add("cancel-btn");

                const buttonsDiv = card.querySelector(".task-buttons");
                buttonsDiv.appendChild(saveBtn);
                buttonsDiv.appendChild(cancelBtn);

                // Handle saving changes
                saveBtn.addEventListener("click", async () => {
                    const newTitle = titleInput.value.trim();
                    const newDesc = descInput.value.trim();

                    if (!newTitle || !newDesc) {
                        alert("Both title and description are required.");
                        return;
                    }

                    try {
                        await fetch(`${BASE}/update-task/${t._id}`, {
                            method: "PUT",
                            headers,
                            body: JSON.stringify({ title: newTitle, desc: newDesc })
                        });
                        loadTasks(); // Reload tasks after update
                    } catch (err) {
                        alert("Error updating task: " + err.message);
                    }
                });

                // Handle canceling edit
                cancelBtn.addEventListener("click", () => {
                    loadTasks(); // Simply reload tasks to discard changes
                });
            });

            card.querySelector(".delete-btn")?.addEventListener("click", async (e) => {
                e.stopPropagation();
                if (confirm("Are you sure you want to delete this task?")) {
                    await fetch(`${BASE}/delete-task/${t._id}`, {
                        method: "DELETE",
                        headers
                    });
                    loadTasks();
                }
            });

            container.appendChild(card);
        });
    }

    // Adding a new task
    document.getElementById("addBtn").addEventListener("click", async () => {
        const title = document.getElementById("title").value.trim();
        const desc = document.getElementById("desc").value.trim();
        if (!title || !desc) {
            alert("Please enter title and description.");
            return;
        }
        try {
            const res = await fetch(`${BASE}/create-task`, {
                method: "POST",
                headers,
                body: JSON.stringify({ title, desc })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            alert("✅ Task created successfully!");
            document.getElementById("title").value = "";
            document.getElementById("desc").value = "";
            loadTasks();
        } catch (err) {
            alert("Error adding task: " + err.message);
        }
    });

    // DRAG & DROP setup for each section
    ["important-tasks", "incomplete-tasks", "complete-tasks"].forEach(containerId => {
        const container = document.getElementById(containerId);

        // Enable drag-over event
        container.addEventListener("dragover", (e) => {
            e.preventDefault(); // Allow the drop
            container.classList.add("drag-over");
        });

        // Remove the highlight when the drag leaves the container
        container.addEventListener("dragleave", () => {
            container.classList.remove("drag-over");
        });

        // Handle the drop event to update task status
        container.addEventListener("drop", async (e) => {
            e.preventDefault();
            container.classList.remove("drag-over");

            const taskId = e.dataTransfer.getData("text/plain");
            const targetCol = containerId;

            let updatedData = {};

            if (targetCol === "incomplete-tasks") {
                updatedData = { complete: false, important: false };
            } else if (targetCol === "complete-tasks") {
                updatedData = { complete: true, important: false };
            } else if (targetCol === "important-tasks") {
                updatedData = { complete: false, important: true };
            }

            try {
                // Update the task with the new status
                await fetch(`${BASE}/update-task/${taskId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                        "id": userId
                    },
                    body: JSON.stringify(updatedData)
                });
                loadTasks(); // Reload tasks after update
            } catch (err) {
                alert("Error updating task: " + err.message);
            }
        });
    });

    loadTasks(); // Initial load of tasks
});
