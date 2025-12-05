import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAvatar } from '../../hooks/useAvatar';
import { User, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LanguageSwitcher } from '../LanguageSwitcher';

interface AppHeaderProps {
  showLogo?: boolean;
  showUserMenu?: boolean;
  sticky?: boolean;
  actions?: React.ReactNode;
}

// Shimmer Title Component - matching landing page style but smaller
const ShimmerTitle = () => {
  return (
    <div className="relative inline-block">
      <motion.h1
        className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-300 via-teal-300 to-primary-300 bg-clip-text text-transparent relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.span
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'easeInOut',
          }}
          style={{ willChange: 'transform' }}
        >
          InFluence
        </motion.span>
      </motion.h1>
    </div>
  );
};

// Falling Star Component - Stars from random positions moving diagonal to bottom-right
const FallingStar = ({ delay, startTop, startLeft }: { delay: number; startTop: string; startLeft: string }) => {
  return (
    <motion.div
      className="absolute text-xl font-bold text-white"
      style={{
        left: startLeft,
        top: startTop,
        filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.6))',
        textShadow: '0 0 15px rgba(200, 150, 255, 0.4)',
        willChange: 'transform',
      }}
      animate={{
        left: 'calc(100% + 50px)',
        top: 'calc(100% + 50px)',
        opacity: [0, 0.9, 0.9, 0],
      }}
      transition={{
        duration: 4.5,
        delay,
        repeat: Infinity,
        repeatDelay: 3 + Math.random() * 4,
        ease: 'easeIn',
      }}
    >
      ★
    </motion.div>
  );
};

// Special Falling Star Component
const SpecialFallingStar = ({ delay, startTop, startLeft }: { delay: number; startTop: string; startLeft: string }) => {
  return (
    <motion.div
      className="absolute font-bold text-white"
      style={{
        left: startLeft,
        top: startTop,
        fontSize: '1.75rem',
        filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.7)) drop-shadow(0 0 15px rgba(200, 150, 255, 0.6))',
        textShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 30px rgba(200, 150, 255, 0.4)',
        willChange: 'transform',
      }}
      animate={{
        left: 'calc(100% + 50px)',
        top: 'calc(100% + 50px)',
        opacity: [0, 0.85, 0.85, 0],
        scale: [0.6, 1.1, 1.15, 0.8],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: 6 + Math.random() * 4,
        ease: 'easeIn',
      }}
    >
      ✨
    </motion.div>
  );
};

// Header Background with Stars
const HeaderStarfield = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Subtle ambient light */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-[10%] top-0 w-[50%] h-full bg-primary-600/10 rounded-full blur-3xl opacity-20"
        style={{ willChange: 'opacity' }}
      />

      {/* Falling stars - reduced for header */}
      <FallingStar delay={0} startTop="-30px" startLeft="-50px" />
      <FallingStar delay={1} startTop="5px" startLeft="10%" />
      <FallingStar delay={2} startTop="2px" startLeft="20%" />
      <FallingStar delay={2.8} startTop="8px" startLeft="30%" />
      <FallingStar delay={3.6} startTop="3px" startLeft="40%" />
      
      {/* Special shiny star */}
      <SpecialFallingStar delay={1.5} startTop="0px" startLeft="25%" />

      {/* Twinkling background stars - subtle */}
      <div className="absolute inset-0">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={`twinkle-${i}`}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              willChange: 'opacity',
            }}
            animate={{
              opacity: [0.15, 0.5, 0.15],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              delay: Math.random() * 6,
              repeat: Infinity,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  showLogo = true,
  showUserMenu = true,
  sticky = true,
  actions,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { avatar } = useAvatar();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header
      className={clsx(
        'h-16 border-b border-slate-800/50 z-40',
        'flex items-center justify-between px-6 relative',
        sticky && 'sticky top-0'
      )}
    >
      {/* Background with stars */}
      <HeaderStarfield />

      {/* Content - relative z-index for stacking above background */}
      <div className="relative z-10 flex items-center justify-between w-full gap-4">
        {/* Logo Section */}
        {showLogo && (
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Ψ</span>
            </div>
            <div className="hidden md:flex">
              <ShimmerTitle />
            </div>
          </button>
        )}

        {/* Center Actions (for flexibility) */}
        <div className="flex-1 flex justify-center">{actions}</div>

        {/* Right Section - User Menu */}
        {showUserMenu && (
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Online/Offline Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700">
              <div
                className={clsx(
                  'w-2 h-2 rounded-full animate-pulse',
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                )}
              />
              <span className="text-xs text-slate-400">
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </span>
            </div>

            <span className="text-slate-300 text-sm hidden md:block">
              {user?.displayName || 'User'}
            </span>
            <button
              onClick={() => navigate('/profile')}
              className={clsx(
                'w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700',
                'flex items-center justify-center hover:from-primary-400 hover:to-primary-600',
                'transition-all border-2 border-primary-400/50 hover:border-primary-300',
                'overflow-hidden group'
              )}
              title="View Profile"
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300"
          title={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
};

AppHeader.displayName = 'AppHeader';
