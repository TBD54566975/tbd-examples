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

  const getWeb5Repo = () => {
    if (!web5.value) {
      throw new Error('Web5 not initialized')
    }
    const { web5: $web5 } = web5.value
    return new TodoDwnRepository($web5.dwn)
  }

  const installProtocols = async () => {
    const repo = getWeb5Repo()
    const { web5: $web5, did } = web5.value!

    return await installDWAProtocols($web5.dwn, did)
  }

  const performTaskAction = async (action: (repo: TodoDwnRepository) => Promise<any>) => {
    const repo = getWeb5Repo()
    return await action(repo)
  }

  const listTasks = () => performTaskAction((repo) => repo.listTasks())

  const createTask = (task: Task) => performTaskAction((repo) => repo.createTask(task))

  const updateTask = (task: Task) => performTaskAction((repo) => repo.updateTask(task))

  const deleteTask = (recordId: string) => performTaskAction((repo) => repo.deleteTask(recordId))

  const findTaskRecord = (recordId: string) =>
    performTaskAction((repo) => repo.findTaskRecord(recordId))

  const listTasksRecords = () => performTaskAction((repo) => repo.listTasksRecords())

  return {
    installProtocols,
    listTasks,
    createTask,
    updateTask,
    deleteTask,
    findTaskRecord,
    listTasksRecords
  }
}
