'use client'

interface CalibrationPromptProps {
  prompt: string
  supportingCopy: string
}

export function CalibrationPrompt({ prompt, supportingCopy }: CalibrationPromptProps) {
  return (
    <div>
      <p
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 400,
          lineHeight: 1.45,
          letterSpacing: '-0.015em',
          color: 'var(--text-primary)',
        }}
      >
        {prompt}
      </p>
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          marginTop: '6px',
        }}
      >
        {supportingCopy}
      </p>
    </div>
  )
}
