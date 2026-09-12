import React from 'react';
import { FamilyProvider, useFamily } from './store/familyContext';
import { RoleSelector } from './components/auth/RoleSelector';
import { AppShell } from './components/layout/AppShell';

const RootContent: React.FC = () => {
  const { currentView } = useFamily();

  if (currentView === 'login') {
    return <RoleSelector />;
  }

  return <AppShell />;
};

export const App: React.FC = () => {
  return (
    <FamilyProvider>
      <RootContent />
    </FamilyProvider>
  );
};

export default App;
