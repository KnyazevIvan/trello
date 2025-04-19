// Get unique ID for tasks
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Create a new task with default properties
export function createTask(text, column, priority) {
  return {
    id: generateId(),
    text,
    column,
    priority,
    createdAt: new Date().toISOString()
  };
}

// Get color class based on priority
export function getPriorityColorClass(priority) {
  switch (priority) {
    case 'Высокий':
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
    case 'Средний':
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
    case 'Низкий':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
  }
}

// Filter tasks based on priority
export function filterTasks(tasks, priorityFilter) {
  if (priorityFilter === 'Все') return tasks;
  
  return tasks.filter(task => task.priority === priorityFilter);
}

// Group tasks by column
export function getTasksByColumn(tasks, columns, priorityFilter) {
  const filteredTasks = filterTasks(tasks, priorityFilter);
  
  // Create an object with column names as keys and empty arrays as values
  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column] = [];
    return acc;
  }, {});
  
  // Group tasks by column
  filteredTasks.forEach(task => {
    if (columns.includes(task.column)) {
      tasksByColumn[task.column].push(task);
    } else {
      // If task has a column that doesn't exist anymore, 
      // move it to the first column
      if (columns.length > 0) {
        const updatedTask = { ...task, column: columns[0] };
        tasksByColumn[columns[0]].push(updatedTask);
      }
    }
  });
  
  return tasksByColumn;
}