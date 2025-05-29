const MailConfig = require('../../config/mail');

class EmailService {
  constructor() {
    this.mailgun = MailConfig.getInstance().getMailgun();
  }

  async sendValidationEmail(email, name, token) {
    if (!this.mailgun) {
      console.log(`📧 [DEV] Email would be sent to: ${email}`);
      console.log(`📧 [DEV] Validation token: ${token}`);
      return { message: 'Email service disabled in development' };
    }
    
    const validationUrl = `${process.env.FRONTEND_URL}/auth/validate-email?token=${token}`;
    
    const data = {
      from: `Cafetería App <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: email,
      subject: 'Valida tu cuenta - Cafetería App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B4513;">¡Bienvenido a Cafetería App!</h2>
          <p>Hola <strong>${name}</strong>,</p>
          <p>Gracias por registrarte en nuestra cafetería. Para completar tu registro, necesitas validar tu correo electrónico.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${validationUrl}" 
               style="background-color: #8B4513; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Validar Correo
            </a>
          </div>
          <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${validationUrl}</p>
          <p>Este enlace expirará en 24 horas.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Si no te registraste en nuestra cafetería, puedes ignorar este correo.
          </p>
        </div>
      `
    };

    return this.mailgun.messages().send(data);
  }

  async sendPasswordResetEmail(email, name, token) {
    if (!this.mailgun) {
      console.log(`📧 [DEV] Password reset email would be sent to: ${email}`);
      console.log(`📧 [DEV] Reset token: ${token}`);
      return { message: 'Email service disabled in development' };
    }
    
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    
    const data = {
      from: `Cafetería App <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: email,
      subject: 'Restablece tu contraseña - Cafetería App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B4513;">Restablece tu contraseña</h2>
          <p>Hola <strong>${name}</strong>,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #8B4513; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>Este enlace expirará en 1 hora.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.
          </p>
        </div>
      `
    };

    return this.mailgun.messages().send(data);
  }
}

module.exports = EmailService;