<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-2.5 shadow-sm">
    <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Добавить новую задачу</h2>
    <form @submit.prevent="$emit('add-task')" class="space-y-2">
      <div>
        <input
          id="taskText"
          ref="taskTextInput"
          type="text"
          :value="taskText"
          @input="$emit('update:taskText', $event.target.value)"
          placeholder="Введите описание задачи..."
          class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label for="taskColumn" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Колонка
          </label>
          <select
            id="taskColumn"
            :value="taskColumn"
            @change="$emit('update:taskColumn', $event.target.value)"
            class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option v-for="column in columns" :key="column" :value="column">
              {{ column }}
            </option>
          </select>
        </div>
        <div>
          <label for="taskPriority" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Приоритет
          </label>
          <select
            id="taskPriority"
            :value="taskPriority"
            @change="$emit('update:taskPriority', $event.target.value)"
            class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="Низкий">Низкий</option>
            <option value="Средний">Средний</option>
            <option value="Высокий">Высокий</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end">
        <button
          type="submit"
          class="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
        >
          Добавить задачу
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'NewTaskForm',
  props: {
    taskText: {
      type: String,
      default: ''
    },
    taskColumn: {
      type: String,
      default: ''
    },
    taskPriority: {
      type: String,
      default: 'Средний'
    },
    columns: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:taskText', 'update:taskColumn', 'update:taskPriority', 'add-task'],
  setup() {
    const taskTextInput = ref(null)
    
    onMounted(() => {
      // Установить фокус на поле ввода при загрузке компонента
      if (taskTextInput.value) {
        taskTextInput.value.focus()
      }
    })
    
    return {
      taskTextInput
    }
  }
}
</script>