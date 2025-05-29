// filepath: c:\Users\hugo\web-escalables\cafeteria-app\backend\src\infrastructure\external\MailgunService.js
const MailConfig = require('../../config/mail');

class MailgunService {
    constructor() {
        this.mailgun = MailConfig.getInstance().getMailgun();
        this.fromEmail = process.env.MAILGUN_FROM_EMAIL || 'noreply@cafeteria.com';
        this.fromName = process.env.MAILGUN_FROM_NAME || 'Cafetería App';
    }

    // Enviar email genérico
    async sendEmail(to, subject, text, html = null, attachments = []) {
        try {
            const emailData = {
                from: `${this.fromName} <${this.fromEmail}>`,
                to,
                subject,
                text
            };

            if (html) {
                emailData.html = html;
            }

            if (attachments && attachments.length > 0) {
                emailData.attachment = attachments;
            }

            const result = await this.mailgun.messages().send(emailData);
            
            return {
                success: true,
                messageId: result.id,
                message: result.message
            };
        } catch (error) {
            throw new Error(`Error sending email: ${error.message}`);
        }
    }

    // Email de validación de cuenta
    async sendEmailValidation(to, userName, validationToken, validationUrl) {
        try {
            const subject = '¡Valida tu cuenta en Cafetería App!';
            
            const text = `
Hola ${userName},

¡Bienvenido a Cafetería App!

Para completar tu registro, por favor valida tu correo electrónico haciendo clic en el siguiente enlace:

${validationUrl}?token=${validationToken}

Si no creaste esta cuenta, puedes ignorar este correo.

¡Gracias por unirte a nosotros!

Equipo de Cafetería App
            `.trim();

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #8B4513; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Bienvenido a Cafetería App!</h1>
        </div>
        <div class="content">
            <h2>Hola ${userName},</h2>
            <p>¡Gracias por registrarte en nuestra cafetería!</p>
            <p>Para completar tu registro y comenzar a disfrutar de nuestros deliciosos productos, necesitas validar tu correo electrónico.</p>
            <p style="text-align: center;">
                <a href="${validationUrl}?token=${validationToken}" class="button">Validar mi cuenta</a>
            </p>
            <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p><small>${validationUrl}?token=${validationToken}</small></p>
            <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
        </div>
        <div class="footer">
            <p>© 2025 Cafetería App. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
            `;

            return await this.sendEmail(to, subject, text, html);
        } catch (error) {
            throw new Error(`Error sending email validation: ${error.message}`);
        }
    }

    // Email de recuperación de contraseña
    async sendPasswordReset(to, userName, resetToken, resetUrl) {
        try {
            const subject = 'Recuperación de contraseña - Cafetería App';
            
            const text = `
Hola ${userName},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Cafetería App.

Para crear una nueva contraseña, haz clic en el siguiente enlace:

${resetUrl}?token=${resetToken}

Este enlace expirará en 1 hora por seguridad.

Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá sin cambios.

Equipo de Cafetería App
            `.trim();

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #DC3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #DC3545; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .warning { background-color: #FFF3CD; border: 1px solid #FFEAA7; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Recuperación de Contraseña</h1>
        </div>
        <div class="content">
            <h2>Hola ${userName},</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
            <div class="warning">
                <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por seguridad.
            </div>
            <p style="text-align: center;">
                <a href="${resetUrl}?token=${resetToken}" class="button">Restablecer Contraseña</a>
            </p>
            <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p><small>${resetUrl}?token=${resetToken}</small></p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá sin cambios.</p>
        </div>
        <div class="footer">
            <p>© 2025 Cafetería App. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
            `;

            return await this.sendEmail(to, subject, text, html);
        } catch (error) {
            throw new Error(`Error sending password reset email: ${error.message}`);
        }
    }

