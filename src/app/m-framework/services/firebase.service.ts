import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';

import {
  getDatabase,
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue,
  DataSnapshot
} from 'firebase/database';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {

  db: any;

  constructor() {
    this.setupFirebase();
    this.db = getDatabase();
  }

  setupFirebase() {

    const firebaseConfig = {
      apiKey: "AIzaSyBRQfpDaYHE13csiKUXxTYoqWl5uRLIFZQ",
      authDomain: "saferouteapp-59c78.firebaseapp.com",
      databaseURL: "https://saferouteapp-59c78-default-rtdb.firebaseio.com",
      projectId: "saferouteapp-59c78",
      storageBucket: "saferouteapp-59c78.firebasestorage.app",
      messagingSenderId: "790596163257",
      appId: "1:790596163257:web:7f67374852516d58706d68"
    };

    // Prevent duplicate initialization
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
  }

  // ---------------- CRUD ----------------

  create(path: string, data: any): Promise<void> {
    return set(ref(this.db, path), data);
  }

  async retrieve(path: string, key: string): Promise<DataSnapshot> {
    return await get(ref(this.db, `${path}/${key}`));
  }

  update(path: string, key: string, data: any): Promise<void> {
    return update(ref(this.db, `${path}/${key}`), data);
  }

  delete(path: string, key: string): Promise<void> {
    return remove(ref(this.db, `${path}/${key}`));
  }

  // ---------------- LISTS ----------------

  pushToList(path: string, data: any) {
    return push(ref(this.db, path), data).key;
  }

  deleteFromList(path: string, key: string) {
    return this.delete(path, key);
  }

  async getList(path: string): Promise<any[]> {

    const snapshot = await get(ref(this.db, path));

    const list: any[] = [];

    snapshot.forEach(item => {
      list.push({
        id: item.key,
        ...item.val()
      });
    });

    return list;
  }

  // ---------------- REALTIME LISTENER ----------------

  listenToList(path: string, callback: (data: any[]) => void) {

    onValue(ref(this.db, path), (snapshot) => {

      const list: any[] = [];

      snapshot.forEach(item => {
        list.push({
          id: item.key,
          ...item.val()
        });
      });

      callback(list);
    });
  }

  // ---------------- HELPERS ----------------

  reset(path: string) {
    return remove(ref(this.db, path));
  }

  getDB() {
    return this.db;
  }
}
