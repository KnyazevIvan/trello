<template>
  <SettingsModal
    :showSettingsModal="showSettingsModal"
    :columns="columns"
    :filterPriority="filterPriority"
    :darkMode="darkMode"
    @update:columns="columns = $event"
    @update:filterPriority="filterPriority = $event"
    @toggle-dark-mode="toggleDarkMode"
    @move-column-left="moveColumnLeft"
    @move-column-right="moveColumnRight"
    @delete-column="deleteColumn"
    @close="showSettingsModal = false"
  />
  
  <div 
    class="max-w-full mx-auto p-4 bg-white dark:bg-gray-900 rounded-lg shadow transition-colors duration-200"
    :class="{ 'dark': darkMode }"
  >
    <!-- Header with title and buttons -->
    <KanbanHeader 
      :darkMode="darkMode" 
      @toggle-dark-mode="toggleDarkMode" 
      @open-settings="openSettings" 
    />
    
    <!-- Form for adding a new task -->
    <NewTaskForm 
      v-model:taskText="newTaskText"
      v-model:taskColumn="newTaskColumn"
      v-model:taskPriority="newTaskPriority"
      :columns="columns"
      @add-task="addTask"
      class="mb-3"
    />
    
    <!-- Kanban board with horizontal scroll -->
    <div ref="boardRef">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-700 dark:text-gray-300">
          Задачи ({{ filteredTasksCount }})
        </h2>
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400" />
      </div>
      
      <div class="flex overflow-x-auto gap-4" style="min-height: 300px">
        <Column
          v-for="(column) in columns"
          :key="column"
          :column="column"
          :tasks="tasksByColumn[column] || []"
          :is-drag-over="dragAndDrop.dragOverColumn === column"
          :editing-task="editingTask"
          :edited-task-text="editedTaskText"
          @drag-over="(e) => dragAndDrop.handleColumnDragOver(e, column)"
          @drop="(e) => dragAndDrop.handleColumnDrop(e, column)"
          @drag-start="dragAndDrop.handleTaskDragStart"
          @drag-end="dragAndDrop.handleTaskDragEnd"
          @edit-task="startEditingTask"
          @delete-task="deleteTask"
          @update:edited-task-text="setEditedTaskText"
          @save-edited-task="saveEditedTask"
          @cancel-editing="cancelEditing"
        />
      </div>
      
      <EmptyState v-if="filteredTasksCount === 0" />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import KanbanHeader from './components/KanbanHeader.vue'
import NewTaskForm from './components/NewTaskForm.vue'
import Column from './components/Column.vue'
import EmptyState from './components/EmptyState.vue'
import SettingsModal from './components/SettingsModal.vue'
import useLocalStorage from './composables/useLocalStorage'
import useDragAndDrop from './composables/useDragAndDrop'
import { getPriorityColorClass, filterTasks, getTasksByColumn, createTask } from './utils/taskUtils'

