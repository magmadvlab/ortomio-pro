import { NextRequest, NextResponse } from 'next/server'
import { isAccessError, requireAdmin, requireCron, requireUser } from '@/lib/auth.server'
import { enforceRateLimit, RATE_LIMIT_POLICIES } from '@/lib/rate-limit.server'

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/cron/')) {
    try {
      requireCron(request)
      return NextResponse.next()
    } catch (error) {
      if (!isAccessError(error)) throw error
      return NextResponse.json({ error: error.code }, { status: error.status })
    }
  }

  if (request.nextUrl.pathname.startsWith('/api/ai/')) {
    const rateLimit = enforceRateLimit(request, RATE_LIMIT_POLICIES.ai)
    if (rateLimit instanceof NextResponse) return rateLimit
    return NextResponse.next({ headers: rateLimit.headers })
  }

  if (request.nextUrl.pathname.startsWith('/api/support/')) {
    const rateLimit = enforceRateLimit(request, RATE_LIMIT_POLICIES.support)
    if (rateLimit instanceof NextResponse) return rateLimit
    return NextResponse.next({ headers: rateLimit.headers })
  }

  if (request.nextUrl.pathname === '/api/ndvi/sentinel') {
    const rateLimit = enforceRateLimit(request, RATE_LIMIT_POLICIES.provider)
    if (rateLimit instanceof NextResponse) return rateLimit
    return NextResponse.next({ headers: rateLimit.headers })
  }

  try {
    if (request.nextUrl.pathname.startsWith('/app/admin')) {
      await requireAdmin(request)
    } else {
      await requireUser(request)
    }
    return NextResponse.next()
  } catch (error) {
    if (!isAccessError(error)) throw error

    if (error.status === 403) {
      return NextResponse.redirect(new URL('/app?error=forbidden', request.url))
    }

    const loginUrl = new URL('/auth', request.url)
    loginUrl.searchParams.set('redirect', `${request.nextUrl.pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/app/:path*', '/api/cron/:path*', '/api/ai/:path*', '/api/support/:path*', '/api/ndvi/sentinel'],
}
