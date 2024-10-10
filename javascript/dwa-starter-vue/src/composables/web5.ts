import { drlReadProtocolJson } from '@/lib/drls'
import { installProtocols as installDWAProtocols, profile } from '@/lib/protocols'
import { TodoDwnRepository } from '@/lib/todo-dwn-repository'
import { useWeb5Store } from '@/stores/web5'
import { storeToRefs } from 'pinia'

export interface Task {
  id?: string
  title: string
  completed: boolean
  isEditing?: boolean
}

export function useWeb5() {
  const { web5 } = storeToRefs(useWeb5Store())

  const ensureWeb5Initialized = () => {
    if (!web5.value || !web5.value.web5) {
      throw new Error('web5 not initialised')
    }
  }

  const installProtocols = async () => {
    ensureWeb5Initialized()
    const { web5: $web5, did } = web5.value!
    return await installDWAProtocols($web5.dwn, did)
  }

  const listTasks = async () => {
    ensureWeb5Initialized()
    const { web5: $web5 } = web5.value!
    const dwmRepo = new TodoDwnRepository($web5.dwn)
    return await dwmRepo.listTasks()
  }

  const createTask = async (task: Task) => {
    ensureWeb5Initialized()
    const { web5: $web5 } = web5.value!
    const dwmRepo = new TodoDwnRepository($web5.dwn)
    return await dwmRepo.createTask(task)
  }

  const updateTask = async (task: Task) => {
    ensureWeb5Initialized()
    const { web5: $web5 } = web5.value!
    const dwmRepo = new TodoDwnRepository($web5.dwn)
    return await dwmRepo.updateTask(task)
  }

  const deleteTask = async (recordId: string) => {
    ensureWeb5Initialized()
    const { web5: $web5 } = web5.value!
    const dwmRepo = new TodoDwnRepository($web5.dwn)
    return await dwmRepo.deleteTask(recordId)
  }

  const findTaskRecord = async (recordId: string) => {
    ensureWeb5Initialized()
    const { web5: $web5 } = web5.value!
    const dwmRepo = new TodoDwnRepository($web5.dwn)
    return await dwmRepo.findTaskRecord(recordId)
  }

  const listTasksRecords = async () => {
    ensureWeb5Initialized()
    const { web5: $web5 } = web5.value!
    const dwmRepo = new TodoDwnRepository($web5.dwn)
    return await dwmRepo.listTasksRecords()
  }

  const createDisplayName = async (displayName: string) => {
    ensureWeb5Initialized()
    const { web5: $web5, did } = web5.value!
    const res = await $web5.dwn.records.create({
      data: {
        displayName
      },
      message: {
        published: true,
        recipient: did,
        schema: profile.schemas.name,
        dataFormat: 'application/json',
        protocol: profile.uri,
        protocolPath: 'name'
      }
    })

    res.record?.send()
  }

  const loadDisplayName = async () => {
    ensureWeb5Initialized()
    const { web5: $web5, did } = web5.value!
    const profileRecord = await drlReadProtocolJson(did, profile.uri, 'name')
    return profileRecord
  }

  const createAvatarImage = async (blob: Blob) => {
    ensureWeb5Initialized()
    const { web5: $web5, did } = web5.value!
    const { record, status } = await $web5.dwn.records.create({
      data: blob,
      message: {
        published: true,
        recipient: did,
        dataFormat: blob.type,
        protocol: profile.uri,
        protocolPath: 'avatar'
      }
    })

    record?.send()
  }

  return {
    installProtocols,
    listTasks,
    createTask,
    updateTask,
    deleteTask,
    findTaskRecord,
    listTasksRecords,
    createDisplayName,
    loadDisplayName,
    createAvatarImage
  }
}
