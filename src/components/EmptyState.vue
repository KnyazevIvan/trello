<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
    <ClipboardList class="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
    <h3 class="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Нет задач для отображения</h3>
    <p class="text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
      Добавьте новую задачу с помощью формы выше или проверьте настройки фильтра.
    </p>
  </div>
</template>

<script>
import { ClipboardList } from 'lucide-vue-next'

export default {
  name: 'EmptyState',
  components: {
    ClipboardList
  }
}
</script>