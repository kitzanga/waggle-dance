'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-md rounded-xl p-0 backdrop:bg-black/60"
      style={{
        background: 'var(--surface-card)',
        color: 'var(--text-primary)',
        border: '0.5px solid var(--border-default)',
      }}
      aria-labelledby="modal-title"
    >
      <div className="p-6">
        <h2
          id="modal-title"
          className="mb-4"
          style={{ fontSize: 'var(--text-lg)', fontWeight: 500 }}
        >
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  )
}
