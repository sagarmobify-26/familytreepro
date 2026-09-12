import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  FamilyMember,
  FamilyRelationship,
  RelativeTypeOption,
  RelationshipType,
} from '../types/family';
import { UserRole, AppView, UserSession } from '../types/auth';
import { initialMembers, initialRelationships } from '../data/initialFamily';
import {
  signInWithEmail,
  signUpWithEmail,
  logOutFirebase,
  subscribeToAuth,
  subscribeToVaultData,
  saveVaultToFirestore,
  initializePersonalVault,
} from '../services/firebaseService';

export type CloudSyncStatus = 'connected' | 'syncing' | 'offline';

interface FamilyContextType {
  members: Record<string, FamilyMember>;
  relationships: FamilyRelationship[];
  familyHead: FamilyMember | null;
  selectedMember: FamilyMember | null;
  memberToAddRelativeTo: FamilyMember | null;
  isAddModalOpen: boolean;
  isProfileDrawerOpen: boolean;
  isDrawerEditing: boolean;
  searchQuery: string;
  searchResults: FamilyMember[];

  // Auth & View routing
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  currentUser: UserSession;
  activeRole: UserRole;
  isReadOnly: boolean;
  cloudSyncStatus: CloudSyncStatus;
  vaultName: string;

  // Firebase Email/Password Auth
  handleEmailLogin: (email: string, pass: string) => Promise<void>;
  handleEmailSignUp: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
  loginWithRole: (role: UserRole, personaMemberId?: string) => void;
  loginAsFamilyHead: (memberId: string) => void;
  logoutToLogin: () => Promise<void>;

  // Actions
  openAddRelativeModal: (relativeTo?: FamilyMember) => void;
  closeAddModal: () => void;
  openProfileDrawer: (member: FamilyMember, editMode?: boolean) => void;
  closeProfileDrawer: () => void;
  setSelectedMember: (member: FamilyMember | null) => void;
  setSearchQuery: (query: string) => void;

  // Data Mutations (Direct to Firestore)
  addMemberRelative: (
    data: Omit<FamilyMember, 'id'>,
    relativeToId: string,
    relativeType: RelativeTypeOption
  ) => FamilyMember;
  addStandaloneMember: (data: Omit<FamilyMember, 'id'>) => FamilyMember;
  updateMember: (member: FamilyMember) => void;
  deleteMember: (memberId: string) => void;
  addRelationship: (sourceId: string, targetId: string, type: RelationshipType) => void;
  removeRelationship: (relationshipId: string) => void;

