<template>
  <div 
    class="max-w-full mx-auto p-4 bg-white dark:bg-gray-900 rounded-lg shadow transition-colors duration-200"
    :class="{ 'dark': darkMode }"
  >
    <!-- Header with title and buttons -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold text-gray-700 dark:text-gray-300">{{ boardTitle }}</h1>
      <div class="flex gap-2">
        <button 
          @click="toggleDarkMode" 
          class="p-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
        >
          <template v-if="darkMode">
            <Sun class="h-5 w-5" />
          </template>
          <template v-else>
            <Moon class="h-5 w-5" />
          </template>
        </button>
        <button 
          @click="openSettings" 
          class="p-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
        >
          <Settings class="h-5 w-5" />
        </button>
      </div>
    </div>
    
    <!-- Trello board with horizontal scroll -->
    <div ref="boardRef">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-700 dark:text-gray-300">
          Задачи ({{ filteredTasksCount }})
        </h2>
      </div>
      
      <div class="flex overflow-x-auto gap-4" style="min-height: 300px">
        <div 
          v-for="column in columns" 
          :key="column.id"
          class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex-shrink-0 flex flex-col relative max-h-[calc(100vh-300px)] w-72"
          @dragover.prevent="onDragOver($event, column.id)"
          @drop="onDrop($event, column.id)"
        >
          <!-- Column header -->
          <div class="flex justify-between items-center mb-3">
            <div class="w-full">
              <div v-if="editingColumn === column.id" class="flex items-center">
                <input
                  v-model="editedColumnTitle"
                  @blur="saveColumnTitle"
                  @keyup.enter="saveColumnTitle"
                  @keyup.esc="cancelEditingColumn"
                  ref="editColumnInput"
                  class="flex-grow px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  type="text"
                />
              </div>
              <div 
                v-else
                class="flex items-center justify-between w-full"
              >
                <h3 
                  @click="startEditingColumn(column)" 
                  class="font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {{ column.title }}
                </h3>
                
                <div class="flex gap-1">
                  <span 
                    class="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                  >
                    {{ getTasksByColumnId(column.id).length }}
                  </span>
                  <button
                    @click="showColumnActions = column.id"
                    class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <MoreHorizontal class="h-4 w-4" />
                  </button>
                  
                  <!-- Column Actions Dropdown -->
                  <div 
                    v-if="showColumnActions === column.id"
                    class="absolute mt-8 right-0 z-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg"
                  >
                    <div class="p-1">
                      <button
                        @click="() => { startEditingColumn(column); showColumnActions = null; }"
                        class="w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <Pencil class="h-4 w-4" /> Edit
                      </button>
                      <button
                        @click="deleteColumn(column.id)"
                        class="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <Trash2 class="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Tasks Container -->
          <div 
            class="flex-grow overflow-y-auto space-y-2"
            :class="{ 'border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg p-2': dragOverColumn === column.id }"
          >
            <div
              v-for="task in getTasksByColumnId(column.id)"
              :key="task.id"
              draggable="true"
              @dragstart="onTaskDragStart($event, task, column.id)"
              @dragend="onTaskDragEnd"
              class="p-3 rounded-lg shadow-sm border bg-white dark:bg-gray-700 flex flex-col gap-2"
              :class="[getPriorityColorClass(task.priority)]"
            >
              <!-- Task in edit mode -->
              <div v-if="editingTask && editingTask.id === task.id" class="w-full">
                <textarea
                  v-model="editedTaskText"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                ></textarea>
                <div class="flex justify-end gap-2 mt-2">
                  <button
                    @click="cancelEditingTask"
                    class="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    @click="saveEditedTask"
                    class="px-2 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
              
              <!-- Task in view mode -->
              <div v-else>
                <div class="flex justify-between items-start">
                  <p class="text-gray-800 dark:text-gray-200 break-words w-[calc(100%-45px)]">
                    {{ task.text }}
                  </p>
                  <div class="flex space-x-1">
                    <button
                      @click="startEditingTask(task)"
                      class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Edit"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      @click="deleteTask(task.id)"
                      class="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div class="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <span class="bg-opacity-50 px-2 py-1 rounded">
                    {{ task.priority }}
                  </span>
                  <span>
                    {{ formatDate(task.createdAt) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Add new card button -->
          <div class="mt-2">
            <div v-if="addingCard === column.id" class="add-card-container">
              <textarea
                id="newCardTextarea"
                v-model="newCardText"
                placeholder="Enter a title for this card..."
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              ></textarea>
              <div class="flex items-center gap-2 mt-2">
                <button
                  @click="addNewCard(column.id)"
                  class="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded"
                >
                  Add Card
                </button>
                <button
                  @click="cancelAddingCard"
                  class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X class="h-5 w-5" />
                </button>
              </div>
            </div>
            <button
              v-else
              @click="startAddingCard(column.id)"
              class="w-full mt-2 px-3 py-1.5 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex items-center gap-1"
            >
              <Plus class="h-4 w-4" />
              <span>Add a card</span>
            </button>
          </div>
        </div>
        
        <!-- Add new list section -->
        <div class="w-72 flex-shrink-0">
          <div v-if="addingList" class="bg-gray-100 dark:bg-gray-800 rounded-lg shadow p-3">
            <input
              v-model="newListTitle"
              placeholder="Enter list title..."
              class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 mb-2"
              ref="newListInput"
              @keyup.enter="addNewList"
              @keyup.esc="cancelAddingList"
            />
            <div class="flex items-center gap-2">
              <button
                @click="addNewList"
                class="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded"
              >
                Add List
              </button>
              <button
                @click="cancelAddingList"
                class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
          </div>
          <button
            v-else
            @click="startAddingList"
            class="w-full h-12 px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded flex items-center gap-1"
          >
            <Plus class="h-5 w-5" />
            <span>Add another list</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Settings Modal -->
    <SettingsModal
      v-if="showSettingsModal"
      :columns="columns.map(col => ({ id: col.id, title: col.title }))"
      :filterPriority="filterPriority"
      :darkMode="darkMode"
      :boardTitle="boardTitle"
      @update:boardTitle="boardTitle = $event"
      @update:filterPriority="filterPriority = $event"
      @toggle-dark-mode="toggleDarkMode"
      @move-column-left="moveColumnLeft"
      @move-column-right="moveColumnRight"
      @delete-column="deleteColumn"
      @close="showSettingsModal = false"
    />
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'
import { Sun, Moon, Settings, MoreHorizontal, Plus, X, Pencil, Trash2 } from 'lucide-vue-next'
import SettingsModal from './components/SettingsModal.vue'
import useLocalStorage from './composables/useLocalStorage'
import { generateId, getPriorityColorClass } from './utils/taskUtils'

export default {
  name: 'TrelloBoard',
  components: {
    SettingsModal,
    Sun,
    Moon,
    Settings,
    MoreHorizontal,
    Plus,
    X,
    Pencil,
    Trash2
  },
  setup() {
    // Board state
    const boardTitle = useLocalStorage('trelloBoardTitle', 'My Trello Board')
    const darkMode = useLocalStorage('trelloDarkMode', false)
    
    // Columns & Tasks
    const columns = useLocalStorage('trelloColumns', [
      { id: 'col1', title: 'To do' },
      { id: 'col2', title: 'Задачи' },
      { id: 'col3', title: 'Done' }
    ])
    
    const tasks = useLocalStorage('trelloTasks', [
      {
        id: 'task1',
        text: 'Kickoff meeting',
        columnId: 'col1',
        priority: 'Средний',
        createdAt: new Date().toISOString()
      },
      {
        id: 'task2',
        text: 'asd',
        columnId: 'col3',
        priority: 'Низкий',
        createdAt: new Date().toISOString()
      }
    ])
    
    // Column states
    const editingColumn = ref(null)
    const editedColumnTitle = ref('')
    const showColumnActions = ref(null)
    const addingList = ref(false)
    const newListTitle = ref('')
    
    // Task states
    const editingTask = ref(null)
    const editedTaskText = ref('')
    const addingCard = ref(null)
    const newCardText = ref('')
    
    // Filter state
    const filterPriority = useLocalStorage('trelloFilterPriority', 'Все')
    
    // Settings modal state
    const showSettingsModal = ref(false)
    
    // Drag and drop state
    const draggedTask = ref(null)
    const draggedTaskOriginalColumn = ref(null)
    const dragOverColumn = ref(null)
    
    // Board reference
    const boardRef = ref(null)
    const newListInput = ref(null)
    const editColumnInput = ref(null)
    
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
    
    // ===== Drag and Drop Methods =====
    
    // Start dragging a task
    const onTaskDragStart = (event, task, columnId) => {
      console.log('Drag start', task.id)
      draggedTask.value = task
      draggedTaskOriginalColumn.value = columnId
      
      // Set data for Firefox
      event.dataTransfer.setData('text/plain', JSON.stringify({
        taskId: task.id,
        columnId: columnId
      }))
      
      // Hide ghost image in Chrome
      const ghostImage = document.createElement('div')
      ghostImage.style.opacity = '0'
      document.body.appendChild(ghostImage)
      event.dataTransfer.setDragImage(ghostImage, 0, 0)
      setTimeout(() => document.body.removeChild(ghostImage), 0)
    }
    
    // End dragging a task
    const onTaskDragEnd = () => {
      console.log('Drag end')
      draggedTask.value = null
      draggedTaskOriginalColumn.value = null
      dragOverColumn.value = null
    }
    
    // Handle drag over
    const onDragOver = (event, columnId) => {
      event.preventDefault()
      
      if (draggedTask.value && dragOverColumn.value !== columnId) {
        console.log('Drag over column', columnId)
        dragOverColumn.value = columnId
      }
    }
    
    // Handle drop event
    const onDrop = (event, columnId) => {
      event.preventDefault()
      
      console.log('Drop on column', columnId)
      
      if (!draggedTask.value) {
        // Try to get data from dataTransfer for Firefox
        try {
          const data = JSON.parse(event.dataTransfer.getData('text/plain'))
          const taskId = data.taskId
          
          const taskToMove = tasks.value.find(t => t.id === taskId)
          if (taskToMove) {
            console.log('Moving task from data transfer', taskId, 'to column', columnId)
            taskToMove.columnId = columnId
          }
        } catch (e) {
          console.error('Error parsing drag data', e)
          return
        }
      } else {
        console.log('Moving task', draggedTask.value.id, 'to column', columnId)
        
        // Update the task's column
        tasks.value = tasks.value.map(task => 
          task.id === draggedTask.value.id ? { ...task, columnId } : task
        )
      }
      
      // Reset drag state
      draggedTask.value = null
      draggedTaskOriginalColumn.value = null
      dragOverColumn.value = null
    }
    
    // ===== Column Methods =====
    
    // Start editing column title
    const startEditingColumn = (column) => {
      editingColumn.value = column.id
      editedColumnTitle.value = column.title
      nextTick(() => {
        if (editColumnInput.value) {
          editColumnInput.value.focus()
          editColumnInput.value.select()
        }
      })
    }
    
    // Save column title
    const saveColumnTitle = () => {
      if (editedColumnTitle.value.trim() === '') return
      
      columns.value = columns.value.map(col => 
        col.id === editingColumn.value 
          ? { ...col, title: editedColumnTitle.value.trim() } 
          : col
      )
      
      editingColumn.value = null
      editedColumnTitle.value = ''
    }
    
    // Cancel editing column
    const cancelEditingColumn = () => {
      editingColumn.value = null
      editedColumnTitle.value = ''
    }
    
    // Start adding new list
    const startAddingList = () => {
      addingList.value = true
      nextTick(() => {
        if (newListInput.value) {
          newListInput.value.focus()
        }
      })
    }
    
    // Add new list
    const addNewList = () => {
      if (newListTitle.value.trim() === '') return
      
      const newColumn = {
        id: 'col_' + generateId(),
        title: newListTitle.value.trim()
      }
      
      columns.value.push(newColumn)
      
      newListTitle.value = ''
      addingList.value = false
    }
    
    // Cancel adding list
    const cancelAddingList = () => {
      newListTitle.value = ''
      addingList.value = false
    }
    
    // Delete column
    const deleteColumn = (columnId) => {
      if (columns.value.length <= 1) return // Don't allow deleting the last column
      
      // Move tasks from deleted column to the first column
      if (columns.value[0]) {
        const firstColId = columns.value[0].id
        tasks.value = tasks.value.map(task => 
          task.columnId === columnId ? {...task, columnId: firstColId} : task
        )
      }
      
      columns.value = columns.value.filter(col => col.id !== columnId)
      showColumnActions.value = null
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
    
    // ===== Card/Task Methods =====
    
    // Start adding card
    const startAddingCard = (columnId) => {
      addingCard.value = columnId
      newCardText.value = ''
      
      // Focus the textarea after the component is updated
      nextTick(() => {
        const textarea = document.getElementById('newCardTextarea')
        if (textarea) {
          textarea.focus()
        }
      })
    }
    
    // Add new card
    const addNewCard = (columnId) => {
      if (newCardText.value.trim() === '') return
      
      const newTask = {
        id: 'task_' + generateId(),
        text: newCardText.value.trim(),
        columnId: columnId,
        priority: 'Средний',
        createdAt: new Date().toISOString()
      }
      
      tasks.value.push(newTask)
      
      newCardText.value = ''
      addingCard.value = null
    }
    
    // Cancel adding card
    const cancelAddingCard = () => {
      newCardText.value = ''
      addingCard.value = null
    }
    
    // Start editing task
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
        task.id === editingTask.value.id ? { ...task, text: editedTaskText.value.trim() } : task
      )
      
      editingTask.value = null
      editedTaskText.value = ''
    }
    
    // Cancel editing task
    const cancelEditingTask = () => {
      editingTask.value = null
      editedTaskText.value = ''
    }
    
    // Delete task
    const deleteTask = (taskId) => {
      tasks.value = tasks.value.filter(task => task.id !== taskId)
    }
    
    // Format date string
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // ===== Other Methods =====
    
    // Open settings modal
    const openSettings = () => {
      showSettingsModal.value = true
    }
    
    // Toggle dark mode
    const toggleDarkMode = () => {
      darkMode.value = !darkMode.value
    }
    
    // Get tasks by column ID
    const getTasksByColumnId = (columnId) => {
      return tasks.value.filter(task => 
        task.columnId === columnId && 
        (filterPriority.value === 'Все' || task.priority === filterPriority.value)
      )
    }
    
    // Get filtered tasks count
    const filteredTasksCount = computed(() => {
      return tasks.value.filter(task => 
        filterPriority.value === 'Все' || task.priority === filterPriority.value
      ).length
    })
    
    // Close popups when clicking outside
    document.addEventListener('click', (e) => {
      // Only run this if we're actually showing a popup
      if (showColumnActions.value) {
        // Check if click is outside dropdown
        if (!e.target.closest('.column-actions-dropdown') && 
            !e.target.closest('button[data-dropdown]')) {
          showColumnActions.value = null
        }
      }
    })
    
    return {
      // State
      boardTitle,
      darkMode,
      columns,
      tasks,
      editingColumn,
      editedColumnTitle,
      showColumnActions,
      addingList,
      newListTitle,
      editingTask,
      editedTaskText,
      addingCard,
      newCardText,
      filterPriority,
      showSettingsModal,
      boardRef,
      newListInput,
      editColumnInput,
      draggedTask,
      draggedTaskOriginalColumn,
      dragOverColumn,
      filteredTasksCount,
      
      // Drag and drop methods
      onTaskDragStart,
      onTaskDragEnd,
      onDragOver,
      onDrop,
      
      // Column methods
      startEditingColumn,
      saveColumnTitle,
      cancelEditingColumn,
      startAddingList,
      addNewList,
      cancelAddingList,
      deleteColumn,
      moveColumnLeft,
      moveColumnRight,
      
      // Task methods
      startAddingCard,
      addNewCard,
      cancelAddingCard,
      startEditingTask,
      saveEditedTask,
      cancelEditingTask,
      deleteTask,
      formatDate,
      
      // Utility methods
      getTasksByColumnId,
      getPriorityColorClass,
      openSettings,
      toggleDarkMode
    }
  }
}
</script>

<style>
/* Add any custom styles here */
.dark {
  color-scheme: dark;
}

/* Custom scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}
</style>