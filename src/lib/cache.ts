const CACHE_NAME = 'flipverse-cache-v1';
const QUESTIONS_STORE = 'questions';
const DECKS_STORE = 'decks';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CACHE_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(QUESTIONS_STORE)) {
        db.createObjectStore(QUESTIONS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(DECKS_STORE)) {
        db.createObjectStore(DECKS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getStore(storeName: string): Promise<IDBObjectStore> {
  const db = await getDb();
  return db.transaction(storeName, 'readonly').objectStore(storeName);
}

async function getWriteStore(storeName: string): Promise<IDBObjectStore> {
  const db = await getDb();
  return db.transaction(storeName, 'readwrite').objectStore(storeName);
}

export async function getCached<T>(key: string, storeName: string): Promise<T | null> {
  try {
    const store = await getStore(storeName);
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
          resolve(entry.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, data: T, storeName: string): Promise<void> {
  try {
    const store = await getWriteStore(storeName);
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    store.put(entry);
  } catch {
    // IndexedDB not available
  }
}

export async function cacheQuestions(questions: Array<Record<string, unknown>>): Promise<void> {
  try {
    const store = await getWriteStore(QUESTIONS_STORE);
    for (const q of questions) {
      const entry: CacheEntry<typeof q> = { data: q, timestamp: Date.now() };
      store.put({ ...entry, id: q.id as string });
    }
  } catch {
    // IndexedDB not available
  }
}

export async function getCachedQuestions(): Promise<Array<Record<string, unknown>> | null> {
  try {
    const store = await getStore(QUESTIONS_STORE);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const entries = request.result as Array<CacheEntry<Record<string, unknown>> & { id: string }>;
        const valid = entries.filter((e) => Date.now() - e.timestamp < CACHE_TTL);
        resolve(valid.length > 0 ? valid.map((e) => e.data) : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function cacheDecks(decks: Array<Record<string, unknown>>): Promise<void> {
  try {
    const store = await getWriteStore(DECKS_STORE);
    for (const d of decks) {
      const entry: CacheEntry<typeof d> = { data: d, timestamp: Date.now() };
      store.put({ ...entry, id: d.id as string });
    }
  } catch {
    // IndexedDB not available
  }
}

export async function getCachedDecks(): Promise<Array<Record<string, unknown>> | null> {
  try {
    const store = await getStore(DECKS_STORE);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const entries = request.result as Array<CacheEntry<Record<string, unknown>> & { id: string }>;
        const valid = entries.filter((e) => Date.now() - e.timestamp < CACHE_TTL);
        resolve(valid.length > 0 ? valid.map((e) => e.data) : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function clearCache(): Promise<void> {
  try {
    const db = await getDb();
    db.close();
    indexedDB.deleteDatabase(CACHE_NAME);
  } catch {
    // ignore
  }
}
