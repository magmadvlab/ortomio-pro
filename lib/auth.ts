/**
 * Authentication and authorization utilities
 * 
 * DEPRECATED: This file is kept for backward compatibility.
 * 
 * IMPORTANT: This file should NOT be imported in Client Components!
 * 
 * For API routes (server-side): import from '@/lib/auth.server'
 * For Client Components: import from '@/lib/auth.client'
 * 
 * This file re-exports server functions for backward compatibility.
 * New code should use auth.server.ts or auth.client.ts directly.
 */

// Re-export server functions for backward compatibility
// Note: This will cause build errors if imported in Client Components
// Use auth.server.ts or auth.client.ts instead
export * from './auth.server'

