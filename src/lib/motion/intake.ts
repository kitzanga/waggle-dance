import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

export const INTAKE_MOTION = {
  heroEnter: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 },
  },
  heroCollapse: {
    animate: { fontSize: '13px', color: 'var(--text-muted)' },
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
  openingExit: {
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2 },
  },
  sendPress: {
    whileTap: { scale: 0.94 },
    transition: { duration: 0.1 },
  },
  progressFill: {
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
} as const

/**
 * Hook that delegates to Framer Motion's useReducedMotion.
 * When true, all entrance animations skip to final state and
 * all state transitions apply instantly.
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false
}
