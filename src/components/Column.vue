<template>
  <div
    ref="columnRef"
    :style="{ width: `${width}px` }"
    class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex-shrink-0 flex flex-col relative max-h-[calc(100vh-500px)]"
    :class="[isDragOver ? 'border-2 border-blue-400 dark:border-blue-500' : 'border border-gray-200 dark:border-gray-700']"
    @dragover.prevent="$emit('drag-over', $event)"
    @drop.prevent="$emit('drop', $event)"
  >
    <div class="flex justify-between items-center mb-3">
      <h3 class="font-bold text-gray-700 dark:text-gray-300">{{ column }}</h3>
      <span class="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
        {{ tasks.length }}
      </span>
    </div>
    
    <div class="flex-grow overflow-y-auto space-y-2">
      <Task
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :priority-color-class="getPriorityColorClass(task.priority)"
        :is-editing="editingTask && editingTask.id === task.id"
        :edited-text="editedTaskText"
        @drag-start="$emit('drag-start', task)"
        @drag-end="$emit('drag-end')"
        @edit="$emit('edit-task', task)"
        @delete="$emit('delete-task', task.id)"
        @update:edited-text="$emit('update:edited-task-text', $event)"
        @save-edit="$emit('save-edited-task')"
        @cancel-edit="$emit('cancel-editing')"
      />
    </div>
    
    <div
      class="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-blue-500 opacity-0 hover:opacity-100 transition-opacity"
      @mousedown="handleMouseDown"
    ></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Task from './Task.vue'
import { getPriorityColorClass } from '../utils/taskUtils'

export default {
  name: 'KanbanColumn',
  components: {
    Task
  },
  props: {
    column: {
      type: String,
      required: true
    },
    tasks: {
      type: Array,
      default: () => []
    },
    isDragOver: {
      type: Boolean,
      default: false
    },
    editingTask: {
      type: Object,
      default: null
    },
    editedTaskText: {
      type: String,
      default: ''
    }
  },
  emits: [
    'drag-over',
    'drop',
    'drag-start',
    'drag-end',
    'edit-task',
    'delete-task',
    'update:edited-task-text',
    'save-edited-task',
    'cancel-editing'
  ],
  setup(props) {
    const columnRef = ref(null)
    const width = ref(280)
    
    // Load saved width from localStorage
    onMounted(() => {
      const savedWidth = localStorage.getItem(`columnWidth_${props.column}`)
      if (savedWidth) {
        width.value = parseInt(savedWidth)
      }
    })
    
    const handleMouseDown = (e) => {
      e.preventDefault()
      const startX = e.clientX
      const startWidth = width.value
      
      const handleMouseMove = (e) => {
        const newWidth = startWidth + (e.clientX - startX)
        width.value = newWidth
        // Save to localStorage
        localStorage.setItem(`columnWidth_${props.column}`, newWidth.toString())
      }
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    return {
      columnRef,
      width,
      handleMouseDown,
      getPriorityColorClass
    }
  }
}
</script>