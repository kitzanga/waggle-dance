'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion/intake'

interface OpeningStateProps {
  visible: boolean
}

export function OpeningState({ visible }: OpeningStateProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="flex flex-col items-center justify-center flex-1 px-6"
          style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}
          initial={{ opacity: 1, y: 0 }}
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -8 }
          }
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <h2
            className="text-center"
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: 1.3,
            }}
          >
            What&apos;s the idea?
          </h2>
          <p
            className="text-center"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
              marginTop: '10px',
              lineHeight: 1.45,
            }}
          >
            A sentence is enough. We&apos;ll build from there.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
