/**
 * IndexedDB service for chat messages and sessions
 * Replaces Firebase for local, reliable persistence
 */

const DB_NAME = 'psycho-genealogy-chat';
const DB_VERSION = 1;
const SESSIONS_STORE = 'chat_sessions';
const MESSAGES_STORE = 'chat_messages';

let db: IDBDatabase | null = null;

export const chatDB = {
  async init(): Promise<IDBDatabase> {
    if (db) return db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create sessions store
        if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
          db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
        }

        // Create messages store
        if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
          const messagesStore = db.createObjectStore(MESSAGES_STORE, { keyPath: 'id' });
          messagesStore.createIndex('sessionId', 'sessionId', { unique: false });
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  },

  // Sessions API
  async saveSessions(sessions: any[]): Promise<void> {
    const database = await this.init();
    const tx = database.transaction(SESSIONS_STORE, 'readwrite');
    const store = tx.objectStore(SESSIONS_STORE);

    return new Promise((resolve, reject) => {
      store.clear();
      sessions.forEach(session => {
        store.add(session);
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to save sessions'));
    });
  },

  async getSessions(): Promise<any[]> {
    const database = await this.init();
    const tx = database.transaction(SESSIONS_STORE, 'readonly');
    const store = tx.objectStore(SESSIONS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get sessions'));
    });
  },

  async deleteSession(sessionId: string): Promise<void> {
    const database = await this.init();
    const tx = database.transaction(SESSIONS_STORE, 'readwrite');
    const store = tx.objectStore(SESSIONS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.delete(sessionId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete session'));
    });
  },

  // Messages API
  async saveMessage(message: any): Promise<void> {
    const database = await this.init();
    const tx = database.transaction(MESSAGES_STORE, 'readwrite');
    const store = tx.objectStore(MESSAGES_STORE);

    return new Promise((resolve, reject) => {
      const request = store.add(message);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save message'));
    });
  },

  async getMessages(sessionId: string): Promise<any[]> {
    const database = await this.init();
    const tx = database.transaction(MESSAGES_STORE, 'readonly');
    const store = tx.objectStore(MESSAGES_STORE);
    const index = store.index('sessionId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(sessionId);
      request.onsuccess = () => {
        const messages = request.result.sort((a: any, b: any) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        resolve(messages);
      };
      request.onerror = () => reject(new Error('Failed to get messages'));
    });
  },

  async deleteSessionMessages(sessionId: string): Promise<void> {
    const database = await this.init();
    const tx = database.transaction(MESSAGES_STORE, 'readwrite');
    const store = tx.objectStore(MESSAGES_STORE);
    const index = store.index('sessionId');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(sessionId));
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(new Error('Failed to delete messages'));
    });
  },

  async deleteAllMessages(): Promise<void> {
    const database = await this.init();
    const tx = database.transaction(MESSAGES_STORE, 'readwrite');
    const store = tx.objectStore(MESSAGES_STORE);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear messages'));
    });
  },

  async clearAll(): Promise<void> {
    const database = await this.init();
    const tx = database.transaction([SESSIONS_STORE, MESSAGES_STORE], 'readwrite');

    return new Promise((resolve, reject) => {
      tx.objectStore(SESSIONS_STORE).clear();
      tx.objectStore(MESSAGES_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to clear database'));
    });
  }
};
