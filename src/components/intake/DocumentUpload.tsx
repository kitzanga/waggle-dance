'use client'

import { useState, useRef } from 'react'

interface DocumentUploadProps {
  storyId: string
  onUploadComplete: (result: {
    documentUrl: string
    extractedText: string | null
  }) => void
  onUploadError: (error: string) => void
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

export function DocumentUpload({
  storyId,
  onUploadComplete,
  onUploadError,
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedName, setUploadedName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onUploadError('Unsupported format. Accepted: PDF, DOCX, PPTX')
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      onUploadError('File exceeds 20MB limit')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('storyId', storyId)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        onUploadError(data.error || 'Upload failed')
        return
      }

      setUploadedName(file.name)
      onUploadComplete({
        documentUrl: data.documentUrl,
        extractedText: data.extractedText,
      })
    } catch {
      onUploadError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  if (uploadedName) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-secondary)]">
        <svg
          className="w-4 h-4 text-[var(--color-success)] shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="truncate">{uploadedName}</span>
      </div>
    )
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.pptx"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload a document"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          text-sm text-[var(--color-text-muted)]
          hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)]
          transition-colors duration-150
          disabled:opacity-50
          min-h-[44px]
        "
      >
        {isUploading ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
            <span>Uploading...</span>
          </>
        ) : (
          <>
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
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <span>Have a document? Attach it.</span>
          </>
        )}
      </button>
    </div>
  )
}
