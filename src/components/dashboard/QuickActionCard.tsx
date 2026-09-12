import React from 'react';
import { GitFork, UserPlus, BookOpen, ArrowRight } from 'lucide-react';
import { useFamily } from '../../store/familyContext';

export const QuickActionsGrid: React.FC = () => {
  const { setCurrentView, openAddRelativeModal, isReadOnly } = useFamily();

  const actions = [
    {
      id: 'act-visualizer',
      title: 'Visual Family Tree',
      description: 'Explore, pan, and zoom through 4 generations of ancestral connections.',
      cta: 'Open Visualizer →',
      icon: <GitFork size={22} className="text-indigo-600" />,
      onClick: () => setCurrentView('visualizer'),
      disabled: false,
    },
    {
      id: 'act-add',
      title: 'Add Family Member',
      description: 'Quickly add a spouse, child, or parent node with vital details.',
      cta: isReadOnly ? 'View Only Mode' : 'Open Member Form →',
      icon: <UserPlus size={22} className="text-emerald-600" />,
      onClick: () => openAddRelativeModal(),
      disabled: isReadOnly,
    },
    {
      id: 'act-directory',
      title: 'Directory & Documents',
      description: 'Browse searchable member profiles, archival photographs, and marriage records.',
      cta: 'View Archives →',
      icon: <BookOpen size={22} className="text-amber-600" />,
      onClick: () => setCurrentView('directory'),
      disabled: false,
    },
  ];

  return (
    <div className="dashboard-section-block">
      <div className="section-title-row">
        <h3 className="section-title-text">Quick Actions</h3>
        <span className="section-title-tag">Core Vault Workflows</span>
      </div>

      <div className="quick-actions-grid">
        {actions.map((act) => (
          <div
            key={act.id}
            className={`quick-action-card ${act.disabled ? 'is-disabled' : ''}`}
            onClick={act.disabled ? undefined : act.onClick}
          >
            <div className="action-card-top">
              <div className="action-icon-box">{act.icon}</div>
              <ArrowRight size={16} className="action-arrow-icon" />
            </div>

            <h4 className="action-card-title">{act.title}</h4>
            <p className="action-card-desc">{act.description}</p>

            <span className="action-cta-link">{act.cta}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
