import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserPlus,
  Crown,
  Heart,
  Baby,
  Users,
  Save,
  CheckCircle,
} from 'lucide-react';
import { useFamily } from '../store/familyContext';
import { FamilyMember, Gender } from '../types/family';

export const MemberProfileDrawer: React.FC = () => {
  const {
    isProfileDrawerOpen,
    closeProfileDrawer,
    selectedMember,
    members,
    relationships,
    updateMember,
    deleteMember,
    openAddRelativeModal,
    setSelectedMember,
    loginAsFamilyHead,
    isReadOnly,
  } = useFamily();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<FamilyMember>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (selectedMember) {
      setFormData(selectedMember);
      setIsEditing(false);
      setConfirmDelete(false);
    }
  }, [selectedMember]);

  if (!isProfileDrawerOpen || !selectedMember) return null;

  // Calculate immediate relations
  const parents = relationships
    .filter((r) => r.type === 'parent' && r.targetMemberId === selectedMember.id)
    .map((r) => members[r.sourceMemberId])
    .filter(Boolean);

  const children = relationships
    .filter((r) => r.type === 'parent' && r.sourceMemberId === selectedMember.id)
    .map((r) => members[r.targetMemberId])
    .filter(Boolean);

  const spouse = relationships
    .filter(
      (r) =>
        r.type === 'spouse' &&
        (r.sourceMemberId === selectedMember.id || r.targetMemberId === selectedMember.id)
    )
    .map((r) =>
      r.sourceMemberId === selectedMember.id
        ? members[r.targetMemberId]
        : members[r.sourceMemberId]
    )
    .find(Boolean);

  // Find siblings (children who share at least one parent)
  const parentIds = new Set(parents.map((p) => p.id));
  const siblings = relationships
    .filter((r) => r.type === 'parent' && parentIds.has(r.sourceMemberId) && r.targetMemberId !== selectedMember.id)
    .map((r) => members[r.targetMemberId])
    .filter((m, idx, arr) => m && arr.findIndex((x) => x?.id === m.id) === idx);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName) return;
    updateMember({
      ...selectedMember,
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName ? formData.lastName.trim() : '',
    } as FamilyMember);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMember(selectedMember.id);
  };

  return (
    <div className="drawer-backdrop animate-fade-in" onClick={closeProfileDrawer}>
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-600">
              Member Details
            </span>
          </div>
          <button type="button" className="btn-close" onClick={closeProfileDrawer}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Member Hero Banner */}
          <div className="profile-hero">
            <div className="profile-avatar-box">
              {selectedMember.profileImage ? (
                <img
                  src={selectedMember.profileImage}
                  alt={selectedMember.firstName}
                  className="profile-avatar-img"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {selectedMember.firstName[0]}
                  {selectedMember.lastName[0]}
                </div>
              )}
              {selectedMember.isFamilyHead && (
                <div className="head-badge-pill">
                  <Crown size={12} className="text-amber-400" />
                  <span>Family Head</span>
                </div>
              )}
            </div>

            <div className="profile-title-area">
              <h2 className="profile-full-name">
                {selectedMember.firstName} {selectedMember.lastName}
              </h2>
              <p className="profile-subtitle">
                {selectedMember.roleTitle ||
                  (selectedMember.gender === 'male'
                    ? 'Male'
                    : selectedMember.gender === 'female'
                    ? 'Female'
                    : 'Member')}
              </p>
            </div>
          </div>

          {/* Quick Action Pills */}
          {!isReadOnly && (
            <div className="profile-quick-actions">
              <button
                type="button"
                className="btn-action-pill"
                onClick={() => {
                  closeProfileDrawer();
                  openAddRelativeModal(selectedMember);
                }}
              >
                <UserPlus size={14} className="text-indigo-600" />
                <span>+ Add Relative</span>
              </button>

              <button
                type="button"
                className={`btn-action-pill ${isEditing ? 'active' : ''}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 size={14} className="text-slate-600" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Info'}</span>
              </button>

              {!selectedMember.isFamilyHead && (
                <button
                  type="button"
                  className="btn-action-pill"
                  onClick={() => loginAsFamilyHead(selectedMember.id)}
                  title="Make Family Head"
                >
                  <Crown size={14} className="text-amber-500" />
                  <span>Make Head</span>
                </button>
              )}
            </div>
          )}

          {/* Edit Form Mode vs View Mode */}
          {isEditing ? (
            <form onSubmit={handleSave} className="edit-form-container animate-fade-in">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="grid-2-col">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={formData.gender || 'male'}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as Gender })
                    }
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Role Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.roleTitle || ''}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profile Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.profileImage || ''}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">About / Bio</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  <Save size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-view-details">
              {/* About / Bio */}
              {selectedMember.bio && (
                <div className="detail-section">
                  <h4 className="section-heading">Biography</h4>
                  <p className="bio-text">{selectedMember.bio}</p>
                </div>
              )}

              {/* Immediate Family Relations */}
              <div className="detail-section">
                <h4 className="section-heading">Lineage & Family Relations</h4>

                {/* Parents */}
                <div className="relation-row">
                  <div className="relation-label">
                    <Users size={14} className="text-indigo-500" />
                    <span>Parents</span>
                  </div>
                  <div className="relation-tags">
                    {parents.length > 0 ? (
                      parents.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="relation-chip"
                          onClick={() => setSelectedMember(p)}
                        >
                          {p.firstName} {p.lastName}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">None linked</span>
                    )}
                  </div>
                </div>

                {/* Spouse */}
                <div className="relation-row">
                  <div className="relation-label">
                    <Heart size={14} className="text-rose-500" />
                    <span>Spouse</span>
                  </div>
                  <div className="relation-tags">
                    {spouse ? (
                      <button
                        type="button"
                        className="relation-chip chip-spouse"
                        onClick={() => setSelectedMember(spouse)}
                      >
                        {spouse.firstName} {spouse.lastName}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Not recorded</span>
                    )}
                  </div>
                </div>

                {/* Children */}
                <div className="relation-row">
                  <div className="relation-label">
                    <Baby size={14} className="text-emerald-500" />
                    <span>Children</span>
                  </div>
                  <div className="relation-tags">
                    {children.length > 0 ? (
                      children.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="relation-chip"
                          onClick={() => setSelectedMember(c)}
                        >
                          {c.firstName} {c.lastName}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">None recorded</span>
                    )}
                  </div>
                </div>

                {/* Siblings */}
                <div className="relation-row">
                  <div className="relation-label">
                    <Users size={14} className="text-amber-500" />
                    <span>Siblings</span>
                  </div>
                  <div className="relation-tags">
                    {siblings.length > 0 ? (
                      siblings.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className="relation-chip"
                          onClick={() => setSelectedMember(s)}
                        >
                          {s.firstName} {s.lastName}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">None recorded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="detail-section">
                <h4 className="section-heading">Contact & Details</h4>
                <div className="contact-list">
                  {selectedMember.dateOfBirth && (
                    <div className="contact-item">
                      <Calendar size={15} className="text-slate-400" />
                      <span>{selectedMember.dateOfBirth}</span>
                    </div>
                  )}

                  {selectedMember.phone && (
                    <div className="contact-item">
                      <Phone size={15} className="text-slate-400" />
                      <a href={`tel:${selectedMember.phone}`}>{selectedMember.phone}</a>
                    </div>
                  )}

                  {selectedMember.email && (
                    <div className="contact-item">
                      <Mail size={15} className="text-slate-400" />
                      <a href={`mailto:${selectedMember.email}`}>{selectedMember.email}</a>
                    </div>
                  )}

                  {selectedMember.address && (
                    <div className="contact-item">
                      <MapPin size={15} className="text-slate-400" />
                      <span>{selectedMember.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete Area */}
              {!isReadOnly && (
                <div className="delete-section mt-8 pt-4 border-t border-slate-200">
                  {confirmDelete ? (
                    <div className="confirm-delete-box animate-fade-in">
                      <p className="text-xs text-rose-700 mb-2 font-medium">
                        Are you sure you want to remove {selectedMember.firstName}? All connected relationships will be detached.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn-danger flex-1"
                          onClick={handleDelete}
                        >
                          Yes, Remove
                        </button>
                        <button
                          type="button"
                          className="btn-secondary flex-1"
                          onClick={() => setConfirmDelete(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-text-danger"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 size={14} />
                      <span>Remove Member From Family Tree</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
