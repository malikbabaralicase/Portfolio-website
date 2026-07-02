const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpEmail || !smtpPassword) {
    console.error('SMTP not configured -- cannot send email.');
    return res.status(500).json({ error: 'Failed to send email' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: smtpEmail,
      to: smtpEmail,
      replyTo: email,
      subject: `New Portfolio Contact from ${name}`,
      text: `You have a new message from your portfolio contact form:

Name: ${name}
Email: ${email}

Message:
${message}
`,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Email send error:', err.message);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
