<template>
  <div
    class="max-w-full mx-auto p-4 bg-white dark:bg-gray-900 rounded-lg shadow transition-colors duration-200"
    :class="{ 'dark': darkMode }"
    @click="handleClickOutside" >
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold text-gray-700 dark:text-gray-300">{{ boardTitle }}</h1>
      <div class="flex gap-2">
        <button
          @click="toggleDarkMode"
          class="p-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          title="Toggle Dark/Light Mode"
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
          title="Board Settings"
        >
          <Settings class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div ref="boardRef">
       <div class="flex justify-between items-center mb-4">
         <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300">
           Задачи ({{ filteredTasksCount }})
         </h2>
         </div>

      <div class="flex overflow-x-auto gap-4 pb-4" style="min-height: 300px">
        <div
          v-for="column in columns"
          :key="column.id"
          :data-column-id="column.id" class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex-shrink-0 flex flex-col relative max-h-[calc(100vh-300px)] w-72"
          > <div class="flex justify-between items-center mb-3 flex-shrink-0">
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
                  class="font-bold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  title="Click to edit title"
                >
                  {{ column.title }}
                </h3>

                <div class="flex gap-1 items-center">
                  <span
                    class="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded"
                    title="Number of tasks in this list"
                  >
                    {{ getTasksByColumnId(column.id).length }}
                  </span>
                   <button
                    @click.stop="showColumnActions = (showColumnActions === column.id ? null : column.id)" :data-col-actions-btn="column.id" class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                     title="Column Actions"
                  >
                    <MoreHorizontal class="h-4 w-4" />
                  </button>

                  <div
                    v-if="showColumnActions === column.id"
                    class="column-actions-dropdown absolute mt-8 right-0 z-50 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg"
                    @click.stop >
                    <div class="py-1">
                      <button
                        @click="() => { startEditingColumn(column); showColumnActions = null; }"
                        class="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <Pencil class="h-4 w-4" /> Edit List Title
                      </button>
                      <button
                        @click="() => { deleteColumn(column.id); showColumnActions = null; }"
                        class="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 dark:text-red-400"
                        :disabled="columns.length <= 1"
                        :class="{ 'opacity-50 cursor-not-allowed': columns.length <= 1 }"
                        title="Delete this list (cannot delete the last list)"
                      >
                        <Trash2 class="h-4 w-4" /> Delete List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="tasks-container flex-grow overflow-y-auto space-y-2 pr-2 -mr-2" :class="{ 'border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg p-2': dragOverColumn === column.id && !dropTargetInfo.taskId }"
            @dragover.prevent="onColumnDragOver($event, column.id)"
            @dragleave="onColumnDragLeave"
            @drop.prevent="onColumnDrop($event, column.id)"
          >
            <div
              v-for="task in getTasksByColumnId(column.id)"
              :key="task.id"
              :data-task-id="task.id" draggable="true"
              @dragstart="onTaskDragStart($event, task, column.id)"
              @dragend="onTaskDragEnd"
              @dragover.prevent="onTaskDragOver($event, task, column.id)"
              @dragleave="onTaskDragLeave($event)" @drop.prevent="onTaskDrop($event, task, column.id)"
              class="task-card p-3 rounded-lg shadow-sm border bg-white dark:bg-gray-700 flex flex-col gap-2 relative cursor-grab"
              :class="[
                  getPriorityColorClass(task.priority),
                  { 'opacity-50': draggedTask && draggedTask.id === task.id },
                  { 'drop-indicator-above': dropTargetInfo.taskId === task.id && dropTargetInfo.position === 'above' },
                  { 'drop-indicator-below': dropTargetInfo.taskId === task.id && dropTargetInfo.position === 'below' }
              ]"
            >
              <div v-if="editingTask && editingTask.id === task.id" class="w-full">
                <textarea
                  v-model="editedTaskText"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  @keyup.esc="cancelEditingTask"
                  @keyup.enter.prevent="saveEditedTask" ></textarea>
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

              <div v-else>
                <div class="flex justify-between items-start">
                  <p class="text-sm text-gray-800 dark:text-gray-200 break-words w-[calc(100%-45px)]">
                    {{ task.text }}
                  </p>
                  <div class="flex-shrink-0 flex space-x-1">
                    <button
                      @click="startEditingTask(task)"
                      class="p-1 text-gray-500 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Edit Task"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      @click="deleteTask(task.id)"
                      class="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Delete Task"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div class="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span class="font-medium bg-opacity-50 px-2 py-0.5 rounded" :class="getPriorityColorClass(task.priority, true)"> {{ task.priority }}
                  </span>
                  <span title="Creation date">
                    {{ formatDate(task.createdAt) }}
                  </span>
                </div>
              </div>
            </div> </div> <div class="mt-2 flex-shrink-0">
            <div v-if="addingCard === column.id" class="add-card-container">
              <textarea
                id="newCardTextarea"
                v-model="newCardText"
                placeholder="Enter a title for this card..."
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                rows="3"
                ref="newCardTextareaRef" ></textarea>
              <div class="flex items-center gap-2">
                <button
                  @click="addNewCard(column.id)"
                  class="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm font-medium"
                >
                  Add Card
                </button>
                <button
                  @click="cancelAddingCard"
                  class="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Cancel adding card"
                >
                  <X class="h-5 w-5" />
                </button>
              </div>
            </div>
            <button
              v-else
              @click="startAddingCard(column.id)"
              class="w-full mt-2 px-3 py-1.5 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 rounded flex items-center gap-1 text-sm"
            >
              <Plus class="h-4 w-4" />
              <span>Add a card</span>
            </button>
          </div>
        </div> <div class="w-72 flex-shrink-0">
          <div v-if="addingList" class="bg-gray-200 dark:bg-gray-700 rounded-lg shadow p-3">
            <input
              v-model="newListTitle"
              placeholder="Enter list title..."
              class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 mb-2"
              ref="newListInput"
              @keyup.enter="addNewList"
              @keyup.esc="cancelAddingList"
            />
            <div class="flex items-center gap-2">
              <button
                @click="addNewList"
                class="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm font-medium"
              >
                Add List
              </button>
              <button
                @click="cancelAddingList"
                class="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                 title="Cancel adding list"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
          </div>
          <button
            v-else
            @click="startAddingList"
            class="w-full h-12 px-3 py-2 bg-gray-200/50 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded flex items-center gap-1 transition-colors duration-150"
          >
            <Plus class="h-5 w-5" />
            <span>Add another list</span>
          </button>
        </div>
      </div> </div> <SettingsModal
      v-if="showSettingsModal"
      :columns="columns.map(col => ({ id: col.id, title: col.title }))"
      :filterPriority="filterPriority"
      :darkMode="darkMode"
      :boardTitle="boardTitle"
      @update:boardTitle="boardTitle = $event"
      @update:filterPriority="filterPriority = $event"
      @toggle-dark-mode="toggleDarkMode"
      @move-column-left="moveColumnLeft($event)" @move-column-right="moveColumnRight($event)" @delete-column="deleteColumn($event)" @close="showSettingsModal = false"
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
    SettingsModal, Sun, Moon, Settings, MoreHorizontal, Plus, X, Pencil, Trash2
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
       { id: 'task1', text: 'Kickoff meeting', columnId: 'col1', priority: 'Средний', createdAt: new Date().toISOString() },
       { id: 'task2', text: 'Task 2 content', columnId: 'col1', priority: 'Высокий', createdAt: new Date().toISOString() },
       { id: 'task3', text: 'Review design', columnId: 'col2', priority: 'Низкий', createdAt: new Date().toISOString() },
       { id: 'task4', text: 'Deploy feature', columnId: 'col3', priority: 'Средний', createdAt: new Date().toISOString() }
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

    // --- Drag and Drop State ---
    const draggedTask = ref(null)          // The task object being dragged
    const draggedTaskOriginalColumn = ref(null) // ID of the column the task started in
    const dragCounter = ref(0)            // Counter to manage nested dragleave events
    const dragOverColumn = ref(null)      // ID of the column currently being dragged over
    const dropTargetInfo = ref({          // Info about the specific drop target (task)
        taskId: null,                     // ID of the task being hovered over
        position: null                    // 'above' or 'below' the target task
    })


    // Board reference
    const boardRef = ref(null)
    const newListInput = ref(null)
    const editColumnInput = ref(null)

    // Apply dark mode theme
    watch(darkMode, (newValue) => {
      if (newValue) {
        document.documentElement.classList.add('dark')
        document.body.style.backgroundColor = '#1a1a2e' // Example dark bg
        document.body.style.color = '#e0e0e0'          // Example dark text
      } else {
        document.documentElement.classList.remove('dark')
        document.body.style.backgroundColor = ''
        document.body.style.color = ''
      }
    }, { immediate: true })

    // ===== Drag and Drop Methods =====

    const onTaskDragStart = (event, task, columnId) => {
      draggedTask.value = task
      draggedTaskOriginalColumn.value = columnId
      event.dataTransfer.effectAllowed = 'move'
      // Optional: You might still need setData for Firefox compatibility,
      // but rely on the ref (`draggedTask`) primarily.
      event.dataTransfer.setData('text/plain', task.id)

      // Optional: Style the dragged element (handled by opacity class now)
       event.target.classList.add('dragging');
    }

    const onTaskDragEnd = (event) => {
      // Clean up state regardless of drop success
      if (event.target && event.target.classList.contains('dragging')) {
        event.target.classList.remove('dragging');
      }
      draggedTask.value = null
      draggedTaskOriginalColumn.value = null
      dragOverColumn.value = null
      dropTargetInfo.value = { taskId: null, position: null }
      dragCounter.value = 0 // Reset counter
    }

    // --- Drag Over COLUMN ---
    const onColumnDragOver = (event, columnId) => {
      event.preventDefault(); // Necessary to allow dropping
      if (!draggedTask.value) return; // Only react if dragging a task
      dragOverColumn.value = columnId;
      // If not hovering over a specific task, indicate column drop zone
      if (!dropTargetInfo.value.taskId) {
         event.dataTransfer.dropEffect = 'move'
      }
    }

     const onColumnDragLeave = () => {
       // Decrement counter is complex here, simple reset might be enough
       // Reset column highlight *only* if leaving the column entirely
       // This basic version might flicker, more complex counter logic needed for perfect behavior
       dragOverColumn.value = null;
     }

    // --- Drag Over TASK ---
    const onTaskDragOver = (event, targetTask, targetColumnId) => {
        event.preventDefault();
        if (!draggedTask.value || draggedTask.value.id === targetTask.id) {
            // Don't allow dropping onto itself
            dropTargetInfo.value = { taskId: null, position: null }; // Clear indicator
            return;
        }

        event.stopPropagation(); // Prevent column dragover when over a task
        event.dataTransfer.dropEffect = 'move';

        const targetElement = event.currentTarget; // The task element being dragged over
        const rect = targetElement.getBoundingClientRect();
        const verticalMidpoint = rect.top + rect.height / 2;

        const position = event.clientY < verticalMidpoint ? 'above' : 'below';

        // Update drop target info only if it changed
        if (dropTargetInfo.value.taskId !== targetTask.id || dropTargetInfo.value.position !== position) {
           dropTargetInfo.value = { taskId: targetTask.id, position: position };
        }
        dragOverColumn.value = targetColumnId; // Ensure column highlight remains
    }

    // --- Drag Leave TASK ---
     const onTaskDragLeave = (event) => {
         // Only clear the indicator if leaving the specific task area
         const relatedTarget = event.relatedTarget;
         const currentTarget = event.currentTarget;

         // Check if the mouse is still within the bounds of the current task element or its children
         if (!currentTarget.contains(relatedTarget)) {
            // Moved outside the task, clear the indicator for this task
             if (dropTargetInfo.value.taskId === currentTarget.dataset.taskId) { // Assuming you add data-task-id
                 dropTargetInfo.value = { taskId: null, position: null };
             }
             // More robustly, check if the mouse has moved to another task or column area
             // This basic check might clear indicator too early sometimes.
             // A small timeout might help, or relying on the next onTaskDragOver event.
              dropTargetInfo.value = { taskId: null, position: null }; // Simplest approach: clear on leave
         }
     }


    // --- Drop on COLUMN ---
    const onColumnDrop = (event, targetColumnId) => {
        event.preventDefault();
        event.stopPropagation(); // Prevent potential parent drops

        if (!draggedTask.value || dropTargetInfo.value.taskId) {
            // If not dragging, or if the drop should happen relative to a task, ignore column drop
            return;
        }

        console.log(`Dropped task ${draggedTask.value.id} onto empty space in column ${targetColumnId}`);

        // --- Perform the move ---
        const taskToMove = draggedTask.value;
        const originalColId = draggedTaskOriginalColumn.value;

        // Find the index of the task being moved
        const fromIndex = tasks.value.findIndex(t => t.id === taskToMove.id);
        if (fromIndex === -1) return; // Should not happen

        // Create a mutable copy
        const updatedTasks = [...tasks.value];

        // 1. Remove task from original position
        updatedTasks.splice(fromIndex, 1);

        // 2. Update columnId
        taskToMove.columnId = targetColumnId;

        // 3. Find insertion index: Append to the end of tasks in the target column
        //    Find the index of the last task in the target column within the *updated* array
        let insertAtIndex = updatedTasks.length; // Default to very end
        for (let i = updatedTasks.length - 1; i >= 0; i--) {
            if (updatedTasks[i].columnId === targetColumnId) {
                insertAtIndex = i + 1; // Insert after the last task of the target column
                break;
            }
        }
        // If the column was empty, insertAtIndex remains updatedTasks.length (which is correct)

        // 4. Insert task at the calculated position
        updatedTasks.splice(insertAtIndex, 0, taskToMove);

        // 5. Update the reactive tasks array
        tasks.value = updatedTasks;

        // Cleanup handled by dragend
    }


    // --- Drop on TASK ---
    const onTaskDrop = (event, targetTask, targetColumnId) => {
        event.preventDefault();
        event.stopPropagation(); // Important: Prevent the column drop handler from firing

        if (!draggedTask.value || !dropTargetInfo.value.taskId || dropTargetInfo.value.taskId !== targetTask.id) {
            // If not dragging, or drop indicator isn't set for this task, ignore
            return;
        }

        console.log(`Dropped task ${draggedTask.value.id} ${dropTargetInfo.value.position} task ${targetTask.id} in column ${targetColumnId}`);


        // --- Perform the move/reorder ---
        const taskToMove = draggedTask.value;
        const dropPosition = dropTargetInfo.value.position;

        // Find indices
        const fromIndex = tasks.value.findIndex(t => t.id === taskToMove.id);
        const toIndexOriginal = tasks.value.findIndex(t => t.id === targetTask.id);
        if (fromIndex === -1 || toIndexOriginal === -1) return; // Should not happen


        // Create a mutable copy
        const updatedTasks = [...tasks.value];

        // 1. Remove task from original position
        updatedTasks.splice(fromIndex, 1);

        // 2. Update columnId (might be the same or different)
        taskToMove.columnId = targetColumnId;

        // 3. Calculate insertion index based on the position *after* removal
        //    Find the target task's index *again* in the *modified* array
        const toIndexAfterRemoval = updatedTasks.findIndex(t => t.id === targetTask.id);
        if (toIndexAfterRemoval === -1) {
             // This could happen if the targetTask was the one removed (shouldn't be possible with self-drop check)
             // Fallback: append to column (similar to column drop logic)
             console.warn("Target task index not found after removal, appending to column.");
              let insertAtIndexFallback = updatedTasks.length;
              for (let i = updatedTasks.length - 1; i >= 0; i--) {
                 if (updatedTasks[i].columnId === targetColumnId) {
                      insertAtIndexFallback = i + 1;
                      break;
                  }
              }
              updatedTasks.splice(insertAtIndexFallback, 0, taskToMove);

        } else {
             // Calculate final insertion index based on 'above' or 'below'
            const insertAtIndex = (dropPosition === 'above') ? toIndexAfterRemoval : toIndexAfterRemoval + 1;

            // 4. Insert task at the calculated position
            updatedTasks.splice(insertAtIndex, 0, taskToMove);
        }


        // 5. Update the reactive tasks array
        tasks.value = updatedTasks;

        // Cleanup handled by dragend
    }


    // ===== Column Methods ===== (Keep existing methods: startEditingColumn, saveColumnTitle, etc.)
     const startEditingColumn = (column) => {
       editingColumn.value = column.id
       editedColumnTitle.value = column.title
       nextTick(() => {
         if (editColumnInput.value && editColumnInput.value.length > 0) {
           editColumnInput.value[0].focus() // editColumnInput is now an array
           editColumnInput.value[0].select()
         } else if (editColumnInput.value) { // Fallback if not array
            editColumnInput.value.focus()
            editColumnInput.value.select()
         }
       })
     }

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

     const cancelEditingColumn = () => {
       editingColumn.value = null
       editedColumnTitle.value = ''
     }

     const startAddingList = () => {
       addingList.value = true
       nextTick(() => {
         if (newListInput.value) {
           newListInput.value.focus()
         }
       })
     }

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

     const cancelAddingList = () => {
       newListTitle.value = ''
       addingList.value = false
     }

    const deleteColumn = (columnId) => {
        // Find the index of the column to delete
        const colIndex = columns.value.findIndex(col => col.id === columnId);
        if (colIndex === -1) return;

        // Determine the target column for tasks (first column, unless deleting the first one)
        let targetColId = null;
        if (columns.value.length > 1) {
            targetColId = (colIndex === 0) ? columns.value[1].id : columns.value[0].id;
        }

        // Move tasks if a target column exists
        if (targetColId) {
            tasks.value = tasks.value.map(task =>
                task.columnId === columnId ? { ...task, columnId: targetColId } : task
            );
        } else {
            // If deleting the last column, delete its tasks too
            tasks.value = tasks.value.filter(task => task.columnId !== columnId);
        }

        // Remove the column
        columns.value = columns.value.filter(col => col.id !== columnId);
        showColumnActions.value = null; // Close dropdown if open
        if (showSettingsModal.value) { // Close settings modal if open and column was deleted from there
            const stillExists = columns.value.some(col => col.id === columnId);
            if(!stillExists) {
                // Potentially refresh settings modal or just close it if the context is invalid
                // showSettingsModal.value = false; // Or update its internal state
            }
        }
    }


     const moveColumnLeft = (columnIndex) => {
       if (columnIndex <= 0) return
       const newColumns = [...columns.value]
       const temp = newColumns[columnIndex]
       newColumns[columnIndex] = newColumns[columnIndex - 1]
       newColumns[columnIndex - 1] = temp
       columns.value = newColumns
     }

     const moveColumnRight = (columnIndex) => {
       if (columnIndex >= columns.value.length - 1) return
       const newColumns = [...columns.value]
       const temp = newColumns[columnIndex]
       newColumns[columnIndex] = newColumns[columnIndex + 1]
       newColumns[columnIndex + 1] = temp
       columns.value = newColumns
     }

    // ===== Card/Task Methods ===== (Keep existing methods: startAddingCard, addNewCard, etc.)
     const startAddingCard = (columnId) => {
       addingCard.value = columnId
       newCardText.value = ''
       nextTick(() => {
           // Find the specific textarea for this column if multiple could exist
           const columnElement = boardRef.value?.querySelector(`[data-column-id="${columnId}"]`); // Add data-column-id to column div if needed
           const textarea = columnElement?.querySelector('.add-card-container textarea'); // Be more specific
         if (textarea) {
           textarea.focus()
         } else {
             // Fallback if specific textarea not found
              const genericTextarea = document.getElementById('newCardTextarea');
             if (genericTextarea) genericTextarea.focus();
         }
       })
     }

     const addNewCard = (columnId) => {
       if (newCardText.value.trim() === '') return
       const newTask = {
         id: 'task_' + generateId(),
         text: newCardText.value.trim(),
         columnId: columnId,
         priority: 'Средний', // Default priority
         createdAt: new Date().toISOString()
       }
        // Insert the new task at the end of the tasks for this specific column
        const updatedTasks = [...tasks.value];
        let insertAtIndex = updatedTasks.length;
        for (let i = updatedTasks.length - 1; i >= 0; i--) {
            if (updatedTasks[i].columnId === columnId) {
                insertAtIndex = i + 1;
                break;
            }
        }
        updatedTasks.splice(insertAtIndex, 0, newTask);
        tasks.value = updatedTasks;

       newCardText.value = ''
       addingCard.value = null
     }

     const cancelAddingCard = () => {
       newCardText.value = ''
       addingCard.value = null
     }

     const startEditingTask = (task) => {
       editingTask.value = { ...task } // Edit a copy
       editedTaskText.value = task.text
        // Add nextTick focus if needed
     }

     const saveEditedTask = () => {
       if (!editingTask.value || editedTaskText.value.trim() === '') {
         cancelEditingTask();
         return
       }
       tasks.value = tasks.value.map(task =>
         task.id === editingTask.value.id ? { ...task, text: editedTaskText.value.trim() } : task
       )
       cancelEditingTask();
     }

     const cancelEditingTask = () => {
       editingTask.value = null
       editedTaskText.value = ''
     }

     const deleteTask = (taskId) => {
       tasks.value = tasks.value.filter(task => task.id !== taskId)
     }

     const formatDate = (dateString) => {
       if (!dateString) return '';
       try {
          const date = new Date(dateString);
          return date.toLocaleDateString('ru-RU', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
          });
       } catch (e) {
           console.error("Error formatting date:", dateString, e);
           return 'Invalid Date';
       }
     }

    // ===== Other Methods =====
    const openSettings = () => { showSettingsModal.value = true }
    const toggleDarkMode = () => { darkMode.value = !darkMode.value }

    const getTasksByColumnId = (columnId) => {
        // Get all tasks for the column
        const columnTasks = tasks.value.filter(task => task.columnId === columnId);
        // Apply priority filter
        const filteredTasks = columnTasks.filter(task =>
            filterPriority.value === 'Все' || task.priority === filterPriority.value
        );
        // The order is now determined by the `tasks.value` array order for tasks in this column
        return filteredTasks;
    }


    const filteredTasksCount = computed(() => {
      return tasks.value.filter(task =>
        filterPriority.value === 'Все' || task.priority === filterPriority.value
      ).length
    })

    // Close popups when clicking outside (improved)
     const handleClickOutside = (e) => {
         // Close column actions dropdown
         if (showColumnActions.value && !e.target.closest(`[data-col-actions-btn="${showColumnActions.value}"]`) && !e.target.closest('.column-actions-dropdown')) {
            // Add data-col-actions-btn="column.id" to the MoreHorizontal button
            // Add class="column-actions-dropdown" to the dropdown div
            showColumnActions.value = null;
         }
         // Add similar logic for other popups/modals if needed
     }

     // Add listener on mount, remove on unmount (if using Composition API directly in setup)
     // If using Options API or <script setup>, Vue handles this lifecycle automatically for top-level listeners
     // For setup(), you'd typically use onMounted/onUnmounted hooks
     // onMounted(() => document.addEventListener('click', handleClickOutside));
     // onUnmounted(() => document.removeEventListener('click', handleClickOutside));
     // Since this is Options API style in <script>, adding listener directly is less clean.
     // It's better handled within the component lifecycle hooks (mounted/beforeUnmount).
     // Let's assume Vue handles cleanup or add explicit hooks if needed.


    return {
      // State
      boardTitle, darkMode, columns, tasks, editingColumn, editedColumnTitle,
      showColumnActions, addingList, newListTitle, editingTask, editedTaskText,
      addingCard, newCardText, filterPriority, showSettingsModal, boardRef,
      newListInput, editColumnInput, draggedTask, dragOverColumn, dropTargetInfo,
      filteredTasksCount,

      // D&D Methods
      onTaskDragStart, onTaskDragEnd, onColumnDragOver, onColumnDragLeave,
      onTaskDragOver, onTaskDragLeave, onColumnDrop, onTaskDrop,

      // Column Methods
      startEditingColumn, saveColumnTitle, cancelEditingColumn, startAddingList,
      addNewList, cancelAddingList, deleteColumn, moveColumnLeft, moveColumnRight,

      // Task Methods
      startAddingCard, addNewCard, cancelAddingCard, startEditingTask, saveEditedTask,
      cancelEditingTask, deleteTask, formatDate,

      // Utility Methods
      getTasksByColumnId, getPriorityColorClass, openSettings, toggleDarkMode
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
/* ... (scrollbar styles remain the same) ... */
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


/* Drag and Drop Styles */
.task-card {
  /* Add transition for smoother indicator appearance */
  transition: border-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  position: relative; /* Needed for pseudo-elements */
}

.task-card.dragging {
    opacity: 0.4;
    cursor: grabbing;
    /* Optional: Add rotation or other effects */
    /* transform: rotate(3deg); */
}

.task-card.drop-indicator-above::before,
.task-card.drop-indicator-below::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 6px; /* Height of the indicator line/space */
  background-color: #3b82f6; /* Blue indicator color */
  border-radius: 3px;
  z-index: 10; /* Ensure it's visible */
}

.task-card.drop-indicator-above::before {
  top: -4px; /* Position above the card, adjust as needed */
}

.task-card.drop-indicator-below::after {
  bottom: -4px; /* Position below the card, adjust as needed */
}


/* Style for the column highlight when dragging over empty space */
.dark .border-blue-500 {
    border-color: #3b82f6; /* Ensure consistency */
}
.border-blue-400 {
     border-color: #60a5fa; /* Ensure consistency */
}

/* Ensure column actions dropdown doesn't interfere with drag */
.column-actions-dropdown {
    /* Add position relative/absolute if needed based on context */
     position: absolute; /* Example */
     right: 5px;
     top: 30px; /* Adjust */
     z-index: 50; /* High z-index */
     min-width: 120px; /* Example width */
}

</style>
