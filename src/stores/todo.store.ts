import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apolloClient } from '@/apollo/client'
import { GET_TODOS, ADD_TODO, TOGGLE_TODO, DELETE_TODO, DELETE_ALL, TODOS_SUB } from '@/graphql/todos'

export type Todo = {
  id: string
  title: string
  is_done: boolean
  created_at: string
}

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // CHALLENGE 1: Filtering - Computed properties
  const activeTodos = computed(() => todos.value.filter(t => !t.is_done))
  const doneTodos = computed(() => todos.value.filter(t => t.is_done))

  async function fetchTodos() {
    loading.value = true
    error.value = null
    try {
      const { data } = await apolloClient.query<{ todos: Todo[] }>({
        query: GET_TODOS,
        fetchPolicy: 'network-only', // keep it simple for students
      })
      todos.value = data.todos
    } catch (e: any) {
      error.value = e.message ?? 'Failed to load todos'
    } finally {
      loading.value = false
    }
  }

  async function addTodo(title: string) {
    const clean = title.trim()
    if (!clean) return

    // CHALLENGE 2: Optimistic UI - Add to local state immediately
    const optimisticTodo: Todo = {
      id: 'temp-' + Date.now(),
      title: clean,
      is_done: false,
      created_at: new Date().toISOString(),
    }
    todos.value.unshift(optimisticTodo)

    try {
      const { data } = await apolloClient.mutate<{ insert_todos_one: Todo }>({
        mutation: ADD_TODO,
        variables: { title: clean },
        // CHALLENGE 3: Better Apollo cache - Update cache manually instead of refetching
        update: (cache, { data }) => {
          if (data?.insert_todos_one) {
            // Replace the optimistic todo with the real one from server
            const index = todos.value.findIndex(t => t.id === optimisticTodo.id)
            if (index >= 0) {
              todos.value[index] = data.insert_todos_one
            }
          }
        },
      })
      // Update with real server response if update didn't catch it
      if (data?.insert_todos_one) {
        const index = todos.value.findIndex(t => t.id === optimisticTodo.id)
        if (index >= 0) {
          todos.value[index] = data.insert_todos_one
        }
      }
    } catch (e: any) {
      // Rollback on error
      todos.value = todos.value.filter(t => t.id !== optimisticTodo.id)
      error.value = e.message ?? 'Failed to add todo'
    }
  }

  async function toggleTodo(todo: Todo) {
    // CHALLENGE 2: Optimistic UI - Toggle immediately in local state
    const originalState = todo.is_done
    todo.is_done = !todo.is_done

    try {
      await apolloClient.mutate({
        mutation: TOGGLE_TODO,
        variables: { id: todo.id, done: todo.is_done },
        // CHALLENGE 3: Better Apollo cache - Update cache manually
        update: (cache, { data }) => {
          // Cache automatically updated by Apollo's writeFragment
          // but we keep our local state in sync
        },
      })
    } catch (e: any) {
      // Rollback on error
      todo.is_done = originalState
      error.value = e.message ?? 'Failed to toggle todo'
    }
  }

  async function deleteTodo(id: string) {
    // CHALLENGE 2: Optimistic UI - Remove from local state immediately
    const originalTodos = [...todos.value]
    todos.value = todos.value.filter(t => t.id !== id)

    try {
      await apolloClient.mutate({
        mutation: DELETE_TODO,
        variables: { id },
        // CHALLENGE 3: Better Apollo cache - No refetch needed, local state already updated
      })
    } catch (e: any) {
      // Rollback on error
      todos.value = originalTodos
      error.value = e.message ?? 'Failed to delete todo'
    }
  }

  async function clearAll() {
    // CHALLENGE 2: Optimistic UI - Clear immediately
    const originalTodos = [...todos.value]
    todos.value = []

    try {
      await apolloClient.mutate({
        mutation: DELETE_ALL,
        // CHALLENGE 3: Better Apollo cache - No refetch needed
      })
    } catch (e: any) {
      // Rollback on error
      todos.value = originalTodos
      error.value = e.message ?? 'Failed to clear todos'
    }
  }

  // Optional: realtime updates (subscription)
  function startRealtime() {
    const obs = apolloClient.subscribe<{ todos: Todo[] }>({
      query: TODOS_SUB,
    })

    const sub = obs.subscribe({
      next: ({ data }) => {
        if (data?.todos) todos.value = data.todos
      },
      error: (e) => {
        // keep app running even if WS fails
        console.error('Subscription error', e)
      },
    })

    return () => sub.unsubscribe()
  }

  return {
    todos,
    activeTodos,
    doneTodos,
    loading,
    error,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearAll,
    startRealtime,
  }
})
