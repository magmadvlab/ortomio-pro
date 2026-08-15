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
