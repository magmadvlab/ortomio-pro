import { NextRequest, NextResponse } from 'next/server'
import { thingsboardService } from '@/services/thingsboardService'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { deviceId, telemetry } = body

        if (!telemetry || typeof telemetry !== 'object') {
            return NextResponse.json(
                { error: 'Invalid telemetry data' },
                { status: 400 }
            )
        }

        // In a real scenario, we might want to look up the access token based on deviceId
        // For now, we use the single configured token environment variable
        // TODO: Implement device lookup for multi-device support

        await thingsboardService.sendTelemetry(telemetry)

        return NextResponse.json({ success: true, message: 'Telemetry sent to ThingsBoard' })
    } catch (error) {
        console.error('API Error sending telemetry:', error)
        return NextResponse.json(
            { error: 'Failed to process telemetry' },
            { status: 500 }
        )
    }
}
