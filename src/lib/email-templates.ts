// ============================================================
// SoundTicket — Email Templates (Corporate Branding)
// Primary color: #8B5CF6 (Purple)
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
      Sound<span style="color: #8B5CF6;">Ticket</span>
    </span>
  </div>
`

const footerHtml = `
  <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #1e1e1e; text-align: center;">
    <p style="color: #444; font-size: 12px; margin: 0;">
      © ${new Date().getFullYear()} SoundTicket
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
      <div style="background: linear-gradient(135deg, #0a0a0a 0%, #0d0a14 100%); padding: 40px 48px 32px;">
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
      Ya casi estás. Solo queda confirmar tu dirección de correo para activar tu cuenta en <strong style="color: #8B5CF6;">SoundTicket</strong> y empezar a descubrir los mejores eventos.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${confirmLink}"
         style="display: inline-block; background: #8B5CF6; color: #ffffff; padding: 16px 40px;
                text-decoration: none; font-weight: 900; font-size: 15px; letter-spacing: 1px;
                border-radius: 8px; text-transform: uppercase; box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.39);">
        Confirmar mi cuenta
      </a>
    </div>
    <p style="color: #555; font-size: 13px; line-height: 1.6;">
      O copia y pega este enlace en tu navegador:<br>
      <a href="${confirmLink}" style="color: #8B5CF6; word-break: break-all;">${confirmLink}</a>
    </p>
  `)
}

// ── 2. Purchase Confirmation Email (Con código QR visual) ────
export interface PurchaseEmailData {
    userName: string
    userEmail: string
    eventTitle: string
    eventLocation: string
    eventDate: Date
    ticketTypeName: string
    ticketId: string
    qrToken: string
    price: number
    coverImage?: string
}

export function purchaseConfirmationTemplate(data: PurchaseEmailData): string {
    const dateStr = data.eventDate.toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
    const timeStr = data.eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qrToken)}&format=png&margin=10&bgcolor=ffffff&color=000000&qzone=1`;
    // Nunca enviar localhost en emails — siempre usar la URL de producción
    const rawBase = process.env.NEXT_PUBLIC_BASE_URL || 'https://soundticket.es'
    const baseUrl = rawBase.includes('localhost') || rawBase.includes('127.0.0.1')
        ? 'https://soundticket.es'
        : rawBase

    return wrapper(`
    <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; font-style: italic; margin: 0 0 8px;">
      ¡Entrada confirmada! 🎫
    </h1>
    <p style="color: #aaaaaa; font-size: 15px; margin: 0 0 28px; line-height: 1.6;">
      Hola <strong style="color: #ffffff;">${data.userName}</strong>, todo listo. Tu pase directo a la fiesta está aquí.
    </p>

    <!-- QR Block — tabla para compatibilidad dark-mode email -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom: 28px;">
      <tr>
        <td bgcolor="#ffffff" align="center"
            style="background-color: #ffffff !important; border-radius: 16px; padding: 24px 20px;">
          <p style="color: #8B5CF6; font-size: 11px; font-weight: 900; text-transform: uppercase;
                     letter-spacing: 2px; margin: 0 0 14px; font-family: Helvetica, Arial, sans-serif;">
            Preséntalo en la puerta
          </p>
          <img src="${qrUrl}" alt="Código QR de entrada" width="200" height="200"
               style="width: 200px; height: 200px; display: block; margin: 0 auto;
                      border: 8px solid #ffffff; border-radius: 8px;" />
          <p style="color: #777777; font-size: 10px; text-transform: uppercase; letter-spacing: 3px;
                     font-family: monospace; margin: 14px 0 0;">
            ID: ${data.ticketId.substring(0, 12)}...
          </p>
        </td>
      </tr>
    </table>

    ${data.coverImage ? `
    <!-- Cover Image: sin max-height ni object-fit (no soportados en clientes de email) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom: 24px;">
      <tr>
        <td style="line-height: 0; border-radius: 12px; overflow: hidden;">
          <img src="${data.coverImage}" alt="${data.eventTitle}"
               width="100%"
               style="width: 100%; height: auto; display: block; border-radius: 12px;" />
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- Event Card — tabla en lugar de flex para evitar solapamientos en móvil -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
           style="background: #0a0a0a; border: 1px solid #1e1e1e; border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px 20px 0 20px;">
          <!-- Fila etiqueta EVENTO -->
          <p style="color: #555555; font-size: 10px; text-transform: uppercase;
                     letter-spacing: 2px; margin: 0 0 4px; font-family: Helvetica, Arial, sans-serif;">Evento</p>
          <!-- Nombre del evento -->
          <p style="color: #ffffff; font-size: 18px; font-weight: 900; font-style: italic;
                     margin: 0 0 10px; line-height: 1.3;">${data.eventTitle}</p>
          <!-- Badge tipo entrada (debajo del nombre, no al lado) -->
          <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom: 18px;">
            <tr>
              <td bgcolor="#8B5CF622" style="background-color: #1e1535; border: 1px solid #8B5CF644;
                            border-radius: 6px; padding: 5px 12px;">
                <span style="color: #8B5CF6; font-weight: 900; font-size: 11px;
                              text-transform: uppercase; letter-spacing: 1px;">${data.ticketTypeName}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Fecha -->
      <tr>
        <td style="padding: 0 20px 14px 20px; border-top: 1px solid #1e1e1e;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-top:14px;">
            <tr>
              <td width="28" valign="top" style="padding-top: 2px; font-size: 16px;">📅</td>
              <td valign="top">
                <p style="color: #555555; font-size: 10px; text-transform: uppercase;
                           letter-spacing: 1px; margin: 0; font-family: Helvetica, Arial, sans-serif;">Fecha y hora</p>
                <p style="color: #cccccc; font-size: 13px; margin: 3px 0 0; text-transform: capitalize;
                           line-height: 1.4;">${dateStr} · ${timeStr}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Ubicación -->
      <tr>
        <td style="padding: 0 20px 20px 20px; border-top: 1px solid #1e1e1e;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-top:14px;">
            <tr>
              <td width="28" valign="top" style="padding-top: 2px; font-size: 16px;">📍</td>
              <td valign="top">
                <p style="color: #555555; font-size: 10px; text-transform: uppercase;
                           letter-spacing: 1px; margin: 0; font-family: Helvetica, Arial, sans-serif;">Ubicación</p>
                <p style="color: #cccccc; font-size: 13px; margin: 3px 0 0; line-height: 1.4;">${data.eventLocation}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Price Row -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
           style="border-top: 1px solid #1e1e1e; margin-bottom: 28px;">
      <tr>
        <td valign="middle" style="padding: 16px 0;">
          <span style="color: #aaaaaa; font-size: 14px;">Total pagado</span>
        </td>
        <td valign="middle" align="right" style="padding: 16px 0;">
          <span style="color: #ffffff; font-size: 22px; font-weight: 900; font-style: italic;">${data.price.toFixed(2)} €</span>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin: 0 0 8px;">
      <a href="${baseUrl}/profile"
         style="display: inline-block; background: #8B5CF6; color: #ffffff; padding: 14px 36px;
                text-decoration: none; font-weight: 900; font-size: 14px; letter-spacing: 1px;
                border-radius: 8px; text-transform: uppercase; box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.39);">
        Ver mi perfil
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
      Hola <strong style="color: #ffffff;">${name}</strong>, hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo. El enlace expira en <strong style="color: #8B5CF6;">1 hora</strong>.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetLink}"
         style="display: inline-block; background: #8B5CF6; color: #ffffff; padding: 16px 40px;
                text-decoration: none; font-weight: 900; font-size: 15px; letter-spacing: 1px;
                border-radius: 8px; text-transform: uppercase; box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.39);">
        Cambiar contraseña
      </a>
    </div>
    <p style="color: #555; font-size: 13px; line-height: 1.6; margin-top: 20px;">
      Si no has solicitado este cambio, ignora este mensaje. Tu cuenta permanece segura.
    </p>
  `)
}

// ── 4. Organizer Approved Template ───────────────────────────
export function organizerApprovedTemplate(name: string): string {
  return wrapper(`
  <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; font-style: italic; margin: 0 0 16px;">
    ¡Cuenta de Organizador Aprobada! 🚀
  </h1>
  <p style="color: #aaaaaa; font-size: 16px; line-height: 1.7; margin: 0 0 32px;">
    Hola <strong style="color: #ffffff;">${name}</strong>, tu perfil ha superado nuestras revisiones de seguridad. Tu panel de organizador está completamente activo.
  </p>
  <div style="background: #8B5CF611; border: 1px dashed #8B5CF633; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="color: #8B5CF6; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">¿Cuáles son los siguientes pasos?</p>
      <ul style="color: #aaaaaa; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
        <li>Configura tu facturación a través de Stripe para empezar a recibir cobros.</li>
        <li>Publica tu primer evento.</li>
        <li>Comparte el enlace y revienta el aforo.</li>
      </ul>
  </div>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://soundticket.es'}/dashboard"
       style="display: inline-block; background: #8B5CF6; color: #ffffff; padding: 16px 40px;
              text-decoration: none; font-weight: 900; font-size: 15px; letter-spacing: 1px;
              border-radius: 8px; text-transform: uppercase; box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.39);">
      Acceder a mi Panel
    </a>
  </div>
