# OrtoMio Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current no-op landing (`app/page.tsx`, which only spins and redirects) with a real public marketing landing page for unauthenticated visitors, while preserving today's behavior for authenticated users and Supabase auth-callback links.

**Architecture:** A session-aware root page (`app/page.tsx`) decides between three outcomes — auth-callback redirect, authenticated redirect to `/app`, or rendering the new `LandingPage` component tree — using a small pure decision function that is unit tested. The landing itself is a stack of presentational section components under `components/landing/`, composed by `LandingPage.tsx`, styled with the project's existing Tailwind design tokens (no new tokens needed).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS (existing `ortomio-green` / `ortomio-earth` / `semantic` tokens in `tailwind.config.js` + `index.css`), `packages/core/hooks/useAuth` for session state. Test runner: Node's built-in `tsx --test` (see `__tests__/`), no Jest/Vitest/React Testing Library in this repo — do not add one for this plan.

## Global Constraints

- **Copy source of truth:** every string of copy used in this plan comes from `docs/superpowers/specs/2026-08-15-ortomio-landing-copy-design.md` (validated) — do not paraphrase or invent new copy while implementing. If a task's JSX and the spec ever disagree, the spec wins and the JSX in this plan has a bug.
- **Honesty guardrail (non-negotiable):** no fabricated customer names, quotes, or result numbers anywhere in the landing. Every technical number (confidence range, capability counts, formulas) must match what is documented in `docs/DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-15_APPROFONDITO.md`.
- **Preserve existing behavior:** authenticated users still land on `/app` automatically; Supabase auth-callback query params (`code`, `token_hash`, `type`, `error`, `error_description`) still redirect to `/auth/callback` exactly as today.
- **Design tokens for accent/brand color — use these, do not invent new brand colors:** `ortomio-green-50/100/500/600/700/900`, `ortomio-earth-100/200/500/600/700`, `semantic-warning`, `semantic-info` (all defined in `index.css` and exposed via `tailwind.config.js`). **Neutral body text/borders** may use standard Tailwind gray scale (`text-gray-400/500/600/700/800`, `border-gray-200/300`) since the project has no dedicated neutral-gray token — every task's example JSX in this plan uses this mix deliberately (accent tokens for brand moments: headlines, CTAs, swatches, badges; gray for plain body copy), and that mix is correct, not a constraint violation. Fonts: `font-display` (DM Sans) for headings, `font-body` (Inter, the Tailwind default already applies this via `body`) for copy, `font-mono` (JetBrains Mono) for data labels/badges — matches the "measured/estimated" motif from the copy spec.
- **No new test framework:** only `lib/landing/rootRouting.ts` gets a unit test (pure function, testable with the existing `tsx --test` runner). Presentational components are verified manually via `npm run dev` + browser — this repo has no component-test infrastructure, and adding one is out of scope for a landing page.
- **CTA targets:** primary CTA → `/app`. Secondary "Accedi" link → `/login` (existing route, `app/(auth)/login`). Do not create new routes for these.

---

### Task 1: Root routing decision logic

**Files:**
- Create: `lib/landing/rootRouting.ts`
- Test: `__tests__/landing/rootRouting.test.ts`

**Interfaces:**
- Produces: `type RootRoutingInput = { hasAuthCallbackParams: boolean; authLoading: boolean; isAuthenticated: boolean }` and `type RootRoutingDecision = 'AUTH_CALLBACK' | 'LOADING' | 'REDIRECT_APP' | 'SHOW_LANDING'`, and `function decideRootRouting(input: RootRoutingInput): RootRoutingDecision`. Task 2 imports both the type and the function by these exact names from `@/lib/landing/rootRouting`.

- [ ] **Step 1: Write the failing test**

Create `__tests__/landing/rootRouting.test.ts`:

```typescript
import test from 'node:test'
import assert from 'node:assert/strict'
import { decideRootRouting } from '../../lib/landing/rootRouting'

test('auth callback params always win, even while loading or authenticated', () => {
  assert.equal(
    decideRootRouting({ hasAuthCallbackParams: true, authLoading: true, isAuthenticated: false }),
    'AUTH_CALLBACK'
  )
  assert.equal(
    decideRootRouting({ hasAuthCallbackParams: true, authLoading: false, isAuthenticated: true }),
    'AUTH_CALLBACK'
  )
})

test('shows a loading state while auth session is still resolving', () => {
  assert.equal(
    decideRootRouting({ hasAuthCallbackParams: false, authLoading: true, isAuthenticated: false }),
    'LOADING'
  )
})

test('redirects authenticated users to /app once loading is done', () => {
  assert.equal(
    decideRootRouting({ hasAuthCallbackParams: false, authLoading: false, isAuthenticated: true }),
    'REDIRECT_APP'
  )
})

test('shows the landing page for unauthenticated visitors once loading is done', () => {
  assert.equal(
    decideRootRouting({ hasAuthCallbackParams: false, authLoading: false, isAuthenticated: false }),
    'SHOW_LANDING'
  )
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `NODE_OPTIONS=--conditions=react-server npx --yes tsx --test __tests__/landing/rootRouting.test.ts`
Expected: FAIL — `Cannot find module '../../lib/landing/rootRouting'`

- [ ] **Step 3: Write minimal implementation**

Create `lib/landing/rootRouting.ts`:

```typescript
export type RootRoutingInput = {
  hasAuthCallbackParams: boolean
  authLoading: boolean
  isAuthenticated: boolean
}

