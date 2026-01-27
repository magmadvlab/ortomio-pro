# Onboarding Fix - Requirements

## Problem Statement
Users successfully create a garden, but immediately after creation the app still shows "No gardens found" and displays the onboarding screen again. The console shows:
- `✅ Garden created: {id: '18961df5-5db9-474b-ad40-0dcc1392edba', ...}`
- `⚠️ Rendering: No gardens found, showing create garden message`

## Root Cause Analysis
Based on the console logs and code inspection:
1. User IS authenticated ✅
2. Garden creation succeeds ✅
3. Garden is saved to database ✅
4. **BUG**: After creation, `getGardens()` returns 0 results ❌
5. The `onComplete` callback tries to refresh but fails

Possible causes:
- Race condition: query runs before database commit completes
- State not updating after successful creation
- `getGardens()` query not including the newly created garden
- Component re-render issue after wizard closes

## User Stories

### 1. As a new user, I want clear feedback about my authentication status
**Acceptance Criteria:**
- 1.1 The app displays whether I'm logged in or not
- 1.2 If not logged in, I see a clear login prompt
- 1.3 If logged in, I see my user email/info
- 1.4 Authentication errors are displayed clearly

### 2. As a user creating my first garden, I want to see it immediately after creation
**Acceptance Criteria:**
- 2.1 After clicking "Create Garden", the wizard processes my input
- 2.2 The garden is saved to the database successfully
- 2.3 The wizard closes automatically
- 2.4 The dashboard loads showing my new garden (NOT the onboarding screen)
- 2.5 I can see my garden's name and details
- 2.6 No "No gardens found" message appears after successful creation

### 3. As a developer, I want reliable state management after garden creation
**Acceptance Criteria:**
- 3.1 Garden creation waits for database commit before returning
- 3.2 State updates immediately after successful creation
- 3.3 No race conditions between create and fetch operations
- 3.4 Component re-renders correctly with new garden data
- 3.5 Error handling prevents partial state updates

### 4. As a developer, I want to prevent multiple GoTrueClient instances
**Acceptance Criteria:**
- 4.1 Only one Supabase client instance exists per session
- 4.2 The client is properly initialized and reused
- 4.3 No warnings about multiple instances in console

## Technical Requirements

### Garden Creation Flow Fix
- Fix race condition in `onComplete` callback
- Ensure `getGardens()` includes newly created garden
- Add proper state management after creation
- Implement optimistic UI updates
- Add retry logic for failed refreshes

### State Management
- Use React state correctly to trigger re-renders
- Ensure wizard closure doesn't reset state
- Maintain garden data across component lifecycle
- Handle async operations properly

### Error Handling
- Catch and display creation errors clearly
- Provide retry mechanisms for failed operations
- Log detailed error information for debugging
- Prevent UI from showing stale "no gardens" state

## Out of Scope
- Changing the overall authentication system
- Migrating to a different auth provider
- Modifying RLS policies
- Redesigning the entire onboarding flow

## Success Metrics
- 100% of users see their garden immediately after creation
- Zero "No gardens found" messages after successful creation
- Garden list refreshes reliably within 500ms of creation
- No race conditions in state management
