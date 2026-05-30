import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  listenToAuthChanges(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  async register(name: string, email: string, password: string): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await set(ref(db, `users/${user.uid}`), {
      uid: user.uid,
      name: name,
      email: email,
      reportCount: 0,
      verifiedReportCount: 0,
      upvotesReceived: 0,
      safetyScore: 0,
      createdAt: Date.now()
    });
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async getUserProfile(uid: string): Promise<any> {
    const snapshot = await get(ref(db, `users/${uid}`));

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return null;
  }

  async getCurrentUserProfile(): Promise<any> {
    const user = this.getCurrentUser();

    if (!user) {
      return null;
    }

    return this.getUserProfile(user.uid);
  }
}