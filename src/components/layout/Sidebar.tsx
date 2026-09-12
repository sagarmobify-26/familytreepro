import React from 'react';
import {
  GitFork,
  Clock,
  BookOpen,
  FolderArchive,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useFamily } from '../../store/familyContext';
import { AppView } from '../../types/auth';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, vaultName } = useFamily();

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Family Vault', icon: <LayoutDashboard size={18} /> },
    {
      id: 'visualizer',
      label: 'Visual Tree',
      icon: <GitFork size={18} />,
      badge: 'Interactive',
    },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={18} /> },
    { id: 'directory', label: 'Directory', icon: <BookOpen size={18} /> },
    { id: 'archives', label: 'Archival Documents', icon: <FolderArchive size={18} /> },
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-row">
          <div className="sidebar-logo-icon">
            <Sparkles size={16} className="text-amber-400" />
          </div>
          <div>
            <span className="sidebar-brand-title">KinTree</span>
            <span className="sidebar-brand-subtitle">ARCHIVAL HERITAGE</span>
          </div>
        </div>

        {/* Vault Banner */}
        <div className="sidebar-vault-card">
          <span className="vault-label">FAMILY VAULT</span>
          <h4 className="vault-name">{vaultName || 'Family Heritage Vault'}</h4>
          <span className="vault-origin">Secured Archive</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item-btn ${isActive ? 'nav-item-active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <div className="flex items-center gap-3">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </div>
              {item.badge && <span className="nav-pill-badge">{item.badge}</span>}
              {isActive && <span className="nav-active-dot" />}
            </button>
          );
        })}
      </nav>

      {/* CECOM Validated Footer */}
      <div className="sidebar-footer">
        <div className="cecom-badge">
          <div className="cecom-status-dot" />
          <div className="cecom-info">
            <span className="cecom-title">CECOM Validated</span>
            <span className="cecom-version">v5.3 Archive Protocol</span>
          </div>
          <ShieldCheck size={14} className="text-emerald-400 ml-auto" />
        </div>
      </div>
    </aside>
  );
};
