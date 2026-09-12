import React, { useState } from 'react';
import { Search, UserCheck, GitFork, ArrowLeft, Calendar, MapPin, Mail, Phone, Crown } from 'lucide-react';
import { useFamily } from '../../store/familyContext';

export const DirectoryView: React.FC = () => {
  const { members, setCurrentView, openProfileDrawer } = useFamily();
  const [filterGen, setFilterGen] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const memberList = Object.values(members);

  const filteredMembers = memberList.filter((m) => {
    const matchesSearch =
      m.firstName.toLowerCase().includes(search.toLowerCase()) ||
      m.lastName.toLowerCase().includes(search.toLowerCase()) ||
      (m.roleTitle && m.roleTitle.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterGen === 'all') return true;
    if (filterGen === 'gen1') return m.roleTitle?.includes('Gen I');
    if (filterGen === 'gen2') return m.roleTitle?.includes('Gen II');
    if (filterGen === 'gen3') return m.roleTitle?.includes('Gen III');
    if (filterGen === 'gen4') return m.roleTitle?.includes('Gen IV');
    return true;
  });

  const handleOpenInTree = (m: any) => {
    setCurrentView('visualizer');
    openProfileDrawer(m);
  };

  return (
    <div className="directory-view-page animate-fade-in">
      <div className="directory-container">
        {/* Header */}
        <div className="directory-header-row">
          <div>
            <button
              type="button"
              className="btn-back-link mb-2"
              onClick={() => setCurrentView('dashboard')}
            >
              <ArrowLeft size={15} />
              <span>Back to Family Vault</span>
            </button>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              Family Directory & Archives
            </h2>
            <p className="text-sm text-slate-500">
              Browse complete historical roster across 4 generations of the Shah lineage.
            </p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => setCurrentView('visualizer')}
          >
            <GitFork size={16} />
            <span>Open Interactive Tree</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="directory-filter-bar">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              className="form-input pl-9"
              placeholder="Search member by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Members' },
              { id: 'gen1', label: 'Gen I (Founders)' },
              { id: 'gen2', label: 'Gen II' },
              { id: 'gen3', label: 'Gen III' },
              { id: 'gen4', label: 'Gen IV' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`filter-pill ${filterGen === tab.id ? 'active' : ''}`}
                onClick={() => setFilterGen(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Members Grid */}
        <div className="directory-members-grid">
          {filteredMembers.map((m) => (
            <div key={m.id} className="directory-member-card">
              <div className="flex items-start gap-3">
                <div className="dir-avatar">
                  {m.profileImage ? (
                    <img src={m.profileImage} alt={m.firstName} />
                  ) : (
                    <span>{m.firstName[0]}</span>
                  )}
                  {m.isFamilyHead && <Crown size={11} className="dir-crown" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="dir-name font-heading">
                    {m.firstName} {m.lastName}
                  </h4>
                  <span className="dir-role">{m.roleTitle || m.gender}</span>

                  <div className="dir-meta-items mt-2 space-y-1">
                    {m.dateOfBirth && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={12} className="text-slate-400" />
                        <span>Born {new Date(m.dateOfBirth).getFullYear()}</span>
                      </div>
                    )}
                    {m.address && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{m.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="dir-card-footer mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  className="btn-dir-inspect"
                  onClick={() => openProfileDrawer(m)}
                >
                  <UserCheck size={13} />
                  <span>Dossier</span>
                </button>

                <button
                  type="button"
                  className="btn-dir-tree"
                  onClick={() => handleOpenInTree(m)}
                >
                  <GitFork size={13} />
                  <span>View in Tree</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
