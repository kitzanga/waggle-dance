'use client'

import { motion } from 'framer-motion'
import type { Chapter } from '@/types/story'

interface ChapterRevealProps {
  chapter: Chapter
  index: number
  showVisuals: boolean
}

export function ChapterReveal({ chapter, index, showVisuals }: ChapterRevealProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="py-12"
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest"
      >
        {index + 1}
      </motion.span>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="font-serif text-2xl text-[var(--color-text-primary)] mt-3 mb-6"
      >
        {chapter.title}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="prose-reading"
      >
        {chapter.body.split('\n\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </motion.div>

      {showVisuals && chapter.imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8 rounded-lg overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={chapter.imageUrl}
            alt=""
            className="w-full h-auto"
          />
        </motion.div>
      )}
    </motion.article>
  )
}
