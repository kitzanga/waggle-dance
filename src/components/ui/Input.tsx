'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg px-4 py-3 transition-colors duration-150 min-h-[44px] ${className}`}
          style={{
            background: 'var(--surface-input)',
            color: 'var(--text-primary)',
            border: error ? '1px solid #ff453a' : '0.5px solid var(--border-input)',
            outline: 'none',
            fontSize: 'var(--text-base)',
          }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            style={{ fontSize: 'var(--text-sm)', color: '#ff453a' }}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
