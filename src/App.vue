<script setup lang="ts">
import TodoView from './components/TodoView.vue'
</script>

<template>
  <div class="app">
    <TodoView />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>
