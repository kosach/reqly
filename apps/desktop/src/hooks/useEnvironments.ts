import { useState, useEffect } from 'react'
import { getDatabase } from '../lib/database'
import type { Environment } from '@reqly/types'

export function useEnvironments() {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [loading, setLoading] = useState(true)

  const loadEnvironments = async () => {
    try {
      setLoading(true)
      const db = getDatabase()
      const data = db.getAllEnvironments()
      setEnvironments(data)
    } catch (error) {
      console.error('Failed to load environments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEnvironments()
  }, [])

  const createEnvironment = async (name: string, variables?: Record<string, string>) => {
    try {
      const db = getDatabase()
      const newEnv = db.createEnvironment({
        name,
        variables: variables || {},
      })
      setEnvironments(prev => [...prev, newEnv])
      return newEnv
    } catch (error) {
      console.error('Failed to create environment:', error)
      throw error
    }
  }

  const updateEnvironment = async (id: string, updates: Partial<Environment>) => {
    try {
      const db = getDatabase()
      db.updateEnvironment(id, updates)
      await loadEnvironments()
    } catch (error) {
      console.error('Failed to update environment:', error)
      throw error
    }
  }

  const deleteEnvironment = async (id: string) => {
    try {
      const db = getDatabase()
      db.deleteEnvironment(id)
      setEnvironments(prev => prev.filter(e => e.id !== id))
    } catch (error) {
      console.error('Failed to delete environment:', error)
      throw error
    }
  }

  return {
    environments,
    loading,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    refresh: loadEnvironments,
  }
}
