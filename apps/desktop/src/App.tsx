import { useState, useEffect } from 'react'
import { CollectionTree } from './components/CollectionTree'
import { RequestBuilder } from './components/RequestBuilder'
import { ResponseViewer } from './components/ResponseViewer'
import { EnvironmentSelector } from './components/EnvironmentSelector'
import { VariableEditor } from './components/VariableEditor'
import { useCollections } from './hooks/useCollections'
import { useRequests } from './hooks/useRequests'
import { useEnvironments } from './hooks/useEnvironments'
import type { ResponseData } from './types'

function App() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null)
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [showVariableEditor, setShowVariableEditor] = useState(false)

  const { collections, loading: collectionsLoading, createCollection, deleteCollection } = useCollections()
  const { requests, loading: requestsLoading, createRequest, updateRequest, deleteRequest, sendRequest } = useRequests(selectedCollectionId)
  const { environments, createEnvironment } = useEnvironments()

  const selectedCollection = collections.find(c => c.id === selectedCollectionId)
  const selectedRequest = requests.find(r => r.id === selectedRequestId)

  const handleSendRequest = async () => {
    if (!selectedRequestId) return
    
    try {
      const result = await sendRequest(selectedRequestId, selectedEnvironmentId)
      setResponse(result)
    } catch (error) {
      console.error('Failed to send request:', error)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary-600">Reqly</h1>
          <EnvironmentSelector
            environments={environments}
            selectedId={selectedEnvironmentId}
            onSelect={setSelectedEnvironmentId}
            onCreate={createEnvironment}
          />
        </div>
        <button
          onClick={() => setShowVariableEditor(!showVariableEditor)}
          className="btn-secondary text-sm"
        >
          Variables
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <CollectionTree
            collections={collections}
            requests={requests}
            selectedCollectionId={selectedCollectionId}
            selectedRequestId={selectedRequestId}
            onSelectCollection={setSelectedCollectionId}
            onSelectRequest={setSelectedRequestId}
            onCreateCollection={createCollection}
            onDeleteCollection={deleteCollection}
            onCreateRequest={createRequest}
            onDeleteRequest={deleteRequest}
            loading={collectionsLoading || requestsLoading}
          />
        </aside>

        {/* Main Panel */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedRequest ? (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                <RequestBuilder
                  request={selectedRequest}
                  onUpdate={updateRequest}
                  onSend={handleSendRequest}
                />
              </div>
              {response && (
                <div className="h-1/2 border-t border-gray-200">
                  <ResponseViewer response={response} />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-lg">Select a request to get started</p>
                <p className="text-sm mt-2">or create a new collection from the sidebar</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Variable Editor Modal */}
      {showVariableEditor && selectedCollection && (
        <VariableEditor
          collection={selectedCollection}
          onClose={() => setShowVariableEditor(false)}
        />
      )}
    </div>
  )
}

export default App
