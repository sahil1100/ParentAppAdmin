import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Generate a random 6-character uppercase alphanumeric code (excluding ambiguous chars)
 */
export function generateRandomCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Ensures code uniqueness by checking against admins collection
 */
export async function getUniqueAdminCode() {
  let unique = false;
  let code = '';
  let attempts = 0;
  const maxAttempts = 10;

  while (!unique && attempts < maxAttempts) {
    attempts++;
    code = generateRandomCode(6);
    const q = query(collection(db, 'admins'), where('uniqueCode', '==', code));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      unique = true;
    }
  }

  if (!unique) {
    // If 6 chars had too many collisions, generate 8 chars
    code = generateRandomCode(8);
  }
  return code;
}

/**
 * Register admin and assign a unique pairing code
 */
export async function registerAdmin(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;
  const uniqueCode = await getUniqueAdminCode();

  const adminData = {
    email: email.trim().toLowerCase(),
    uniqueCode,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'admins', uid), adminData);
  return { user: userCredential.user, profile: adminData };
}

/**
 * Sign in admin
 */
export async function loginAdmin(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const profileDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
  return { 
    user: userCredential.user, 
    profile: profileDoc.exists() ? profileDoc.data() : null 
  };
}

/**
 * Sign out current admin
 */
export async function logoutAdmin() {
  return await firebaseSignOut(auth);
}

/**
 * Get current admin profile
 */
export async function getAdminProfile(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, 'admins', uid));
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}
