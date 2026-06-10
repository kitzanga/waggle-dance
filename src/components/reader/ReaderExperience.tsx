'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Story } from '@/types/story'
import { ChapterReveal } from './ChapterReveal'

interface ReaderExperienceProps {
  story: Story
}

export function ReaderExperience({ story }: ReaderExperienceProps) {
  const [currentChapter, setCurrentChapter] = useState(0)
  const chapters = story.storyContent
  const isLastChapter = currentChapter === chapters.length - 1

  function advanceChapter() {
    if (!isLastChapter) {
      setCurrentChapter((prev) => prev + 1)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--surface-page)', color: 'var(--text-primary)' }}
    >
      {/* Title card for first chapter */}
      {currentChapter === 0 && (
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="pt-16 pb-8 px-4 text-center"
        >
          <h1
            className="leading-tight text-3xl md:text-4xl"
            style={{ fontFamily: 'var(--font-reading)', color: 'var(--text-primary)' }}
          >
            {story.title}
          </h1>
        </motion.header>
      )}

      {/* Chapter content */}
      <main id="main-content" className="flex-1 px-4 max-w-[720px] mx-auto w-full">
        <AnimatePresence mode="wait">
          <ChapterReveal
            key={currentChapter}
            chapter={chapters[currentChapter]}
            index={currentChapter}
            showVisuals={story.visualsEnabled}
          />
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <footer className="px-4 py-8 text-center">
        {!isLastChapter ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            onClick={advanceChapter}
            className="inline-flex items-center gap-2 px-6 py-3 transition-colors duration-300 min-h-[44px] text-sm"
            style={{ fontFamily: 'var(--font-reading)', color: 'var(--text-secondary)' }}
            aria-label="Continue to next chapter"
          >
            <span>Continue</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.button>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="text-sm italic"
            style={{ fontFamily: 'var(--font-reading)', color: 'var(--text-muted)' }}
          >
            ·
          </motion.p>
        )}
      </footer>
    </div>
  )
}
