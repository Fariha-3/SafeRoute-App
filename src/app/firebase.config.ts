import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA7va9BnXu_S7D_cWbscTDmgI0_f32A9Xg",
  authDomain: "saferoute-b6da1.firebaseapp.com",
  databaseURL: "https://saferoute-b6da1-default-rtdb.firebaseio.com/",
  projectId: "saferoute-b6da1",
  storageBucket: "saferoute-b6da1.firebasestorage.app",
  messagingSenderId: "305708394031",
  appId: "1:305708394031:web:938ca986151b4d117948da"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);