export type RootRoutingDecision = 'AUTH_CALLBACK' | 'LOADING' | 'REDIRECT_APP' | 'SHOW_LANDING'

export function decideRootRouting(input: RootRoutingInput): RootRoutingDecision {
  if (input.hasAuthCallbackParams) {
    return 'AUTH_CALLBACK'
  }
  if (input.authLoading) {
    return 'LOADING'
  }
  return input.isAuthenticated ? 'REDIRECT_APP' : 'SHOW_LANDING'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `NODE_OPTIONS=--conditions=react-server npx --yes tsx --test __tests__/landing/rootRouting.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/landing/rootRouting.ts __tests__/landing/rootRouting.test.ts
git commit -m "feat: add pure root routing decision for landing vs redirect"
```

---

### Task 2: Wire `app/page.tsx` to the routing decision

**Revision note (added after Task 1 was already complete):** the original version of this task assumed `useAuth()` could be called from `app/page.tsx` directly. It cannot — `AuthProvider` (from `@/packages/core/hooks/useAuth`) is only mounted inside `app/app/layout.tsx` and `app/dashboard/layout.tsx`, not in the root `app/layout.tsx` that `app/page.tsx` renders under. Calling `useAuth()` outside an `AuthProvider` throws `Error: useAuth must be used within an AuthProvider` immediately. Human decision: mount `AuthProvider` at the **root** layout instead, shared by the whole app, and remove the now-redundant nested providers from `app/app/layout.tsx` and `app/dashboard/layout.tsx`. This task now touches three files instead of one.

**Second revision note:** implementing the first revision surfaced a second, unrelated pre-existing gap: `packages/core/hooks/useAuth.tsx` uses `useState`/`useEffect`/`createContext` but has no `'use client'` directive at the top of the file. This was invisible until now because every existing importer (`app/app/layout.tsx`, `app/dashboard/layout.tsx`) was already itself a client component; importing it from the true Server Component root layout exposes the gap and 500s every route. Fix: add `'use client'` as the first line of `packages/core/hooks/useAuth.tsx` — a one-line, single-option fix (the hook already only contains client-only logic), not an architectural choice, so this task's scope now includes that file too.

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/app/layout.tsx`
- Modify: `app/dashboard/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `packages/core/hooks/useAuth.tsx` (add `'use client'` as line 1 — no other change)

**Interfaces:**
- Consumes: `decideRootRouting`, `RootRoutingInput` from `@/lib/landing/rootRouting` (Task 1). `useAuth`, `AuthProvider` from `@/packages/core/hooks/useAuth` (existing — `useAuth()` exposes `{ user, loading }`; `AuthProvider` is an existing client component that takes `children`).
- Consumes: `LandingPage` default export from `@/components/landing/LandingPage` (Task 8 creates this — until Task 8 lands, Step 4 below temporarily renders a placeholder `<div>Landing placeholder</div>` instead of `<LandingPage />`; Task 8's last step swaps the placeholder for the real import).

- [ ] **Step 1: Mount `AuthProvider` once, at the root layout**

`app/layout.tsx` is a server component (it exports `metadata`) — that's fine, a server component can render a client component like `AuthProvider` as a wrapper around its children without itself becoming a client component. Add the import and wrap `{children}`:

```typescript
import '../index.css'
import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/packages/core/hooks/useAuth'

export const metadata: Metadata = {
  title: 'OrtoMio Agricoltura',
  description: 'Centro operativo per gestione agricola, appezzamenti e coltivazioni',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OrtoMio',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#10b981',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="bg-gray-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

(This is the existing file with only the `AuthProvider` import added and `{children}` wrapped — every other line is unchanged from today's `app/layout.tsx`. Read the current file first to confirm no other lines have drifted since this plan was written, and preserve anything present that isn't shown above.)

- [ ] **Step 2: Remove the now-redundant nested `AuthProvider` from `app/app/layout.tsx`**

Read the current `app/app/layout.tsx` first. Remove the `AuthProvider` import and its wrapping JSX tags only — keep every other provider (`CapabilityProvider`, `StorageProvider`, `TierProvider`) and `AuthGuard` exactly as they are today, just no longer nested inside a second `AuthProvider`. The file's shape goes from:

```tsx
import { AuthProvider } from '@/packages/core/hooks/useAuth'
// ...
    <AuthProvider>
      <AuthGuard>
        <CapabilityProvider>
          {/* ... */}
        </CapabilityProvider>
      </AuthGuard>
    </AuthProvider>
```

to:

```tsx
// AuthProvider import removed — it's mounted once at app/layout.tsx now
// ...
    <AuthGuard>
      <CapabilityProvider>
        {/* ... */}
      </CapabilityProvider>
    </AuthGuard>
```

- [ ] **Step 3: Remove the now-redundant nested `AuthProvider` from `app/dashboard/layout.tsx`**

Same pattern — read the current file, remove the `AuthProvider` import and its wrapping tags, keep `StorageProvider` and `TierProvider` as they are:

```tsx
'use client'

import React from 'react'
import { TierProvider } from '@/packages/core/context/TierContext'
import { StorageProvider } from '@/packages/core/context/StorageContext'
import { AppTier } from '@/packages/core/config/tiers'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('🔍 Dashboard Layout with providers loading...')

  return (
    <StorageProvider>
      <TierProvider defaultTier={AppTier.PRO}>
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#f9fafb'
        }}>
          {children}
        </div>
      </TierProvider>
    </StorageProvider>
  )
}
```

- [ ] **Step 4: Replace `app/page.tsx` with the session-aware version**

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { decideRootRouting } from '@/lib/landing/rootRouting'

export default function HomePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [callbackParams, setCallbackParams] = useState<URLSearchParams | null>(null)

  useEffect(() => {
    setCallbackParams(new URLSearchParams(window.location.search))
  }, [])

  const hasAuthCallbackParams = useMemo(() => {
    if (!callbackParams) return false
    return Boolean(
      callbackParams.get('code') || callbackParams.get('token_hash') || callbackParams.get('error')
    )
  }, [callbackParams])

  // callbackParams starts null on first render (before the effect above runs) so we
  // don't know yet whether this is an auth-callback link; treat that as still loading.
  const decision = callbackParams === null
    ? 'LOADING'
    : decideRootRouting({
        hasAuthCallbackParams,
        authLoading,
        isAuthenticated: Boolean(user),
      })

  useEffect(() => {
    if (decision === 'AUTH_CALLBACK' && callbackParams) {
      const forward = new URLSearchParams()
      const code = callbackParams.get('code')
      const tokenHash = callbackParams.get('token_hash')
      const type = callbackParams.get('type')
      const error = callbackParams.get('error')
      const errorDescription = callbackParams.get('error_description')
      if (code) forward.set('code', code)
      if (tokenHash) forward.set('token_hash', tokenHash)
      if (type) forward.set('type', type)
      if (error) forward.set('error', error)
      if (errorDescription) forward.set('error_description', errorDescription)
      router.replace(`/auth/callback?${forward.toString()}`)
      return
    }
    if (decision === 'REDIRECT_APP') {
      router.push('/app')
    }
  }, [decision, callbackParams, router])

  if (decision === 'LOADING' || decision === 'AUTH_CALLBACK' || decision === 'REDIRECT_APP') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ortomio-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ortomio-green-600 mx-auto" />
          <p className="text-sm text-gray-500 mt-4">Caricamento...</p>
        </div>
      </div>
    )
  }

  return <div>Landing placeholder</div>
}
```

