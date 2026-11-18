'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export default function NativeDialog({ titleId, onClose, busy = false, children }: {
  titleId: string; onClose: () => void; busy?: boolean; children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog?.showModal()
    return () => { dialog?.close(); if (opener?.isConnected) opener.focus() }
  }, [])
  return <dialog ref={ref} aria-labelledby={titleId} aria-busy={busy}
    onCancel={event => { event.preventDefault(); if (!busy) onClose() }}
    className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-gray-300 bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/50">
    {children}
  </dialog>
}
