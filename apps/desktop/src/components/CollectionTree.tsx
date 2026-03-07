import { useState } from 'react'
import type { Collection, Request } from '../types'

interface CollectionTreeProps {
  collections: Collection[]
  requests: Request[]
  selectedCollectionId: string | null
  selectedRequestId: string | null
  onSelectCollection: (id: string) => void
  onSelectRequest: (id: string) => void
  onCreateCollection: (name: string) => Promise<void>
  onDeleteCollection: (id: string) => Promise<void>
  onCreateRequest: (name: string) => Promise<void>
  onDeleteRequest: (id: string) => Promise<void>
  loading: boolean
}

export function CollectionTree({
  collections,
  requests,
  selectedCollectionId,
  selectedRequestId,
  onSelectCollection,
  onSelectRequest,
  onCreateCollection,
  onDeleteCollection,
  onCreateRequest,
  onDeleteRequest,
  loading,
}: CollectionTreeProps) {
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [isCreatingRequest, setIsCreatingRequest] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newRequestName, setNewRequestName] = useState('')

  const toggleCollection = (id: string) => {
    const newExpanded = new Set(expandedCollections)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCollections(newExpanded)
  }

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return
    
    try {
      await onCreateCollection(newCollectionName.trim())
      setNewCollectionName('')
      setIsCreatingCollection(false)
    } catch (error) {
      console.error('Failed to create collection:', error)
    }
  }

  const handleCreateRequest = async () => {
    if (!newRequestName.trim() || !selectedCollectionId) return
    
    try {
      await onCreateRequest(newRequestName.trim())
      setNewRequestName('')
      setIsCreatingRequest(false)
    } catch (error) {
      console.error('Failed to create request:', error)
    }
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'text-green-600',
      POST: 'text-blue-600',
      PUT: 'text-yellow-600',
      PATCH: 'text-orange-600',
      DELETE: 'text-red-600',
    }
    return colors[method] || 'text-gray-600'
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <button
          onClick={() => setIsCreatingCollection(true)}
          className="w-full btn-primary text-sm"
          disabled={loading}
        >
          + New Collection
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading && collections.length === 0 ? (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        ) : (
          <>
            {isCreatingCollection && (
              <div className="mb-2 p-2 bg-gray-50 rounded">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateCollection()
                    if (e.key === 'Escape') {
                      setIsCreatingCollection(false)
                      setNewCollectionName('')
                    }
                  }}
                  placeholder="Collection name"
                  className="w-full input-field text-sm mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateCollection}
                    className="btn-primary text-xs flex-1"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingCollection(false)
                      setNewCollectionName('')
                    }}
                    className="btn-secondary text-xs flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {collections.map((collection) => {
              const isExpanded = expandedCollections.has(collection.id)
              const collectionRequests = requests.filter(
                (r) => r.collectionId === collection.id
              )

              return (
                <div key={collection.id} className="mb-1">
                  <div
                    className={`
                      flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100
                      ${selectedCollectionId === collection.id ? 'bg-primary-50' : ''}
                    `}
                    onClick={() => {
                      onSelectCollection(collection.id)
                      toggleCollection(collection.id)
                    }}
                  >
                    <span className="text-gray-400">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <span className="flex-1 text-sm font-medium truncate">
                      {collection.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Delete collection "${collection.name}"?`)) {
                          onDeleteCollection(collection.id)
                        }
                      }}
                      className="text-gray-400 hover:text-red-600 text-xs"
                    >
                      ×
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="ml-6 mt-1">
                      {selectedCollectionId === collection.id && isCreatingRequest && (
                        <div className="mb-2 p-2 bg-gray-50 rounded">
                          <input
                            type="text"
                            value={newRequestName}
                            onChange={(e) => setNewRequestName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCreateRequest()
                              if (e.key === 'Escape') {
                                setIsCreatingRequest(false)
                                setNewRequestName('')
                              }
                            }}
                            placeholder="Request name"
                            className="w-full input-field text-sm mb-2"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleCreateRequest}
                              className="btn-primary text-xs flex-1"
                            >
                              Create
                            </button>
                            <button
                              onClick={() => {
                                setIsCreatingRequest(false)
                                setNewRequestName('')
                              }}
                              className="btn-secondary text-xs flex-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {collectionRequests.map((request) => (
                        <div
                          key={request.id}
                          className={`
                            flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100
                            ${selectedRequestId === request.id ? 'bg-primary-50' : ''}
                          `}
                          onClick={() => onSelectRequest(request.id)}
                        >
                          <span className={`text-xs font-semibold ${getMethodColor(request.method)}`}>
                            {request.method}
                          </span>
                          <span className="flex-1 text-sm truncate">
                            {request.name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm(`Delete request "${request.name}"?`)) {
                                onDeleteRequest(request.id)
                              }
                            }}
                            className="text-gray-400 hover:text-red-600 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {selectedCollectionId === collection.id && !isCreatingRequest && (
                        <button
                          onClick={() => setIsCreatingRequest(true)}
                          className="w-full text-left p-2 text-sm text-gray-500 hover:bg-gray-100 rounded"
                        >
                          + New Request
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
