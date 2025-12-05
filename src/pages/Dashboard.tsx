/**
 * Dashboard Page
 * Main entry point for dashboard, uses refactored DashboardContainer
 */

import { DashboardContainer } from '../components/Dashboard';
import { AppHeader } from '../components/layout/AppHeader';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  return (
    <motion.div 
      className="min-h-screen bg-slate-950 page-enter"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AppHeader showLogo showUserMenu sticky={false} />
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <DashboardContainer />
      </main>
    </motion.div>
  );
};
