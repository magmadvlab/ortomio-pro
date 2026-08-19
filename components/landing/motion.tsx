'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

export { useReducedMotion }

/** Ease-out esponenziale: parte visibile, arriva morbida. */
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

/**
 * Reveal allo scroll: fade + risalita leggera, una volta sola.
 * Con `prefers-reduced-motion` l'elemento è subito visibile senza transizioni.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  )
}

/** Container per griglie: i figli entrano scaglionati. */
export function staggerParent(stagger = 0.08): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
  }
}

/** Figlio di StaggerParent: stessa famiglia di movimento del Reveal. */
export function staggerItem(y = 20): Variants {
  return {
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
  }
}

export { motion }
