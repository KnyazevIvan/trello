import { ref } from 'vue'

export function useDragAndDrop(/* { tasks, columns } */) {
  const draggedTask = ref(null)
  const dragOverColumn = ref(null)
  
  // Task drag handlers
  const handleTaskDragStart = (task) => {
    draggedTask.value = task
  }
  
  const handleTaskDragEnd = () => {
    draggedTask.value = null
    dragOverColumn.value = null
  }
  
  const handleColumnDragOver = (e, column) => {
    e.preventDefault()
    if (draggedTask.value && dragOverColumn.value !== column) {
      dragOverColumn.value = column
    }
  }
  
  const handleColumnDrop = (e, column) => {
    e.preventDefault()
    
    if (draggedTask.value && draggedTask.value.column !== column) {
      // Update the task's column
      draggedTask.value.column = column
      
      // Reset drag state
      draggedTask.value = null
      dragOverColumn.value = null
    }
  }
  
  return {
    draggedTask,
    dragOverColumn,
    handleTaskDragStart,
    handleTaskDragEnd,
    handleColumnDragOver,
    handleColumnDrop
  }
}

export default useDragAndDrop