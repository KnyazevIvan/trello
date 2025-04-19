<template>
  <div
    class="p-3 rounded-lg shadow-sm border bg-white dark:bg-gray-700 flex flex-col gap-2"
    :class="[priorityColorClass]"
    draggable="true"
    @dragstart="$emit('drag-start')"
    @dragend="$emit('drag-end')"
  >
    <div v-if="isEditing" class="w-full">
      <textarea
        :value="editedText"
        @input="$emit('update:edited-text', $event.target.value)"
        class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows="3"
      ></textarea>
      <div class="flex justify-end gap-2 mt-2">
        <button
          @click="$emit('cancel-edit')"
          class="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          Отмена
        </button>
        <button
          @click="$emit('save-edit')"
          class="px-2 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
        >
          Сохранить
        </button>
      </div>
    </div>
    
    <div v-else>
      <div class="flex justify-between items-start">
        <p class="text-gray-800 dark:text-gray-200 break-words w-[calc(100%-45px)]">
          {{ task.text }}
        </p>
        <div class="flex space-x-1">
          <button
            @click="$emit('edit')"
            class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Редактировать"
          >
            <Pencil class="h-4 w-4" />
          </button>
          <button
            @click="$emit('delete')"
            class="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            title="Удалить"
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
</template>

<script>
import { Pencil, Trash2 } from 'lucide-vue-next'

export default {
  name: 'TaskItem',
  components: {
    Pencil,
    Trash2
  },
  props: {
    task: {
      type: Object,
      required: true
    },
    priorityColorClass: {
      type: String,
      default: ''
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    editedText: {
      type: String,
      default: ''
    }
  },
  emits: [
    'drag-start',
    'drag-end',
    'edit',
    'delete',
    'update:edited-text',
    'save-edit',
    'cancel-edit'
  ],
  setup() {
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
    
    return {
      formatDate
    }
  }
}
</script>