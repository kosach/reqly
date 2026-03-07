/**
 * Unit tests for ReqlyDatabase
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReqlyDatabase } from './index';
import type { Collection, Request, Environment } from '@reqly/types';

describe('ReqlyDatabase', () => {
  let db: ReqlyDatabase;

  beforeEach(() => {
    db = new ReqlyDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  describe('Collections', () => {
    it('should create a collection', () => {
      const collection = db.createCollection({
        name: 'Test Collection',
        description: 'A test collection',
      });

      expect(collection.id).toBeTruthy();
      expect(collection.name).toBe('Test Collection');
      expect(collection.description).toBe('A test collection');
      expect(collection.createdAt).toBeInstanceOf(Date);
      expect(collection.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a collection with variables and auth', () => {
      const collection = db.createCollection({
        name: 'API Collection',
        variables: [
          { key: 'baseUrl', value: 'https://api.example.com', type: 'default' },
          { key: 'apiKey', value: 'secret123', type: 'secret' },
        ],
        auth: {
          type: 'bearer',
          bearer: { token: 'test-token' },
        },
      });

      expect(collection.variables).toHaveLength(2);
      expect(collection.auth?.type).toBe('bearer');
    });

    it('should get a collection by id', () => {
      const created = db.createCollection({
        name: 'Get Test',
      });

      const fetched = db.getCollection(created.id);

      expect(fetched).not.toBeNull();
      expect(fetched?.id).toBe(created.id);
      expect(fetched?.name).toBe('Get Test');
    });

    it('should return null for non-existent collection', () => {
      const result = db.getCollection('non-existent-id');
      expect(result).toBeNull();
    });

    it('should get all collections', () => {
      db.createCollection({ name: 'Collection 1' });
      db.createCollection({ name: 'Collection 2' });
      db.createCollection({ name: 'Collection 3' });

      const collections = db.getAllCollections();

      expect(collections).toHaveLength(3);
      const names = collections.map(c => c.name);
      expect(names).toContain('Collection 1');
      expect(names).toContain('Collection 2');
      expect(names).toContain('Collection 3');
    });

    it('should update a collection', () => {
      const created = db.createCollection({
        name: 'Original Name',
        description: 'Original Description',
      });

      const updated = db.updateCollection(created.id, {
        name: 'Updated Name',
        description: 'Updated Description',
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('Updated Description');
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
    });

    it('should partially update a collection', () => {
      const created = db.createCollection({
        name: 'Original',
        description: 'Keep this',
      });

      const updated = db.updateCollection(created.id, {
        name: 'Changed',
      });

      expect(updated?.name).toBe('Changed');
      expect(updated?.description).toBe('Keep this');
    });

    it('should return null when updating non-existent collection', () => {
      const result = db.updateCollection('non-existent', { name: 'Test' });
      expect(result).toBeNull();
    });

    it('should delete a collection', () => {
      const created = db.createCollection({ name: 'To Delete' });

      const deleted = db.deleteCollection(created.id);
      expect(deleted).toBe(true);

      const fetched = db.getCollection(created.id);
      expect(fetched).toBeNull();
    });

    it('should return false when deleting non-existent collection', () => {
      const result = db.deleteCollection('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Requests', () => {
    it('should create a request', () => {
      const request = db.createRequest({
        name: 'Test Request',
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(request.id).toBeTruthy();
      expect(request.name).toBe('Test Request');
      expect(request.method).toBe('GET');
      expect(request.url).toBe('https://api.example.com/users');
      expect(request.headers['Content-Type']).toBe('application/json');
      expect(request.createdAt).toBeInstanceOf(Date);
    });

    it('should create a request with body', () => {
      const request = db.createRequest({
        name: 'POST Request',
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: {},
        body: JSON.stringify({ name: 'John Doe' }),
      });

      expect(request.body).toBe(JSON.stringify({ name: 'John Doe' }));
    });

    it('should create a request in a collection', () => {
      const collection = db.createCollection({ name: 'API Tests' });
      const request = db.createRequest({
        name: 'Get Users',
        method: 'GET',
        url: '/users',
        headers: {},
        collectionId: collection.id,
      });

      expect(request.collectionId).toBe(collection.id);
    });

    it('should get a request by id', () => {
      const created = db.createRequest({
        name: 'Test',
        method: 'GET',
        url: '/test',
        headers: {},
      });

      const fetched = db.getRequest(created.id);

      expect(fetched).not.toBeNull();
      expect(fetched?.id).toBe(created.id);
    });

    it('should get all requests', () => {
      db.createRequest({ name: 'Request 1', method: 'GET', url: '/1', headers: {} });
      db.createRequest({ name: 'Request 2', method: 'POST', url: '/2', headers: {} });

      const requests = db.getAllRequests();

      expect(requests).toHaveLength(2);
    });

    it('should get requests by collection', () => {
      const collection1 = db.createCollection({ name: 'Collection 1' });
      const collection2 = db.createCollection({ name: 'Collection 2' });

      db.createRequest({
        name: 'Request 1',
        method: 'GET',
        url: '/1',
        headers: {},
        collectionId: collection1.id,
      });
      db.createRequest({
        name: 'Request 2',
        method: 'GET',
        url: '/2',
        headers: {},
        collectionId: collection1.id,
      });
      db.createRequest({
        name: 'Request 3',
        method: 'GET',
        url: '/3',
        headers: {},
        collectionId: collection2.id,
      });

      const collection1Requests = db.getRequestsByCollection(collection1.id);
      const collection2Requests = db.getRequestsByCollection(collection2.id);

      expect(collection1Requests).toHaveLength(2);
      expect(collection2Requests).toHaveLength(1);
    });

    it('should update a request', () => {
      const created = db.createRequest({
        name: 'Original',
        method: 'GET',
        url: '/original',
        headers: {},
      });

      const updated = db.updateRequest(created.id, {
        name: 'Updated',
        method: 'POST',
        url: '/updated',
      });

      expect(updated?.name).toBe('Updated');
      expect(updated?.method).toBe('POST');
      expect(updated?.url).toBe('/updated');
    });

    it('should partially update a request', () => {
      const created = db.createRequest({
        name: 'Original',
        method: 'GET',
        url: '/test',
        headers: { 'X-Test': 'value' },
      });

      const updated = db.updateRequest(created.id, {
        name: 'Changed',
      });

      expect(updated?.name).toBe('Changed');
      expect(updated?.method).toBe('GET');
      expect(updated?.url).toBe('/test');
    });

    it('should delete a request', () => {
      const created = db.createRequest({
        name: 'To Delete',
        method: 'GET',
        url: '/delete',
        headers: {},
      });

      const deleted = db.deleteRequest(created.id);
      expect(deleted).toBe(true);

      const fetched = db.getRequest(created.id);
      expect(fetched).toBeNull();
    });

    it('should cascade delete requests when collection is deleted', () => {
      const collection = db.createCollection({ name: 'Test Collection' });
      const request = db.createRequest({
        name: 'Test Request',
        method: 'GET',
        url: '/test',
        headers: {},
        collectionId: collection.id,
      });

      db.deleteCollection(collection.id);

      const fetchedRequest = db.getRequest(request.id);
      expect(fetchedRequest).toBeNull();
    });
  });

  describe('Environments', () => {
    it('should create an environment', () => {
      const environment = db.createEnvironment({
        name: 'Development',
        variables: [
          { key: 'baseUrl', value: 'http://localhost:3000', type: 'default' },
          { key: 'apiKey', value: 'dev-key', type: 'secret' },
        ],
      });

      expect(environment.id).toBeTruthy();
      expect(environment.name).toBe('Development');
      expect(environment.variables).toHaveLength(2);
      expect(environment.createdAt).toBeInstanceOf(Date);
    });

    it('should get an environment by id', () => {
      const created = db.createEnvironment({
        name: 'Production',
        variables: [{ key: 'apiUrl', value: 'https://api.prod.com', type: 'default' }],
      });

      const fetched = db.getEnvironment(created.id);

      expect(fetched).not.toBeNull();
      expect(fetched?.id).toBe(created.id);
      expect(fetched?.name).toBe('Production');
    });

    it('should get all environments', () => {
      db.createEnvironment({ name: 'Dev', variables: [] });
      db.createEnvironment({ name: 'Staging', variables: [] });
      db.createEnvironment({ name: 'Production', variables: [] });

      const environments = db.getAllEnvironments();

      expect(environments).toHaveLength(3);
    });

    it('should update an environment', () => {
      const created = db.createEnvironment({
        name: 'Dev',
        variables: [{ key: 'url', value: 'http://localhost', type: 'default' }],
      });

      const updated = db.updateEnvironment(created.id, {
        name: 'Development',
        variables: [
          { key: 'url', value: 'http://localhost:8080', type: 'default' },
          { key: 'token', value: 'abc123', type: 'secret' },
        ],
      });

      expect(updated?.name).toBe('Development');
      expect(updated?.variables).toHaveLength(2);
    });

    it('should delete an environment', () => {
      const created = db.createEnvironment({
        name: 'Temp',
        variables: [],
      });

      const deleted = db.deleteEnvironment(created.id);
      expect(deleted).toBe(true);

      const fetched = db.getEnvironment(created.id);
      expect(fetched).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty collections list', () => {
      const collections = db.getAllCollections();
      expect(collections).toHaveLength(0);
    });

    it('should handle empty requests list', () => {
      const requests = db.getAllRequests();
      expect(requests).toHaveLength(0);
    });

    it('should handle collection with no description', () => {
      const collection = db.createCollection({ name: 'No Description' });
      expect(collection.description).toBeUndefined();
    });

    it('should handle request with no body', () => {
      const request = db.createRequest({
        name: 'No Body',
        method: 'GET',
        url: '/test',
        headers: {},
      });
      expect(request.body).toBeUndefined();
    });

    it('should handle request with no collection', () => {
      const request = db.createRequest({
        name: 'Orphan Request',
        method: 'GET',
        url: '/test',
        headers: {},
      });
      expect(request.collectionId).toBeUndefined();
    });

    it('should preserve timestamps correctly', () => {
      const collection = db.createCollection({ name: 'Test' });
      
      // Small delay to ensure updatedAt is different
      const updated = db.updateCollection(collection.id, { name: 'Updated' });
      
      expect(updated?.createdAt.getTime()).toBe(collection.createdAt.getTime());
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(collection.updatedAt.getTime());
    });
  });
});
