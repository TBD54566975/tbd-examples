// Main Todo List Page Component
export function TodoListPage() {
  const container = document.createElement('div');
  container.classList.add('min-h-screen', 'p-6', 'bg-gray-100', 'text-gray-900', 'transition-colors', 'duration-300');

  const title = document.createElement('h1');
  title.textContent = 'Todo List';
  title.classList.add('text-3xl', 'font-bold', 'mb-4', 'text-blue-800');

  const taskList = TodoList();
  const taskForm = TaskForm();

  container.appendChild(title);
  container.appendChild(taskForm);
  container.appendChild(taskList);

  document.getElementById('app').innerHTML = '';
  document.getElementById('app').appendChild(container);
}

// Todo List Component
function TodoList() {
  const listContainer = document.createElement('ul');
  listContainer.classList.add('task-list', 'space-y-4');

  async function loadTasks() {
      const tasks = await TodoDwnRepository.listTasks();
      listContainer.innerHTML = ''; // Clear previous tasks

      tasks.forEach(task => {
          const taskItem = TaskItem(task);
          listContainer.appendChild(taskItem);
      });
  }

  loadTasks(); // Initial load
  return listContainer;
}

// Task Item Component
function TaskItem(task) {
  const item = document.createElement('li');
  item.classList.add('task-item', 'flex', 'justify-between', 'bg-white', 'p-4', 'shadow', 'rounded-md');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      TodoDwnRepository.updateTask(task);
  });

  const taskText = document.createElement('span');
  taskText.textContent = task.title;
  taskText.classList.add(task.completed ? 'line-through' : '');

  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.classList.add('text-blue-500', 'mr-2');
  editButton.addEventListener('click', () => openEditForm(task));

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.classList.add('text-red-500');
  deleteButton.addEventListener('click', () => {
      TodoDwnRepository.deleteTask(task.id);
      item.remove();
  });

  item.append(checkbox, taskText, editButton, deleteButton);
  return item;
}

// Task Form Component
function TaskForm() {
  const form = document.createElement('form');
  form.classList.add('task-form', 'mb-4', 'flex', 'space-x-4');

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Add a new task';
  input.classList.add('p-2', 'border', 'rounded', 'flex-grow');

  const addButton = document.createElement('button');
  addButton.type = 'submit';
  addButton.textContent = 'Add Task';
  addButton.classList.add('bg-blue-500', 'text-white', 'p-2', 'rounded');

  form.append(input, addButton);

  form.addEventListener('submit', (e) => {
      e.preventDefault();
      const task = { title: input.value, completed: false };
      TodoDwnRepository.createTask(task).then(() => {
          TodoListPage();
      });
  });

  return form;
}

// TodoDwnRepository for DWN Operations
const TodoDwnRepository = {
  async listTasks() {
      // Placeholder for listing tasks from DWN
      return [];
  },
  async createTask(task) {
      // Placeholder for creating a task in DWN
  },
  async updateTask(task) {
      // Placeholder for updating a task in DWN
  },
  async deleteTask(recordId) {
      // Placeholder for deleting a task in DWN
  }
};

// Helper function for editing tasks
function openEditForm(task) {
  const form = TaskForm();
  form.querySelector('input').value = task.title;
  form.addEventListener('submit', (e) => {
      e.preventDefault();
      task.title = form.querySelector('input').value;
      TodoDwnRepository.updateTask(task).then(() => {
          TodoListPage();
      });
  });
  document.getElementById('app').replaceChild(form, document.querySelector('.task-form'));
}


function AboutPage() {
    const container = document.createElement('div');
    container.classList.add('min-h-screen', 'p-6', 'text-center', 'bg-blue-100', 'dark:bg-blue-900', 'text-gray-900', 'dark:text-white', 'transition-colors', 'duration-300');
  
    const title = document.createElement('h1');
    title.textContent = 'DWA Starter Vanilla';
    title.classList.add('text-3xl', 'font-bold', 'mb-4', 'text-blue-800', 'dark:text-blue-200');
  
    const para1 = document.createElement('p');
    para1.textContent = "Decentralized Web App: it's a Web5 Progressive Web App.";
    para1.classList.add('text-lg', 'text-blue-700', 'dark:text-blue-300');
  
    const subtitle = document.createElement('h2');
    subtitle.textContent = 'Why PWA?';
    subtitle.classList.add('text-2xl', 'font-semibold', 'mt-4', 'text-blue-800', 'dark:text-blue-200');
  
    const para2 = document.createElement('p');
    para2.textContent = 'It\'s a perfect match with Web5 DWNs since a PWA can work offline and DWN has a synced local storage.';
    para2.classList.add('text-lg', 'text-blue-700', 'dark:text-blue-300');
  
    container.appendChild(title);
    container.appendChild(para1);
    container.appendChild(subtitle);
    container.appendChild(para2);
  
    return container;
  }
  
  export function Home() {
    const homeContainer = document.createElement('div');
    homeContainer.classList.add('min-h-screen', 'p-6', 'bg-green-100', 'dark:bg-green-900', 'text-gray-900', 'dark:text-white', 'transition-colors', 'duration-300');
    
    const title = document.createElement('h1');
    title.textContent = 'Home';
    title.classList.add('text-3xl', 'font-bold', 'mb-4', 'text-green-800', 'dark:text-green-200');
    
    homeContainer.appendChild(title);
    
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(homeContainer);
  }
  
  export function About() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    const aboutPage = AboutPage();
    app.appendChild(aboutPage);
  }
  
  export function Settings() {
    const settingsContainer = document.createElement('div');
    settingsContainer.classList.add('min-h-screen', 'p-6', 'bg-purple-100', 'dark:bg-purple-900', 'text-gray-900', 'dark:text-white', 'transition-colors', 'duration-300');
    
    const title = document.createElement('h1');
    title.textContent = 'Settings';
    title.classList.add('text-3xl', 'font-bold', 'mb-4', 'text-purple-800', 'dark:text-purple-200');
    
    settingsContainer.appendChild(title);
    
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(settingsContainer);
  }
  
  export function NotFound() {
    const notFoundContainer = document.createElement('div');
    notFoundContainer.classList.add('min-h-screen', 'p-6', 'bg-red-100', 'dark:bg-red-900', 'text-gray-900', 'dark:text-white', 'transition-colors', 'duration-300');
    
    const title = document.createElement('h1');
    title.textContent = '404 - Page Not Found';
    title.classList.add('text-3xl', 'font-bold', 'mb-4', 'text-red-800', 'dark:text-red-200');
    
    notFoundContainer.appendChild(title);
    
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(notFoundContainer);
  }