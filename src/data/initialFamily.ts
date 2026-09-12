import { FamilyMember, FamilyRelationship } from '../types/family';

// 4 Generations, 18 Members recorded
export const initialMembers: Record<string, FamilyMember> = {
  // Generation I (Elders / Est. 1928)
  'mem-1': {
    id: 'mem-1',
    firstName: 'Harilal',
    lastName: 'Shah',
    gender: 'male',
    dateOfBirth: '1905-02-14',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98201 00001',
    email: 'harilal.archive@kintree.org',
    address: 'Patan, Gujarat',
    bio: 'Founder of the Shah Family mercantile firm in 1928. Community philanthropist.',
    roleTitle: 'Great-Grandfather (Gen I)',
    isFamilyHead: false,
  },
  'mem-2': {
    id: 'mem-2',
    firstName: 'Gangaben',
    lastName: 'Shah',
    gender: 'female',
    dateOfBirth: '1909-08-21',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98201 00002',
    email: 'gangaben.archive@kintree.org',
    address: 'Patan, Gujarat',
    bio: 'Matriarch of the founding lineage. Recorded extensive oral histories.',
    roleTitle: 'Great-Grandmother (Gen I)',
    isFamilyHead: false,
  },

  // Generation II (Brothers & Spouses)
  'mem-3': {
    id: 'mem-3',
    firstName: 'Rajendra',
    lastName: 'Shah',
    gender: 'male',
    dateOfBirth: '1938-05-19',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98201 10001',
    email: 'rajendra.shah@kintree.org',
    address: 'Ahmedabad, Gujarat',
    bio: 'Current Family Head & Chief Trustee of the Shah Archival Vault.',
    roleTitle: 'Family Head (Gen II)',
    isFamilyHead: true,
  },
  'mem-4': {
    id: 'mem-4',
    firstName: 'Taraben',
    lastName: 'Shah',
    gender: 'female',
    dateOfBirth: '1942-11-03',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98201 10002',
    email: 'taraben.shah@kintree.org',
    address: 'Ahmedabad, Gujarat',
    bio: 'Preserver of family cultural traditions and historical recipes.',
    roleTitle: 'Grandmother (Gen II)',
    isFamilyHead: false,
  },
  'mem-5': {
    id: 'mem-5',
    firstName: 'Kantilal',
    lastName: 'Shah',
    gender: 'male',
    dateOfBirth: '1935-09-12',
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98201 10003',
    email: 'kantilal.shah@kintree.org',
    address: 'Surat, Gujarat',
    bio: 'Elder brother to Rajendra. Diamond merchant and historian.',
    roleTitle: 'Granduncle (Gen II)',
    isFamilyHead: false,
  },
  'mem-6': {
    id: 'mem-6',
    firstName: 'Jasodaben',
    lastName: 'Shah',
    gender: 'female',
    dateOfBirth: '1939-04-18',
    profileImage: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98201 10004',
    email: 'jasodaben.shah@kintree.org',
    address: 'Surat, Gujarat',
    bio: 'Social reformer and educator.',
    roleTitle: 'Grandaunt (Gen II)',
    isFamilyHead: false,
  },

  // Generation III (Branch Contributors & Spouses)
  'mem-7': {
    id: 'mem-7',
    firstName: 'Rahul',
    lastName: 'Shah',
    gender: 'male',
    dateOfBirth: '1968-07-22',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98202 20001',
    email: 'rahul.shah@kintree.org',
    address: 'Mumbai, Maharashtra',
    bio: 'Son of Rajendra & Taraben. Digital archivist and engineer.',
    roleTitle: 'Branch Contributor (Gen III)',
    isFamilyHead: false,
  },
  'mem-8': {
    id: 'mem-8',
    firstName: 'Pooja',
    lastName: 'Shah',
    gender: 'female',
    dateOfBirth: '1971-10-15',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98202 20002',
    email: 'pooja.shah@kintree.org',
    address: 'Mumbai, Maharashtra',
    bio: 'Pediatric specialist and trustee of education foundation.',
    roleTitle: 'Mother (Gen III)',
    isFamilyHead: false,
  },
  'mem-9': {
    id: 'mem-9',
    firstName: 'Amit',
    lastName: 'Shah',
    gender: 'male',
    dateOfBirth: '1973-03-30',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98202 20003',
    email: 'amit.shah@kintree.org',
    address: 'Pune, Maharashtra',
    bio: 'Younger son of Rajendra. Textile enterprise director.',
    roleTitle: 'Uncle (Gen III)',
    isFamilyHead: false,
  },
  'mem-10': {
    id: 'mem-10',
    firstName: 'Meena',
    lastName: 'Shah',
    gender: 'female',
    dateOfBirth: '1976-12-08',
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98202 20004',
    email: 'meena.shah@kintree.org',
    address: 'Pune, Maharashtra',
    bio: 'Architect and environmental designer.',
    roleTitle: 'Aunt (Gen III)',
    isFamilyHead: false,
  },
  'mem-11': {
    id: 'mem-11',
    firstName: 'Dharmesh',
    lastName: 'Shah',
    gender: 'male',
    dateOfBirth: '1965-01-25',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98202 20005',
    email: 'dharmesh.shah@kintree.org',
    address: 'Surat, Gujarat',
    bio: 'Son of Kantilal & Jasodaben. Oversees Surat commercial operations.',
    roleTitle: 'First Cousin (Gen III)',
    isFamilyHead: false,
  },
  'mem-12': {
    id: 'mem-12',
    firstName: 'Bhavna',
    lastName: 'Shah',
    gender: 'female',
    dateOfBirth: '1969-06-14',
    profileImage: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98202 20006',
    email: 'bhavna.shah@kintree.org',
    address: 'Surat, Gujarat',
    bio: 'Ayurvedic wellness consultant.',
    roleTitle: 'Aunt by Marriage (Gen III)',
    isFamilyHead: false,
  },

  // Generation IV (Youth / Fourth Generation)
  'mem-13': {
    id: 'mem-13',
    firstName: 'Aarav',
    lastName: 'Shah',
    gender: 'male',
    dateOfBirth: '1998-04-10',
    profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98203 30001',
    email: 'aarav.shah@kintree.org',
    address: 'Mumbai, Maharashtra',
    bio: 'Robotics software researcher and vault developer.',
    roleTitle: 'Grandson (Gen IV)',
    isFamilyHead: false,
  },
  'mem-14': {
    id: 'mem-14',
    firstName: 'Ananya',
    lastName: 'Shah',
    gender: 'female',
    dateOfBirth: '2002-11-28',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98203 30002',
    email: 'ananya.shah@kintree.org',
    address: 'Mumbai, Maharashtra',
    bio: 'Journalist and documentary researcher.',
    roleTitle: 'Granddaughter (Gen IV)',
    isFamilyHead: false,
  },
  'mem-15': {
    id: 'mem-15',
    firstName: 'Rohan',
    lastName: 'Shah',
    gender: 'male',
    dateOfBirth: '2005-08-16',
    profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98203 30003',
    email: 'rohan.shah@kintree.org',
    address: 'Pune, Maharashtra',
    bio: 'Varsity tennis athlete and high school captain.',
    roleTitle: 'Grandson (Gen IV)',
    isFamilyHead: false,
  },
  'mem-16': {
    id: 'mem-16',
    firstName: 'Diya',
    lastName: 'Shah',
    gender: 'female',
    dateOfBirth: '2008-01-19',
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98203 30004',
    email: 'diya.shah@kintree.org',
    address: 'Pune, Maharashtra',
    bio: 'Violinist and academic scholar.',
    roleTitle: 'Granddaughter (Gen IV)',
    isFamilyHead: false,
  },
  'mem-17': {
    id: 'mem-17',
    firstName: 'Karan',
    lastName: 'Shah',
    gender: 'male',
    dateOfBirth: '1995-12-04',
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98203 30005',
    email: 'karan.shah@kintree.org',
    address: 'Surat, Gujarat',
    bio: 'Financial analyst with international trade focus.',
    roleTitle: 'Grandson (Gen IV)',
    isFamilyHead: false,
  },
  'mem-18': {
    id: 'mem-18',
    firstName: 'Riya',
    lastName: 'Shah',
    gender: 'female',
    dateOfBirth: '1999-03-22',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98203 30006',
    email: 'riya.shah@kintree.org',
    address: 'Surat, Gujarat',
    bio: 'Biotechnology graduate researcher.',
    roleTitle: 'Granddaughter (Gen IV)',
    isFamilyHead: false,
  },
};

