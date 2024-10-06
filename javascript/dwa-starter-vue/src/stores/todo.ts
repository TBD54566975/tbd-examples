import { ref } from 'vue'
import { defineStore } from 'pinia'
import { parse, stringify } from 'zipson'

export const useTodoStore = defineStore(
  'todoStore',
  () => {
    const todos = ref<{ title: string; status: string }[]>([])

    function setTodos(_todos: any[]) {
      todos.value = _todos
    }

    return { todos, setTodos }
  },
  {
    persist: {
      storage: localStorage,
      serializer: {
        deserialize: parse,
        serialize: stringify
      },
      beforeHydrate: (ctx) => {
        console.log(`about to hydrate '${ctx.store.$id}'`)
      },
      afterHydrate: (ctx) => {
        console.log(`just hydrated '${ctx.store.$id}'`)
      }
    }
  }
)