  // Utilities
  resetTreeData: () => void;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => boolean;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Active User Session (persisted per session)
  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem('kintree_active_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: '',
      name: '',
      role: 'head',
      roleTitle: 'Family Head',
      email: '',
    };
  });

  const [activeVaultId, setActiveVaultId] = useState<string>(() => {
    try {
      return localStorage.getItem('kintree_active_vault_id') || '';
    } catch {
      return '';
    }
  });

  const [vaultName, setVaultName] = useState<string>('Family Heritage Vault');

  // In-memory Members & Relationships for the ACTIVE vault
  const [members, setMembers] = useState<Record<string, FamilyMember>>({});
  const [relationships, setRelationships] = useState<FamilyRelationship[]>([]);
  const [headId, setHeadId] = useState<string>('');

  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const saved = localStorage.getItem('kintree_view');
      return (saved as AppView) || 'login';
    } catch {
      return 'login';
    }
  });

  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('syncing');

  // UI modal states
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [memberToAddRelativeTo, setMemberToAddRelativeTo] = useState<FamilyMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);
  const [isDrawerEditing, setIsDrawerEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isSavingToCloud = useRef(false);

  // 1. Firebase Auth listener - Auto-redirects whenever an authenticated user is present
  useEffect(() => {
    const unsub = subscribeToAuth((firebaseUser) => {
      if (firebaseUser) {
        const expectedVaultId = `vault_${firebaseUser.uid}`;
        setActiveVaultId(expectedVaultId);
        localStorage.setItem('kintree_active_vault_id', expectedVaultId);

        const displayName =
          firebaseUser.displayName ||
          currentUser.name ||
          firebaseUser.email?.split('@')[0] ||
          'Family Head';

        const userSession: UserSession = {
          id: firebaseUser.uid,
          name: displayName,
          role: 'head',
          roleTitle: 'Family Head',
          email: firebaseUser.email || '',
        };

        setCurrentUser(userSession);
        localStorage.setItem('kintree_active_user', JSON.stringify(userSession));

        // Redirect immediately to dashboard on valid auth!
        setCurrentView((prev) => (prev === 'login' ? 'dashboard' : prev));
      } else {
        // If not logged in and not in demo mode
        const savedVault = localStorage.getItem('kintree_active_vault_id');
        if (!savedVault?.startsWith('demo_')) {
          setCurrentView((prev) => (prev === 'login' ? 'login' : 'login'));
        }
      }
    });
    return () => unsub();
  }, []);

  // 2. Real-time Firestore Vault Subscription (Scoped to activeVaultId)
  useEffect(() => {
    if (!activeVaultId) {
      setCloudSyncStatus('offline');
      return;
    }

    setCloudSyncStatus('syncing');

    // Handle demo vault locally
    if (activeVaultId === 'demo_shah_vault') {
      setMembers(initialMembers);
      setRelationships(initialRelationships);
      setHeadId('mem-3');
      setVaultName('Shah Family Heritage');
      setCloudSyncStatus('connected');
      return;
    }

    // Set default initial member for this user immediately so canvas is not empty while waiting for network
    if (currentUser.id && Object.keys(members).length === 0) {
      const nameParts = (currentUser.name || 'Me').trim().split(' ');
      const fName = nameParts[0] || 'Me';
      const lName = nameParts.slice(1).join(' ') || '';
      const fFamilyName = lName ? `${lName} Family Heritage` : `${fName}'s Family Heritage`;
      const fallbackHeadId = `mem_${currentUser.id.substring(0, 8)}`;

      setMembers({
        [fallbackHeadId]: {
          id: fallbackHeadId,
          firstName: fName,
          lastName: lName,
          gender: 'female',
          roleTitle: 'Family Head',
          isFamilyHead: true,
          email: currentUser.email,
        },
      });
      setHeadId(fallbackHeadId);
      setVaultName(fFamilyName);
    }

    const unsubscribe = subscribeToVaultData(
      activeVaultId,
      (vaultDoc) => {
        if (!isSavingToCloud.current) {
          if (vaultDoc.members && Object.keys(vaultDoc.members).length > 0) {
            setMembers(vaultDoc.members);
          }
          if (vaultDoc.relationships) {
            setRelationships(vaultDoc.relationships);
          }
          if (vaultDoc.headId) {
            setHeadId(vaultDoc.headId);
          }
          if (vaultDoc.vaultName) {
            setVaultName(vaultDoc.vaultName);
          }
        }
        setCloudSyncStatus('connected');
      },
      async (err) => {
        if (err.message === 'VAULT_NOT_FOUND' && currentUser.id) {
          try {
            await initializePersonalVault(
              currentUser.id,
              activeVaultId,
              currentUser.name || 'My Family',
              currentUser.email || ''
            );
            setCloudSyncStatus('connected');
          } catch {
            setCloudSyncStatus('offline');
          }
        } else {
          setCloudSyncStatus('offline');
        }
      }
    );

    return () => unsubscribe();
  }, [activeVaultId, currentUser.id, currentUser.name, currentUser.email]);

  // 3. Persist navigation view
  useEffect(() => {
    try {
      localStorage.setItem('kintree_view', currentView);
    } catch {}
  }, [currentView]);

  const familyHead = members[headId] || null;
  const isReadOnly = currentUser.role === 'viewer';

  // Cloud Sync Mutation Helper
  const syncChangeToCloud = async (
    nextMembers: Record<string, FamilyMember>,
    nextRels: FamilyRelationship[],
    nextHead: string
  ) => {
    if (!activeVaultId || activeVaultId.startsWith('demo_')) return;

    isSavingToCloud.current = true;
    try {
      await saveVaultToFirestore(activeVaultId, nextMembers, nextRels, nextHead, vaultName);
      setCloudSyncStatus('connected');
    } catch (err) {
      console.warn('Firestore sync error:', err);
      setCloudSyncStatus('offline');
    } finally {
      setTimeout(() => {
        isSavingToCloud.current = false;
      }, 400);
    }
  };

  // Search Results
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return Object.values(members).filter(
      (m) =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        (m.roleTitle && m.roleTitle.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q))
    );
  }, [members, searchQuery]);

  // ---------------------------------------------------------------------------
  // Auth Actions (Immediate Navigation)
  // ---------------------------------------------------------------------------

  const handleEmailLogin = async (email: string, pass: string) => {
    // Clear previous state
    setMembers({});
    setRelationships([]);

    const { user, vaultId, role } = await signInWithEmail(email, pass);

    const displayName = user.displayName || email.split('@')[0];
    const userSession: UserSession = {
      id: user.uid,
      name: displayName,
      role,
      roleTitle: role === 'head' ? 'Family Head' : role === 'contributor' ? 'Branch Contributor' : 'Family Viewer',
      email: user.email || email,
    };

    setCurrentUser(userSession);
    setActiveVaultId(vaultId);
    localStorage.setItem('kintree_active_user', JSON.stringify(userSession));
    localStorage.setItem('kintree_active_vault_id', vaultId);

    // Immediate view redirect!
    setCurrentView('dashboard');
  };

  const handleEmailSignUp = async (email: string, pass: string, name: string, role: UserRole) => {
    setMembers({});
    setRelationships([]);

    const { user, vaultId } = await signUpWithEmail(email, pass, name, role);

    const userSession: UserSession = {
      id: user.uid,
      name: name || email.split('@')[0],
      role,
      roleTitle: role === 'head' ? 'Family Head' : role === 'contributor' ? 'Branch Contributor' : 'Family Viewer',
      email: user.email || email,
    };

    setCurrentUser(userSession);
    setActiveVaultId(vaultId);
    localStorage.setItem('kintree_active_user', JSON.stringify(userSession));
    localStorage.setItem('kintree_active_vault_id', vaultId);

    // Immediate view redirect!
    setCurrentView('dashboard');
  };

  const loginWithRole = (role: UserRole, personaMemberId?: string) => {
    const targetId = personaMemberId || (role === 'head' ? 'mem-3' : role === 'contributor' ? 'mem-7' : 'mem-13');
    const m = initialMembers[targetId] || initialMembers['mem-3'];

    const userSession: UserSession = {
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      role,
      roleTitle: role === 'head' ? 'Family Head' : role === 'contributor' ? 'Branch Contributor' : 'Family Viewer',
      email: m.email || `${m.firstName.toLowerCase()}@kintree.org`,
      avatarUrl: m.profileImage,
      branchName: 'Shah Family Archive',
    };

    setCurrentUser(userSession);
    setActiveVaultId('demo_shah_vault');
    localStorage.setItem('kintree_active_user', JSON.stringify(userSession));
    localStorage.setItem('kintree_active_vault_id', 'demo_shah_vault');

    setCurrentView('dashboard');
  };

  const loginAsFamilyHead = (memberId: string) => {
    if (members[memberId]) {
      setHeadId(memberId);
      syncChangeToCloud(members, relationships, memberId);
    }
  };

  const logoutToLogin = async () => {
    try {
      await logOutFirebase();
    } catch {}

    setMembers({});
    setRelationships([]);
    setHeadId('');
    setActiveVaultId('');
    setCurrentUser({
      id: '',
      name: '',
      role: 'head',
      roleTitle: 'Family Head',
      email: '',
    });

    localStorage.removeItem('kintree_active_user');
    localStorage.removeItem('kintree_active_vault_id');
    setCurrentView('login');
  };

  // ---------------------------------------------------------------------------
  // Modal Navigation
  // ---------------------------------------------------------------------------

  const openAddRelativeModal = (relativeTo?: FamilyMember) => {
    if (isReadOnly) {
      alert('Family Viewers have read-only permissions.');
      return;
    }
    setMemberToAddRelativeTo(relativeTo || null);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setMemberToAddRelativeTo(null);
  };

  const openProfileDrawer = (member: FamilyMember, editMode = false) => {
    setSelectedMember(member);
    setIsDrawerEditing(editMode && !isReadOnly);
    setIsProfileDrawerOpen(true);
  };

  const closeProfileDrawer = () => {
    setIsProfileDrawerOpen(false);
    setIsDrawerEditing(false);
  };

  // ---------------------------------------------------------------------------
  // Data Mutations (Direct Firestore Sync)
  // ---------------------------------------------------------------------------

  const addMemberRelative = (
    data: Omit<FamilyMember, 'id'>,
    relativeToId: string,
    relativeType: RelativeTypeOption
  ): FamilyMember => {
    if (isReadOnly) throw new Error('Read-only permissions');

    const newId = 'mem_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const newMember: FamilyMember = { ...data, id: newId };
    const newRels: FamilyRelationship[] = [];

    if (relativeType === 'child') {
      newRels.push({
        id: `rel_${Date.now()}_1`,
        sourceMemberId: relativeToId,
        targetMemberId: newId,
        type: 'parent',
      });

      const spouseRel = relationships.find(
        (r) =>
          r.type === 'spouse' &&
          (r.sourceMemberId === relativeToId || r.targetMemberId === relativeToId)
      );
      if (spouseRel) {
        const spouseId =
          spouseRel.sourceMemberId === relativeToId
            ? spouseRel.targetMemberId
            : spouseRel.sourceMemberId;
        newRels.push({
          id: `rel_${Date.now()}_2`,
          sourceMemberId: spouseId,
          targetMemberId: newId,
          type: 'parent',
        });
      }
    } else if (relativeType === 'spouse') {
      newRels.push({
        id: `rel_${Date.now()}_spouse`,
        sourceMemberId: relativeToId,
        targetMemberId: newId,
        type: 'spouse',
      });
    } else if (relativeType === 'parent') {
      newRels.push({
        id: `rel_${Date.now()}_parent`,
        sourceMemberId: newId,
        targetMemberId: relativeToId,
        type: 'parent',
      });
    } else if (relativeType === 'sibling') {
      const parentRels = relationships.filter(
        (r) => r.type === 'parent' && r.targetMemberId === relativeToId
      );
      if (parentRels.length > 0) {
        parentRels.forEach((pr, index) => {
          newRels.push({
            id: `rel_${Date.now()}_sib_${index}`,
            sourceMemberId: pr.sourceMemberId,
            targetMemberId: newId,
            type: 'parent',
          });
        });
      }
    }

    const nextMembers = { ...members, [newId]: newMember };
    const nextRels = [...relationships, ...newRels];

    setMembers(nextMembers);
    setRelationships(nextRels);
    closeAddModal();

    syncChangeToCloud(nextMembers, nextRels, headId);
    return newMember;
  };

  const addStandaloneMember = (data: Omit<FamilyMember, 'id'>): FamilyMember => {
    if (isReadOnly) throw new Error('Read-only permissions');

    const newId = 'mem_' + Date.now().toString(36);
    const newMember: FamilyMember = { ...data, id: newId };
    const nextMembers = { ...members, [newId]: newMember };
    const nextHead = headId || newId;

    setMembers(nextMembers);
    if (!headId) setHeadId(newId);
    closeAddModal();

    syncChangeToCloud(nextMembers, relationships, nextHead);
    return newMember;
  };

  const updateMember = (updated: FamilyMember) => {
    if (isReadOnly) return;
    const nextMembers = { ...members, [updated.id]: updated };
    setMembers(nextMembers);
    if (selectedMember?.id === updated.id) {
      setSelectedMember(updated);
    }
    syncChangeToCloud(nextMembers, relationships, headId);
  };

  const deleteMember = (memberId: string) => {
    if (isReadOnly) return;
    const nextMembers = { ...members };
    delete nextMembers[memberId];

    const nextRels = relationships.filter(
      (r) => r.sourceMemberId !== memberId && r.targetMemberId !== memberId
    );

    setMembers(nextMembers);
    setRelationships(nextRels);

    if (selectedMember?.id === memberId) {
      closeProfileDrawer();
    }
    syncChangeToCloud(nextMembers, nextRels, headId);
  };

  const addRelationship = (sourceId: string, targetId: string, type: RelationshipType) => {
    if (isReadOnly) return;
    const newRel: FamilyRelationship = {
      id: `rel_${Date.now()}`,
      sourceMemberId: sourceId,
      targetMemberId: targetId,
      type,
    };
    const nextRels = [...relationships, newRel];
    setRelationships(nextRels);
    syncChangeToCloud(members, nextRels, headId);
  };

  const removeRelationship = (relationshipId: string) => {
    if (isReadOnly) return;
    const nextRels = relationships.filter((r) => r.id !== relationshipId);
    setRelationships(nextRels);
    syncChangeToCloud(members, nextRels, headId);
  };

  const resetTreeData = () => {
    setMembers(initialMembers);
    setRelationships(initialRelationships);
    setHeadId('mem-3');
    syncChangeToCloud(initialMembers, initialRelationships, 'mem-3');
  };

  const exportJSON = (): string => {
    return JSON.stringify({ vaultId: activeVaultId, vaultName, members, relationships, headId }, null, 2);
  };

  const importJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.members && parsed.relationships) {
        setMembers(parsed.members);
        setRelationships(parsed.relationships);
        if (parsed.headId) setHeadId(parsed.headId);
        syncChangeToCloud(parsed.members, parsed.relationships, parsed.headId || headId);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <FamilyContext.Provider
      value={{
        members,
        relationships,
        familyHead,
        selectedMember,
        memberToAddRelativeTo,
        isAddModalOpen,
        isProfileDrawerOpen,
        isDrawerEditing,
        searchQuery,
        searchResults,

        currentView,
        setCurrentView,
        currentUser,
        activeRole: currentUser.role,
        isReadOnly,
        cloudSyncStatus,
        vaultName,

        handleEmailLogin,
        handleEmailSignUp,
        loginWithRole,
        loginAsFamilyHead,
        logoutToLogin,

        openAddRelativeModal,
        closeAddModal,
        openProfileDrawer,
        closeProfileDrawer,
        setSelectedMember,
        setSearchQuery,
        addMemberRelative,
        addStandaloneMember,
        updateMember,
        deleteMember,
        addRelationship,
        removeRelationship,
        resetTreeData,
        exportJSON,
        importJSON,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) throw new Error('useFamily must be used within a FamilyProvider');
  return context;
};
