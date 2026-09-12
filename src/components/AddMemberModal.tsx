import React, { useState, useEffect } from 'react';
import { X, UserPlus, Heart, Users, ArrowUpCircle, Baby } from 'lucide-react';
import { useFamily } from '../store/familyContext';
import { Gender, RelativeTypeOption } from '../types/family';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

export const AddMemberModal: React.FC = () => {
  const {
    isAddModalOpen,
    closeAddModal,
    memberToAddRelativeTo,
    addMemberRelative,
    addStandaloneMember,
  } = useFamily();

  const [relativeType, setRelativeType] = useState<RelativeTypeOption>('child');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  // Pre-fill last name if adding relative
  useEffect(() => {
    if (memberToAddRelativeTo) {
      setLastName(memberToAddRelativeTo.lastName);
    } else {
      setLastName('');
    }
    setError('');
  }, [memberToAddRelativeTo, isAddModalOpen]);

  // Auto-suggest role title based on relation and gender
  useEffect(() => {
    if (!memberToAddRelativeTo) return;
    if (relativeType === 'child') {
      setRoleTitle(gender === 'male' ? 'Son' : gender === 'female' ? 'Daughter' : 'Child');
    } else if (relativeType === 'spouse') {
      setRoleTitle(gender === 'female' ? 'Wife' : gender === 'male' ? 'Husband' : 'Spouse');
    } else if (relativeType === 'parent') {
      setRoleTitle(gender === 'male' ? 'Father' : gender === 'female' ? 'Mother' : 'Parent');
    } else if (relativeType === 'sibling') {
      setRoleTitle(gender === 'male' ? 'Brother' : gender === 'female' ? 'Sister' : 'Sibling');
    }
  }, [relativeType, gender, memberToAddRelativeTo]);

  if (!isAddModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      dateOfBirth: dateOfBirth || undefined,
      profileImage: profileImage || undefined,
      roleTitle: roleTitle.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      bio: bio.trim() || undefined,
      isFamilyHead: false,
    };

    if (memberToAddRelativeTo) {
      addMemberRelative(payload, memberToAddRelativeTo.id, relativeType);
    } else {
      addStandaloneMember(payload);
    }

    // Reset fields
    setFirstName('');
    setLastName('');
    setDateOfBirth('');
    setProfileImage('');
    setBio('');
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={closeAddModal}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <div className="icon-badge">
              <UserPlus size={18} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add Family Member</h3>
              <p className="text-xs text-slate-500">
                {memberToAddRelativeTo
                  ? `Expanding lineage for ${memberToAddRelativeTo.firstName} ${memberToAddRelativeTo.lastName}`
                  : 'Add a new member to the family tree'}
              </p>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={closeAddModal}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Relative Target & Relationship Picker */}
          {memberToAddRelativeTo ? (
            <div className="relative-selector-box">
              <div className="target-pill">
                <span className="text-xs text-slate-500">Connecting to:</span>
                <strong className="text-xs text-indigo-700 font-semibold">
                  {memberToAddRelativeTo.firstName} {memberToAddRelativeTo.lastName} (
                  {memberToAddRelativeTo.roleTitle || 'Member'})
                </strong>
              </div>

              <label className="form-label font-medium mt-3">Select Relationship:</label>
              <div className="relation-grid">
                <button
                  type="button"
                  className={`relation-card ${relativeType === 'child' ? 'active' : ''}`}
                  onClick={() => setRelativeType('child')}
                >
                  <Baby size={18} />
                  <span className="title">Child</span>
                  <span className="desc">Branches below</span>
                </button>

                <button
                  type="button"
                  className={`relation-card ${relativeType === 'spouse' ? 'active' : ''}`}
                  onClick={() => setRelativeType('spouse')}
                >
                  <Heart size={18} />
                  <span className="title">Spouse</span>
                  <span className="desc">Direct partner</span>
                </button>

                <button
                  type="button"
                  className={`relation-card ${relativeType === 'sibling' ? 'active' : ''}`}
                  onClick={() => setRelativeType('sibling')}
                >
                  <Users size={18} />
                  <span className="title">Sibling</span>
                  <span className="desc">Shares parents</span>
                </button>

                <button
                  type="button"
                  className={`relation-card ${relativeType === 'parent' ? 'active' : ''}`}
                  onClick={() => setRelativeType('parent')}
                >
                  <ArrowUpCircle size={18} />
                  <span className="title">Parent</span>
                  <span className="desc">Branches above</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="info-banner">
              Adding a root family member. You can link relationships afterward.
            </div>
          )}

          {error && <div className="form-error-banner">{error}</div>}

          {/* Form Fields */}
          <div className="grid-2-col">
            <div className="form-group">
              <label className="form-label">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Aryan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Shah"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-3-col">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Role / Label</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Son, Daughter"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
          </div>

          {/* Avatar URL & Preset Selector */}
          <div className="form-group">
            <label className="form-label">Profile Photo (Optional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://example.com/avatar.jpg"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
            />
            <div className="avatar-preset-bar">
              <span className="text-xs text-slate-400 mr-2">Or choose avatar:</span>
              {AVATAR_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`preset-btn ${profileImage === p ? 'active' : ''}`}
                  onClick={() => setProfileImage(p)}
                >
                  <img src={p} alt={`Preset ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Contact Information Accordion */}
          <div className="grid-2-col">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="member@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={closeAddModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <UserPlus size={16} />
              <span>Add Member</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
