import React from 'react';
import { GitFork, UserPlus, Sparkles, ArrowRight } from 'lucide-react';
import { useFamily } from '../../store/familyContext';

export const WelcomeHero: React.FC = () => {
  const { currentUser, setCurrentView, openAddRelativeModal, isReadOnly, members } = useFamily();
  const totalMembers = Object.keys(members).length;

  return (
    <section className="dashboard-hero-card">
      <div className="hero-left-content">
        <div className="hero-pill-tag">
          <span className="pulsing-green-dot" />
          <span>FAMILY LINEAGE VAULT</span>
        </div>

        <h2 className="hero-welcome-title">
          Welcome back, {currentUser.name.split(' ')[0]}
        </h2>

        <p className="hero-subtitle-line">
          Shah Family Tree • <strong>4 Generations</strong>, <strong>{totalMembers} Members</strong> Recorded
        </p>

        <div className="hero-action-buttons">
          <button
            type="button"
            className="btn-hero-primary"
            onClick={() => setCurrentView('visualizer')}
          >
            <GitFork size={18} />
            <span>Open Family Tree Visualizer</span>
            <ArrowRight size={16} className="ml-1" />
          </button>

          {!isReadOnly && (
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => openAddRelativeModal()}
            >
              <UserPlus size={17} />
              <span>+ Add Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Mini Lineage Overview Diagram */}
      <div className="hero-lineage-preview">
        <div className="lineage-preview-header">
          <Sparkles size={13} className="text-amber-500" />
          <span>Lineage Overview</span>
        </div>

        <div className="mini-tree-diagram">
          {/* Generation I */}
          <div className="mini-node mini-gen-1">
            <span className="mini-node-title">Harilal & Gangaben</span>
            <span className="mini-node-tag">Generation I (Founders)</span>
          </div>

          <div className="mini-connector-vert" />

          {/* Generation II */}
          <div className="mini-gen-2-row">
            <div className="mini-node mini-gen-2">
              <span className="mini-node-title">Kantilal</span>
            </div>
            <div className="mini-connector-horiz" />
            <div className="mini-node mini-gen-2 mini-highlight">
              <span className="mini-node-title">Rajendra (Head)</span>
            </div>
          </div>

          <div className="mini-connector-vert" />

          {/* Generation III */}
          <div className="mini-gen-3-row">
            <div className="mini-node mini-gen-3">
              <span className="mini-node-title">Dharmesh</span>
            </div>
            <div className="mini-node mini-gen-3 mini-highlight">
              <span className="mini-node-title">Rahul & Pooja</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
