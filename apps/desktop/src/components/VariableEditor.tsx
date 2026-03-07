import { useState } from 'react'
import { getDatabase } from '../lib/database'
import type { Collection } from '../types'

interface VariableEditorProps {
  collection: Collection
  onClose: () => void
}

export function VariableEditor({ collection, onClose }: VariableEditorProps) {
  const [variables, setVariables] = useState<Record<string, string>>(
    collection.variables?.default || {}
  )

  const handleAddVariable = () => {
    setVariables({ ...variables, '': '' })
  }

  const handleUpdateKey = (oldKey: string, newKey: string) => {
    const newVariables = { ...variables }
    if (oldKey !== newKey) {
      const value = newVariables[oldKey]
      delete newVariables[oldKey]
      if (newKey) {
        newVariables[newKey] = value
      }
    }
    setVariables(newVariables)
  }

  const handleUpdateValue = (key: string, value: string) => {
    setVariables({ ...variables, [key]: value })
  }

  const handleDeleteVariable = (key: string) => {
    const newVariables = { ...variables }
    delete newVariables[key]
    setVariables(newVariables)
  }

  const handleSave = async () => {
    try {
      const db = getDatabase()
      db.updateCollection(collection.id, {
        variables: {
          ...collection.variables,
          default: variables,
        },
      })
      onClose()
    } catch (error) {
      console.error('Failed to save variables:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Variables - {collection.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {Object.entries(variables).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => handleUpdateKey(key, e.target.value)}
                  placeholder="Variable name"
                  className="flex-1 input-field"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleUpdateValue(key, e.target.value)}
                  placeholder="Variable value"
                  className="flex-1 input-field"
                />
                <button
                  onClick={() => handleDeleteVariable(key)}
                  className="text-gray-400 hover:text-red-600 px-2"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={handleAddVariable}
              className="btn-secondary text-sm"
            >
              + Add Variable
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Using Variables
            </h3>
            <p className="text-sm text-gray-600">
              Use variables in your requests with the syntax:{' '}
              <code className="bg-white px-2 py-1 rounded">
                {'{{variableName}}'}
              </code>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Example: <code className="bg-white px-2 py-1 rounded">
                https://api.example.com/{'{{endpoint}}'}
              </code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
