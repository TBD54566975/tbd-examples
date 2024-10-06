import { Protocol, Record } from '@web5/api/browser'

import { useWeb5Store } from '@/stores/web5'
import { storeToRefs } from 'pinia'

export enum DateSort {
  CreatedAscending = 'createdAscending',
  CreatedDescending = 'createdDescending',
  PublishedAscending = 'publishedAscending',
  PublishedDescending = 'publishedDescending'
}

export function useWeb5() {
  const { web5 } = storeToRefs(useWeb5Store())

  const protocol = 'https://didcomm.org/dwa-starter-vue'
  const protocolDefinition = {
    protocol,
    published: true,
    types: {
      todos: {
        schema: `${protocol}/schema/todos.json`,
        dataFormats: ['application/json']
      },
      profile: {
        schema: `${protocol}/schema/profile.json`,
        dataFormats: ['application/json']
      }
    },
    structure: {
      todos: {
        $actions: [
          {
            who: 'author',
            of: 'todos',
            can: ['read']
          },
          {
            who: 'anyone',
            can: ['create']
          }
        ]
      },
      profile: {
        $actions: [
          {
            who: 'author',
            of: 'profile',
            can: ['read']
          },
          {
            who: 'anyone',
            can: ['create']
          }
        ]
      }
    }
  }

  const configureProtocol = async () => {
    if (!web5.value) {
      return
    }
    const { web5: $web5 } = web5.value
    const { protocol } = await $web5.dwn.protocols.configure({
      message: {
        definition: protocolDefinition
      }
    })
    if (!protocol) {
      return
    }

    syncToUserDwn(protocol)
  }

  const createRecord = async <T>(
    data: T,
    schema: 'todos' | 'profile',
    parentId?: string,
    recordId?: string
  ) => {
    if (!web5.value) {
      return
    }
    const { web5: $web5 } = web5.value
    const { record, status } = await $web5.dwn.records.write({
      data,
      message: {
        protocol: protocolDefinition.protocol,
        protocolPath: schema,
        schema: protocolDefinition.types[schema].schema,
        dataFormat: protocolDefinition.types[schema].dataFormats?.[0],
        ...(parentId ? { parentId, contextId: parentId } : {}),
        ...(recordId ? { recordId } : {})
      }
    })

    if (status.code !== 202) {
      throw Error(status.detail)
    }

    if (!record) {
      return
    }
    syncToUserDwn(record)

    return { ...data, recordId: record?.id }
  }
  const findRecords = async <T>(
    schema: 'todos' | 'profile',
    recordId?: string,
    dateSort = DateSort.CreatedDescending
  ) => {
    if (!web5.value) {
      return
    }
    const { web5: $web5, did } = web5.value
    const { records } = await $web5.dwn.records.query({
      from: did,
      message: {
        filter: {
          protocol: protocolDefinition.protocol,
          schema: protocolDefinition.types[schema].schema,
          dataFormat: protocolDefinition.types[schema].dataFormats?.[0]
        },
        dateSort,
        ...(recordId ? { recordId } : {})
      }
    })
    const loadRecords: Array<{ recordId: string } & T> = await Promise.all(
      (records || []).map(async (record) => {
        const data = (await record.data.json()) as T
        return { recordId: record.id, ...data }
      })
    )

    return loadRecords
  }

  const updateRecord = async (recordId: string, data: any) => {
    if (!web5.value) {
      return
    }
    const { web5: $web5 } = web5.value
    const { record, status } = await $web5.dwn.records.read({
      message: {
        filter: { recordId }
      }
    })
    if (!record) {
      return
    }
    await record.update({ data })

    syncToUserDwn(record)
  }
  const deleteRecord = async (recordId: string) => {
    if (!web5.value) {
      return
    }
    const { web5: $web5, did } = web5.value
    const { status } = await $web5.dwn.records.delete({
      from: did,
      message: {
        recordId
      }
    })
    if (status.code !== 202) {
      throw Error(status.detail)
    }
  }

  const syncToUserDwn = async (record: Record | Protocol, targetDid?: string) => {
    if (!web5.value) {
      return
    }
    const { did } = web5.value
    await record.send(targetDid || did)
  }

  const findOrUpdateRecord = async <T>(data: T, schema: 'todos' | 'profile', upsert = true) => {
    if (!web5.value) {
      return
    }
    const { web5: $web5 } = web5.value
    const { record, status } = await $web5.dwn.records.read({
      message: {
        filter: {
          protocol: protocolDefinition.protocol,
          schema: protocolDefinition.types[schema].schema
        }
      }
    })
    if (!record && upsert) {
      return createRecord<T>(data, schema)
    }
    if (upsert) {
      await record.update({ data })
      syncToUserDwn(record)
    }
    if (!record || status.code === 404) {
      return
    }
    const dataInRecord = await record.data.json()

    return {
      ...data,
      ...dataInRecord,
      recordId: record?.id
    } as T & { recordId: string }
  }

  return {
    findRecords,
    updateRecord,
    deleteRecord,
    createRecord,
    configureProtocol,
    findOrUpdateRecord
  }
}
