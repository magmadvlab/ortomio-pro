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
