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
  seedInitialVault,
} from '../services/firebaseService';

const STORAGE_KEY = 'kintree_family_vault_v3';

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

  // Data Mutations
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
  // Initialize state from local cache
  const [members, setMembers] = useState<Record<string, FamilyMember>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_members');
      return saved ? JSON.parse(saved) : initialMembers;
    } catch {
      return initialMembers;
    }
  });

  const [relationships, setRelationships] = useState<FamilyRelationship[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_rels');
      return saved ? JSON.parse(saved) : initialRelationships;
    } catch {
      return initialRelationships;
    }
  });

  const [headId, setHeadId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_head');
      return saved || 'mem-3'; // Rajendra Shah (Family Head)
    } catch {
      return 'mem-3';
    }
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_view');
      return (saved as AppView) || 'login';
    } catch {
      return 'login';
    }
  });

  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'mem-3',
      name: 'Rajendra Shah',
      role: 'head',
      roleTitle: 'Family Head',
      email: 'rajendra.shah@kintree.org',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      branchName: 'Ahmedabad Main Vault',
    };
  });

  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('syncing');

  // UI state
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [memberToAddRelativeTo, setMemberToAddRelativeTo] = useState<FamilyMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);
  const [isDrawerEditing, setIsDrawerEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isSavingToCloud = useRef(false);

  // 1. Subscribe to Firebase Auth State
  useEffect(() => {
    const unsub = subscribeToAuth((firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser((prev) => ({
          ...prev,
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || prev.name,
          email: firebaseUser.email || prev.email,
        }));
      }
    });
    return () => unsub();
  }, []);

  // 2. Real-time Firestore Vault Sync
  useEffect(() => {
    setCloudSyncStatus('syncing');

    const unsubscribe = subscribeToVaultData(
      'shah-family-archive',
      (cloudData) => {
        if (!isSavingToCloud.current) {
          if (cloudData.members && Object.keys(cloudData.members).length > 0) {
            setMembers(cloudData.members);
          }
          if (cloudData.relationships) {
            setRelationships(cloudData.relationships);
          }
          if (cloudData.headId) {
            setHeadId(cloudData.headId);
          }
        }
        setCloudSyncStatus('connected');
      },
      async (err) => {
        if (err.message === 'VAULT_NOT_FOUND') {
          // Auto-seed vault on first cloud setup
          try {
            await seedInitialVault(initialMembers, initialRelationships, 'mem-3');
            setCloudSyncStatus('connected');
          } catch (seedErr) {
            console.warn('Vault auto-seeding deferred:', seedErr);
            setCloudSyncStatus('offline');
          }
        } else {
          setCloudSyncStatus('offline');
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Local Cache Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_members', JSON.stringify(members));
      localStorage.setItem(STORAGE_KEY + '_rels', JSON.stringify(relationships));
      localStorage.setItem(STORAGE_KEY + '_head', headId);
      localStorage.setItem(STORAGE_KEY + '_view', currentView);
      localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(currentUser));
    } catch (e) {
      console.error('Failed to save to local cache', e);
    }
  }, [members, relationships, headId, currentView, currentUser]);

  const familyHead = members[headId] || null;
  const isReadOnly = currentUser.role === 'viewer';

  // Helper to persist updates to Firestore
  const syncChangeToCloud = async (
    nextMembers: Record<string, FamilyMember>,
    nextRels: FamilyRelationship[],
    nextHead: string
  ) => {
    isSavingToCloud.current = true;
    try {
      await saveVaultToFirestore(nextMembers, nextRels, nextHead);
      setCloudSyncStatus('connected');
    } catch (err) {
      console.warn('Cloud sync error (persisted locally):', err);
      setCloudSyncStatus('offline');
    } finally {
      setTimeout(() => {
        isSavingToCloud.current = false;
      }, 500);
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

  // Auth Handlers
  const handleEmailLogin = async (email: string, pass: string) => {
    const user = await signInWithEmail(email, pass);
    setCurrentUser((prev) => ({
      ...prev,
      id: user.uid,
      name: user.displayName || email.split('@')[0],
      email: user.email || email,
    }));
    setCurrentView('dashboard');
  };

  const handleEmailSignUp = async (email: string, pass: string, name: string, role: UserRole) => {
    const user = await signUpWithEmail(email, pass, name, role);
    const roleTitle =
      role === 'head'
        ? 'Family Head'
        : role === 'contributor'
        ? 'Branch Contributor'
        : 'Family Viewer';

    setCurrentUser({
      id: user.uid,
      name: name || email.split('@')[0],
      role,
      roleTitle,
      email: user.email || email,
      branchName: 'Shah Family Archive',
    });
    setCurrentView('dashboard');
  };

  const loginWithRole = (role: UserRole, personaMemberId?: string) => {
    const targetId =
      personaMemberId ||
      (role === 'head' ? 'mem-3' : role === 'contributor' ? 'mem-7' : 'mem-13');

    const m = members[targetId] || members['mem-3'];
    const roleTitle =
      role === 'head'
        ? 'Family Head'
        : role === 'contributor'
        ? 'Branch Contributor'
        : 'Family Viewer';

    const user: UserSession = {
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      role,
      roleTitle,
      email: m.email || `${m.firstName.toLowerCase()}@kintree.org`,
      avatarUrl: m.profileImage,
      branchName: role === 'contributor' ? 'Mumbai Branch' : 'Shah Family Heritage',
    };

    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const logoutToLogin = async () => {
    try {
      await logOutFirebase();
    } catch {}
    setCurrentView('login');
  };

  const loginAsFamilyHead = (memberId: string) => {
    if (members[memberId]) {
      setHeadId(memberId);
      loginWithRole('head', memberId);
    }
  };

  // Modal controls
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

  // Add Member Relative to Existing Node
  const addMemberRelative = (
    data: Omit<FamilyMember, 'id'>,
    relativeToId: string,
    relativeType: RelativeTypeOption
  ): FamilyMember => {
    if (isReadOnly) throw new Error('Read-only permissions');

    const newId = 'mem-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const newMember: FamilyMember = { ...data, id: newId };
    const newRels: FamilyRelationship[] = [];

    if (relativeType === 'child') {
      newRels.push({
        id: `rel-${Date.now()}-1`,
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
          id: `rel-${Date.now()}-2`,
          sourceMemberId: spouseId,
          targetMemberId: newId,
          type: 'parent',
        });
      }
    } else if (relativeType === 'spouse') {
      newRels.push({
        id: `rel-${Date.now()}-spouse`,
        sourceMemberId: relativeToId,
        targetMemberId: newId,
        type: 'spouse',
      });
    } else if (relativeType === 'parent') {
      newRels.push({
        id: `rel-${Date.now()}-parent`,
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
            id: `rel-${Date.now()}-sib-${index}`,
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
    const newId = 'mem-' + Date.now().toString(36);
    const newMember: FamilyMember = { ...data, id: newId };
    const nextMembers = { ...members, [newId]: newMember };

    setMembers(nextMembers);
    closeAddModal();

    syncChangeToCloud(nextMembers, relationships, headId);
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
      id: `rel-${Date.now()}`,
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
    return JSON.stringify({ members, relationships, headId, version: '5.3-firebase' }, null, 2);
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
