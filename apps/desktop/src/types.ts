import type { Collection, Request, Environment, Variable } from '@reqly/types'

export interface UIState {
  selectedCollectionId: string | null
  selectedRequestId: string | null
  selectedEnvironmentId: string | null
  isLoading: boolean
}

export interface ResponseData {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  time: number
}

export { Collection, Request, Environment, Variable }