    // Email de confirmación de orden
    async sendOrderConfirmation(to, userName, orderData) {
        try {
            const { numeroOrden, items, total, fechaCreacion } = orderData;
            const subject = `Confirmación de Orden #${numeroOrden} - Cafetería App`;
            
            const itemsText = items.map(item => 
                `- ${item.nombre} x${item.cantidad} - $${item.precio_unitario.toFixed(2)}`
            ).join('\n');

            const text = `
Hola ${userName},

¡Tu orden ha sido confirmada!

Detalles de la orden:
Número de orden: #${numeroOrden}
Fecha: ${new Date(fechaCreacion).toLocaleDateString('es-MX')}

Productos:
${itemsText}

Total: $${total.toFixed(2)} MXN

Tu orden será preparada y estará lista en aproximadamente 15-20 minutos.
Te notificaremos cuando esté lista para recoger.

¡Gracias por tu preferencia!

Equipo de Cafetería App
            `.trim();

            const itemsHtml = items.map(item => `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.nombre}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.cantidad}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.precio_unitario.toFixed(2)}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                </tr>
            `).join('');

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28A745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .order-info { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .table th { background-color: #8B4513; color: white; padding: 10px; text-align: left; }
        .table td { padding: 8px; border-bottom: 1px solid #ddd; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ ¡Orden Confirmada!</h1>
        </div>
        <div class="content">
            <h2>Hola ${userName},</h2>
            <p>¡Tu orden ha sido confirmada y ya está siendo preparada!</p>
            
            <div class="order-info">
                <h3>Detalles de la Orden</h3>
                <p><strong>Número de orden:</strong> #${numeroOrden}</p>
                <p><strong>Fecha:</strong> ${new Date(fechaCreacion).toLocaleDateString('es-MX')}</p>
                <p><strong>Tiempo estimado:</strong> 15-20 minutos</p>
            </div>

            <table class="table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th style="text-align: center;">Cantidad</th>
                        <th style="text-align: right;">Precio Unit.</th>
                        <th style="text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div class="total">
                Total: $${total.toFixed(2)} MXN
            </div>

            <p>Te notificaremos cuando tu orden esté lista para recoger.</p>
            <p>¡Gracias por tu preferencia!</p>
        </div>
        <div class="footer">
            <p>© 2025 Cafetería App. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
            `;

            return await this.sendEmail(to, subject, text, html);
        } catch (error) {
            throw new Error(`Error sending order confirmation email: ${error.message}`);
        }
    }

    // Email de orden lista para recoger
    async sendOrderReady(to, userName, orderNumber) {
        try {
            const subject = `¡Tu orden #${orderNumber} está lista! - Cafetería App`;
            
            const text = `
Hola ${userName},

¡Buenas noticias! Tu orden #${orderNumber} está lista para recoger.

Por favor, acércate al mostrador con tu número de orden para recoger tu pedido.

¡Te esperamos!

Equipo de Cafetería App
            `.trim();

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FFC107; color: #333; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .order-number { font-size: 24px; font-weight: bold; color: #8B4513; text-align: center; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 ¡Tu orden está lista!</h1>
        </div>
        <div class="content">
            <h2>Hola ${userName},</h2>
            <p>¡Excelentes noticias! Tu orden ya está preparada y te está esperando.</p>
            
            <div class="order-number">
                Orden #${orderNumber}
            </div>

            <p>Por favor, acércate al mostrador y presenta tu número de orden para recoger tu pedido.</p>
            <p>¡Te esperamos con tu deliciosa orden lista!</p>
        </div>
        <div class="footer">
            <p>© 2025 Cafetería App. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
            `;

            return await this.sendEmail(to, subject, text, html);
        } catch (error) {
            throw new Error(`Error sending order ready email: ${error.message}`);
        }
    }

    // Email de cambio de contraseña exitoso
    async sendPasswordChangeConfirmation(to, userName) {
        try {
            const subject = 'Contraseña actualizada - Cafetería App';
            
            const text = `
Hola ${userName},

Tu contraseña ha sido actualizada exitosamente.

Si no realizaste este cambio, por favor contacta a nuestro equipo de soporte inmediatamente.

Equipo de Cafetería App
            `.trim();

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #17A2B8; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .warning { background-color: #F8D7DA; border: 1px solid #F5C6CB; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Contraseña Actualizada</h1>
        </div>
        <div class="content">
            <h2>Hola ${userName},</h2>
            <p>Tu contraseña ha sido actualizada exitosamente.</p>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong> Si no realizaste este cambio, contacta a nuestro equipo de soporte inmediatamente.
            </div>

            <p>Tu cuenta ahora está protegida con la nueva contraseña.</p>
        </div>
        <div class="footer">
            <p>© 2025 Cafetería App. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
            `;

            return await this.sendEmail(to, subject, text, html);
        } catch (error) {
            throw new Error(`Error sending password change confirmation: ${error.message}`);
        }
    }

    // Validar formato de email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Obtener estadísticas de envío
    async getEmailStats(domain = null) {
        try {
            const targetDomain = domain || process.env.MAILGUN_DOMAIN;
            const stats = await this.mailgun.get(`/${targetDomain}/stats/total`);
            
            return {
                delivered: stats.stats[0]?.delivered?.total || 0,
                clicked: stats.stats[0]?.clicked?.total || 0,
                opened: stats.stats[0]?.opened?.total || 0,
                failed: stats.stats[0]?.failed?.total || 0
            };
        } catch (error) {
            throw new Error(`Error getting email stats: ${error.message}`);
        }
    }

    // Verificar dominio
    async verifyDomain(domain = null) {
        try {
            const targetDomain = domain || process.env.MAILGUN_DOMAIN;
            const domainInfo = await this.mailgun.get(`/domains/${targetDomain}`);
            
            return {
                name: domainInfo.domain.name,
                state: domainInfo.domain.state,
                created_at: domainInfo.domain.created_at,
                smtp_login: domainInfo.domain.smtp_login
            };
        } catch (error) {
            throw new Error(`Error verifying domain: ${error.message}`);
        }
    }
}

module.exports = MailgunService;