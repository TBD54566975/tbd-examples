<script setup lang="ts">
import { useWeb5 } from '@/composables/web5'
import { onBeforeMount, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TrashIcon } from '@radix-icons/vue'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/toast/use-toast'

interface ITodo {
  completed: boolean
  title: string
  createdAt: string
  recordId: string
  isEditing?: boolean
}

const todo = ref('')
const todos = ref<{ [recordId: string]: ITodo }>({})

const { createRecord, deleteRecord, updateRecord, findRecords } = useWeb5()

onBeforeMount(() => {
  findTodos()
})

const findTodos = async () => {
  const res = await findRecords<ITodo>('todos')
  res?.forEach((i) => {
    todos.value[i.recordId] = i
  })
}

const formatDate = (date: string) => {
  const parsedDate = new Date(date)

  if (isNaN(parsedDate.getTime())) {
    return 'Invalid Date'
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  }).format(parsedDate)
}

async function addTodo() {
  try {
    if (!todo.value) {
      return
    }
    const data = {
      completed: false,
      title: todo.value
    }

    const writeRes = await createRecord(data, 'todos')
    if (writeRes) {
      todos.value[writeRes.recordId] = writeRes
      toast({
        description: 'Todo added successfully'
      })

      todo.value = ''
    }
  } catch (err: any) {
    toast({
      description: `Failed to add todo: ${err.message || 'Unknown error'}`,
      title: 'Error'
    })
  }
}

async function deleteTodo(recordId: string) {
  try {
    await deleteRecord(recordId)

    delete todos.value[recordId]
    toast({
      description: 'Todo deleted successfully'
    })
  } catch (err: any) {
    toast({
      description: `Failed to delete todo: ${err.message || 'Unknown error'}`,
      title: 'Error'
    })
  }
}

async function toggleTodoStatus(recordId: string) {
  try {
    await updateRecord(recordId, {
      ...todos.value[recordId],
      completed: !todos.value[recordId].completed
    })
    todos.value[recordId].completed = !todos.value[recordId].completed

    toast({
      description: `Todo status updated to ${todos.value[recordId].completed ? 'completed' : 'incomplete'}`
    })
  } catch (err: any) {
    toast({
      description: `Failed to update todo: ${err.message || 'Unknown error'}`,
      title: 'Error'
    })
  }
}

function startEditing(recordId: string) {
  todos.value[recordId].isEditing = true
}

function stopEditing(recordId: string) {
  todos.value[recordId].isEditing = false
}

async function updateTodoTitle(recordId: string, newTitle: string) {
  try {
    await updateRecord(recordId, {
      ...todos.value[recordId],
      title: newTitle
    })

    todos.value[recordId].title = newTitle
    toast({
      description: 'Todo title updated successfully'
    })
  } catch (err: any) {
    toast({
      description: `Failed to update todo title: ${err.message || 'Unknown error'}`,
      title: 'Error'
    })
  } finally {
    stopEditing(recordId)
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1>Todos</h1>

    <div class="lg:w-1/3 flex items-center gap-2">
      <label for="add-todo" class="sr-only">Add a todo</label>
      <Input
        type="text"
        id="add-todo"
        v-model="todo"
        @keydown.enter.exact.prevent="addTodo"
        placeholder="what are you working on?"
      />
      <Button type="button" @click="addTodo"> Add </Button>
    </div>
    <div v-if="!Object.values(todos).length">
      <h2>no todos created yet</h2>
    </div>

    <Table v-else class="lg:w-1/3">
      <TableCaption>Todos.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]"> Completed? </TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Date</TableHead>
          <TableHead class="text-right"> </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="todo in todos" :key="todo.recordId">
          <TableCell>
            <Checkbox :checked="todo.completed" @click="toggleTodoStatus(todo.recordId)" />
          </TableCell>
          <TableCell>
            <div v-if="todo.isEditing">
              <Input
                v-model="todo.title"
                @keydown.enter="updateTodoTitle(todo.recordId, todo.title)"
                @blur="updateTodoTitle(todo.recordId, todo.title)"
              />
            </div>
            <div v-else @dblclick="startEditing(todo.recordId)">
              {{ todo.title }}
            </div>
          </TableCell>
          <TableCell> {{ formatDate(todo.createdAt) }}</TableCell>
          <TableCell class="text-right">
            <Button variant="ghost" @click="deleteTodo(todo.recordId)">
              <TrashIcon class="w-4 h-4" />
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
