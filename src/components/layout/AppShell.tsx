import React, { useRef, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { FamilyDashboard } from '../dashboard/FamilyDashboard';
import { TreeCanvasInner } from '../TreeCanvas';
import { DirectoryView } from '../directory/DirectoryView';
import { AddMemberModal } from '../AddMemberModal';
import { MemberProfileDrawer } from '../MemberProfileDrawer';
import { useFamily } from '../../store/familyContext';

export const AppShell: React.FC = () => {
  const { currentView } = useFamily();
  const focusRef = useRef<((id: string) => void) | null>(null);

  const handleRegisterFocus = useCallback((fn: (id: string) => void) => {
    focusRef.current = fn;
  }, []);

  return (
    <div className="kintree-shell-layout">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="kintree-main-workspace">
        <TopBar />

        <main className="kintree-view-container">
          {currentView === 'dashboard' && <FamilyDashboard />}

          {currentView === 'visualizer' && (
            <ReactFlowProvider>
              <TreeCanvasInner onFocusMemberCallback={handleRegisterFocus} />
            </ReactFlowProvider>
          )}

          {(currentView === 'directory' ||
            currentView === 'timeline' ||
            currentView === 'archives') && <DirectoryView />}
        </main>
      </div>

      {/* Overlays & Modals */}
      <AddMemberModal />
      <MemberProfileDrawer />
    </div>
  );
};
