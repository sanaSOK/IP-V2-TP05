<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import { useTodoStore } from '@/stores/todo.store'

const todoStore = useTodoStore()
const title = ref('')
// CHALLENGE 1: Filtering - Track active filter
const filter = ref<'all' | 'active' | 'done'>('all')
let stopRealtime: null | (() => void) = null

onMounted(async () => {
  await todoStore.fetchTodos()
  // Optional realtime:
  stopRealtime = todoStore.startRealtime()
})

onBeforeUnmount(() => stopRealtime?.())

function onAdd() {
  todoStore.addTodo(title.value)
  title.value = ''
}

// CHALLENGE 1: Filtering - Get filtered todos based on selected filter
function getFilteredTodos() {
  switch (filter.value) {
    case 'active':
      return todoStore.activeTodos
    case 'done':
      return todoStore.doneTodos
    default:
      return todoStore.todos
  }
}
</script>

<template>
  <div class="todo-view">
    <div class="card">
      <h1>Todo App</h1>

      <!-- Add Todo Form -->
      <div class="add-todo-form">
        <input
          v-model="title"
          type="text"
          placeholder="Add your new todo"
          @keyup.enter="onAdd"
        />
        <button class="add-btn" @click="onAdd">+</button>
      </div>

      <!-- Error State -->
      <div v-if="todoStore.error" class="error">
        {{ todoStore.error }}
      </div>

      <!-- CHALLENGE 1: Filtering - Filter Tabs -->
      <div class="filter-tabs">
        <button 
          :class="{ active: filter === 'all' }" 
          @click="filter = 'all'"
          class="tab-btn"
        >
          All ({{ todoStore.todos.length }})
        </button>
        <button 
          :class="{ active: filter === 'active' }" 
          @click="filter = 'active'"
          class="tab-btn"
        >
          Active ({{ todoStore.activeTodos.length }})
        </button>
        <button 
          :class="{ active: filter === 'done' }" 
          @click="filter = 'done'"
          class="tab-btn"
        >
          Done ({{ todoStore.doneTodos.length }})
        </button>
      </div>

      <!-- Todos List -->
      <div v-if="!todoStore.loading && getFilteredTodos().length > 0" class="todos-list">
        <div
          v-for="todo in getFilteredTodos()"
          :key="todo.id"
          class="todo-item"
          :class="{ done: todo.is_done }"
        >
          <!-- CHALLENGE 2 & 3: Checkbox for toggling with optimistic UI and cache updates -->
          <input
            type="checkbox"
            :checked="todo.is_done"
            @change="() => todoStore.toggleTodo(todo)"
            class="todo-checkbox"
          />
          <span class="todo-title">{{ todo.title }}</span>
          <button class="delete-btn" @click="todoStore.deleteTodo(todo.id)">
            <Trash2 :size="18" />
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!todoStore.loading && getFilteredTodos().length === 0" class="empty">
        <template v-if="filter === 'done'">
          No completed tasks yet!
        </template>
        <template v-else-if="filter === 'active'">
          No active tasks! Great job 🎉
        </template>
        <template v-else>
          No todos yet. Add one to get started!
        </template>
      </div>

      <!-- Footer with pending count and clear button -->
      <div v-if="todoStore.todos.length > 0" class="footer">
        <span class="pending-text">{{ todoStore.activeTodos.length }} of {{ todoStore.todos.length }} remaining</span>
        <button class="clear-all-btn" @click="todoStore.clearAll">Clear All</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todo-view {
  width: 100%;
  max-width: 400px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin: 0 0 1.5rem 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.add-todo-form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.add-todo-form input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

.add-todo-form input:focus {
  border-color: #7c3aed;
}

.add-btn {
  background: #5eed3a;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
  width: 50px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover {
  background: #6d28d9;
}

/* CHALLENGE 1: Filter tabs styling */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 8px;
}

.tab-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
}

.tab-btn.active {
  background: #7c3aed;
  color: white;
}

.todos-list {
  margin-bottom: 1.5rem;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  transition: all 0.3s;
}

.todo-item:hover {
  background: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.todo-item.done {
  opacity: 0.6;
}

.todo-item.done .todo-title {
  text-decoration: line-through;
  color: #999;
}

/* CHALLENGE 2: Checkbox styling */
.todo-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #7c3aed;
  flex-shrink: 0;
}

.todo-title {
  flex: 1;
  color: #333;
  font-size: 1rem;
  word-break: break-word;
}

.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
  min-width: 40px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: #dc2626;
}

.empty {
  text-align: center;
  color: #999;
  padding: 2rem 1rem;
  font-size: 1rem;
}

.error {
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.pending-text {
  color: #666;
  font-size: 0.95rem;
}

.clear-all-btn {
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.3s;
}

.clear-all-btn:hover {
  background: #6d28d9;
}
</style>
