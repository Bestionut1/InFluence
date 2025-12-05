import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Brain, GitBranch } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

// Custom Logo - Tree + Brain Combined - Modern Design
const TreeBrainLogo = () => {
  return (
    <motion.div
      animate={{
        boxShadow: [
          '0 0 20px rgba(200, 150, 255, 0.3)',
          '0 0 40px rgba(200, 150, 255, 0.8)',
          '0 0 20px rgba(200, 150, 255, 0.3)',
        ],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatDelay: 0,
        ease: 'easeInOut',
      }}
      className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg"
      style={{ willChange: 'box-shadow' }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top left brain curve */}
        <path
          d="M7 8C6 7 5 5 6 3C6.5 2 7 3 7 4"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="white"
          fillOpacity="0.7"
        />
        {/* Top center brain bulge */}
        <circle cx="12" cy="5" r="1.5" fill="white" />
        {/* Top right brain curve */}
        <path
          d="M17 8C18 7 19 5 18 3C17.5 2 17 3 17 4"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="white"
          fillOpacity="0.7"
        />
        {/* Left brain lobe */}
        <path
          d="M7 8Q5 9 6 11Q7 12 8 11"
          stroke="white"
          strokeWidth="1.5"
          fill="white"
          fillOpacity="0.6"
        />
        {/* Right brain lobe */}
        <path
          d="M17 8Q19 9 18 11Q17 12 16 11"
          stroke="white"
          strokeWidth="1.5"
          fill="white"
          fillOpacity="0.6"
        />
        {/* Center brain */}
        <circle cx="12" cy="10" r="2" fill="white" />
        {/* Trunk connecting to roots */}
        <rect x="11" y="12" width="2" height="5" fill="white" rx="1" />
        {/* Left root */}
        <path
          d="M10 17Q8 18 7 20"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Center root */}
        <path
          d="M12 17V20"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Right root */}
        <path
          d="M14 17Q16 18 17 20"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </motion.div>
  );
};

// Shimmer Title Component - letters get zoom shine effect left to right - CONTINUOUS - SLOW
const ShimmerTitle = ({ text }: { text: string }) => {
  return (
    <div className="relative inline-block">
      <motion.h1
        className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-300 via-teal-300 to-primary-300 bg-clip-text text-transparent relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.span
          animate={{
            textShadow: [
              '0 0 0px rgba(255, 255, 255, 0)',
              '0 0 8px rgba(255, 255, 255, 0.6), 0 0 15px rgba(200, 150, 255, 0.4)',
              '0 0 0px rgba(255, 255, 255, 0)',
            ],
            letterSpacing: ['0px', '1.5px', '0px'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatDelay: 0,
            ease: 'easeInOut',
          }}
          style={{ willChange: 'text-shadow, letter-spacing' }}
        >
          {text}
        </motion.span>
      </motion.h1>
    </div>
  );
};

// Falling Star Component - Stars from random positions moving diagonal to bottom-right
const FallingStar = ({ delay, startTop, startLeft }: { delay: number; startTop: string; startLeft: string }) => {
  return (
    <motion.div
      className="absolute text-3xl font-bold text-white"
      style={{
        left: startLeft,
        top: startTop,
        filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.6))',
        textShadow: '0 0 15px rgba(200, 150, 255, 0.4)',
        willChange: 'transform',
      }}
      animate={{
        left: 'calc(100vw + 100px)',
        top: 'calc(100vh + 100px)',
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

// Special Falling Star Component - Bigger, brighter, with glow and scaling - FASTER
const SpecialFallingStar = ({ delay, startTop, startLeft }: { delay: number; startTop: string; startLeft: string }) => {
  return (
    <motion.div
      className="absolute font-bold text-white"
      style={{
        left: startLeft,
        top: startTop,
        fontSize: '2.5rem',
        filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.7)) drop-shadow(0 0 15px rgba(200, 150, 255, 0.6))',
        textShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 30px rgba(200, 150, 255, 0.4)',
        willChange: 'transform',
      }}
      animate={{
        left: 'calc(100vw + 100px)',
        top: 'calc(100vh + 100px)',
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

// Starfield Background Component
const StarfieldBackground = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-bg-dark" />
      
      {/* Ambient light effects - reduced from 2 to 1 */}
      <motion.div
        animate={{
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary-600/15 rounded-full blur-3xl opacity-20"
        style={{ willChange: 'opacity' }}
      />

      {/* Falling stars - from random positions moving diagonal to bottom-right */}
      {/* Reduced count: 9 instead of 11 */}
      <FallingStar delay={0} startTop="-100px" startLeft="-100px" />
      <FallingStar delay={0.8} startTop="10vh" startLeft="5vw" />
      <FallingStar delay={1.6} startTop="20vh" startLeft="15vw" />
      <FallingStar delay={2.4} startTop="5vh" startLeft="25vw" />
      <FallingStar delay={3.2} startTop="30vh" startLeft="35vw" />
      <FallingStar delay={4} startTop="15vh" startLeft="45vw" />
      <FallingStar delay={4.8} startTop="40vh" startLeft="10vw" />
      <FallingStar delay={5.6} startTop="25vh" startLeft="50vw" />
      <FallingStar delay={6.4} startTop="35vh" startLeft="20vw" />
      
      {/* Special shiny stars - reduced from 2 to 1 */}
      <SpecialFallingStar delay={1.5} startTop="15vh" startLeft="30vw" />

      {/* Twinkling background stars - reduced from 20 to 12 */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={`twinkle-${i}`}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              willChange: 'opacity',
            }}
            animate={{
              opacity: [0.15, 0.6, 0.15],
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

export const LandingPage = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const t = useTranslation();

  React.useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div className="h-screen bg-bg-dark flex flex-col items-center justify-center relative overflow-hidden page-enter">
      {/* Falling Stars Background */}
      <StarfieldBackground />

      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      {/* Content */}
      <div className="z-10 text-center max-w-4xl px-6 space-y-4 flex flex-col items-center justify-center h-full">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center items-center gap-3"
        >
          <TreeBrainLogo />
          <div>
            <ShimmerTitle text="InFluence" />
            <p className="text-slate-400 text-xs mt-0.5">{t.landing.subtitle}</p>
          </div>
        </motion.div>

        {/* Headline - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-2"
        >
          <h2 className="text-xl md:text-2xl font-light text-white leading-tight">
            {t.landing.description}
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            {t.landing.description}
          </p>
        </motion.div>

        {/* Features Preview - Compact Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-2 py-3 w-full"
        >
          {[
            {
              icon: GitBranch,
              title: 'Smart Genograms',
              desc: 'Detailed family trees',
            },
            {
              icon: Brain,
              title: 'AI Analysis',
              desc: 'Intelligent insights',
            },
            {
              icon: Sparkles,
              title: 'Psychology',
              desc: 'Evidence-based',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              className="glass p-2 rounded-lg text-center"
            >
              <feature.icon className="w-6 h-6 text-primary-400 mx-auto mb-1" />
              <h3 className="font-semibold text-white text-sm mb-0.5">{feature.title}</h3>
              <p className="text-xs text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-2 justify-center pt-1"
        >
          <Button
            variant="primary"
            size="sm"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={signInWithGoogle}
            className="shadow-lg shadow-primary-600/40 text-sm px-4 py-2"
          >
            {t.landing.getStarted}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/editor/new')}
            className="text-sm px-4 py-2"
          >
            Get Free
          </Button>
        </motion.div>

        {/* Trust Indicators - Compact */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-xs text-slate-500 pt-2"
        >
          Secure • Private • AI-Powered • No credit card needed
        </motion.p>
      </div>
    </div>
  );
};