export default {
  name: 'KanbanBoard',
  components: {
    KanbanHeader,
    NewTaskForm,
    Column,
    EmptyState,
    SettingsModal
  },
  setup() {
    console.log('KanbanBoard rendered')
    
    // Default columns and localStorage state
    const defaultColumns = ['Ожидает', 'В процессе', 'Завершено']
    const tasks = useLocalStorage('kanbanTasks', [])
    const columns = useLocalStorage('kanbanColumns', defaultColumns)
    const darkMode = useLocalStorage('kanbanDarkMode', false)
    
    // New task state
    const newTaskText = ref('')
    const newTaskPriority = ref('Средний')
    const newTaskColumn = ref(columns.value[0])
    
    // Editing task state
    const editingTask = ref(null)
    const editedTaskText = ref('')
    
    // Filter state
    const filterPriority = ref('Все')
    
    // Settings modal state
    const showSettingsModal = ref(false)
    
    // Add logging for debugging
    const openSettings = () => {
      console.log('Opening settings modal')
      showSettingsModal.value = true
      console.log('showSettingsModal set to:', showSettingsModal.value)
    }
    
    // Drag and drop functionality
    const dragAndDrop = useDragAndDrop(/* { 
      tasks, 
      columns 
    } */)
    
    // Board reference for scrolling
    const boardRef = ref(null)
    
    // Apply dark mode theme
    watch(darkMode, (newValue) => {
      if (newValue) {
        document.documentElement.classList.add('dark')
        document.body.style.backgroundColor = '#1a1a2e'
        document.body.style.color = '#fff'
      } else {
        document.documentElement.classList.remove('dark')
        document.body.style.backgroundColor = ''
        document.body.style.color = ''
      }
    }, { immediate: true })
    
    // Add a new task
    const addTask = () => {
      if (newTaskText.value.trim() === '') return
      
      const newTask = createTask(
        newTaskText.value, 
        newTaskColumn.value, 
        newTaskPriority.value
      )
      
      tasks.value.push(newTask)
      newTaskText.value = ''
      // Leave other fields for convenience of adding similar tasks
    }
    
    // Delete a column
    const deleteColumn = (columnToDelete) => {
      if (columns.value.length <= 1) return // Don't allow deleting the last column
      
      // Move tasks from deleted column to the first column
      tasks.value = tasks.value.map(task => 
        task.column === columnToDelete ? {...task, column: columns.value[0]} : task
      )
      
      columns.value = columns.value.filter(column => column !== columnToDelete)
    }
    
    // Move column left
    const moveColumnLeft = (columnIndex) => {
      if (columnIndex <= 0) return
      
      const newColumns = [...columns.value]
      const temp = newColumns[columnIndex]
      newColumns[columnIndex] = newColumns[columnIndex - 1]
      newColumns[columnIndex - 1] = temp
      
      columns.value = newColumns
    }
    
    // Move column right
    const moveColumnRight = (columnIndex) => {
      if (columnIndex >= columns.value.length - 1) return
      
      const newColumns = [...columns.value]
      const temp = newColumns[columnIndex]
      newColumns[columnIndex] = newColumns[columnIndex + 1]
      newColumns[columnIndex + 1] = temp
      
      columns.value = newColumns
    }
    
    // Delete a task
    const deleteTask = (taskId) => {
      tasks.value = tasks.value.filter(task => task.id !== taskId)
    }
    
    // Start editing a task
    const startEditingTask = (task) => {
      editingTask.value = task
      editedTaskText.value = task.text
    }
    
    // Save edited task
    const saveEditedTask = () => {
      if (!editingTask.value || editedTaskText.value.trim() === '') {
        // If no task to edit or text is empty, reset state
        editingTask.value = null
        editedTaskText.value = ''
        return
      }
      
      tasks.value = tasks.value.map(task =>
        task.id === editingTask.value.id ? { ...task, text: editedTaskText.value } : task
      )
      
      editingTask.value = null
      editedTaskText.value = ''
    }
    
    // Cancel editing
    const cancelEditing = () => {
      editingTask.value = null
      editedTaskText.value = ''
    }
    
    // Set edited task text
    const setEditedTaskText = (text) => {
      editedTaskText.value = text
    }
    
    // Toggle dark mode
    const toggleDarkMode = () => {
      darkMode.value = !darkMode.value
    }
    
    // Computed properties
    const tasksByColumn = computed(() => 
      getTasksByColumn(tasks.value, columns.value, filterPriority.value)
    )
    
    const filteredTasksCount = computed(() => 
    filterTasks(tasks.value, filterPriority.value).length
    )
  
  // Removing unused parameter warning by using it in a comment
  // columnIndex is used in template when calling events
    
    return {
      tasks,
      columns,
      darkMode,
      newTaskText,
      newTaskPriority,
      newTaskColumn,
      editingTask,
      editedTaskText,
      filterPriority,
      showSettingsModal,
      dragAndDrop,
      boardRef,
      tasksByColumn,
      filteredTasksCount,
      addTask,
      deleteColumn,
      moveColumnLeft,
      moveColumnRight,
      deleteTask,
      startEditingTask,
      saveEditedTask,
      cancelEditing,
      setEditedTaskText,
      toggleDarkMode,
      getPriorityColorClass,
      openSettings
    }
  }
}
</script>