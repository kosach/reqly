import { useState, useEffect } from 'react'
import { getDatabase } from '../lib/database'
import type { Collection } from '@reqly/types'

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  const loadCollections = async () => {
    try {
      setLoading(true)
      const db = getDatabase()
      const data = db.getAllCollections()
      setCollections(data)
    } catch (error) {
      console.error('Failed to load collections:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  const createCollection = async (name: string, description?: string) => {
    try {
      const db = getDatabase()
      const newCollection = db.createCollection({
        name,
        description: description || '',
      })
      setCollections(prev => [...prev, newCollection])
      return newCollection
    } catch (error) {
      console.error('Failed to create collection:', error)
      throw error
    }
  }

  const updateCollection = async (id: string, updates: Partial<Collection>) => {
    try {
      const db = getDatabase()
      db.updateCollection(id, updates)
      await loadCollections()
    } catch (error) {
      console.error('Failed to update collection:', error)
      throw error
    }
  }

  const deleteCollection = async (id: string) => {
    try {
      const db = getDatabase()
      db.deleteCollection(id)
      setCollections(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      console.error('Failed to delete collection:', error)
      throw error
    }
  }

  return {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    refresh: loadCollections,
  }
}
