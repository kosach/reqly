import { useState, useEffect } from 'react'
import { getDatabase } from '../lib/database'
import { HTTPClient } from '@reqly/http-engine'
import type { Request } from '@reqly/types'
import type { ResponseData } from '../types'

const httpClient = new HTTPClient()

export function useRequests(collectionId: string | null) {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(false)

  const loadRequests = async () => {
    if (!collectionId) {
      setRequests([])
      return
    }

    try {
      setLoading(true)
      const db = getDatabase()
      const data = db.getRequestsByCollection(collectionId)
      setRequests(data)
    } catch (error) {
      console.error('Failed to load requests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [collectionId])

  const createRequest = async (
    name: string,
    method: string = 'GET',
    url: string = ''
  ) => {
    if (!collectionId) throw new Error('No collection selected')

    try {
      const db = getDatabase()
      const newRequest = db.createRequest({
        collectionId,
        name,
        method: method as Request['method'],
        url,
        headers: {},
      })
      setRequests(prev => [...prev, newRequest])
      return newRequest
    } catch (error) {
      console.error('Failed to create request:', error)
      throw error
    }
  }

  const updateRequest = async (id: string, updates: Partial<Request>) => {
    try {
      const db = getDatabase()
      db.updateRequest(id, updates)
      await loadRequests()
    } catch (error) {
      console.error('Failed to update request:', error)
      throw error
    }
  }

  const deleteRequest = async (id: string) => {
    try {
      const db = getDatabase()
      db.deleteRequest(id)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (error) {
      console.error('Failed to delete request:', error)
      throw error
    }
  }

  const sendRequest = async (
    requestId: string,
    environmentId?: string | null
  ): Promise<ResponseData> => {
    try {
      const db = getDatabase()
      const request = db.getRequest(requestId)
      if (!request) throw new Error('Request not found')

      const environment = environmentId ? db.getEnvironment(environmentId) : undefined
      const collection = request.collectionId ? db.getCollection(request.collectionId) : undefined

      const result = await httpClient.sendRequest({
        request,
        environment,
        collectionVariables: collection?.variables?.default 
          ? Object.entries(collection.variables.default).map(([key, value]) => ({ key, value, enabled: true }))
          : undefined,
        collectionAuth: collection?.auth,
      })

      return {
        status: result.response.status,
        statusText: result.response.statusText,
        headers: result.response.headers || {},
        body: result.response.body || '',
        time: result.response.time,
      }
    } catch (error) {
      console.error('Failed to send request:', error)
      throw error
    }
  }

  return {
    requests,
    loading,
    createRequest,
    updateRequest,
    deleteRequest,
    sendRequest,
    refresh: loadRequests,
  }
}