export const initialRelationships: FamilyRelationship[] = [
  // Gen I Union
  { id: 'rel-1', sourceMemberId: 'mem-1', targetMemberId: 'mem-2', type: 'spouse' },
  { id: 'rel-2', sourceMemberId: 'mem-1', targetMemberId: 'mem-3', type: 'parent' }, // Harilal -> Rajendra
  { id: 'rel-3', sourceMemberId: 'mem-2', targetMemberId: 'mem-3', type: 'parent' }, // Gangaben -> Rajendra
  { id: 'rel-4', sourceMemberId: 'mem-1', targetMemberId: 'mem-5', type: 'parent' }, // Harilal -> Kantilal
  { id: 'rel-5', sourceMemberId: 'mem-2', targetMemberId: 'mem-5', type: 'parent' }, // Gangaben -> Kantilal

  // Gen II Unions
  { id: 'rel-6', sourceMemberId: 'mem-3', targetMemberId: 'mem-4', type: 'spouse' }, // Rajendra & Taraben
  { id: 'rel-7', sourceMemberId: 'mem-5', targetMemberId: 'mem-6', type: 'spouse' }, // Kantilal & Jasodaben

  // Gen II -> Gen III (Children of Rajendra & Taraben)
  { id: 'rel-8', sourceMemberId: 'mem-3', targetMemberId: 'mem-7', type: 'parent' }, // Rajendra -> Rahul
  { id: 'rel-9', sourceMemberId: 'mem-4', targetMemberId: 'mem-7', type: 'parent' }, // Taraben -> Rahul
  { id: 'rel-10', sourceMemberId: 'mem-3', targetMemberId: 'mem-9', type: 'parent' }, // Rajendra -> Amit
  { id: 'rel-11', sourceMemberId: 'mem-4', targetMemberId: 'mem-9', type: 'parent' }, // Taraben -> Amit

  // Gen II -> Gen III (Children of Kantilal & Jasodaben)
  { id: 'rel-12', sourceMemberId: 'mem-5', targetMemberId: 'mem-11', type: 'parent' }, // Kantilal -> Dharmesh
  { id: 'rel-13', sourceMemberId: 'mem-6', targetMemberId: 'mem-11', type: 'parent' }, // Jasodaben -> Dharmesh

  // Gen III Unions
  { id: 'rel-14', sourceMemberId: 'mem-7', targetMemberId: 'mem-8', type: 'spouse' }, // Rahul & Pooja
  { id: 'rel-15', sourceMemberId: 'mem-9', targetMemberId: 'mem-10', type: 'spouse' }, // Amit & Meena
  { id: 'rel-16', sourceMemberId: 'mem-11', targetMemberId: 'mem-12', type: 'spouse' }, // Dharmesh & Bhavna

  // Gen III -> Gen IV (Children of Rahul & Pooja)
  { id: 'rel-17', sourceMemberId: 'mem-7', targetMemberId: 'mem-13', type: 'parent' }, // Rahul -> Aarav
  { id: 'rel-18', sourceMemberId: 'mem-8', targetMemberId: 'mem-13', type: 'parent' }, // Pooja -> Aarav
  { id: 'rel-19', sourceMemberId: 'mem-7', targetMemberId: 'mem-14', type: 'parent' }, // Rahul -> Ananya
  { id: 'rel-20', sourceMemberId: 'mem-8', targetMemberId: 'mem-14', type: 'parent' }, // Pooja -> Ananya

  // Gen III -> Gen IV (Children of Amit & Meena)
  { id: 'rel-21', sourceMemberId: 'mem-9', targetMemberId: 'mem-15', type: 'parent' }, // Amit -> Rohan
  { id: 'rel-22', sourceMemberId: 'mem-10', targetMemberId: 'mem-15', type: 'parent' }, // Meena -> Rohan
  { id: 'rel-23', sourceMemberId: 'mem-9', targetMemberId: 'mem-16', type: 'parent' }, // Amit -> Diya
  { id: 'rel-24', sourceMemberId: 'mem-10', targetMemberId: 'mem-16', type: 'parent' }, // Meena -> Diya

  // Gen III -> Gen IV (Children of Dharmesh & Bhavna)
  { id: 'rel-25', sourceMemberId: 'mem-11', targetMemberId: 'mem-17', type: 'parent' }, // Dharmesh -> Karan
  { id: 'rel-26', sourceMemberId: 'mem-12', targetMemberId: 'mem-17', type: 'parent' }, // Bhavna -> Karan
  { id: 'rel-27', sourceMemberId: 'mem-11', targetMemberId: 'mem-18', type: 'parent' }, // Dharmesh -> Riya
  { id: 'rel-28', sourceMemberId: 'mem-12', targetMemberId: 'mem-18', type: 'parent' }, // Bhavna -> Riya
];
