
interface TelemetryData {
    [key: string]: string | number | boolean | object
}

interface ThingsboardConfig {
    url: string
    accessToken: string
}

export class ThingsboardService {
    private config: ThingsboardConfig

    constructor(config?: Partial<ThingsboardConfig>) {
        this.config = {
            url: config?.url || process.env.THINGSBOARD_URL || 'https://eu.thingsboard.cloud',
            accessToken: config?.accessToken || process.env.THINGSBOARD_ACCESS_TOKEN || ''
        }
    }

    /**
     * Helper to perform fetch requests
     */
    private async request(endpoint: string, data: TelemetryData): Promise<void> {
        if (!this.config.accessToken) {
            throw new Error('ThingsBoard access token is not configured')
        }

        const url = `${this.config.url}/api/v1/${this.config.accessToken}/${endpoint}`

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
            }
        } catch (error) {
            console.error(`❌ [ThingsBoard] Request to ${endpoint} failed:`, error)
            throw error
        }
    }

    /**
     * Send telemetry data to ThingsBoard
     * @param data Key-value pairs of telemetry data (e.g., { temperature: 25, humidity: 60 })
     */
    async sendTelemetry(data: TelemetryData): Promise<void> {
        await this.request('telemetry', data)
        console.log(`✅ [ThingsBoard] Telemetry sent:`, data)
    }

    /**
     * Send attributes to ThingsBoard
     * @param attributes Key-value pairs of attributes
     */
    async sendAttributes(attributes: TelemetryData): Promise<void> {
        await this.request('attributes', attributes)
        console.log(`✅ [ThingsBoard] Attributes sent:`, attributes)
    }
}

export const thingsboardService = new ThingsboardService()
