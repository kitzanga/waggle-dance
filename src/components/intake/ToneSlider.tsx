'use client'

import { useRef, useCallback } from 'react'
import { getToneReadout } from '@/lib/intake/calibration-config'

interface ToneSliderProps {
  value: number // 0–100
  onChange: (value: number) => void
  hasInteracted: boolean
  onInteract: () => void
}

export function ToneSlider({ value, onChange, hasInteracted, onInteract }: ToneSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      onChange(newValue)
      if (!hasInteracted) {
        onInteract()
      }
    },
    [onChange, hasInteracted, onInteract]
  )

  const handlePointerDown = useCallback(() => {
    if (!hasInteracted) {
      onInteract()
    }
  }, [hasInteracted, onInteract])

  const readout = hasInteracted ? getToneReadout(value) : null

  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '0.5px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
      }}
    >
      {/* Pole labels + slider */}
      <div className="flex items-center" style={{ gap: '14px' }}>
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          Warm
        </span>

        <div className="flex-1 relative" ref={trackRef} style={{ height: '18px' }}>
          {/* Custom track visual */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '2px',
              borderRadius: '2px',
              background: 'var(--border-default)',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          {/* Fill from left */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: `${value}%`,
              height: '2px',
              borderRadius: '2px',
              background: 'var(--progress-active)',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              transition: 'width 50ms',
            }}
          />
          {/* Native range input (positioned over the track for accessibility) */}
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={value}
            onChange={handleSliderChange}
            onPointerDown={handlePointerDown}
            aria-label="Tone temperature"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-valuetext={readout ?? 'Move slider to set tone'}
            className="tone-slider-input"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              margin: 0,
              opacity: 0,
              cursor: 'pointer',
            }}
          />
          {/* Custom thumb */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${value}%`,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'var(--surface-card)',
              border: '0.5px solid var(--border-input)',
              boxShadow: 'var(--shadow-sm)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              transition: 'left 50ms',
            }}
          />
        </div>

        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          Cool
        </span>
      </div>

      {/* Readout — only after interaction */}
      {readout && (
        <p
          className="text-center"
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            marginTop: '10px',
            transition: 'opacity 200ms',
          }}
        >
          {readout}
        </p>
      )}
    </div>
  )
}
