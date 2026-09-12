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
const USERS_COLLECTION = 'users';

export interface VaultDocument {
  id: string;
  ownerUid: string;
  vaultName: string;
  headId: string;
  members: Record<string, FamilyMember>;
  relationships: FamilyRelationship[];
  updatedAt?: any;
}

export interface UserProfileDocument {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  vaultId: string;
  createdAt?: any;
}

// ---------------------------------------------------------------------------
// Non-blocking Authentication & User Profile Services
// ---------------------------------------------------------------------------

export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string,
  role: UserRole = 'head'
): Promise<{ user: User; vaultId: string }> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = credential.user;

  if (displayName) {
    try {
      await updateProfile(user, { displayName });
    } catch {}
  }

  const vaultId = `vault_${user.uid}`;

  // Asynchronously record user profile & seed personal vault without blocking login redirect
  const name = displayName || email.split('@')[0];
  setDoc(
    doc(db, USERS_COLLECTION, user.uid),
    {
      uid: user.uid,
      email,
      displayName: name,
      role,
      vaultId,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  ).catch((err) => console.warn('User profile write notice:', err));

  initializePersonalVault(user.uid, vaultId, name, email).catch((err) =>
    console.warn('Vault init notice:', err)
  );

  return { user, vaultId };
}

export async function signInWithEmail(
  email: string,
  pass: string
): Promise<{ user: User; vaultId: string; role: UserRole }> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  const user = credential.user;
  const vaultId = `vault_${user.uid}`;
  const role: UserRole = 'head';

  // Asynchronously ensure user profile and vault exist in the background
  const name = user.displayName || email.split('@')[0];
  setDoc(
    doc(db, USERS_COLLECTION, user.uid),
    {
      uid: user.uid,
      email: user.email || email,
      displayName: name,
      role,
      vaultId,
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  ).catch(() => {});

  initializePersonalVault(user.uid, vaultId, name, user.email || email).catch(() => {});

  return { user, vaultId, role };
}

export async function logOutFirebase(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ---------------------------------------------------------------------------
// Personalized Vault Initialization
// ---------------------------------------------------------------------------

export async function initializePersonalVault(
  uid: string,
  vaultId: string,
  fullName: string,
  email: string
): Promise<void> {
  const vaultRef = doc(db, VAULT_COLLECTION, vaultId);

  // Use a timeout so network delays don't hang execution
  const snapPromise = getDoc(vaultRef);
  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
  const snap = await Promise.race([snapPromise, timeoutPromise]);

  if (!snap || !snap.exists()) {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Me';
    const lastName = nameParts.slice(1).join(' ') || '';
    const familyName = lastName ? `${lastName} Family Heritage` : `${firstName}'s Family Heritage`;

    const headMemberId = `mem_${uid.substring(0, 8)}`;
    const headMember: FamilyMember = {
      id: headMemberId,
      firstName,
      lastName,
      gender: 'female',
      roleTitle: 'Family Head',
      isFamilyHead: true,
      email,
      bio: `Family Head of the ${familyName}.`,
    };

    await setDoc(
      vaultRef,
      {
        id: vaultId,
        ownerUid: uid,
        vaultName: familyName,
        headId: headMemberId,
        members: {
          [headMemberId]: headMember,
        },
        relationships: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

// ---------------------------------------------------------------------------
// Firestore Realtime Sync Services (Scoped per Vault)
// ---------------------------------------------------------------------------

export function subscribeToVaultData(
  vaultId: string,
  onData: (data: VaultDocument) => void,
  onError: (err: Error) => void
) {
  if (!vaultId) return () => {};

  const vaultRef = doc(db, VAULT_COLLECTION, vaultId);

  return onSnapshot(
    vaultRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as VaultDocument;
        onData(data);
      } else {
        onError(new Error('VAULT_NOT_FOUND'));
      }
    },
    (error) => {
      console.warn(`Firestore subscription notice for ${vaultId}:`, error);
      onError(error);
    }
  );
}

export async function saveVaultToFirestore(
  vaultId: string,
  members: Record<string, FamilyMember>,
  relationships: FamilyRelationship[],
  headId: string,
  vaultName?: string
): Promise<void> {
  if (!vaultId) return;

  const vaultRef = doc(db, VAULT_COLLECTION, vaultId);
  const payload: any = {
    headId,
    members,
    relationships,
    updatedAt: serverTimestamp(),
  };

  if (vaultName) {
    payload.vaultName = vaultName;
  }

  await setDoc(vaultRef, payload, { merge: true });
}
