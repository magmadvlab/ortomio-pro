import { handleAgronomistRequest, listAgronomistRequests } from '@/services/agronomistRequest.server'
import type { NextRequest } from 'next/server'
export const POST = (request: NextRequest) => handleAgronomistRequest(request)
export const GET = listAgronomistRequests
