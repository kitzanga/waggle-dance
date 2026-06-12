'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion/intake'

interface ContinueCTAProps {
  visible: boolean
  onClick: () => void
  label?: string
}

export function ContinueCTA({ visible, onClick, label = 'Continue' }: ContinueCTAProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
          }
          style={{ marginTop: '16px' }}
        >
          <button
            type="button"
            onClick={onClick}
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--text-primary)',
              background: 'var(--surface-card)',
              border: '0.5px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              padding: '8px 20px',
              cursor: 'pointer',
              transition: 'background-color 150ms',
            }}
          >
            {label}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