`)
}

// ── 5. Event Status Template ─────────────────────────────────
export function eventStatusTemplate(title: string, status: 'APPROVED' | 'REJECTED' | 'CANCELLED', reason?: string): string {
  const statusStyles = {
      APPROVED: { color: '#10b981', bg: '#10b98122', text: 'APROBADO', emoji: '🟢' },
      REJECTED: { color: '#ef4444', bg: '#ef444422', text: 'RECHAZADO', emoji: '🔴' },
      CANCELLED: { color: '#f59e0b', bg: '#f59e0b22', text: 'CANCELADO', emoji: '🟠' },
  };
  const theme = statusStyles[status];

  return wrapper(`
  <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; font-style: italic; margin: 0 0 16px;">
    Actualización de Estado de Evento ${theme.emoji}
  </h1>
  <p style="color: #aaaaaa; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
    Hemos actualizado el estado de tu evento: <strong style="color: #ffffff;">${title}</strong>.
  </p>
  
  <div style="background: ${theme.bg}; border: 1px solid ${theme.color}44; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
      <p style="color: ${theme.color}; font-size: 18px; font-weight: 900; letter-spacing: 2px; margin: 0;">ESTADO ACTUAL: ${theme.text}</p>
  </div>

  ${reason && status === 'REJECTED' ? `
  <div style="background: #1e1e1e; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 24px;">
      <p style="color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Motivo del Rechazo</p>
      <p style="color: #ffffff; font-size: 14px; margin: 0; font-style: italic;">"${reason}"</p>
  </div>
  ` : ''}

  ${status === 'APPROVED' ? `
  <p style="color: #aaaaaa; font-size: 14px; line-height: 1.6;">
    Tu evento ya está disponible en la plataforma. Los clientes pueden empezar a comprar entradas inmediatamente. Recuerda tener tu facturación conectada para retirar los fondos.
  </p>
  ` : ''}

  <div style="text-align: center; margin: 32px 0;">
    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://soundticket.es'}/dashboard/events"
       style="display: inline-block; background: #222; color: #fff; padding: 14px 36px;
              text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 8px;">
      Ir al panel de eventos
    </a>
  </div>
