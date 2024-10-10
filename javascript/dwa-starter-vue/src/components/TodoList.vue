<script setup lang="ts">
import { ref } from 'vue';

// Define the Task interface
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// Explicitly type the tasks array
const tasks = ref<Task[]>([]);

const newTask = ref('');
const editingTaskId = ref<number | null>(null);

// Add a new task
const addTask = () => {
  if (newTask.value.trim()) {
    tasks.value.push({
      id: Date.now(),
      title: newTask.value,
      completed: false,
    });
    newTask.value = ''; // Clear the input after adding
  }
};

// Toggle task completion
const toggleTask = (taskId: number) => {
  const task = tasks.value.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
  }
};

// Edit an existing task
const editTask = (taskId: number) => {
  const task = tasks.value.find((t) => t.id === taskId);
  if (task) {
    editingTaskId.value = taskId;
    newTask.value = task.title;
  }
};

// Save the edited task
const saveTask = () => {
  if (editingTaskId.value !== null) {
    const task = tasks.value.find((t) => t.id === editingTaskId.value);
    if (task) {
      task.title = newTask.value;
      editingTaskId.value = null;
      newTask.value = ''; // Clear the input after saving
    }
  }
};

// Delete a task
const deleteTask = (taskId: number) => {
  tasks.value = tasks.value.filter((t) => t.id !== taskId);
};
</script>

<template>
  <div class="todo-container">
    <h1 id="todo-heading">To-Do List</h1>

    <!-- Add or Edit Task Form -->
    <form @submit.prevent="editingTaskId ? saveTask() : addTask()" aria-labelledby="todo-heading">
      <label for="new-task" class="sr-only">Task title</label>
      <input 
        id="new-task" 
        v-model="newTask" 
        type="text" 
        placeholder="Enter task title" 
        aria-required="true"
        aria-label="Task title" 
        class="input-task"
      />
      <button type="submit" class="btn-primary">
        {{ editingTaskId ? 'Save Task' : 'Add Task' }}
      </button>
    </form>

    <!-- To-Do List -->
    <ul aria-live="polite" aria-labelledby="todo-heading" class="task-list">
      <li v-for="task in tasks" :key="task.id" class="task-item">
        <input 
          type="checkbox" 
          :checked="task.completed" 
          @change="toggleTask(task.id)" 
          :aria-label="`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`"
          class="checkbox"
        />
        <span :class="{ completed: task.completed }">{{ task.title }}</span>

        <!-- Edit Task Button -->
        <button 
          @click="editTask(task.id)" 
          class="btn-secondary" 
          :aria-label="`Edit task: ${task.title}`"
        >
          Edit
        </button>

        <!-- Delete Task Button -->
        <button 
          @click="deleteTask(task.id)" 
          class="btn-danger" 
          :aria-label="`Delete task: ${task.title}`"
        >
          Delete
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.todo-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.input-task {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  margin-bottom: 10px;
}

.btn-primary {
  padding: 10px 15px;
  background-color: #3490dc;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 10px;
}

.btn-primary:hover {
  background-color: #2779bd;
}

.task-list {
  list-style: none;
  padding: 0;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
}

.checkbox {
  margin-right: 10px;
}

.completed {
  text-decoration: line-through;
}

.btn-secondary, .btn-danger {
  margin-left: 10px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #fbbf24;
  padding: 5px 10px;
  color: white;
}

.btn-danger {
  background-color: #e3342f;
  padding: 5px 10px;
  color: white;
}
</style>
