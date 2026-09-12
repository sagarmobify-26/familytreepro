import React from 'react';
import { WelcomeHero } from './WelcomeHero';
import { StatCardsGrid } from './StatCard';
import { QuickActionsGrid } from './QuickActionCard';
import { RecentUpdates } from './RecentUpdates';

export const FamilyDashboard: React.FC = () => {
  return (
    <div className="family-dashboard-page animate-fade-in">
      <div className="dashboard-content-container">
        {/* 1. Hero Lineage Vault Banner */}
        <WelcomeHero />

        {/* 2. Data-Driven Statistics Grid */}
        <StatCardsGrid />

        {/* 3. Quick Actions Grid */}
        <QuickActionsGrid />

        {/* 4. Recent Family Updates Feed */}
        <RecentUpdates />
      </div>
    </div>
  );
};
