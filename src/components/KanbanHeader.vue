<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Kanban Board</h1>
    <div class="flex gap-2">
      <button 
        @click="$emit('toggle-dark-mode')"
        class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        :title="darkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
      >
        <Sun v-if="darkMode" class="h-5 w-5 text-gray-800 dark:text-gray-200" />
        <Moon v-else class="h-5 w-5 text-gray-800 dark:text-gray-200" />
      </button>
      <button 
        @click="$emit('open-settings')"
        class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Настройки"
      >
        <Settings class="h-5 w-5 text-gray-800 dark:text-gray-200" />
      </button>
    </div>
  </div>
</template>

<script>
import { Sun, Moon, Settings } from 'lucide-vue-next'

export default {
  name: 'KanbanHeader',
  components: {
    Sun,
    Moon,
    Settings
  },
  props: {
    darkMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-dark-mode', 'open-settings']
}
</script>