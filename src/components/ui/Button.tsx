'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: '',
  secondary: '',
  ghost: '',
  danger: '',
}

const variantInlineStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: 'var(--accent)', color: '#ffffff' },
  secondary: { background: 'var(--surface-card)', color: 'var(--text-primary)', border: '0.5px solid var(--border-default)' },
  ghost: { background: 'transparent', color: 'var(--text-secondary)' },
  danger: { background: '#ff453a', color: '#ffffff' },
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[13px] min-h-[44px] min-w-[44px]',
  md: 'px-4 py-2 text-[15px] min-h-[44px] min-w-[44px]',
  lg: 'px-6 py-2.5 text-[15px] min-h-[44px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className = '',
      children,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center rounded-full font-medium
          transition-all duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          disabled:opacity-40 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        style={{ ...variantInlineStyles[variant], ...style }}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2" role="status">
            <span
              className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
              aria-hidden="true"
            />
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
