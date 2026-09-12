export type Gender = 'male' | 'female' | 'other';

export type RelationshipType = 'parent' | 'child' | 'spouse';

export type RelativeTypeOption = 'child' | 'spouse' | 'parent' | 'sibling';

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth?: string;
  profileImage?: string;
  phone?: string;
  email?: string;
  address?: string;
  bio?: string;
  isFamilyHead?: boolean;
  roleTitle?: string; // e.g. "Grandfather", "Father", "Mother", "Son", "Daughter"
}

export interface FamilyRelationship {
  id: string;
  sourceMemberId: string;
  targetMemberId: string;
  type: RelationshipType;
}

export interface FamilyTreeData {
  members: Record<string, FamilyMember>;
  relationships: FamilyRelationship[];
}

export interface FamilyNodeData extends Record<string, unknown> {
  member: FamilyMember;
  relationships: FamilyRelationship[];
  onAddRelative: (member: FamilyMember) => void;
  onViewProfile: (member: FamilyMember) => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (member: FamilyMember) => void;
  isSelected?: boolean;
  isHighlighted?: boolean;
}
