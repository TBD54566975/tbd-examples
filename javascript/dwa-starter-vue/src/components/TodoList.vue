<script setup lang="ts">
import { useWeb5, type Task } from '@/composables/web5'
import { onBeforeMount, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TrashIcon, ReloadIcon, Pencil1Icon, CheckIcon } from '@radix-icons/vue'
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

const task = ref('')
const tasks = ref<Task[]>([])
const isSubmitting = ref({
  add: false,
  delete: false,
  update: false
})
const isSubmittingRecordId = ref('')

const { listTasks, createTask, updateTask, deleteTask } = useWeb5()

onBeforeMount(() => findTasks())

const findTasks = async () => {
  tasks.value = (await listTasks()) || []
}

const handleError = (action: string, err: any) => {
  toast({
    description: `Failed to ${action}: ${err.message || 'Unknown error'}`,
    title: 'Error'
  })
}

const resetLoadingState = () => {
  isSubmitting.value = {
    add: false,
    delete: false,
    update: false
  }
  isSubmittingRecordId.value = ''
}

const addTodo = async () => {
  if (!task.value.trim()) {
    toast({ title: 'Error', description: "Task can't be empty" })
    return
  }

  isSubmitting.value.add = true
  try {
    await createTask({ completed: false, title: task.value.trim() })
    await findTasks()
    task.value = ''
    toast({ description: 'Todo added successfully' })
  } catch (err) {
    handleError('add todo', err)
  } finally {
    resetLoadingState()
  }
}

const deleteTodo = async (id: string) => {
  isSubmitting.value.delete = true
  isSubmittingRecordId.value = id
  try {
    await deleteTask(id)
    await findTasks()
    toast({ description: 'Todo deleted successfully' })
  } catch (err) {
    handleError('delete todo', err)
  } finally {
    resetLoadingState()
  }
}

const toggleTodoStatus = async (task: Task) => {
  isSubmitting.value.update = true
  isSubmittingRecordId.value = task.id || ''
  try {
    task.completed = !task.completed
    await updateTask(task)
    await findTasks()
    toast({ description: `Todo status updated to ${task.completed ? 'completed' : 'incomplete'}` })
  } catch (err) {
    handleError('update todo status', err)
  } finally {
    resetLoadingState()
  }
}

const startEditing = (id?: string) => {
  const task = tasks.value.find((i) => i.id === id)
  if (task) task.isEditing = true
}

const stopEditing = (id?: string) => {
  const task = tasks.value.find((i) => i.id === id)
  if (task) task.isEditing = false
}

const updateTodoTitle = async (task: Task) => {
  isSubmitting.value.update = true
  isSubmittingRecordId.value = task.id || ''
  try {
    await updateTask(task)
    await findTasks()
    toast({ description: 'Todo title updated successfully' })
  } catch (err) {
    handleError('update todo title', err)
  } finally {
    stopEditing(task.id)
    resetLoadingState()
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
        v-model="task"
        @keydown.enter.prevent="addTodo"
        placeholder="What are you working on?"
      />
      <Button type="button" @click="addTodo">
        <ReloadIcon v-if="isSubmitting.add" class="w-4 h-4 mr-2 animate-spin" />
        <span v-else>Add</span>
      </Button>
    </div>

    <div v-if="!tasks.length">
      <h3>No todos added yet</h3>
    </div>

    <Table v-else class="lg:w-1/3">
      <TableCaption>Todos.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Completed?</TableHead>
          <TableHead>Title</TableHead>
          <TableHead class="text-right"></TableHead>
          <TableHead class="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="todo in tasks" :key="todo.id">
          <TableCell>
            <Checkbox :checked="todo.completed" @click="toggleTodoStatus(todo)" />
          </TableCell>
          <TableCell class="cursor-pointer">
            <div v-if="todo.isEditing">
              <Input
                v-model="todo.title"
                @keydown.enter="updateTodoTitle(todo)"
                @blur="updateTodoTitle(todo)"
              />
            </div>
            <div v-else @click="startEditing(todo.id)">
              {{ todo.title }}
            </div>
          </TableCell>
          <TableCell class="text-right">
            <Button
              variant="ghost"
              @click="!todo.isEditing ? startEditing(todo.id) : updateTodoTitle(todo)"
            >
              <ReloadIcon
                class="w-4 h-4 mr-2 animate-spin"
                v-if="isSubmitting.update && isSubmittingRecordId === todo.id"
              />
              <div v-else>
                <Pencil1Icon class="w-5 h-5" v-if="!todo.isEditing" />
                <CheckIcon class="w-5 h-5" v-else />
              </div>
            </Button>
          </TableCell>
          <TableCell class="text-right">
            <Button variant="ghost" @click="deleteTodo(todo.id as string)">
              <ReloadIcon
                class="w-4 h-4 mr-2 animate-spin"
                v-if="isSubmitting.delete && isSubmittingRecordId === todo.id"
              />
              <TrashIcon class="w-5 h-5" v-else />
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
