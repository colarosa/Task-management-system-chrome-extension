document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('taskInput');
  const priorityInput = document.getElementById('priorityInput');
  const addTaskButton = document.getElementById('addTask');
  const clearTasksButton = document.getElementById('clearTasks');
  const exportTasksButton = document.getElementById('exportTasks');
  const taskList = document.getElementById('taskList');

  // Load tasks from storage
  chrome.storage.sync.get('tasks', ({ tasks }) => {
    tasks = tasks || [];
    tasks.forEach(renderTask);
  });

  // Add a task
  addTaskButton.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    const priority = priorityInput.value;

    if (!taskText) return;

    chrome.storage.sync.get('tasks', ({ tasks }) => {
      tasks = tasks || [];
      tasks.push({ text: taskText, priority, completed: false });
      chrome.storage.sync.set({ tasks }, () =>
        renderTask({ text: taskText, priority, completed: false })
      );
    });

    taskInput.value = '';
  });

  // Clear all tasks
  clearTasksButton.addEventListener('click', () => {
    chrome.storage.sync.set({ tasks: [] }, () => {
      taskList.innerHTML = '';
    });
  });

  // Export tasks to CSV
  exportTasksButton.addEventListener('click', () => {
    chrome.storage.sync.get('tasks', ({ tasks }) => {
      tasks = tasks || [];
      const csvContent = [
        ['Task', 'Priority', 'Completed'],
        ...tasks.map(task => [
          task.text,
          task.priority || 'Medium',
          task.completed ? 'Yes' : 'No',
        ]),
      ]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tasks.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });

  // Render a task
  function renderTask(task) {
    const li = document.createElement('div');
    li.className = 'task-item';
    if (task.completed) li.classList.add('completed');
    li.textContent = `${task.text} (${task.priority})`;

    // Handle toggle completion
    li.addEventListener('click', () => {
      li.classList.toggle('completed');
      chrome.storage.sync.get('tasks', ({ tasks }) => {
        const index = tasks.findIndex(t => t.text === task.text);
        if (index > -1) {
          tasks[index].completed = !tasks[index].completed;
          chrome.storage.sync.set({ tasks });
        }
      });
    });

    taskList.appendChild(li);
  }
});
