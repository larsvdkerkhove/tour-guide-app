import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

export async function loginAdmin(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutAdmin() {
  return signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
