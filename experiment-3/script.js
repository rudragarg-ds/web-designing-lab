const taskInput = document.getElementById("taskInput");
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearCompleted = document.getElementById("clearCompleted");
const emptyMessage = document.getElementById("emptyMessage");
function updateTaskCount() {
    const totalTasks = taskList.children.length;
    if (totalTasks === 1) {
        taskCount.textContent = "1 task";
    } else {
        taskCount.textContent = totalTasks + " tasks";
    }
    if (totalTasks === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }
}
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText === "") {
        return;
    }
    const task = document.createElement("li");
    const taskTextElement = document.createElement("span");
    taskTextElement.textContent = taskText;
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";
    task.appendChild(taskTextElement);
    task.appendChild(deleteButton);
    taskList.appendChild(task);
    taskInput.value = "";
    taskInput.focus();
    updateTaskCount();
    task.addEventListener("click", function() {
        task.classList.toggle("completed");
        updateTaskCount();
    });
    deleteButton.addEventListener("click", function(event) {
        event.stopPropagation();
        task.remove();
        updateTaskCount();
    });
});
clearCompleted.addEventListener("click", function() {
    const completedTasks = document.querySelectorAll("#taskList .completed");
    completedTasks.forEach(function(task) {
        task.remove();
    });
    updateTaskCount();
});
updateTaskCount();