# Onboarding Fix - Design Document

## Overview
This design addresses the critical bug where users successfully create a garden but the app immediately shows "No gardens found" again. The garden is created in the database but the UI doesn't update to reflect this.

## Root Cause

The issue is in `app/app/page.tsx` in the `onComplete` callback:

```typescript
onComplete={async (garden) => {
  try {
    console.log('✅ Garden created:', garden)
    const updatedGardens = await storageProvider.getGardens()
    setGardens(updatedGardens)
    setActiveGarden(garden)
    setShowGardenWizard(false)
  } catch (error) {
    console.error('Error after garden creation:', error)
  }
}}
```

**Problem**: The `getGardens()` call happens immediately after creation, potentially before the database transaction commits or before the RLS policies recognize the new row.

## Solution Architecture

### Components

#### 1. Fixed App Page Component
**Location:** `app/app/page.tsx`

**Changes:**
- Use optimistic UI update: add garden to state immediately
- Add retry logic for `getGardens()` with exponential backoff
- Ensure wizard doesn't close until state is confirmed updated
- Add loading state during refresh

**New onComplete handler:**
```typescript
onComplete={async (garden) => {
  try {
    console.log('✅ Garden created:', garden)
    
    // Optimistic update - add garden immediately
    setGardens(prev => [...prev, garden])
    setActiveGarden(garden)
    
    // Close wizard
    setShowGardenWizard(false)
    
    // Background refresh with retry
    await refreshGardensWithRetry()
  } catch (error) {
    console.error('Error after garden creation:', error)
    // Rollback optimistic update on error
    setGardens(prev => prev.filter(g => g.id !== garden.id))
    setActiveGarden(null)
  }
}}
```

#### 2. Garden Refresh Service
**Location:** `services/gardenRefreshService.ts`

**Purpose:** Reliable garden list refresh with retry logic

**Methods:**
```typescript
class GardenRefreshService {
  // Refresh with exponential backoff
  async refreshWithRetry(
    storageProvider: IStorageProvider,
    maxRetries: number = 3,
    initialDelay: number = 100
  ): Promise<Garden[]>
  
  // Wait for garden to appear in database
  async waitForGarden(
    storageProvider: IStorageProvider,
    gardenId: string,
    timeout: number = 5000
  ): Promise<Garden | null>
}
```

### Services

#### 1. Garden Refresh Service
**Location:** `services/gardenRefreshService.ts`

**Purpose:** Reliable garden fetching with retry logic

**Implementation:**
```typescript
export class GardenRefreshService {
  async refreshWithRetry(
    storageProvider: IStorageProvider,
    maxRetries: number = 3,
    initialDelay: number = 100
  ): Promise<Garden[]> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const gardens = await storageProvider.getGardens()
        if (gardens.length > 0 || attempt === maxRetries - 1) {
          return gardens
        }
        // Wait before retry with exponential backoff
        await this.delay(initialDelay * Math.pow(2, attempt))
      } catch (error) {
        lastError = error as Error
        if (attempt < maxRetries - 1) {
          await this.delay(initialDelay * Math.pow(2, attempt))
        }
      }
    }
    
    throw lastError || new Error('Failed to refresh gardens')
  }
  
  async waitForGarden(
    storageProvider: IStorageProvider,
    gardenId: string,
    timeout: number = 5000
  ): Promise<Garden | null> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      const gardens = await storageProvider.getGardens()
      const found = gardens.find(g => g.id === gardenId)
      if (found) return found
      
      await this.delay(200)
    }
    
    return null
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

### Data Flow

```
User clicks "Create Garden"
    ↓
GardenTypeWizard collects data
    ↓
Call storageProvider.createGarden()
    ↓
Garden saved to database
    ↓
onComplete callback fires
    ↓
    ├─→ Optimistic update: Add garden to state immediately
    │   └─→ UI shows dashboard with new garden
    │
    └─→ Background: Refresh gardens with retry
        ↓
        ├─→ Success: Confirm garden in database
        │   └─→ Update state with fresh data
        │
        └─→ Failure after retries: Keep optimistic state
            └─→ Log error for debugging
```

## Implementation Plan

### Phase 1: Quick Fix (Priority: CRITICAL)
1. Implement optimistic UI update in app page
2. Add simple retry logic to onComplete
3. Test garden creation flow
4. Deploy fix

### Phase 2: Robust Solution (Priority: High)
1. Create GardenRefreshService
2. Implement exponential backoff retry
3. Add waitForGarden method
4. Integrate with app page
5. Add comprehensive error handling

### Phase 3: UX Improvements (Priority: Medium)
1. Add loading spinner during refresh
2. Show success message after creation
3. Add error recovery UI
4. Improve wizard feedback

## Correctness Properties

### Property 1: Garden Visibility After Creation
**Description:** A garden must be visible in the UI immediately after successful creation

**Test Strategy:**
- Create garden with valid data
- Verify garden appears in state immediately (optimistic update)
- Verify garden persists after background refresh
- Verify no "No gardens found" message appears

**Validates:** Requirements 2.1-2.6

### Property 2: State Consistency
**Description:** The gardens state must always reflect either the optimistic update or the confirmed database state

**Test Strategy:**
- Create garden
- Check state contains garden before refresh completes
- Check state still contains garden after refresh
- Verify no duplicate gardens in state

**Validates:** Requirements 3.1-3.5

### Property 3: Retry Reliability
**Description:** Garden refresh must succeed within reasonable time even with transient failures

**Test Strategy:**
- Simulate network delays
- Simulate temporary database unavailability
- Verify retry logic attempts multiple times
- Verify eventual success within timeout

**Validates:** Requirements 3.3

### Property 4: Error Recovery
**Description:** If refresh fails completely, optimistic state must be maintained or user must be notified

**Test Strategy:**
- Simulate permanent refresh failure
- Verify optimistic state remains
- Verify error is logged
- Verify user can still interact with garden

**Validates:** Requirements 3.5

## Testing Framework
- **Unit Tests:** Jest for service logic
- **Integration Tests:** Testing Library for component behavior
- **E2E Tests:** Playwright for full user flows
- **Property Tests:** fast-check for property-based testing

## Edge Cases

1. **User logs out during garden creation**
   - Handle: Cancel creation, show login screen

2. **Network fails during garden fetch**
   - Handle: Show retry button, cache last known state

3. **Token expires mid-session**
   - Handle: Auto-refresh token, retry operation

4. **RLS policy changes while user is active**
   - Handle: Detect access denied, prompt re-login

5. **Multiple tabs open**
   - Handle: Sync auth state across tabs using storage events

## Security Considerations

- Never expose service role key in client code
- Always use anon key for client operations
- Respect RLS policies (don't try to bypass)
- Log auth issues without exposing sensitive data
- Clear sessions properly on logout

## Performance Considerations

- Cache auth status checks (max 1 per second)
- Debounce garden list refreshes
- Use optimistic updates for garden creation
- Lazy load diagnostic component (dev mode only)

## Accessibility

- Ensure error messages are screen-reader friendly
- Provide keyboard navigation for all actions
- Use ARIA labels for status indicators
- Ensure sufficient color contrast for status displays

## Monitoring & Logging

**Client-side logs:**
- Authentication state changes
- Garden fetch attempts and results
- RLS access check results
- Error occurrences with context

**Server-side logs (future):**
- Failed authentication attempts
- RLS policy violations
- Unusual access patterns

## Rollback Plan

If issues arise:
1. Feature flag to disable diagnostic component
2. Revert to simple error messages
3. Keep existing onboarding flow as fallback
4. Monitor error rates in production
