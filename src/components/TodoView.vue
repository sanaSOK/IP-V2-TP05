<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import { useTodoStore } from '@/stores/todo.store'

const todoStore = useTodoStore()
const title = ref('')
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

      <!-- Todos List -->
      <div v-if="!todoStore.loading && todoStore.todos.length > 0" class="todos-list">
        <div
          v-for="todo in todoStore.todos"
          :key="todo.id"
          class="todo-item"
          :class="{ done: todo.is_done }"
        >
          <span class="todo-title">{{ todo.title }}</span>
          <button class="delete-btn" @click="todoStore.deleteTodo(todo.id)">
            <Trash2 :size="18" />
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!todoStore.loading && todoStore.todos.length === 0" class="empty">
        No todos yet. Add one to get started!
      </div>

      <!-- Footer with pending count and clear button -->
      <div v-if="todoStore.todos.length > 0" class="footer">
        <span class="pending-text">You have {{ todoStore.todos.length }} pending tasks</span>
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

.todos-list {
  margin-bottom: 1.5rem;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.todo-title {
  flex: 1;
  color: #333;
  font-size: 1rem;
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

.add-todo-form button:hover {
  background-color: #369970;
}

.todos-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: #f9f9f9;
}

.todo-item.done .todo-title {
  text-decoration: line-through;
  color: #999;
}

.todo-item input[type='checkbox'] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.todo-title {
  flex: 1;
  color: #333;
}

.delete-btn {
  padding: 0.25rem 0.75rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 2rem;
  font-size: 1.125rem;
}

.loading {
  color: #666;
}

.error {
  color: #e74c3c;
  background-color: #fdeaea;
  border-radius: 4px;
  padding: 1rem;
}

.empty {
  color: #999;
}
</style>
