import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { User, Plus, MoreVertical, Crown, Calendar, Eye, Edit3, Trash2 } from 'lucide-react';
import { FamilyNodeData, FamilyMember } from '../types/family';
import { useFamily } from '../store/familyContext';

export const FamilyMemberNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as FamilyNodeData;
  const member = nodeData.member;
  const { isReadOnly } = useFamily();
  const [showMenu, setShowMenu] = useState(false);

  if (!member) return null;

  const isMale = member.gender === 'male';
  const isFemale = member.gender === 'female';

  const initials = `${member.firstName[0] || ''}${member.lastName[0] || ''}`.toUpperCase();

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleAction = (
    e: React.MouseEvent,
    action: (m: FamilyMember) => void
  ) => {
    e.stopPropagation();
    setShowMenu(false);
    action(member);
  };

  return (
    <div
      className={`family-node-card ${selected ? 'is-selected' : ''} ${
        nodeData.isHighlighted ? 'is-highlighted' : ''
      } ${member.isFamilyHead ? 'is-family-head' : ''} gender-${member.gender}`}
      onClick={() => nodeData.onViewProfile(member)}
    >
      {/* React Flow Connection Handles */}
      <Handle type="target" position={Position.Top} id="top" className="custom-handle" />
      <Handle type="target" position={Position.Left} id="left" className="custom-handle" />
      <Handle type="source" position={Position.Right} id="right" className="custom-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="custom-handle" />

      {/* Family Head Crown Badge */}
      {member.isFamilyHead && (
        <div className="head-badge" title="Family Head">
          <Crown size={13} className="text-amber-400" />
          <span>Head</span>
        </div>
      )}

      <div className="node-content">
        {/* Profile Avatar */}
        <div className="avatar-wrapper">
          {member.profileImage ? (
            <img
              src={member.profileImage}
              alt={`${member.firstName} ${member.lastName}`}
              className="avatar-img"
              loading="lazy"
            />
          ) : (
            <div className={`avatar-fallback ${isMale ? 'bg-blue' : isFemale ? 'bg-rose' : 'bg-slate'}`}>
              {initials || <User size={20} />}
            </div>
          )}
          <span className={`status-indicator ${isMale ? 'indicator-blue' : 'indicator-rose'}`} />
        </div>

        {/* Member Details */}
        <div className="member-meta">
          <h4 className="member-name">
            {member.firstName} {member.lastName}
          </h4>
          <span className="member-role">
            {member.roleTitle || (isMale ? 'Male' : isFemale ? 'Female' : 'Member')}
          </span>

          {member.dateOfBirth && (
            <div className="member-dob">
              <Calendar size={11} />
              <span>{new Date(member.dateOfBirth).getFullYear()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Node Actions Bar */}
      <div className="node-footer" onClick={(e) => e.stopPropagation()}>
        {!isReadOnly ? (
          <button
            type="button"
            className="btn-add-relative"
            title={`Add relation to ${member.firstName}`}
            onClick={(e) => handleAction(e, nodeData.onAddRelative)}
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400 pl-1">Archived</span>
        )}

        <div className="relative-menu-container">
          <button
            type="button"
            className="btn-node-menu"
            title="More actions"
            onClick={handleMenuClick}
          >
            <MoreVertical size={15} />
          </button>

          {showMenu && (
            <div className="node-dropdown-menu animate-fade-in" onMouseLeave={() => setShowMenu(false)}>
              <button
                type="button"
                className="menu-item"
                onClick={(e) => handleAction(e, nodeData.onViewProfile)}
              >
                <Eye size={13} />
                <span>View Profile</span>
              </button>

              {!isReadOnly && (
                <>
                  <button
                    type="button"
                    className="menu-item"
                    onClick={(e) => handleAction(e, nodeData.onAddRelative)}
                  >
                    <Plus size={13} />
                    <span>Add Relative</span>
                  </button>
                  <button
                    type="button"
                    className="menu-item"
                    onClick={(e) => handleAction(e, nodeData.onEditMember)}
                  >
                    <Edit3 size={13} />
                    <span>Edit Member</span>
                  </button>
                  <div className="menu-divider" />
                  <button
                    type="button"
                    className="menu-item menu-item-danger"
                    onClick={(e) => handleAction(e, nodeData.onDeleteMember)}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