- [ ] **Step 5: Manual verification — `/app` and `/dashboard` still work with a single shared `AuthProvider`**

Run: `npm run dev`, sign in with a test account, navigate to `/app`.
Expected: loads exactly as before this change (no duplicate-provider errors, no infinite loading, `AuthGuard` still gates access). If `/dashboard` is reachable in this environment, check it too.

- [ ] **Step 6: Manual verification — authenticated redirect from root still works**

While still signed in, navigate to `/`.
Expected: brief spinner, then automatic redirect to `/app` (same as before this change).

- [ ] **Step 7: Manual verification — auth callback still works**

Navigate to `/?code=test123` while logged out.
Expected: immediate redirect to `/auth/callback?code=test123` (same as before this change).

- [ ] **Step 8: Manual verification — unauthenticated visitor sees the placeholder**

Open `/` in a private/incognito window (no session).
Expected: after the loading spinner, the page shows "Landing placeholder" instead of redirecting — confirms the routing decision now reaches `SHOW_LANDING`.

- [ ] **Step 9: Commit**

```bash
git add app/layout.tsx app/app/layout.tsx app/dashboard/layout.tsx app/page.tsx packages/core/hooks/useAuth.tsx
git commit -m "feat: share AuthProvider at root layout, make root page session-aware"
```

---

### Task 3: `LandingHeader` component

**Files:**
- Create: `components/landing/LandingHeader.tsx`

**Interfaces:**
- Produces: default export `LandingHeader` — a component with no props, self-contained. Task 8 renders `<LandingHeader />` at the top of `LandingPage`.

- [ ] **Step 1: Create the header component**

