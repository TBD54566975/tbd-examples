import { useWeb5Store } from '@/stores/web5'
import { storeToRefs } from 'pinia'

export interface Task {
  id?: string
  title: string
  completed: boolean
}

export function useWeb5() {
  const { web5 } = storeToRefs(useWeb5Store())

  const tasksProtocolSchema = 'https://schema.org/TaskSample'
  const tasksProtocolTypeTaskSchema = 'https://schema.org/TaskSample/schemas/name'

  const tasksProtocolDefinition = {
    published: true,
    protocol: tasksProtocolSchema,
    types: {
      task: {
        dataFormats: ['application/json'],
        schema: tasksProtocolTypeTaskSchema
      }
    },
    structure: {
      task: {
        $tags: {
          $requiredTags: ['completed'],
          completed: {
            type: 'boolean'
          }
        }
      }
    }
  }

  const task = {
    definition: tasksProtocolDefinition,
    uri: tasksProtocolSchema,
    schemas: {
      task: tasksProtocolTypeTaskSchema
    }
  }

  const protocolSchema = 'https://schema.org/ProfileSample'
  const protocolTypeNameSchema = 'https://schema.org/ProfileSample/schemas/name'

  const profileDefinition = {
    published: true,
    protocol: protocolSchema,
    types: {
      name: {
        dataFormats: ['application/json'],
        schema: protocolTypeNameSchema
      },
      avatar: { dataFormats: ['image/gif', 'image/png', 'image/jpeg'] }
    },
    structure: { name: {}, avatar: {} }
  }

  const profile = {
    definition: profileDefinition,
    uri: protocolSchema,
    schemas: {
      name: protocolTypeNameSchema
    }
  }

  const byUri = {
    [profileDefinition.protocol]: profile,
    [tasksProtocolDefinition.protocol]: task
  }

  const installProtocols = async () => {
    if (!web5.value) {
      throw new Error('web5 not initialiased')
    }
    const { web5: $web5, did } = web5.value
    const installed = await $web5.dwn.protocols.query({ message: {} })
    const configurationPromises = []
    console.info(JSON.stringify(profileDefinition), { profile })
    try {
      for (const protocolUri in byUri) {
        const record = installed.protocols.find(
          (record) => protocolUri === record.definition.protocol
        )
        if (!record) {
          console.info('installing protocol: ' + protocolUri)
          const definition = byUri[protocolUri].definition
          configurationPromises.push(
            $web5.dwn.protocols.configure({
              message: { definition }
            })
          )
        } else {
          console.info('protocol already installed: ' + protocolUri)
        }
      }

      const configurationResponses = await Promise.all(configurationPromises)
      try {
        await Promise.all(configurationResponses.map(({ protocol }) => protocol?.send(did)))
      } catch (e) {
        console.log('remote push of configuration failed', e)
        return true
      }
    } catch (e) {
      console.log('local install of configuration failed', e)
      return false
    }
    return true
  }

  const listTasks = async () => {
    const records = await listTasksRecords()
    const tasksJson: Task[] = await Promise.all(
      (records || []).map(async (r) => {
        const { title, completed } = await r.data.json()
        return {
          id: r.id,
          title,
          completed
        }
      })
    )
    return tasksJson.map((r) => ({
      id: r.id,
      title: r.title,
      completed: r.completed
    }))
  }

  const createTask = async (task: Task) => {
    if (!web5.value) {
      throw new Error('web5 not initialiased')
    }
    const { web5: $web5, did } = web5.value
    const { status, record } = await $web5.dwn.records.create({
      data: task,
      message: {
        protocol: tasksProtocolDefinition.protocol,
        protocolPath: 'task',
        schema: tasksProtocolDefinition.types.task.schema,
        dataFormat: tasksProtocolDefinition.types.task.dataFormats[0],
        published: true,
        tags: {
          completed: task.completed
        }
      }
    })
    if (status.code !== 202) {
      throw Error(status.detail)
    }
    if (record) {
      await record.send()
    }
  }

  const updateTask = async (task: Task) => {
    if (!task.id) {
      throw new Error('Task ID is required')
    }

    const record = await findTaskRecord(task.id)
    if (!record) {
      throw new Error('Task not found')
    }

    const data = { ...task }
    delete data.id // omits record id from data

    const { status } = await record.update({
      data,
      tags: {
        completed: task.completed
      }
    })
    if (status.code !== 202) {
      throw Error(status.detail)
    }
    await record.send()
  }

  const deleteTask = async (recordId: string) => {
    const record = await findTaskRecord(recordId)
    if (!record) {
      throw new Error('Task not found')
    }
    await record.delete()
    return record.send()
  }

  const findTaskRecord = async (recordId: string) => {
    if (!web5.value) {
      throw new Error('web5 not initialiased')
    }
    const { web5: $web5 } = web5.value
    const { record } = await $web5.dwn.records.read({
      protocol: tasksProtocolDefinition.protocol,
      message: {
        filter: {
          recordId
        }
      }
    })

    return record.id ? record : undefined
  }

  const listTasksRecords = async () => {
    if (!web5.value) {
      return
    }
    const { web5: $web5 } = web5.value
    const { records } = await $web5.dwn.records.query({
      protocol: tasksProtocolDefinition.protocol,
      message: {
        filter: {
          protocol: tasksProtocolDefinition.protocol,
          protocolPath: 'task',
          dataFormat: 'application/json'
        }
      }
    })

    return records || []
  }

  return { installProtocols }
}
