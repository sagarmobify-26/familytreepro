import React, { useState } from 'react';
import {
  Search,
  Share2,
  UserPlus,
  Crown,
  LogOut,
  ChevronDown,
  Download,
  Users,
  Eye,
  Check,
  Cloud,
  CloudOff,
  RefreshCw,
} from 'lucide-react';
import { useFamily } from '../../store/familyContext';

export const TopBar: React.FC = () => {
  const {
    currentUser,
    members,
    openAddRelativeModal,
    searchQuery,
    setSearchQuery,
    searchResults,
    openProfileDrawer,
    setCurrentView,
    logoutToLogin,
    exportJSON,
    isReadOnly,
    cloudSyncStatus,
  } = useFamily();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const totalMembers = Object.keys(members).length;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleSelectSearchResult = (memberId: string) => {
    const m = members[memberId];
    if (m) {
      setCurrentView('visualizer');
      openProfileDrawer(m);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="app-topbar">
      {/* Heritage Info Left */}
      <div className="topbar-left">
        <div>
          <h2 className="topbar-vault-title">Shah Family Heritage</h2>
          <div className="topbar-meta-row">
            <span className="meta-badge-generation">4 Generations</span>
            <span className="meta-divider">•</span>
            <span className="meta-member-count">{totalMembers} Members Recorded</span>
          </div>
        </div>
      </div>

      {/* Center Search */}
      <div className="topbar-center">
        <div className="topbar-search-box">
          <Search size={15} className="topbar-search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search vault archives, members, roles..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
          />

          {showSearchResults && searchResults.length > 0 && (
            <div
              className="topbar-search-results animate-fade-in"
              onMouseLeave={() => setShowSearchResults(false)}
            >
              <div className="search-header-label">Archived Members ({searchResults.length})</div>
              {searchResults.map((m) => (
                <div
                  key={m.id}
                  className="search-row-item"
                  onClick={() => handleSelectSearchResult(m.id)}
                >
                  <div className="search-row-avatar">
                    {m.profileImage ? (
                      <img src={m.profileImage} alt={m.firstName} />
                    ) : (
                      <span>{m.firstName[0]}</span>
                    )}
                  </div>
                  <div className="search-row-meta">
                    <span className="search-row-name">
                      {m.firstName} {m.lastName}
                    </span>
                    <span className="search-row-role">{m.roleTitle || m.gender}</span>
                  </div>
                  {m.isFamilyHead && <Crown size={12} className="text-amber-500 ml-auto" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="topbar-right">
        {!isReadOnly && (
          <button
            type="button"
            className="btn-topbar-primary"
            onClick={() => openAddRelativeModal()}
          >
            <UserPlus size={15} />
            <span>+ Add Member</span>
          </button>
        )}

        <button
          type="button"
          className="btn-topbar-ghost"
          onClick={handleShare}
          title="Copy vault share link"
        >
          {copiedShare ? <Check size={15} className="text-emerald-500" /> : <Share2 size={15} />}
          <span>{copiedShare ? 'Copied Link' : 'Share Tree'}</span>
        </button>

        {/* Firebase Cloud Sync Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            cloudSyncStatus === 'connected'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : cloudSyncStatus === 'syncing'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}
          title={
            cloudSyncStatus === 'connected'
              ? 'Firestore Realtime Sync Active (famil-c137b)'
              : cloudSyncStatus === 'syncing'
              ? 'Connecting to Firestore...'
              : 'Local Vault Active (Offline)'
          }
        >
          {cloudSyncStatus === 'connected' ? (
            <Cloud size={13} className="text-emerald-600" />
          ) : cloudSyncStatus === 'syncing' ? (
            <RefreshCw size={13} className="text-indigo-600 animate-spin" />
          ) : (
            <CloudOff size={13} className="text-amber-600" />
          )}
          <span className="text-[11px] capitalize">{cloudSyncStatus}</span>
        </div>

        {/* User Profile Pill */}
        <div className="profile-pill-wrapper">
          <div
            className="topbar-profile-pill"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-pill-avatar">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} />
              ) : (
                <span>{currentUser.name[0]}</span>
              )}
              {currentUser.role === 'head' && <Crown size={10} className="pill-crown" />}
            </div>
            <div className="profile-pill-meta">
              <span className="profile-pill-name">{currentUser.name}</span>
              <span className="profile-pill-role">{currentUser.roleTitle}</span>
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-1" />
          </div>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div
              className="profile-dropdown-menu animate-fade-in"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div className="dropdown-user-header">
                <span className="font-semibold text-slate-900 text-xs">{currentUser.name}</span>
                <span className="text-[11px] text-slate-500">{currentUser.email}</span>
                <div className="role-tag-pill mt-1">Role: {currentUser.roleTitle}</div>
              </div>

              <div className="menu-divider" />

              <button
                type="button"
                className="dropdown-menu-item"
                onClick={() => {
                  const json = exportJSON();
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `shah-family-archive-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  setShowProfileMenu(false);
                }}
              >
                <Download size={14} />
                <span>Export Archival Vault</span>
              </button>

              <button
                type="button"
                className="dropdown-menu-item text-slate-700"
                onClick={() => {
                  setShowProfileMenu(false);
                  logoutToLogin();
                }}
              >
                <Users size={14} />
                <span>Switch Role / Account</span>
              </button>

              <div className="menu-divider" />

              <button
                type="button"
                className="dropdown-menu-item text-rose-600"
                onClick={() => {
                  setShowProfileMenu(false);
                  logoutToLogin();
                }}
              >
                <LogOut size={14} />
                <span>Sign Out of Vault</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