`)
}

// ── 6. Event Sold Out Template ─────────────────────────────────
export function eventSoldOutTemplate(title: string): string {
  return wrapper(`
  <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; font-style: italic; margin: 0 0 16px;">
    ¡SOLD OUT HISTÓRICO! 🏆
  </h1>
  <p style="color: #aaaaaa; font-size: 16px; line-height: 1.7; margin: 0 0 32px;">
    Queríamos darte la enhorabuena. Acaban de agotarse por completo todas las entradas para tu evento <strong style="color: #ffffff;">${title}</strong>.
  </p>
  <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: #8B5CF6; color: #ffffff; padding: 10px 20px; font-weight: 900; font-size: 20px; letter-spacing: 2px; transform: rotate(-5deg); box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);">
          SOLD OUT
      </div>
  </div>
  <p style="color: #aaaaaa; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
    Prepárate para usar el Escáner de Puerta desde tu Panel de Organización para gestionar el flujo de entrada el día de la fiesta. ¡Menudo éxito!
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://soundticket.es'}/dashboard/analytics"
       style="display: inline-block; background: #8B5CF6; color: #ffffff; padding: 16px 40px;
              text-decoration: none; font-weight: 900; font-size: 15px; letter-spacing: 1px;
              border-radius: 8px; text-transform: uppercase; box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.39);">
      Ver mis ingresos netos
    </a>
  </div>
`)
}
