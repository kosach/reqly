import { useState } from 'react'
import type { Environment } from '../types'

interface EnvironmentSelectorProps {
  environments: Environment[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onCreate: (name: string) => Promise<Environment>
}

export function EnvironmentSelector({
  environments,
  selectedId,
  onSelect,
  onCreate,
}: EnvironmentSelectorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newEnvName, setNewEnvName] = useState('')

  const handleCreate = async () => {
    if (!newEnvName.trim()) return

    try {
      await onCreate(newEnvName.trim())
      setNewEnvName('')
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create environment:', error)
    }
  }

  if (isCreating) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newEnvName}
          onChange={(e) => setNewEnvName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate()
            if (e.key === 'Escape') {
              setIsCreating(false)
              setNewEnvName('')
            }
          }}
          placeholder="Environment name"
          className="input-field text-sm w-48"
          autoFocus
        />
        <button onClick={handleCreate} className="btn-primary text-sm px-3 py-1">
          Create
        </button>
        <button
          onClick={() => {
            setIsCreating(false)
            setNewEnvName('')
          }}
          className="btn-secondary text-sm px-3 py-1"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Environment:</span>
      <select
        value={selectedId || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="input-field text-sm w-48"
      >
        <option value="">No Environment</option>
        {environments.map((env) => (
          <option key={env.id} value={env.id}>
            {env.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => setIsCreating(true)}
        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
      >
        + New
      </button>
    </div>
  )
}
