import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { FamilyMember, FamilyRelationship } from '../types/family';
import { UserRole } from '../types/auth';

const VAULT_COLLECTION = 'vaults';
const DEFAULT_VAULT_ID = 'shah-family-archive';

export interface VaultDocument {
  vaultName: string;
  headId: string;
  members: Record<string, FamilyMember>;
  relationships: FamilyRelationship[];
  updatedAt?: any;
}

// ---------------------------------------------------------------------------
// Authentication Services (Email/Password)
// ---------------------------------------------------------------------------

export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string,
  role: UserRole = 'head'
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }

  // Record user role profile in Firestore users collection
  try {
    await setDoc(doc(db, 'users', credential.user.uid), {
      email,
      displayName,
      role,
      createdAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Could not write user profile to Firestore:', err);
  }

  return credential.user;
}

export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return credential.user;
}

export async function logOutFirebase(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ---------------------------------------------------------------------------
// Firestore Vault Realtime Sync Services
// ---------------------------------------------------------------------------

export function subscribeToVaultData(
  vaultId = DEFAULT_VAULT_ID,
  onData: (data: VaultDocument) => void,
  onError: (err: Error) => void
) {
  const vaultRef = doc(db, VAULT_COLLECTION, vaultId);

  return onSnapshot(
    vaultRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as VaultDocument;
        onData(data);
      } else {
        // Vault does not exist yet; we can seed it
        onError(new Error('VAULT_NOT_FOUND'));
      }
    },
    (error) => {
      console.warn('Firestore subscription notice (using local cache fallback):', error);
      onError(error);
    }
  );
}

export async function saveVaultToFirestore(
  members: Record<string, FamilyMember>,
  relationships: FamilyRelationship[],
  headId: string,
  vaultId = DEFAULT_VAULT_ID
): Promise<void> {
  const vaultRef = doc(db, VAULT_COLLECTION, vaultId);
  await setDoc(
    vaultRef,
    {
      vaultName: 'Shah Family Archive',
      headId,
      members,
      relationships,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function seedInitialVault(
  members: Record<string, FamilyMember>,
  relationships: FamilyRelationship[],
  headId: string,
  vaultId = DEFAULT_VAULT_ID
): Promise<void> {
  const vaultRef = doc(db, VAULT_COLLECTION, vaultId);
  const snap = await getDoc(vaultRef);
  if (!snap.exists()) {
    await setDoc(vaultRef, {
      vaultName: 'Shah Family Archive',
      headId,
      members,
      relationships,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}