```tsx
import Link from 'next/link'
import Image from 'next/image'

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-ortomio-earth-200 bg-ortomio-green-50/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-baseline gap-2">
          <Image src="/logo.png" alt="OrtoMio" width={28} height={28} className="rounded" />
          <span className="font-display text-lg font-extrabold tracking-tight text-ortomio-green-900">
            OrtoMio
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 rounded-full border border-semantic-warning/50 bg-semantic-warning/10 px-2.5 py-1 font-mono text-xs text-semantic-warning sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-semantic-warning" />
            demo/beta
          </span>
          <Link
            href="/login"
            className="text-sm text-ortomio-earth-700 underline-offset-2 hover:underline"
          >
            Accedi
          </Link>
          <Link
            href="/app"
            className="rounded-md bg-ortomio-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-ortomio-green-700"
          >
            Prova la demo
          </Link>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Manual verification**

Temporarily render `<LandingHeader />` alone in `app/page.tsx`'s placeholder branch, run `npm run dev`, open `/` logged out.
Expected: sticky header with logo, "demo/beta" pill (hidden on narrow mobile widths), "Accedi" text link, and a solid green "Prova la demo" button. Click "Accedi" → navigates to `/login`. Click "Prova la demo" → navigates to `/app`.

- [ ] **Step 3: Commit**

```bash
git add components/landing/LandingHeader.tsx
git commit -m "feat: add landing page header with login and demo CTAs"
```

---

### Task 4: `Hero` and `StatusBanner` sections

**Files:**
- Create: `components/landing/sections/Hero.tsx`
- Create: `components/landing/sections/StatusBanner.tsx`

**Interfaces:**
- Produces: default exports `Hero` and `StatusBanner`, both no-prop components. Task 8 renders them in order right after `LandingHeader`.

- [ ] **Step 1: Create `Hero.tsx`**

Copy source: spec §1 (Hero), headline option A.

```tsx
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="border-b border-ortomio-earth-200 bg-ortomio-green-50 px-6 pb-16 pt-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7 flex flex-wrap gap-4 font-mono text-xs text-ortomio-earth-700">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-ortomio-green-600" /> misurato
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm border border-ortomio-green-600 bg-[repeating-linear-gradient(45deg,theme(colors.ortomio-green.600)_0_2px,transparent_2px_4px)]" />
            stimato
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm border border-ortomio-earth-500" /> assente
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm border border-dashed border-ortomio-earth-500" /> simulato
          </span>
        </div>

        <h1 className="mb-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ortomio-green-900 sm:text-5xl">
          Non un consiglio a scatola chiusa: un punteggio che puoi{' '}
          <span className="text-ortomio-green-700 underline decoration-ortomio-green-500 decoration-[3px] underline-offset-4">
            scomporre
          </span>
          .
        </h1>

        <p className="mb-9 max-w-xl text-lg text-gray-700">
          Ogni priorità che OrtoMio propone porta con sé il calcolo che l&apos;ha generata: confidenza
          numerica, segnali coperti e mancanti, convenienza economica. Non un&apos;agenda in più, non
          un&apos;AI che &quot;sente&quot; cosa fare — un motore che mostra il proprio ragionamento.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/app"
            className="rounded-md bg-ortomio-green-600 px-6 py-3 text-base font-bold text-white shadow-sm hover:-translate-y-0.5 hover:bg-ortomio-green-700 hover:shadow-md transition"
          >
            Prova la demo ora
          </Link>
          <span className="text-sm text-gray-500">Ambiente demo, dati fittizi — nessun impegno.</span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `StatusBanner.tsx`**

Copy source: spec §2 (Barra di stato onesta).

```tsx
export default function StatusBanner() {
  return (
    <div className="border-b border-ortomio-earth-200 bg-ortomio-earth-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-3 text-sm sm:flex-row sm:items-baseline sm:gap-4">
        <span>
          <strong className="text-semantic-warning">Demo/beta pubblica.</strong>{' '}
          Codice in produzione, dati di prova.
        </span>
        <a href="#maturita" className="text-sm font-semibold underline-offset-2 hover:underline sm:ml-auto">
          → leggi lo stato reale
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Manual verification**

Render both temporarily under the header in `app/page.tsx`'s placeholder branch, `npm run dev`, view `/`.
Expected: hero with headline, legend row, CTA button and note; directly below, an earth-toned banner with the beta disclosure and a working anchor link to `#maturita` (target added in Task 7).

- [ ] **Step 4: Commit**

```bash
git add components/landing/sections/Hero.tsx components/landing/sections/StatusBanner.tsx
git commit -m "feat: add landing hero and status banner sections"
```

---

### Task 5: `ProblemSection`, `AudienceSplit`, `BenefitsList`

**Files:**
- Create: `components/landing/sections/ProblemSection.tsx`
- Create: `components/landing/sections/AudienceSplit.tsx`
- Create: `components/landing/sections/BenefitsList.tsx`

**Interfaces:**
- Produces: default exports `ProblemSection`, `AudienceSplit`, `BenefitsList`, all no-prop. Task 8 renders `ProblemSection` after the three pillars from Task 6 in the order defined in the brief (§3, Level 1 items 3, 7, 8) — `ProblemSection` actually comes right after `StatusBanner` and before the pillars; `AudienceSplit` and `BenefitsList` come after the pillars. This task only builds the components; Task 8 fixes final order.

- [ ] **Step 1: Create `ProblemSection.tsx`**

Copy source: spec §3.

