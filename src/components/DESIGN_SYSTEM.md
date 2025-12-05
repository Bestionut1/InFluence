/**
 * ====================================================================================================
 * PSYCHOGENEALOGY UI DESIGN SYSTEM
 * ====================================================================================================
 * 
 * A comprehensive guide to the modern, psychology-focused design system for the PsychoGenealogy 
 * application. This document outlines colors, typography, components, and usage patterns.
 * 
 * ====================================================================================================
 * COLOR PALETTE
 * ====================================================================================================
 * 
 * PRIMARY (Purple/Violet) - Main brand color for psychology/healing
 * - primary-50:   #faf8ff   (lightest)
 * - primary-100:  #f3f0ff
 * - primary-200:  #ede4ff
 * - primary-300:  #dccfff
 * - primary-400:  #c7b0ff
 * - primary-500:  #a78bfa   (main)
 * - primary-600:  #8b5cf6   (darker)
 * - primary-700:  #7c3aed   (deep)
 * - primary-800:  #6d28d9   (rich)
 * - primary-900:  #5b21b6   (darkest)
 * 
 * SECONDARY (Gold/Warm) - Genealogy/warmth accent
 * - accent-50:    #fffbeb
 * - accent-100:   #fef3c7
 * - accent-200:   #fde68a
 * - accent-300:   #fcd34d
 * - accent-400:   #fbbf24   (main)
 * - accent-500:   #f59e0b
 * - accent-600:   #d97706
 * - accent-700:   #b45309
 * 
 * TERTIARY (Teal) - Wellness/nature/support
 * - teal-50:      #f0fdfa
 * - teal-100:     #d1faf5
 * - teal-200:     #99f6e4
 * - teal-300:     #5eead4
 * - teal-400:     #2dd4bf
 * - teal-500:     #14b8a6   (main)
 * - teal-600:     #0d9488
 * - teal-700:     #0f766e
 * 
 * NEUTRAL (Slate) - Text, backgrounds, borders
 * - slate-50:     #f8fafc   (lightest text)
 * - slate-100:    #f1f5f9
 * - slate-200:    #e2e8f0
 * - slate-300:    #cbd5e1
 * - slate-400:    #94a3b8
 * - slate-500:    #64748b
 * - slate-600:    #475569
 * - slate-700:    #334155
 * - slate-800:    #1e293b
 * - slate-900:    #0f172a
 * 
 * BACKGROUNDS
 * - bg-dark:      #0f0f1e   (deepest background)
 * - bg-surface:   #1a1a2e   (card/surface layer)
 * - bg-card:      #2d2d44   (elevated surface)
 * 
 * ====================================================================================================
 * TYPOGRAPHY
 * ====================================================================================================
 * 
 * Font Family: Inter (sans-serif)
 * 
 * Size Scale:
 * - xs:  12px (captions, small labels)
 * - sm:  14px (secondary text, helpers)
 * - base: 16px (body text)
 * - lg:  18px (section text)
 * - xl:  20px (subsections)
 * - 2xl: 24px (section headers)
 * - 3xl: 30px (page titles)
 * - 4xl: 36px (major headings)
 * - 5xl: 48px (hero titles)
 * 
 * Weight Scale:
 * - light:   300 (subtle text, hints)
 * - normal:  400 (body text)
 * - medium:  500 (emphasis within body)
 * - semibold: 600 (section headers)
 * - bold:    700 (main headers, CTAs)
 * 
 * ====================================================================================================
 * COMPONENTS
 * ====================================================================================================
 * 
 * BUTTON
 * ├── variant: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'outline' | 'ghost'
 * ├── size: 'sm' | 'md' | 'lg'
 * ├── icon?: ReactNode
 * ├── isLoading?: boolean
 * └── Example:
 *     <Button variant="primary" size="lg" icon={<Icon />}>
 *       Click Me
 *     </Button>
 * 
 * Primary: Purple gradient, white text, strong shadow
 * Secondary: Gold gradient, dark text, warm shadow
 * Tertiary: Teal gradient, white text, cool shadow
 * Danger: Red gradient, white text, red shadow
 * Outline: Transparent with border, matches primary color
 * Ghost: Transparent with hover background
 * 
 * CARD
 * ├── isHoverable?: boolean (adds scale animation on hover)
 * ├── withBorder?: boolean (default: true)
 * ├── withShadow?: boolean (default: true)
 * ├── CardHeader: Top section with padding & border
 * ├── CardBody: Main content area
 * └── CardFooter: Bottom section for actions
 * 
 * MODAL
 * ├── isOpen: boolean
 * ├── onClose: () => void
 * ├── title?: string
 * ├── size?: 'sm' | 'md' | 'lg' | 'xl'
 * ├── showCloseButton?: boolean
 * └── Features: Backdrop blur, centered, with animation
 * 
 * HEADER (AppHeader)
 * ├── showLogo?: boolean
 * ├── showUserMenu?: boolean
 * ├── sticky?: boolean
 * ├── actions?: ReactNode (center area)
 * └── Features: Backdrop blur, user avatar dropdown
 * 
 * SIDEBAR
 * ├── isCollapsed?: boolean
 * ├── SidebarSection: Grouped content with optional header
 * └── SidebarItem: Individual menu item with icon support
 * 
 * INPUT / TEXTAREA
 * ├── label?: string
 * ├── error?: string
 * ├── helper?: string
 * ├── icon?: ReactNode (for Input only)
 * └── Features: Focus glow, error state, helper text
 * 
 * ====================================================================================================
 * USAGE PATTERNS
 * ====================================================================================================
 * 
 * BUTTONS
 * --------
 * // Primary action (most important)
 * <Button variant="primary">Save Changes</Button>
 * 
 * // Secondary action (supporting)
 * <Button variant="secondary">Export</Button>
 * 
 * // Success/positive action
 * <Button variant="tertiary">Confirm</Button>
 * 
 * // Destructive action
 * <Button variant="danger">Delete</Button>
 * 
 * // Less prominent action
 * <Button variant="outline">Learn More</Button>
 * 
 * // Subtle/ghost button
 * <Button variant="ghost">More Options</Button>
 * 
 * CARDS
 * ------
 * <Card isHoverable>
 *   <CardHeader>
 *     <h3>Title</h3>
 *   </CardHeader>
 *   <CardBody>
 *     Content here
 *   </CardBody>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * 
 * MODALS
 * -------
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   size="md"
 * >
 *   <p>Are you sure?</p>
 *   <Button variant="danger">Yes, Delete</Button>
 * </Modal>
 * 
 * ANIMATIONS
 * -----------
 * Page entrance: fade-in + slide-up (0.6s)
 * Button hover: lift effect (scale + shadow)
 * Card hover: scale + shadow (card-hover class)
 * Modal: fade backdrop + scale content
 * 
 * ====================================================================================================
 * SPACING & LAYOUT
 * ====================================================================================================
 * 
 * Base unit: 4px (Tailwind)
 * 
 * Common spacings:
 * - xs: 8px   (gap between inline elements)
 * - sm: 12px  (internal component padding)
 * - md: 16px  (standard padding)
 * - lg: 24px  (section padding)
 * - xl: 32px  (major spacing)
 * - 2xl: 48px (page margin)
 * 
 * Responsive:
 * - Mobile: px-4 (16px padding)
 * - Tablet: px-6 (24px padding)
 * - Desktop: px-8 (32px padding)
 * 
 * ====================================================================================================
 * SHADOWS & DEPTH
 * ====================================================================================================
 * 
 * Shadow levels:
 * - sm: Light shadow for subtle depth
 * - md: Standard shadow for cards
 * - lg: Strong shadow for elevated elements
 * - xl: Very strong shadow for overlays
 * 
 * Colored shadows (by feature):
 * - Primary (purple): shadow-lg shadow-primary-600/40
 * - Secondary (gold): shadow-lg shadow-accent-500/30
 * - Tertiary (teal): shadow-lg shadow-teal-500/30
 * 
 * ====================================================================================================
 * STATES & INTERACTIONS
 * ====================================================================================================
 * 
 * Hover: Scale 1.05, enhanced shadow
 * Active/Focus: Border change, glow effect
 * Disabled: Opacity 50%, cursor-not-allowed
 * Loading: Spinner animation
 * Error: Red border, error text below
 * Success: Green checkmark, success message
 * 
 * Transitions: All changes use 300ms duration with cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * 
 * ====================================================================================================
 * ACCESSIBILITY
 * ====================================================================================================
 * 
 * - All buttons have hover states and focus indicators
 * - Color is not the only means of conveying information
 * - Icons are paired with text labels where appropriate
 * - Inputs have associated labels
 * - Modals trap focus and show backdrop for context
 * - Sufficient contrast ratios throughout (WCAG AA)
 * 
 * ====================================================================================================
 * BREAKPOINTS
 * ====================================================================================================
 * 
 * sm: 640px  (small phones)
 * md: 768px  (tablets)
 * lg: 1024px (laptops)
 * xl: 1280px (desktops)
 * 2xl: 1536px (large screens)
 * 
 * ====================================================================================================
 * COMPONENT STRUCTURE
 * ====================================================================================================
 * 
 * src/components/
 * ├── ui/              (Reusable, framework-agnostic components)
 * │   ├── Button.tsx
 * │   ├── Card.tsx
 * │   ├── Modal.tsx
 * │   ├── Input.tsx
 * │   ├── Textarea.tsx
 * │   ├── Sidebar.tsx
 * │   └── index.ts
 * │
 * ├── layout/          (Page structure components)
 * │   ├── AppHeader.tsx
 * │   └── index.ts
 * │
 * ├── genogram/        (Genogram-specific components)
 * │   ├── GenogramCanvas.tsx
 * │   ├── PersonNode.tsx
 * │   ├── GenogramLegend.tsx
 * │   └── ...
 * │
 * ├── modals/          (Feature-specific modals)
 * │   ├── AddPersonModal.tsx
 * │   ├── AddRelationModal.tsx
 * │   ├── AIAnalysisModal.tsx
 * │   └── ...
 * │
 * └── common/          (Small utilities, wrappers)
 *     └── ...
 * 
 * ====================================================================================================
 * DESIGN PRINCIPLES
 * ====================================================================================================
 * 
 * 1. PSYCHOLOGY-FOCUSED
 *    - Purple conveys insight, healing, and growth
 *    - Calm, non-alarming interface for sensitive topics
 * 
 * 2. GENEALOGY-AWARE
 *    - Warm gold accents reference family, heritage
 *    - Tree-like natural flow in layouts
 * 
 * 3. MODERN & CLEAN
 *    - Minimal borders, abundant whitespace
 *    - Clear visual hierarchy through size & weight
 * 
 * 4. ACCESSIBLE & INCLUSIVE
 *    - High contrast, clear interactions
 *    - Support for assistive technologies
 * 
 * 5. CONSISTENT EXPERIENCE
 *    - Unified component library
 *    - Predictable behavior across features
 * 
 * ====================================================================================================
 */
