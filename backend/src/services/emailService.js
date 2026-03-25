const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[Email Service] SMTP not configured. Would send to ${to}: ${subject}`);
      return { success: false, reason: 'SMTP not configured' };
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@empresa.com',
      to,
      subject,
      html,
    });

    console.log(`[Email Service] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email Service] Error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendWorkOrderAssignment = async (user, workOrder) => {
  return sendEmail({
    to: user.email,
    subject: `Nueva Orden de Trabajo Asignada: ${workOrder.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Nueva Orden de Trabajo</h2>
        <p>Hola <strong>${user.first_name}</strong>,</p>
        <p>Se te ha asignado una nueva orden de trabajo:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Título</td><td style="padding: 8px; border: 1px solid #ddd;">${workOrder.title}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Prioridad</td><td style="padding: 8px; border: 1px solid #ddd;">${workOrder.priority.toUpperCase()}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Sector</td><td style="padding: 8px; border: 1px solid #ddd;">${workOrder.sector || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Fecha límite</td><td style="padding: 8px; border: 1px solid #ddd;">${workOrder.due_date || 'Sin fecha límite'}</td></tr>
        </table>
        <p>${workOrder.description || ''}</p>
        <p style="color: #666; font-size: 12px;">Este es un mensaje automático del Sistema de Gestión Empresarial.</p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendWorkOrderAssignment,
};
