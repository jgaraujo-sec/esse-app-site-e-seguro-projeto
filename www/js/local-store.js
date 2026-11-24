class LocalStore {
 constructor(config) {
 this.config = config;
 this.dbPromise = null;
 this.fallbackAnalyses = [];
 this.fallbackTemps = new Map();
 }

 openDb() {
 if (this.dbPromise) return this.dbPromise;

 this.dbPromise = new Promise((resolve) => {
 if (typeof indexedDB === "undefined") {
 resolve(null);
 return;
 }

 try {
 const request = indexedDB.open(this.config.dbName, this.config.dbVersion);

 request.onupgradeneeded = (event) => {
 const db = event.target.result;
 if (!db.objectStoreNames.contains(this.config.stores.analyses)) {
 db.createObjectStore(this.config.stores.analyses, {
 keyPath: "id",
 autoIncrement: true
 });
 }
 if (!db.objectStoreNames.contains(this.config.stores.tempBuffers)) {
 db.createObjectStore(this.config.stores.tempBuffers, {
 keyPath: "tempId"
 });
 }
 };

 request.onsuccess = (event) => resolve(event.target.result);
 request.onerror = () => resolve(null);
 } catch (_err) {
 resolve(null);
 }
 });

 return this.dbPromise;
 }

 async saveTempMetadata(tempId, metadata) {
 const record = {
 tempId,
 createdAt: new Date().toISOString(),
...metadata
 };
 this.fallbackTemps.set(tempId, record);

 const db = await this.openDb();
 if (!db) return record;

 return new Promise((resolve) => {
 try {
 const tx = db.transaction(this.config.stores.tempBuffers, "readwrite");
 tx.objectStore(this.config.stores.tempBuffers).put(record);
 tx.oncomplete = () => resolve(record);
 tx.onerror = () => resolve(record);
 } catch (_err) {
 resolve(record);
 }
 });
 }

 async deleteTempMetadata(tempId) {
 this.fallbackTemps.delete(tempId);

 const db = await this.openDb();
 if (!db) return true;

 return new Promise((resolve) => {
 try {
 const tx = db.transaction(this.config.stores.tempBuffers, "readwrite");
 tx.objectStore(this.config.stores.tempBuffers).delete(tempId);
 tx.oncomplete = () => resolve(true);
 tx.onerror = () => resolve(true);
 } catch (_err) {
 resolve(true);
 }
 });
 }

 async clearAllTemps() {
 let count = this.fallbackTemps.size;
 this.fallbackTemps.clear();

 const db = await this.openDb();
 if (!db) return count;

 return new Promise((resolve) => {
 try {
 const tx = db.transaction(this.config.stores.tempBuffers, "readwrite");
 const store = tx.objectStore(this.config.stores.tempBuffers);
 const countReq = store.count();
 countReq.onsuccess = () => {
 count = countReq.result || count;
 };
 store.clear();
 tx.oncomplete = () => resolve(count);
 tx.onerror = () => resolve(count);
 } catch (_err) {
 resolve(count);
 }
 });
 }

 async saveAnalysis(entry) {
 const record = {
 timestamp: new Date().toISOString(),
...entry
 };

 this.fallbackAnalyses.unshift(record);
 if (this.fallbackAnalyses.length > 100) {
 this.fallbackAnalyses.length = 100;
 }

 const db = await this.openDb();
 if (!db) return record;

 return new Promise((resolve) => {
 try {
 const tx = db.transaction(this.config.stores.analyses, "readwrite");
 const addReq = tx.objectStore(this.config.stores.analyses).add(record);
 addReq.onsuccess = () => {
 record.id = addReq.result;
 };
 tx.oncomplete = () => resolve(record);
 tx.onerror = () => resolve(record);
 } catch (_err) {
 resolve(record);
 }
 });
 }

 async getAnalyses() {
 const db = await this.openDb();
 if (!db) return [...this.fallbackAnalyses];

 return new Promise((resolve) => {
 try {
 const tx = db.transaction(this.config.stores.analyses, "readonly");
 const req = tx.objectStore(this.config.stores.analyses).getAll();
 req.onsuccess = () => {
 const rows = Array.isArray(req.result) ? req.result : [];
 resolve(rows.sort((a, b) => (b.id || 0) - (a.id || 0)));
 };
 req.onerror = () => resolve([...this.fallbackAnalyses]);
 } catch (_err) {
 resolve([...this.fallbackAnalyses]);
 }
 });
 }

 async clearAnalyses() {
 this.fallbackAnalyses = [];
 const db = await this.openDb();
 if (!db) return true;

 return new Promise((resolve) => {
 try {
 const tx = db.transaction(this.config.stores.analyses, "readwrite");
 tx.objectStore(this.config.stores.analyses).clear();
 tx.oncomplete = () => resolve(true);
 tx.onerror = () => resolve(true);
 } catch (_err) {
 resolve(true);
 }
 });
 }
}
