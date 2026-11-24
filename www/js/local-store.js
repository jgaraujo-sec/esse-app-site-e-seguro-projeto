class LocalStore {
 constructor(config) {
 this.config = config || {};
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
 const dbName = this.config.dbName || "esse_app_site_seguro_local_db_v2";
 const dbVersion = this.config.dbVersion || 1;
 const request = indexedDB.open(dbName, dbVersion);

 request.onupgradeneeded = (event) => {
 try {
 const db = event.target ? event.target.result : null;
 if (!db) return;
 const analysesStore = (this.config.stores && this.config.stores.analyses) || "analyses";
 const tempStore = (this.config.stores && this.config.stores.tempBuffers) || "temp_buffers";
 if (!db.objectStoreNames.contains(analysesStore)) {
 db.createObjectStore(analysesStore, {
 keyPath: "id",
 autoIncrement: true
 });
 }
 if (!db.objectStoreNames.contains(tempStore)) {
 db.createObjectStore(tempStore, {
 keyPath: "tempId"
 });
 }
 } catch (_err) {}
 };

 request.onsuccess = (event) => resolve(event.target ? event.target.result : null);
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
 ...(metadata || {})
 };
 this.fallbackTemps.set(tempId, record);

 const db = await this.openDb();
 if (!db) return record;

 return new Promise((resolve) => {
 try {
 const storeName = (this.config.stores && this.config.stores.tempBuffers) || "temp_buffers";
 const tx = db.transaction(storeName, "readwrite");
 tx.objectStore(storeName).put(record);
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
 const storeName = (this.config.stores && this.config.stores.tempBuffers) || "temp_buffers";
 const tx = db.transaction(storeName, "readwrite");
 tx.objectStore(storeName).delete(tempId);
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
 const storeName = (this.config.stores && this.config.stores.tempBuffers) || "temp_buffers";
 const tx = db.transaction(storeName, "readwrite");
 const store = tx.objectStore(storeName);
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
 ...(entry || {})
 };

 this.fallbackAnalyses.unshift(record);
 if (this.fallbackAnalyses.length > 100) {
 this.fallbackAnalyses.length = 100;
 }

 const db = await this.openDb();
 if (!db) return record;

 return new Promise((resolve) => {
 try {
 const storeName = (this.config.stores && this.config.stores.analyses) || "analyses";
 const tx = db.transaction(storeName, "readwrite");
 const addReq = tx.objectStore(storeName).add(record);
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
 const storeName = (this.config.stores && this.config.stores.analyses) || "analyses";
 const tx = db.transaction(storeName, "readonly");
 const req = tx.objectStore(storeName).getAll();
 req.onsuccess = () => {
 const rows = Array.isArray(req.result) ? req.result : [];
 resolve(rows.sort((a, b) => (((b && b.id) || 0) - ((a && a.id) || 0))));
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
 const storeName = (this.config.stores && this.config.stores.analyses) || "analyses";
 const tx = db.transaction(storeName, "readwrite");
 tx.objectStore(storeName).clear();
 tx.oncomplete = () => resolve(true);
 tx.onerror = () => resolve(true);
 } catch (_err) {
 resolve(true);
 }
 });
 }
}
