'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface InputBarProps {
  onSubmit: (text: string) => void
  onAttach: () => void
  isDisabled: boolean
  attachError: string | null
}

export function InputBar({ onSubmit, onAttach, isDisabled, attachError }: InputBarProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasContent = value.trim().length > 0
  const canSend = hasContent && !isDisabled

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const lineHeight = 22
    const maxHeight = lineHeight * 5 + 18 // 5 lines + padding
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [value])

  function handleSubmit() {
    if (!canSend) return
    onSubmit(value.trim())
    setValue('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div
      style={{
        borderTop: '1px solid var(--border-default)',
        background: 'var(--surface-bar, transparent)',
        padding: '12px 24px 20px',
      }}
    >
      {/* Attach error */}
      {attachError && (
        <p
          className="text-center mb-2"
          style={{ fontSize: 'var(--text-xs)', color: '#ff453a' }}
        >
          {attachError}
        </p>
      )}

      {/* Inner container */}
      <div
        className="flex items-end"
        style={{
          maxWidth: 'var(--content-max)',
          margin: '0 auto',
          gap: '8px',
        }}
      >
        {/* Attach button */}
        <button
          type="button"
          onClick={onAttach}
          className="flex-shrink-0 flex items-center justify-center transition-opacity hover:opacity-70"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'none',
            border: '0.5px solid var(--border-input)',
          }}
          aria-label="Attach document"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--text-muted)' }}
            aria-hidden="true"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your answer…"
          disabled={isDisabled}
          rows={1}
          className="flex-1 resize-none"
          style={{
            background: 'var(--surface-input)',
            border: '0.5px solid var(--border-input)',
            borderRadius: '18px',
            padding: '9px 14px',
            fontSize: 'var(--text-base)',
            lineHeight: 1.47,
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 150ms',
            minHeight: '38px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-input-focus)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-input)'
          }}
          aria-label="Your answer"
        />

        {/* Send button */}
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          whileTap={canSend ? { scale: 0.94 } : undefined}
          transition={{ duration: 0.1 }}
          className="flex-shrink-0 flex items-center justify-center transition-opacity"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'var(--accent)',
            border: 'none',
            opacity: canSend ? 1 : 0.35,
            cursor: canSend ? 'pointer' : 'default',
          }}
          aria-label="Send message"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      </div>
    </div>
  )
}
