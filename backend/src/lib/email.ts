import nodemailer, { type Transporter } from 'nodemailer'
import { env, smtpConfigured } from '../config/env'

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (!smtpConfigured) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  }
  return transporter
}

interface SendArgs {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Sends an email via SMTP when configured. When SMTP creds are absent
 * (dev mode), it logs the content to the console so the flow still works.
 */
export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<void> {
  const t = getTransporter()
  if (!t) {
    console.log('\n📧 [DEV EMAIL — SMTP not configured, logging instead]')
    console.log(`   To:      ${to}`)
    console.log(`   Subject: ${subject}`)
    const link = html.match(/href="([^"]+)"/)?.[1]
    if (link) console.log(`   Link:    ${link}`)
    console.log('   (Set SMTP_USER/SMTP_PASS in backend/.env to send real emails.)\n')
    return
  }
  await t.sendMail({ from: env.SMTP_FROM, to, subject, html, text })
}

// ---------- Branded HTML shell ----------
function shell(title: string, body: string, cta?: { label: string; url: string }): string {
  return `
  <div style="background:#0A0F1C;padding:40px 0;font-family:Inter,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#141B2D;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden">
      <div style="padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:center">
        <div style="display:inline-block;width:48px;height:48px;line-height:48px;border-radius:12px;background:linear-gradient(135deg,#D4AF37,#F0D060);color:#0A0F1C;font-weight:700;font-size:18px">LG</div>
        <div style="color:#D4AF37;letter-spacing:3px;font-size:11px;margin-top:8px">LUXE GRAND</div>
      </div>
      <div style="padding:32px">
        <h1 style="color:#fff;font-size:20px;margin:0 0 12px">${title}</h1>
        <div style="color:rgba(255,255,255,0.65);font-size:14px;line-height:1.6">${body}</div>
        ${
          cta
            ? `<div style="margin:28px 0 8px"><a href="${cta.url}" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#F0D060);color:#0A0F1C;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px">${cta.label}</a></div>
               <p style="color:rgba(255,255,255,0.35);font-size:12px;word-break:break-all">Or paste this link: ${cta.url}</p>`
            : ''
        }
      </div>
      <div style="padding:18px 32px;border-top:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.3);font-size:11px;text-align:center">© 2026 Luxe Grand · This is an automated message.</div>
    </div>
  </div>`
}

export const sendVerificationEmail = (to: string, name: string, link: string) =>
  sendEmail({
    to,
    subject: 'Verify your Luxe Grand account',
    html: shell(
      `Welcome, ${name}`,
      `Thanks for joining Luxe Grand. Please confirm your email address to activate your account. This link expires in 24 hours.`,
      { label: 'Verify Email', url: link }
    ),
  })

export const sendResetEmail = (to: string, name: string, link: string) =>
  sendEmail({
    to,
    subject: 'Reset your Luxe Grand password',
    html: shell(
      `Password reset`,
      `Hi ${name}, we received a request to reset your password. This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.`,
      { label: 'Reset Password', url: link }
    ),
  })

export const sendBookingConfirmation = (
  to: string,
  name: string,
  details: { bookingNumber: string; room: string; checkIn: string; checkOut: string; total: string }
) =>
  sendEmail({
    to,
    subject: `Booking confirmed · ${details.bookingNumber}`,
    html: shell(
      `Your stay is confirmed`,
      `Dear ${name}, we're delighted to confirm your reservation.<br/><br/>
       <b style="color:#fff">Confirmation:</b> ${details.bookingNumber}<br/>
       <b style="color:#fff">Room:</b> ${details.room}<br/>
       <b style="color:#fff">Check-in:</b> ${details.checkIn}<br/>
       <b style="color:#fff">Check-out:</b> ${details.checkOut}<br/>
       <b style="color:#fff">Total:</b> ${details.total}<br/><br/>
       We look forward to welcoming you.`
    ),
  })
