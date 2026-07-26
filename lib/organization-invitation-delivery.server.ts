import 'server-only'

type InvitationDeliveryInput = {
  recipient: string
  organizationName: string
  roleName: string
  token: string
}

export type InvitationDeliveryResult =
  | { delivered: true; provider: 'resend'; messageId: string }
  | { delivered: false; provider: 'resend'; error: string }

const resolveSiteUrl = (): string =>
  (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '')
  ).replace(/\/$/, '')

export async function deliverOrganizationInvitation(
  input: InvitationDeliveryInput,
): Promise<InvitationDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.ORGANIZATION_INVITATION_FROM
  const siteUrl = resolveSiteUrl()
  if (!apiKey || !from || !siteUrl) {
    return { delivered: false, provider: 'resend', error: 'invitation_provider_not_configured' }
  }

  const acceptUrl = `${siteUrl}/accept-invitation?token=${encodeURIComponent(input.token)}`
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.recipient],
      subject: `Invito a ${input.organizationName} su OrtoMio`,
      html: [
        '<p>Hai ricevuto un invito a collaborare su OrtoMio.</p>',
        `<p><strong>Organizzazione:</strong> ${escapeHtml(input.organizationName)}</p>`,
        `<p><strong>Ruolo:</strong> ${escapeHtml(input.roleName)}</p>`,
        `<p><a href="${acceptUrl}">Accetta l'invito</a></p>`,
        '<p>Il link scade tra 7 giorni.</p>',
      ].join(''),
    }),
  })

  const payload = await response.json().catch(() => ({})) as { id?: string; message?: string }
  if (!response.ok || !payload.id) {
    return {
      delivered: false,
      provider: 'resend',
      error: payload.message || `invitation_provider_http_${response.status}`,
    }
  }
  return { delivered: true, provider: 'resend', messageId: payload.id }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
