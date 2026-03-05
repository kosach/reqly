/**
 * Shared TypeScript types for Reqly
 */

// HTTP Request types
export interface Request {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: Record<string, string>;
  body?: string;
  collectionId?: string;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Collection types
export interface Collection {
  id: string;
  name: string;
  description?: string;
  variables?: Variable[];
  auth?: AuthConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  collectionId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Environment & Variables
export interface Environment {
  id: string;
  name: string;
  variables: Variable[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Variable {
  key: string;
  value: string;
  type: 'default' | 'secret';
}

// Authentication
export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key' | 'oauth2';

export interface AuthConfig {
  type: AuthType;
  bearer?: { token: string };
  basic?: { username: string; password: string };
  apiKey?: { key: string; value: string; in: 'header' | 'query' };
  oauth2?: OAuth2Config;
}

export interface OAuth2Config {
  grantType: 'authorization_code' | 'client_credentials' | 'password';
  accessTokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
}

// Response types
export interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number; // milliseconds
  size: number; // bytes
}

// MCP Tool types
export interface MCPToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}
