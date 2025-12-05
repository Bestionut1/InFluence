/**
 * Dashboard Page
 * Main entry point for dashboard, uses refactored DashboardContainer
 */

import { DashboardContainer } from '../components/Dashboard';
import { AppHeader } from '../components/layout/AppHeader';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-950 page-enter">
      <AppHeader showLogo showUserMenu sticky={false} />
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <DashboardContainer />
      </main>
    </div>
  );
};
