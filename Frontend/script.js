let tasks = [];
let isEditing = false;
let editingIndex = null;

// Load tasks from backend on page load
document.addEventListener("DOMContentLoaded", () => {
  loadTasksFromServer();
});

// loads task from server
async function loadTasksFromServer() {
  try {
    const res = await fetch("http://localhost:5000/api/tasks");
    tasks = await res.json();
    updateTasksList();
    updateStats();
  } catch (err) {
    console.error("Failed to load tasks", err);
  }
}

// add or edit task
const addTask = async () => {
  const taskInput = document.getElementById("taskInput");
  const text = taskInput.value.trim();

  if (!text) return;

  if (isEditing && editingIndex !== null) {
    // Edit existing task
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${tasks[editingIndex]._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const updatedTask = await res.json();
      tasks[editingIndex] = updatedTask;
    } catch (err) {
      console.error("Failed to update task", err);
    }

    isEditing = false;
    editingIndex = null;
  } else {
    // adds new task
    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, completed: false }),
      });
      const newTask = await res.json();
      tasks.push(newTask);
    } catch (err) {
      console.error("Failed to add task", err);
    }
  }

  taskInput.value = "";
  updateTasksList();
  updateStats();
};

// toggle coplete
const toggleTaskComplete = async (index) => {
  const task = tasks[index];
  try {
    const res = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    const updatedTask = await res.json();
    tasks[index] = updatedTask;
    updateTasksList();
    updateStats();
  } catch (err) {
    console.error("Failed to update task", err);
  }
};

// edit taks
const editTask = (index) => {
  const taskInput = document.getElementById("taskInput");
  taskInput.value = tasks[index].text;
  isEditing = true;
  editingIndex = index;
};

// del task
const deleteTask = async (index) => {
  const task = tasks[index];
  try {
    await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
      method: "DELETE",
    });
    tasks.splice(index, 1);
    updateTasksList();
    updateStats();
  } catch (err) {
    console.error("Failed to delete task", err);
  }
};

// update stats and progress bar
const updateStats = () => {
  const completeTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks === 0 ? 0 : (completeTasks / totalTasks) * 100;
  const progressBar = document.getElementById("progress");

  progressBar.style.width = `${progress}%`;
  document.getElementById("numbers").innerText = `${completeTasks} / ${totalTasks}`;
};

//update task UI
const updateTasksList = () => {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const listItem = document.createElement("li");

    listItem.innerHTML = `
      <div class="taskItem">
        <div class="task ${task.completed ? "completed" : ""}">
          <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""} />
          <p>${task.text}</p>
        </div>
        <div class="icons">
          <img src="./img/edit.png" alt="Edit" onClick="editTask(${index})" />
          <img src="./img/bin.png" alt="Delete" onClick="deleteTask(${index})" />
        </div>
      </div>
    `;

    const checkbox = listItem.querySelector(".checkbox");
    checkbox.addEventListener("change", () => {
      toggleTaskComplete(index);
    });

    taskList.appendChild(listItem);
  });
};

//add task button
document.getElementById("newTask").addEventListener("click", (e) => {
  e.preventDefault();
  addTask();
});
