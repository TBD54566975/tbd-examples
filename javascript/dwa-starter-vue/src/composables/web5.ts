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
      tasks: {
        schema: `${protocol}/schema/tasks.json`,
        dataFormats: ['application/json']
      },
      profile: {
        schema: `${protocol}/schema/profile.json`,
        dataFormats: ['application/json']
      }
    },
    structure: {
      tasks: {
        $actions: [
          {
            who: 'author',
            of: 'tasks',
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
    const { status: configureStatus, protocol } = await $web5.dwn.protocols.configure({
      message: {
        definition: protocolDefinition
      }
    })

    console.log({ configureStatus })
    if (!protocol) {
      return
    }

    syncToUserDwn(protocol)
  }

  const createRecord = async <T>(
    data: T,
    schema: 'tasks' | 'profile',
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
    schema: 'tasks' | 'profile',
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
    const loadRecords = await Promise.all(
      (records || []).map(async (record: { data: { json: () => any }; id: any }) => {
        const data = await record.data.json()
        return { recordId: record.id, ...data }
      })
    )

    return loadRecords as T
  }

  const updateRecord = async (recordId: string, data: any, schema: string) => {
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
  const deleteRecord = async (recordId: string, schema: string) => {
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

    return { status, recordId }
  }

  const syncToUserDwn = async (record: Record | Protocol, targetDid?: string) => {
    if (!web5.value) {
      return
    }
    const { did } = web5.value
    const { status: sendStatus } = await record.send(targetDid || did)

    if (sendStatus.code !== 202) {
      console.log('Unable to send to target did:', { sendStatus, record })
      return
    } else {
      console.log('record sent to user remote dwn', { sendStatus, record })
    }
  }

  const findOrUpdateRecord = async <T>(data: T, schema: 'tasks' | 'profile', upsert = true) => {
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
    console.log('findOrUpdateRecord', { status })
    if (!record && upsert) {
      return createRecord<T>(data, schema)
    }
    if (upsert) {
      await record.update({ data })
      syncToUserDwn(record)
    }
    if (!record || status.code === 404) {
      return {} as T
    }
    const dataInRecord = await record.data.json()

    return {
      ...data,
      ...dataInRecord,
      ...(record ? { recordId: record?.id } : {})
    } as T
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
