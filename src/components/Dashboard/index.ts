/**
 * Dashboard Components Index
 * Centralized exports for dashboard components
 */

export { DashboardContainer } from './DashboardContainer';
export { GenogramCard } from './GenogramCard';
export { GenogramList } from './GenogramList';
export { NewGenogramModal } from './NewGenogramModal';

// Re-export hooks for dashboard usage
export { useGenograms } from '../../hooks/useGenograms';
export { useAutosave } from '../../hooks/useAutosave';
