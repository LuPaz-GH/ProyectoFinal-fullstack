const nodemailer = require('nodemailer');

// =====================================================
// Configuración del transporte SMTP (Outlook/Hotmail)
// =====================================================
const transporter = nodemailer.createTransport({
  service: 'gmail',  // ← reemplaza todo el host/port/tls por esto
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// =====================================================
// Función principal: enviar email de recuperación
// =====================================================
const enviarEmailRecuperacion = async (emailDestino, token, nombreUsuario) => {
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Malfi Veterinaria 🐾" <${process.env.EMAIL_USER}>`,
    to: emailDestino,
    subject: 'Recuperar acceso - Malfi Veterinaria',

    text:
      `Hola ${nombreUsuario || 'Equipo'},\n\n` +
      `Recibimos tu solicitud para recuperar el acceso.\n\n` +
      `Usá este enlace para cambiar tu contraseña y usuario (válido por 1 hora):\n${resetLink}\n\n` +
      `Si no fuiste vos, podés ignorar este mensaje.\n\n` +
      `Saludos,\nEquipo Malfi Veterinaria 🐾`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #663399;">Hola ${nombreUsuario || 'Equipo'},</h2>
        <p>Recibimos una solicitud para recuperar tu acceso en Malfi Veterinaria.</p>
        <p style="margin: 30px 0;">
          <a href="${resetLink}"
             style="background:#663399; color:white; padding:14px 28px; border-radius:8px;
                    text-decoration:none; font-weight:bold; display:inline-block;">
            Cambiar mi contraseña y usuario
          </a>
        </p>
        <p>El enlace expira en 1 hora.</p>
        <p>Si no pediste esto, simplemente ignorá este email. Tu cuenta está protegida.</p>
        <p style="margin-top:40px; color:#666; font-size:13px;">
          Saludos,<br>
          Equipo Malfi Veterinaria 🐾<br>
          <small>Este es un mensaje automático.</small>
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de recuperación enviado a:', emailDestino);
    return true;
  } catch (err) {
    console.error('❌ Error al enviar email:', err.message);
    return false;
  }
};

// =====================================================
// Función genérica (por si la usás en otros lados)
// =====================================================
const enviarEmail = async (toEmail, subject, text, html = null) => {
  const mailOptions = {
    from: `"Malfi Veterinaria 🐾" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    text,
    html: html || text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado a:', toEmail);
    return true;
  } catch (err) {
    console.error('❌ Error al enviar email:', err.message);
    throw err;
  }
};

module.exports = { enviarEmailRecuperacion, enviarEmail };