<script setup lang="ts">
import { useWeb5, type Task } from '@/composables/web5'
import { onBeforeMount, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TrashIcon, Pencil2Icon } from '@radix-icons/vue'
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

const { listTasks, createTask, updateTask, deleteTask } = useWeb5()

onBeforeMount(() => {
  findTasks()
})

const findTasks = async () => {
  tasks.value = (await listTasks()) || []
}

async function addTodo() {
  try {
    if (!task.value) {
      toast({
        title: 'Error',
        description: 'task cant be null'
      })
      return
    }
    const data = {
      completed: false,
      title: task.value
    }

    await createTask(data)
    await findTasks()
    task.value = ''
    toast({
      description: 'Todo added successfully'
    })
  } catch (err: any) {
    toast({
      description: `Failed to add todo: ${err.message || 'Unknown error'}`,
      title: 'Error'
    })
  }
}

async function deleteTodo(id: string) {
  try {
    await deleteTask(id)
    await findTasks()
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

async function toggleTodoStatus(task: Task) {
  try {
    await updateTask(task)
    await findTasks()
    toast({
      description: `Todo status updated to ${task.completed ? 'completed' : 'incomplete'}`
    })
  } catch (err: any) {
    toast({
      description: `Failed to update todo: ${err.message || 'Unknown error'}`,
      title: 'Error'
    })
  }
}

function startEditing(id?: string) {
  const task = tasks.value.find((i) => i.id === id)
  if (task) task.isEditing = true
}

function stopEditing(id?: string) {
  const task = tasks.value.find((i) => i.id === id)
  if (task) task.isEditing = false
}

async function updateTodoTitle(task: Task) {
  try {
    await updateTask(task)
    await findTasks()
    toast({
      description: 'Todo title updated successfully'
    })
  } catch (err: any) {
    toast({
      description: `Failed to update todo title: ${err.message || 'Unknown error'}`,
      title: 'Error'
    })
  } finally {
    stopEditing(task.id)
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
        @keydown.enter.exact.prevent="addTodo"
        placeholder="what are you working on?"
      />
      <Button type="button" @click="addTodo"> Add </Button>
    </div>
    <div v-if="!tasks.length">
      <h2>no todos created yet</h2>
    </div>

    <Table v-else class="lg:w-1/3">
      <TableCaption>Todos.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]"> Completed? </TableHead>
          <TableHead>Title</TableHead>
          <TableHead class="text-right"> </TableHead>
          <TableHead class="text-right"> </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="todo in tasks" :key="todo.id">
          <TableCell>
            <Checkbox
              :checked="todo.completed"
              @click="toggleTodoStatus({ ...todo, completed: !todo.completed })"
            />
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
            <Button variant="ghost" @click="startEditing(todo.id)">
              <Pencil2Icon class="w-4 h-4" />
            </Button>
          </TableCell>
          <TableCell class="text-right">
            <Button variant="ghost" @click="deleteTodo(todo.id as string)">
              <TrashIcon class="w-4 h-4" />
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
