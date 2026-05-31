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
      apiKey: "AIzaSyA7va9BnXu_S7D_cWbscTDmgI0_f32A9Xg",
      authDomain: "saferoute-b6da1.firebaseapp.com",
      databaseURL: "https://saferoute-b6da1-default-rtdb.firebaseio.com/",
      projectId: "saferoute-b6da1",
      storageBucket: "saferoute-b6da1.firebasestorage.app",
      messagingSenderId: "305708394031",
      appId: "1:305708394031:web:938ca986151b4d117948da"
    };

    // Prevent duplicate initialization
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
  }


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


  reset(path: string) {
    return remove(ref(this.db, path));
  }

  getDB() {
    return this.db;
  }
}
