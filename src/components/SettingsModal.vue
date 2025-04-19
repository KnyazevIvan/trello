<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div 
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6"
      @click.stop
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">Board Settings</h2>
        <button 
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <span class="text-xl">×</span>
        </button>
      </div>
      
      <!-- Board Title -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Board Title
        </label>
        <input
          type="text"
          v-model="localBoardTitle"
          @input="$emit('update:boardTitle', localBoardTitle)"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>
      
      <!-- Filter Options -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filter by Priority
        </label>
        <select
          v-model="localFilterPriority"
          @change="$emit('update:filterPriority', localFilterPriority)"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="Все">All</option>
          <option value="Высокий">High</option>
          <option value="Средний">Medium</option>
          <option value="Низкий">Low</option>
        </select>
      </div>
      
      <!-- Columns Management -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Manage Columns
        </label>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-md p-3 max-h-60 overflow-y-auto">
          <ul class="space-y-2">
            <li 
              v-for="(column, index) in columns" 
              :key="column.id"
              class="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600"
            >
              <span class="text-gray-800 dark:text-gray-200">{{ column.title }}</span>
              <div class="flex items-center space-x-1">
                <button
                  @click="$emit('move-column-left', index)"
                  :disabled="index === 0"
                  :class="[
                    'p-1 rounded', 
                    index === 0 
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  ]"
                  title="Move Left"
                >
                  ←
                </button>
                <button
                  @click="$emit('move-column-right', index)"
                  :disabled="index === columns.length - 1"
                  :class="[
                    'p-1 rounded', 
                    index === columns.length - 1
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  ]"
                  title="Move Right"
                >
                  →
                </button>
                <button
                  @click="$emit('delete-column', column.id)"
                  :disabled="columns.length <= 1"
                  :class="[
                    'p-1 rounded', 
                    columns.length <= 1
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                      : 'text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  ]"
                  title="Delete Column"
                >
                  ×
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Dark Mode Toggle -->
      <div class="mt-6 flex items-center">
        <label class="inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            class="sr-only peer" 
            :checked="darkMode" 
            @change="$emit('toggle-dark-mode')"
          >
          <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
        </label>
      </div>
      
      <div class="mt-6 flex justify-end">
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'SettingsModal',
  props: {
    columns: {
      type: Array,
      required: true
    },
    filterPriority: {
      type: String,
      default: 'Все'
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    boardTitle: {
      type: String,
      default: 'My Trello Board'
    }
  },
  emits: [
    'update:boardTitle',
    'update:filterPriority',
    'toggle-dark-mode',
    'move-column-left',
    'move-column-right',
    'delete-column',
    'close'
  ],
  setup(props) {
    const localBoardTitle = ref(props.boardTitle)
    const localFilterPriority = ref(props.filterPriority)
    
    // Update local values when props change
    watch(() => props.boardTitle, (newValue) => {
      localBoardTitle.value = newValue
    })
    
    watch(() => props.filterPriority, (newValue) => {
      localFilterPriority.value = newValue
    })
    
    return {
      localBoardTitle,
      localFilterPriority
    }
  }
}
</script>