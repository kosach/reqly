import { useState } from 'react'
import Editor from '@monaco-editor/react'
import type { Request } from '../types'

interface RequestBuilderProps {
  request: Request
  onUpdate: (id: string, updates: Partial<Request>) => Promise<void>
  onSend: () => void
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

export function RequestBuilder({ request, onUpdate, onSend }: RequestBuilderProps) {
  const [activeTab, setActiveTab] = useState<'headers' | 'body'>('headers')
  const [method, setMethod] = useState(request.method)
  const [url, setUrl] = useState(request.url)
  const [headers, setHeaders] = useState<Record<string, string>>(request.headers || {})
  const [body, setBody] = useState(request.body || '')
  const [isSending, setIsSending] = useState(false)

  const handleUpdateMethod = (newMethod: string) => {
    setMethod(newMethod)
    onUpdate(request.id, { method: newMethod })
  }

  const handleUpdateUrl = () => {
    if (url !== request.url) {
      onUpdate(request.id, { url })
    }
  }

  const handleUpdateHeaders = () => {
    onUpdate(request.id, { headers })
  }

  const handleUpdateBody = () => {
    if (body !== request.body) {
      onUpdate(request.id, { body })
    }
  }

  const handleAddHeader = () => {
    setHeaders({ ...headers, '': '' })
  }

  const handleUpdateHeaderKey = (oldKey: string, newKey: string) => {
    const newHeaders = { ...headers }
    if (oldKey !== newKey) {
      const value = newHeaders[oldKey]
      delete newHeaders[oldKey]
      if (newKey) {
        newHeaders[newKey] = value
      }
    }
    setHeaders(newHeaders)
  }

  const handleUpdateHeaderValue = (key: string, value: string) => {
    setHeaders({ ...headers, [key]: value })
  }

  const handleDeleteHeader = (key: string) => {
    const newHeaders = { ...headers }
    delete newHeaders[key]
    setHeaders(newHeaders)
  }

  const handleSend = async () => {
    setIsSending(true)
    try {
      // Save current state before sending
      await onUpdate(request.id, { method, url, headers, body })
      await onSend()
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Request line */}
      <div className="flex gap-2 mb-4">
        <select
          value={method}
          onChange={(e) => handleUpdateMethod(e.target.value)}
          className="input-field w-32"
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleUpdateUrl}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleUpdateUrl()
              handleSend()
            }
          }}
          placeholder="https://api.example.com/endpoint"
          className="flex-1 input-field"
        />
        <button
          onClick={handleSend}
          disabled={isSending || !url}
          className="btn-primary px-8"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'headers'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Headers
        </button>
        <button
          onClick={() => setActiveTab('body')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'body'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Body
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'headers' ? (
          <div className="space-y-2">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => handleUpdateHeaderKey(key, e.target.value)}
                  onBlur={handleUpdateHeaders}
                  placeholder="Header name"
                  className="flex-1 input-field"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleUpdateHeaderValue(key, e.target.value)}
                  onBlur={handleUpdateHeaders}
                  placeholder="Header value"
                  className="flex-1 input-field"
                />
                <button
                  onClick={() => handleDeleteHeader(key)}
                  className="text-gray-400 hover:text-red-600 px-2"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={handleAddHeader}
              className="btn-secondary text-sm"
            >
              + Add Header
            </button>
          </div>
        ) : (
          <div className="h-full">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={body}
              onChange={(value) => setBody(value || '')}
              onBlur={handleUpdateBody}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
