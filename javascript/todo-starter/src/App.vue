<template>
  <!-- Main To-Do List Container -->
  <div id="todo-list" role="list" aria-label="To-Do List">
    <!-- Loop through tasks and display each one -->
    <div v-for="(task, index) in tasks" :key="index" role="listitem">
      <!-- Checkbox for completing the task -->
      <input
        type="checkbox"
        v-model="task.completed"
        :aria-label="'Mark task ' + task.title + ' as complete'"
      />

      <!-- Display the task title -->
      <span>{{ task.title }}</span>

      <!-- Button to edit the task -->
      <button @click="editTask(index)" aria-label="Edit task">Edit</button>

      <!-- Button to delete the task -->
      <button @click="deleteTask(index)" aria-label="Delete task">
        Delete
      </button>
    </div>
  </div>

  <!-- Form for adding a new task -->
  <form @submit.prevent="addTask" aria-label="Add a new task">
    <input
      v-model="newTask"
      type="text"
      aria-label="Enter new task title"
      placeholder="New Task Title"
    />
    <button type="submit" aria-label="Add new task">Add Task</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      tasks: [], // Array to store tasks
      newTask: "", // Bound to the input field for new tasks
    };
  },
  methods: {
    // Method to add a new task
    addTask() {
      if (this.newTask.trim()) {
        this.tasks.push({ title: this.newTask, completed: false });
        this.newTask = ""; // Clear the input field after adding
      }
    },
    // Method to edit a task
    editTask(index) {
      const updatedTask = prompt("Edit your task:", this.tasks[index].title);
      if (updatedTask !== null && updatedTask.trim()) {
        this.tasks[index].title = updatedTask;
      }
    },
    // Method to delete a task
    deleteTask(index) {
      this.tasks.splice(index, 1);
    },
  },
};
</script>

<style scoped>
/* Style for the To-Do list and tasks */
#todo-list {
  margin-top: 20px;
}

input[type="text"] {
  padding: 10px;
  margin-right: 10px;
  border: 1px solid #ccc;
}

button {
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;
}

button[aria-label="Delete task"] {
  background-color: #dc3545;
}

button[aria-label="Edit task"] {
  background-color: #007bff;
}

button:hover {
  opacity: 0.8;
}
</style>
