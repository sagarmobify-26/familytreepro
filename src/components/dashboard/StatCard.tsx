import React from 'react';
import { Users, Layers, FolderArchive, Clock } from 'lucide-react';
import { useFamily } from '../../store/familyContext';

export const StatCardsGrid: React.FC = () => {
  const { members } = useFamily();
  const total = Object.keys(members).length;

  const stats = [
    {
      id: 'stat-1',
      label: 'TOTAL MEMBERS',
      value: total.toString(),
      subtext: `${Math.round(total * 0.65)} Living Members`,
      icon: <Users size={18} className="text-indigo-600" />,
      badgeColor: 'bg-indigo-50 text-indigo-700',
    },
    {
      id: 'stat-2',
      label: 'GENERATIONS',
      value: '4',
      subtext: 'Patriarchal Est. 1928',
      icon: <Layers size={18} className="text-amber-600" />,
      badgeColor: 'bg-amber-50 text-amber-700',
    },
    {
      id: 'stat-3',
      label: 'ARCHIVAL RECORDS',
      value: '42',
      subtext: 'Photos, Deeds & Certificates',
      icon: <FolderArchive size={18} className="text-emerald-600" />,
      badgeColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 'stat-4',
      label: 'LAST UPDATED',
      value: 'Today',
      subtext: '9:42 AM • Synced with Vault',
      icon: <Clock size={18} className="text-rose-600" />,
      badgeColor: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <div className="stats-cards-grid">
      {stats.map((s) => (
        <div key={s.id} className="stat-metric-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{s.label}</span>
            <div className={`stat-icon-wrapper ${s.badgeColor}`}>{s.icon}</div>
          </div>
          <div className="stat-card-number">{s.value}</div>
          <div className="stat-card-subtext">{s.subtext}</div>
        </div>
      ))}
    </div>
  );
};
