import { useState } from 'react'
import Editor from '@monaco-editor/react'
import type { ResponseData } from '../types'

interface ResponseViewerProps {
  response: ResponseData
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body')

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 300 && status < 400) return 'text-yellow-600'
    if (status >= 400 && status < 500) return 'text-orange-600'
    if (status >= 500) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatBody = () => {
    try {
      const parsed = JSON.parse(response.body)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return response.body
    }
  }

  const detectLanguage = () => {
    try {
      JSON.parse(response.body)
      return 'json'
    } catch {
      if (response.body.startsWith('<!DOCTYPE') || response.body.startsWith('<html')) {
        return 'html'
      }
      if (response.body.startsWith('<?xml')) {
        return 'xml'
      }
      return 'text'
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Status bar */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <span className={`font-semibold ${getStatusColor(response.status)}`}>
              {response.status} {response.statusText}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Time:</span>
            <span className="font-semibold text-gray-700">{response.time}ms</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
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
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'headers'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Headers ({Object.keys(response.headers).length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'body' ? (
          <Editor
            height="100%"
            defaultLanguage={detectLanguage()}
            value={formatBody()}
            theme="vs-light"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        ) : (
          <div className="p-4 space-y-2 overflow-y-auto h-full">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-4 text-sm">
                <span className="font-medium text-gray-700 w-1/3">{key}:</span>
                <span className="text-gray-600 flex-1 break-all">{value}</span>
              </div>
            ))}
            {Object.keys(response.headers).length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No headers received
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
