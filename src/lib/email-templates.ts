// ============================================================
// SoundTicket — Email Templates (Corporate Branding)
// Primary color: #00ffcc (neon green)
// Background: #0a0a0a | Card: #111111 | Text: #ffffff
// ============================================================

const BASE_CSS = `
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #0a0a0a;
  margin: 0; padding: 0;
`

const logoHtml = `
  <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #1e1e1e;">
    <span style="font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: -1px; color: #ffffff;">
      ART<span style="color: #00ffcc;">ICKET</span>
    </span>
  </div>
`

const footerHtml = `
  <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #1e1e1e; text-align: center;">
    <p style="color: #444; font-size: 12px; margin: 0;">
      © ${new Date().getFullYear()} SoundTicket · Hitstar Entertainment
    </p>
    <p style="color: #333; font-size: 11px; margin: 8px 0 0;">
      Si no has solicitado este email, puedes ignorarlo de forma segura.
    </p>
  </div>
`

function wrapper(content: string): string {
    return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body style="${BASE_CSS}">
    <div style="max-width: 600px; margin: 40px auto; background: #111111; border-radius: 16px; border: 1px solid #1e1e1e; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0a0a0a 0%, #001a14 100%); padding: 40px 48px 32px;">
        ${logoHtml}
        ${content}
        ${footerHtml}
      </div>
    </div>
  </body>
  </html>
  `
}

// ── 1. Verify Account Email ──────────────────────────────────
export function verifyEmailTemplate(name: string, confirmLink: string): string {
    return wrapper(`
    <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; font-style: italic; margin: 0 0 16px;">
      ¡Bienvenido, ${name}! 🎉
    </h1>
    <p style="color: #aaaaaa; font-size: 16px; line-height: 1.7; margin: 0 0 32px;">
      Ya casi estás. Solo queda confirmar tu dirección de correo para activar tu cuenta en <strong style="color: #00ffcc;">SoundTicket</strong> y empezar a descubrir los mejores eventos.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${confirmLink}"
         style="display: inline-block; background: #00ffcc; color: #000000; padding: 16px 40px;
                text-decoration: none; font-weight: 900; font-size: 15px; letter-spacing: 1px;
                border-radius: 8px; text-transform: uppercase;">
        Confirmar mi cuenta
      </a>
    </div>
    <p style="color: #555; font-size: 13px; line-height: 1.6;">
      O copia y pega este enlace en tu navegador:<br>
      <a href="${confirmLink}" style="color: #00ffcc; word-break: break-all;">${confirmLink}</a>
    </p>
  `)
}

// ── 2. Purchase Confirmation Email ───────────────────────────
export interface PurchaseEmailData {
    userName: string
    userEmail: string
    eventTitle: string
    eventLocation: string
    eventDate: Date
    ticketTypeName: string
    ticketId: string
    price: number
    coverImage?: string
}

export function purchaseConfirmationTemplate(data: PurchaseEmailData): string {
    const dateStr = data.eventDate.toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
    const timeStr = data.eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    return wrapper(`
    <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; font-style: italic; margin: 0 0 8px;">
      ¡Entrada confirmada! 🎫
    </h1>
    <p style="color: #aaaaaa; font-size: 15px; margin: 0 0 32px;">
      Hola <strong style="color: #ffffff;">${data.userName}</strong>, todo listo. Aquí están los detalles de tu entrada.
    </p>

    ${data.coverImage ? `
    <div style="border-radius: 12px; overflow: hidden; margin-bottom: 24px; max-height: 220px;">
      <img src="${data.coverImage}" alt="${data.eventTitle}" style="width: 100%; object-fit: cover; display: block;" />
    </div>
    ` : ''}

    <!-- Event Card -->
    <div style="background: #0a0a0a; border: 1px solid #1e1e1e; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <p style="color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px;">Evento</p>
          <p style="color: #ffffff; font-size: 20px; font-weight: 900; font-style: italic; margin: 0;">${data.eventTitle}</p>
        </div>
        <div style="background: #00ffcc22; border: 1px solid #00ffcc44; border-radius: 6px; padding: 6px 14px; white-space: nowrap;">
          <span style="color: #00ffcc; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">${data.ticketTypeName}</span>
        </div>
      </div>

      <div style="margin-top: 20px; display: grid; gap: 12px;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <span style="color: #00ffcc; font-size: 16px;">📅</span>
          <div>
            <p style="color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Fecha y hora</p>
            <p style="color: #cccccc; font-size: 14px; margin: 2px 0 0; text-transform: capitalize;">${dateStr} · ${timeStr}</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <span style="color: #00ffcc; font-size: 16px;">📍</span>
          <div>
            <p style="color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Ubicación</p>
            <p style="color: #cccccc; font-size: 14px; margin: 2px 0 0;">${data.eventLocation}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket ID -->
    <div style="background: #00ffcc11; border: 1px dashed #00ffcc33; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <p style="color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 8px;">ID de Entrada</p>
      <p style="color: #00ffcc; font-size: 13px; font-family: monospace; letter-spacing: 2px; margin: 0; word-break: break-all;">${data.ticketId}</p>
    </div>

    <!-- Price -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-top: 1px solid #1e1e1e;">
      <span style="color: #aaaaaa; font-size: 14px;">Total pagado</span>
      <span style="color: #ffffff; font-size: 22px; font-weight: 900; font-style: italic;">${data.price.toFixed(2)} €</span>
    </div>

    <p style="color: #555; font-size: 13px; line-height: 1.6; margin-top: 20px;">
      Presenta el código QR de tu entrada en la entrada del evento. Puedes encontrarlo en tu <strong style="color: #ffffff;">perfil de SoundTicket</strong>.
    </p>

    <div style="text-align: center; margin: 28px 0 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://soundticket.es'}/profile"
         style="display: inline-block; background: #00ffcc; color: #000000; padding: 14px 36px;
                text-decoration: none; font-weight: 900; font-size: 14px; letter-spacing: 1px;
                border-radius: 8px; text-transform: uppercase;">
        Ver mi entrada y QR
      </a>
    </div>
  `)
}

// ── 3. Password Reset Email ──────────────────────────────────
export function passwordResetTemplate(name: string, resetLink: string): string {
    return wrapper(`
    <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; font-style: italic; margin: 0 0 16px;">
      Restablecer Contraseña 🔐
    </h1>
    <p style="color: #aaaaaa; font-size: 16px; line-height: 1.7; margin: 0 0 32px;">
      Hola <strong style="color: #ffffff;">${name}</strong>, hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo. El enlace expira en <strong style="color: #00ffcc;">1 hora</strong>.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetLink}"
         style="display: inline-block; background: #00ffcc; color: #000000; padding: 16px 40px;
                text-decoration: none; font-weight: 900; font-size: 15px; letter-spacing: 1px;
                border-radius: 8px; text-transform: uppercase;">
        Cambiar contraseña
      </a>
    </div>
    <p style="color: #555; font-size: 13px; line-height: 1.6; margin-top: 20px;">
      Si no has solicitado este cambio, ignora este mensaje. Tu cuenta permanece segura.
    </p>
  `)
}
