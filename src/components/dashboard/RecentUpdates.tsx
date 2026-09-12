import React from 'react';
import { Clock, ArrowRight, Camera, UserCheck, FileText, Bookmark } from 'lucide-react';
import { mockFamilyUpdates } from '../../data/mockUpdates';
import { useFamily } from '../../store/familyContext';

export const RecentUpdates: React.FC = () => {
  const { setCurrentView } = useFamily();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'photo':
        return <Camera size={15} className="text-indigo-600" />;
      case 'member':
        return <UserCheck size={15} className="text-emerald-600" />;
      case 'document':
        return <FileText size={15} className="text-amber-600" />;
      default:
        return <Bookmark size={15} className="text-rose-600" />;
    }
  };

  return (
    <div className="dashboard-section-block">
      <div className="section-title-row">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-500" />
          <h3 className="section-title-text">Recent Family Updates</h3>
        </div>
        <button
          type="button"
          className="btn-link-action"
          onClick={() => setCurrentView('timeline')}
        >
          <span>View Timeline</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <div className="updates-feed-list">
        {mockFamilyUpdates.map((update) => (
          <div key={update.id} className="update-feed-item">
            <div className="update-category-dot">{getCategoryIcon(update.category)}</div>

            <div className="update-content">
              <div className="update-sentence">
                <strong className="author-name">{update.author}</strong> {update.action}{' '}
                <span className="target-highlight">{update.target}</span>
              </div>
              <div className="update-detail">{update.detail}</div>
            </div>

            <div className="update-time-col">
              <span className="timestamp-text">{update.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
