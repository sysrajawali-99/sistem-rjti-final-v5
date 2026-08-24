import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch,
  Firestore 
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
});

// Initialize Firestore with specific databaseId if provided
export const db: Firestore = firebaseConfigJson.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  VENDORS: 'vendors',
  CUSTOMERS: 'customers',
  INVENTORY: 'inventory',
  MRS: 'material_requests',
  POS: 'purchase_orders',
  DOS: 'delivery_orders',
  INVOICES: 'invoices',
  PAYABLES: 'payables',
  RECEIVABLES: 'receivables',
  BANK_ACCOUNTS: 'bank_accounts',
  CASH_TRANSACTIONS: 'cash_transactions',
  RETURS: 'returs',
  AUDIT_LOGS: 'audit_logs',
} as const;

/**
 * Real-time listener for any Firestore collection
 */
export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as T);
        });
        onUpdate(items);
      },
      (err) => {
        console.error(`[Firebase] Snapshot error for ${collectionName}:`, err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.error(`[Firebase] Failed to subscribe to ${collectionName}:`, err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Save / Update a single document in Firestore
 */
export async function saveDocToFirestore<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (err) {
    console.error(`[Firebase] Failed to save document to ${collectionName}:`, err);
    throw err;
  }
}

/**
 * Delete a document from Firestore
 */
export async function deleteDocFromFirestore(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`[Firebase] Failed to delete document ${docId} from ${collectionName}:`, err);
    throw err;
  }
}

/**
 * Batch save multiple documents
 */
export async function batchSaveToFirestore<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  if (items.length === 0) return;
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error(`[Firebase] Batch save failed for ${collectionName}:`, err);
    throw err;
  }
}

/**
 * Clear all documents in a collection
 */
export async function clearFirestoreCollection(collectionName: string): Promise<void> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return;
    
    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (err) {
    console.error(`[Firebase] Clear collection failed for ${collectionName}:`, err);
    throw err;
  }
}
