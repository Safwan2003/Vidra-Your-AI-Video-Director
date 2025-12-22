import { VideoPlan, ProjectBrief } from '../types';

const DB_NAME = 'VidraDB';
const DB_VERSION = 1;

export interface SavedProject {
    id: string;
    name: string;
    timestamp: number;
    brief: ProjectBrief;
    plan: VideoPlan;
    thumbnail?: string; // Data URL
}

class DBService {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('projects')) {
                    db.createObjectStore('projects', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('assets')) {
                    db.createObjectStore('assets', { keyPath: 'id' });
                }
            };
        });
    }

    private getStore(storeName: string, mode: IDBTransactionMode): IDBObjectStore {
        if (!this.db) throw new Error("Database not initialized");
        return this.db.transaction(storeName, mode).objectStore(storeName);
    }

    async saveProject(project: SavedProject): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const request = this.getStore('projects', 'readwrite').put(project);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getProject(id: string): Promise<SavedProject | undefined> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const request = this.getStore('projects', 'readonly').get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllProjects(): Promise<SavedProject[]> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const request = this.getStore('projects', 'readonly').getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteProject(id: string): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const request = this.getStore('projects', 'readwrite').delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // --- Asset Management (Simulating a File System) ---

    async saveAsset(id: string, blob: Blob): Promise<string> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const assetRecord = { id, blob, created: Date.now() };
            const request = this.getStore('assets', 'readwrite').put(assetRecord);
            request.onsuccess = () => resolve(id);
            request.onerror = () => reject(request.error);
        });
    }

    async getAsset(id: string): Promise<Blob | undefined> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const request = this.getStore('assets', 'readonly').get(id);
            request.onsuccess = () => resolve(request.result?.blob);
            request.onerror = () => reject(request.error);
        });
    }
}

export const dbService = new DBService();
