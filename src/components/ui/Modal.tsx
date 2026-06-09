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
      className="
        w-full max-w-md rounded-xl p-0
        bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]
        border border-[var(--color-border)]
        backdrop:bg-black/60
      "
      aria-labelledby="modal-title"
    >
      <div className="p-6">
        <h2
          id="modal-title"
          className="text-lg font-medium mb-4"
        >
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  )
}
