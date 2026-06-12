'use client'

interface PastCalibrationStepProps {
  prompt: string
  selectedLabel: string
}

export function PastCalibrationStep({ prompt, selectedLabel }: PastCalibrationStepProps) {
  return (
    <div>
      {/* AI question (receded) */}
      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}
      >
        {prompt}
      </p>

      {/* Hairline divider */}
      <div
        style={{
          height: '1px',
          background: 'var(--border-default)',
          margin: '8px 0',
        }}
      />

      {/* Creator's selection */}
      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
        }}
      >
        {selectedLabel}
      </p>
    </div>
  )
}