```tsx
const PROBLEM_ITEMS = [
  'Non sai più perché un intervento è stato deciso tre settimane fa.',
  'Coordinare zone, filari, colture e operatori diversi resta a voce o su carta.',
  'Non distingui a colpo d’occhio un dato misurato da una stima o da un dato mancante.',
  'Confrontare previsione ed esito richiede di rimettere insieme fonti diverse.',
  'I registri esistono, ma nessuno li rilegge davvero.',
]

export default function ProblemSection() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Il campo genera più informazione di quanta ne riesci a trattenere
        </h2>
        <p className="mb-8 max-w-2xl text-gray-700">
          In molte aziende agricole le informazioni vivono in quaderni, fogli Excel, foto sul
          telefono, promemoria a voce e app meteo separate. Quando serve ricostruire perché è
          stato fatto un trattamento, la risposta dipende da chi se lo ricorda meglio.
        </p>
        <ul className="grid gap-px overflow-hidden rounded-md border border-ortomio-earth-200 bg-ortomio-earth-200 sm:grid-cols-2">
          {PROBLEM_ITEMS.map((item) => (
            <li key={item} className="bg-white p-4 text-sm text-gray-800">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `AudienceSplit.tsx`**

Copy source: spec §5.

```tsx
export default function AudienceSplit() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Pensato per chi decide sul campo, tutti i giorni
        </h2>
        <div className="grid overflow-hidden rounded-md border border-ortomio-earth-200 sm:grid-cols-2">
          <div className="border-b border-ortomio-earth-200 p-7 sm:border-b-0 sm:border-r">
            <span className="mb-3 block font-mono text-xs uppercase tracking-wide text-gray-500">
              Aziende agricole
            </span>
            <h3 className="mb-2 font-display text-lg font-bold text-ortomio-green-900">
              Coordini zone, filari e operatori senza rincorrerli.
            </h3>
            <p className="max-w-sm text-sm text-gray-700">
              Ogni zona ha la sua storia: colture, trattamenti, irrigazioni, esiti. Chi lavora in
              campo trova il contesto già pronto, chi coordina vede tutto in un unico posto.
            </p>
          </div>
          <div className="bg-ortomio-green-50 p-7">
            <span className="mb-3 block font-mono text-xs uppercase tracking-wide text-ortomio-green-700">
              Tecnici e consulenti
            </span>
            <h3 className="mb-2 font-display text-lg font-bold text-ortomio-green-900">
              Segui più aziende con dati che si possono confrontare.
            </h3>
            <p className="max-w-sm text-sm text-gray-700">
              Stessa struttura, stessi criteri, stessa provenienza del dato per ogni cliente che
              segui. Meno tempo a ricostruire il contesto a ogni visita.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `BenefitsList.tsx`**

Copy source: spec §6.

```tsx
const BENEFITS = [
  { text: 'Una sola memoria per attività, osservazioni e risultati — non più tra quaderno, Excel e messaggi.', swatch: 'measured' },
  { text: 'Sai sempre chi ha deciso, chi ha eseguito, chi ha verificato.', swatch: 'measured' },
  { text: 'Il sistema distingue in modo esplicito dato misurato, stimato, assente o simulato — mai un numero inventato spacciato per misura.', swatch: 'estimated' },
  { text: 'Meno dipendenza dalla memoria di una singola persona in azienda.', swatch: 'measured' },
  { text: 'Una base dati reale per confrontare previsione ed esito, non solo sensazioni.', swatch: 'absent' },
] as const

function Swatch({ kind }: { kind: (typeof BENEFITS)[number]['swatch'] }) {
  const base = 'mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-sm'
  if (kind === 'measured') return <span className={`${base} bg-ortomio-green-600`} />
  if (kind === 'estimated') return <span className={`${base} border border-ortomio-green-600`} />
  return <span className={`${base} border border-ortomio-earth-500`} />
}

export default function BenefitsList() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Cosa cambia davvero
        </h2>
        <ul className="divide-y divide-ortomio-earth-200 border-t border-ortomio-earth-200">
          {BENEFITS.map((benefit) => (
            <li key={benefit.text} className="flex items-start gap-3 py-4 text-gray-800">
              <Swatch kind={benefit.swatch} />
              <span>{benefit.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Manual verification**

Temporarily render all three in `app/page.tsx`'s placeholder branch, `npm run dev`, view `/`.
Expected: problem grid (2 columns on desktop, 1 on mobile), two-column audience split with the "Tecnici" column tinted green, and a divided benefits list with swatch markers matching the legend from the Hero.

- [ ] **Step 5: Commit**

```bash
git add components/landing/sections/ProblemSection.tsx components/landing/sections/AudienceSplit.tsx components/landing/sections/BenefitsList.tsx
git commit -m "feat: add problem, audience split and benefits landing sections"
```

---

### Task 6: The three differentiator pillars

**Files:**
- Create: `components/landing/sections/PillarTransparency.tsx`
- Create: `components/landing/sections/PillarCorrelation.tsx`
- Create: `components/landing/sections/PillarTraceability.tsx`

**Interfaces:**
- Produces: default exports `PillarTransparency`, `PillarCorrelation`, `PillarTraceability`, all no-prop. These are the core differentiators from the brief §3 Level 1 items 4-6.

- [ ] **Step 1: Create `PillarTransparency.tsx`**

Copy source: brief §3 Level 1 item 4 + spec §4bis (updated version referencing `AITransparencyPanel`).

```tsx
const TABS = ['Panoramica', 'Dati usati', 'Calcoli', 'Alternative'] as const

