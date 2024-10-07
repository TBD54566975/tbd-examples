import { installProtocols as installDWAProtocols } from '@/lib/protocols'
import { TodoDwnRepository } from '@/lib/todo-dwn-repository'
import { useWeb5Store } from '@/stores/web5'
import { storeToRefs } from 'pinia'

export interface Task {
  id?: string
  title: string
  completed: boolean
}

export function useWeb5() {
  const { web5 } = storeToRefs(useWeb5Store())

  const installProtocols = async () => {
    if (!web5.value) {
      throw new Error('web5 not initialiased')
    }
    const { web5: $web5, did } = web5.value
    return await installDWAProtocols($web5.dwn, did)
  }

  const listTasks = async () => {
    if (!web5.value) {
      throw new Error('web5 not initialiased')
    }
    const { web5: $web5, did } = web5.value
    const dwmRepo = new TodoDwnRepository($web5.dwn)
    return await dwmRepo.listTasks()
  }

  const createTask = async (task: Task) => {
    if (!web5.value) {
      throw new Error('web5 not initialiased')
    }
    const { web5: $web5, did } = web5.value
    const dwmRepo = new TodoDwnRepository($web5.dwn)
    return await dwmRepo.createTask(task)
  }

  const updateTask = async (task: Task) => {
    if (!web5.value) {
      throw new Error('web5 not initialiased')
    }
    const { web5: $web5, did } = web5.value
    const dwmRepo = new TodoDwnRepository($web5.dwn)
    return await dwmRepo.updateTask(task)
  }

  const deleteTask = async (recordId: string) => {
    if (!web5.value) {
      throw new Error('web5 not initialiased')
    }
    const { web5: $web5, did } = web5.value
    const dwmRepo = new TodoDwnRepository($web5.dwn)
    return await dwmRepo.deleteTask(recordId)
  }

  const findTaskRecord = async (recordId: string) => {
    if (!web5.value) {
      throw new Error('web5 not initialiased')
    }
    const { web5: $web5, did } = web5.value
    const dwmRepo = new TodoDwnRepository($web5.dwn)
    return await dwmRepo.findTaskRecord(recordId)
  }

  const listTasksRecords = async () => {
    if (!web5.value) {
      throw new Error('web5 not initialiased')
    }
    const { web5: $web5, did } = web5.value
    const dwmRepo = new TodoDwnRepository($web5.dwn)
    return await dwmRepo.listTasksRecords()
  }

  return { installProtocols }
}
