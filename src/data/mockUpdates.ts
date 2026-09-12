import { FamilyActivityUpdate } from '../types/auth';

export const mockFamilyUpdates: FamilyActivityUpdate[] = [
  {
    id: 'act-1',
    author: 'Rahul Shah',
    action: 'added historical photo',
    target: '"Textile Guild, 1945"',
    detail: 'Archived to Generation III records with 3 tagged family elders',
    timestamp: '2 hours ago',
    category: 'photo',
  },
  {
    id: 'act-2',
    author: 'Pooja Shah',
    action: 'recorded birth of',
    target: 'Aarav Shah',
    detail: 'Added to Generation IV branch of Rahul & Pooja Shah',
    timestamp: 'Yesterday',
    category: 'member',
  },
  {
    id: 'act-3',
    author: 'Rajendra Shah',
    action: 'updated maiden name for',
    target: 'Gangaben Shah',
    detail: 'Confirmed with Baroda municipality 1932 archival register',
    timestamp: '3 days ago',
    category: 'document',
  },
  {
    id: 'act-4',
    author: 'Amit Shah',
    action: 'linked branch milestone',
    target: 'Shah Brothers Trading Co.',
    detail: 'Established 1954 in Ahmedabad Old City',
    timestamp: '5 days ago',
    category: 'branch',
  },
];
