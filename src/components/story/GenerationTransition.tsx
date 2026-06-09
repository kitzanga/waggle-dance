'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface GenerationTransitionProps {
  isActive: boolean
  message?: string
}

export function GenerationTransition({ isActive, message }: GenerationTransitionProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center min-h-[60vh] px-8"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center"
          >
            {/* Subtle animated indicator */}
            <motion.div
              className="w-12 h-12 mx-auto mb-8 rounded-full border-2 border-[var(--color-accent)]"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <p className="font-serif text-xl text-[var(--color-text-primary)] mb-3">
              {message || 'Finding the story inside your challenge...'}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              This takes a moment. The right metaphor is worth waiting for.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