const CALC_ROWS: Array<[string, string]> = [
  ['baseScore', '62'],
  ['+ confidenza segnali disponibili', '+9'],
  ['+ copertura segnali P0', '+6'],
  ['+ bonus fase critica', '+8'],
  ['+ fonte profilo (plant_id)', '+4'],
  ['→ lettura economica (ROI alto)', 'soglia ~75'],
]

export default function PillarTransparency() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Non &quot;fidati di noi&quot;. Apri il pannello di trasparenza.
        </h2>
        <p className="mb-6 max-w-2xl text-gray-700">
          Ogni suggerimento AI si può aprire in un pannello dedicato — non una demo isolata, il
          componente reale che accompagna ogni proposta nel prodotto.
        </p>

        <div className="mb-6 flex gap-1 border-b border-ortomio-earth-200 font-mono text-sm">
          {TABS.map((tab) => (
            <span
              key={tab}
              className={
                tab === 'Calcoli'
                  ? 'border-b-2 border-ortomio-green-600 px-3 py-2 font-bold text-ortomio-green-700'
                  : 'px-3 py-2 text-gray-400'
              }
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="rounded-md border border-ortomio-earth-200 bg-ortomio-green-50 p-5">
          <div className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-500">
            tab &quot;calcoli&quot; — esempio illustrativo, meccanismo reale
          </div>
          {CALC_ROWS.map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-dashed border-ortomio-earth-200 py-1.5 font-mono text-sm">
              <span className="text-gray-600">{label}</span>
              <span className="font-bold text-ortomio-green-700">{value}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-ortomio-green-900 pt-2 font-mono text-base font-bold text-ortomio-green-900">
            <span>punteggio finale</span>
            <span>78/100</span>
          </div>
          <div className="mt-1 flex justify-between font-mono text-sm">
            <span className="text-gray-600">confidenza dichiarata</span>
            <span className="font-bold">0.84</span>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `PillarCorrelation.tsx`**

Copy source: spec §4ter.

```tsx
export default function PillarCorrelation() {
  return (
    <section className="border-b border-ortomio-earth-200 bg-ortomio-earth-100 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Excel contiene i dati. OrtoMio li mette in relazione.
        </h2>
        <p className="mb-8 max-w-2xl text-gray-700">
          Un foglio può contenere meteo, rotazioni e fasi lunari, ognuno nella sua scheda. Non può
          far scattare un avviso perché fase lunare, stress idrico e pH sono fuori soglia nello
          stesso momento, sulla stessa zona.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-md border border-ortomio-earth-200 bg-white p-5">
            <div className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-500">
              rotazione — motivazione botanica reale
            </div>
            <div className="mb-3 space-y-1.5 text-sm">
              <div className="rounded border-l-2 border-gray-300 px-2 py-1 text-gray-400 line-through">
                evita — Solanacee (es. patata)
              </div>
              <div className="rounded border-l-2 border-ortomio-green-500 px-2 py-1">
                consigliato — Brassicacee
              </div>
              <div className="rounded border-l-2 border-ortomio-green-700 bg-ortomio-green-50 px-2 py-1 font-semibold">
                eccellente — Leguminose
              </div>
            </div>
            <p className="border-t border-dashed border-ortomio-earth-200 pt-3 text-sm italic text-gray-600">
              &quot;Le Solanacee depauperano il suolo. Seguire con leguminose per ripristinare
              l&apos;azoto.&quot; — dopo un ciclo di pomodoro.
            </p>
          </div>

          <div className="rounded-md border border-ortomio-earth-200 bg-white p-5">
            <div className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-500">
              briefing del giorno — una lettura correlata
            </div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {['Meteo sintetico', 'Fase lunare', 'GDD (growing degree days)', 'Stress idrico', 'Fotoperiodo', 'Azioni prioritizzate'].map(
                (item) => (
                  <li key={item} className="relative pl-3 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-ortomio-green-600">
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-ortomio-earth-200 pt-6">
          {['piano di semina', 'piano di rotazione', 'timing raccolta', 'irrigazione', 'nutrizione'].map((chip) => (
            <span key={chip} className="rounded-full border border-ortomio-green-600 px-2.5 py-1 font-mono text-xs text-ortomio-green-700">
              {chip}
            </span>
          ))}
          <span className="ml-1 text-sm text-gray-500">
            → ogni proposta AI resta dentro un unico percorso: punteggio → spiegazione → task →
            ledger → feedback. Mai fuori da lì.
          </span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `PillarTraceability.tsx`**

Copy source: spec §4sexies.

```tsx
const PIPELINE = ['Semina/acquisto', 'Germinazione', 'Nursing', 'Hardening', 'Pianta F1-P001', 'Raccolto']

export default function PillarTraceability() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Dal seme al raccolto, una pianta alla volta
        </h2>
        <p className="mb-8 max-w-2xl text-gray-700">
          Ogni piantina ha un codice proprio, collegato al lotto del vivaio da cui arriva. Ogni
          operazione registra lo stato di salute prima e dopo, non solo &quot;fatto&quot;. Il
          raccolto chiude il cerchio — per quella pianta specifica, non per la zona in generale.
        </p>

        <div className="mb-8 flex flex-wrap items-center gap-2 rounded-md border border-ortomio-earth-200 bg-ortomio-green-50 p-5">
          {PIPELINE.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span
                className={
                  step.startsWith('Pianta')
                    ? 'rounded border border-ortomio-green-700 bg-white px-2.5 py-1 text-sm font-bold text-ortomio-green-700'
                    : 'rounded border border-ortomio-earth-200 bg-white px-2.5 py-1 text-sm'
                }
              >
                {step}
              </span>
              {i < PIPELINE.length - 1 && <span className="text-gray-400">→</span>}
            </span>
          ))}
        </div>

        <p className="mb-6 max-w-2xl border-l-2 border-semantic-warning bg-semantic-warning/10 p-4 text-sm text-gray-700">
          <strong className="text-ortomio-green-900">Non è un vezzo tecnico:</strong> questa
          tracciabilità alimenta direttamente il punteggio di conformità per la certificazione
          biologica — sistema di tracciabilità, separazione bio/convenzionale, registri di
          produzione contano punti reali nel modulo Certificazioni.
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Manual verification**

Temporarily render all three pillars in sequence in `app/page.tsx`'s placeholder branch, `npm run dev`, view `/`.
Expected: three visually distinct sections (transparency panel with tab strip and calc breakdown; correlation section on an earth-toned background with rotation card + briefing card + AI type chips; traceability section with the pipeline chip flow and the amber-bordered certification callout).

- [ ] **Step 5: Commit**

```bash
git add components/landing/sections/PillarTransparency.tsx components/landing/sections/PillarCorrelation.tsx components/landing/sections/PillarTraceability.tsx
git commit -m "feat: add the three differentiator pillar sections"
```

---

### Task 7: `MaturitySection` and `FinalCta`

**Files:**
- Create: `components/landing/sections/MaturitySection.tsx`
- Create: `components/landing/sections/FinalCta.tsx`

**Interfaces:**
- Produces: default exports `MaturitySection` (renders with `id="maturita"`, the anchor target for `StatusBanner`'s link from Task 4) and `FinalCta`, both no-prop.

- [ ] **Step 1: Create `MaturitySection.tsx`**

Copy source: spec §8 (revised version with real 15/14/2 numbers). Per the brief §3 Level 1 item 9, use only the certifications example, not the full "Il Poggio Verde" history.

```tsx
export default function MaturitySection() {
  return (
    <section id="maturita" className="border-b border-ortomio-earth-200 bg-ortomio-earth-100 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Dove siamo davvero — funzione per funzione, non a parole
        </h2>
        <blockquote className="mb-6 border-l-2 border-semantic-warning pl-4 text-lg text-gray-800">
          La maturità non è un&apos;affermazione di marketing: è un campo nel codice, mostrato
          dall&apos;interfaccia stessa.
        </blockquote>

        <ul className="mb-6 divide-y divide-ortomio-earth-200 border-y border-ortomio-earth-200 bg-white">
          <li className="flex items-start gap-3 p-4 text-sm">
            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-sm bg-ortomio-green-600" />
            <span><strong>15 capability stabili</strong> — nessun badge mostrato, uso pieno.</span>
          </li>
          <li className="flex items-start gap-3 p-4 text-sm">
            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-sm border border-ortomio-green-600" />
            <span>
              <strong>14 in beta</strong> — badge &quot;Beta&quot; visibile in app: funzionalmente
              complete e testate in locale, ma senza ancora le prove richieste in produzione.
            </span>
          </li>
          <li className="flex items-start gap-3 p-4 text-sm">
            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-sm border border-dashed border-ortomio-earth-500" />
            <span>
              <strong>2 in simulazione</strong> — drone e blockchain/NFT: laboratori isolati, mai
              promossi finché non c&apos;è hardware o provider reale.
            </span>
          </li>
        </ul>

        <p className="mb-3 text-sm text-gray-700">
          Un esempio concreto di questo rigore: il modulo Certificazioni dichiara apertamente{' '}
          <em>&quot;non sostituisce un audit e non emette certificati&quot;</em> — prepara
          evidenze e dossier, non promette conformità che non può garantire.
        </p>

        <p className="mb-6 text-sm text-gray-700">
          Nessuna capability beta viene promossa a stabile finché la sua prova specifica non è
          chiusa con evidenza riproducibile. Non sostituiamo il responsabile agronomico. Non
          garantiamo certificazioni ufficiali.
        </p>

        <a href="mailto:roberto.lalinga@gmail.com" className="font-bold text-ortomio-green-700 underline-offset-2 hover:underline">
          Vuoi un pilot reale sulla tua azienda? Parliamone →
        </a>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `FinalCta.tsx`**

Copy source: spec §9.

```tsx
import Link from 'next/link'

export default function FinalCta() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Prova a portare un tuo caso reale nella demo
        </h2>
        <p className="mb-8 text-gray-700">
          Configura un garden, aggiungi una coltura, guarda come il sistema costruisce una
          priorità e spiega perché. Dati fittizi, nessun impegno, puoi ricominciare da capo
          quando vuoi.
        </p>
        <Link
          href="/app"
          className="inline-block rounded-md bg-ortomio-green-600 px-6 py-3 text-base font-bold text-white shadow-sm hover:-translate-y-0.5 hover:bg-ortomio-green-700 hover:shadow-md transition"
        >
          Prova la demo ora
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Manual verification**

Render both temporarily in `app/page.tsx`'s placeholder branch after the pillars, `npm run dev`, view `/`.
Expected: `StatusBanner`'s "→ leggi lo stato reale" link (Task 4) now scrolls to `MaturitySection` (`id="maturita"`). Maturity section shows the 3-row breakdown and the certifications honesty example — not the fabricated success-story material. Final CTA repeats the demo button.

- [ ] **Step 4: Commit**

```bash
git add components/landing/sections/MaturitySection.tsx components/landing/sections/FinalCta.tsx
git commit -m "feat: add maturity/honesty section and final CTA"
```

---

### Task 8: `LandingFooter` and full `LandingPage` composition

**Files:**
- Create: `components/landing/LandingFooter.tsx`
- Create: `components/landing/LandingPage.tsx`
- Modify: `app/page.tsx` (swap the `<div>Landing placeholder</div>` from Task 2 for the real `<LandingPage />`)

**Interfaces:**
- Consumes: every component created in Tasks 3-7, imported by their exact paths and default export names.
- Produces: default export `LandingPage` (no props) from `@/components/landing/LandingPage`, imported by `app/page.tsx`.

- [ ] **Step 1: Create `LandingFooter.tsx`**

```tsx
export default function LandingFooter() {
  return (
    <footer className="border-t border-ortomio-earth-200 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        <span>OrtoMio — registro agronomico</span>
        <span className="font-mono text-xs">demo/beta · schema M15 in produzione</span>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Create `LandingPage.tsx`, composing every section in the brief's Level 1 order**

```tsx
import LandingHeader from './LandingHeader'
import Hero from './sections/Hero'
import StatusBanner from './sections/StatusBanner'
import ProblemSection from './sections/ProblemSection'
import PillarTransparency from './sections/PillarTransparency'
import PillarCorrelation from './sections/PillarCorrelation'
import PillarTraceability from './sections/PillarTraceability'
import AudienceSplit from './sections/AudienceSplit'
import BenefitsList from './sections/BenefitsList'
import MaturitySection from './sections/MaturitySection'
import FinalCta from './sections/FinalCta'
import LandingFooter from './LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-body">
      <LandingHeader />
      <Hero />
      <StatusBanner />
      <ProblemSection />
      <PillarTransparency />
      <PillarCorrelation />
      <PillarTraceability />
      <AudienceSplit />
      <BenefitsList />
      <MaturitySection />
      <FinalCta />
      <LandingFooter />
    </div>
  )
}
```

- [ ] **Step 3: Swap the placeholder in `app/page.tsx` for the real landing**

In `app/page.tsx`, add the import:

```typescript
import LandingPage from '@/components/landing/LandingPage'
```

And replace the final `return <div>Landing placeholder</div>` line with:

```typescript
  return <LandingPage />
```

- [ ] **Step 4: Full manual verification against the brief**

Run `npm run dev`, open `/` in an incognito window (no session), and check off each item from the brief (`docs/superpowers/specs/2026-08-15-ortomio-site-implementation-brief.md` §3, Level 1):
1. Header shows logo, beta pill, "Accedi", "Prova la demo".
2. Hero headline reads "...un punteggio che puoi scomporre."
3. Status banner's "leggi lo stato reale" scrolls to the maturity section.
4. Problem section shows the 5-item grid.
5. All three pillars render in order: transparency panel → correlation → traceability.
6. Audience split shows both columns.
7. Benefits list shows all 5 items with correct swatches.
8. Maturity section shows 15/14/2 and the certifications example (not the fabricated success story).
9. Final CTA repeats "Prova la demo ora".
10. Footer renders.
11. Resize to mobile width (375px) — problem grid and audience split collapse to a single column, header's beta pill hides, no horizontal scroll anywhere on the page.
12. Click "Prova la demo" (any instance) → navigates to `/app`. Click "Accedi" → navigates to `/login`.

- [ ] **Step 5: Run the full verification suite for the repo**

Run: `npm run type-check`
Expected: no new TypeScript errors introduced by the new files.

Run: `NODE_OPTIONS=--conditions=react-server npx --yes tsx --test __tests__/landing/rootRouting.test.ts`
Expected: PASS (still, from Task 1).

- [ ] **Step 6: Commit**

```bash
git add components/landing/LandingFooter.tsx components/landing/LandingPage.tsx app/page.tsx
git commit -m "feat: compose full OrtoMio landing page and wire it into root route"
```

---

## Explicitly out of scope for this plan

Per the brief (§3, Level 2), these are real, verified differentiators that do **not** belong on the main landing and are deferred to a future "Come funziona in profondità" page/plan: planning duale (classico/AI), irrigazione Penman-Monteith detail, IoT Smart Hub, full 8-family crop rotation logic, export audit-gate/CSV-injection defense, indice di Ravaz. Do not add them to `LandingPage.tsx` while executing this plan — that reopens the density problem the brief exists to solve.
