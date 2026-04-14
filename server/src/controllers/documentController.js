const nodemailer = require('nodemailer');

// Setup transporter optimized for GoDaddy/Office365 or Custom Hosts
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtpout.secureserver.net', // GoDaddy standard. Change to 'smtp.office365.com' if using Microsoft 365 GoDaddy
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 465,
  secure: process.env.EMAIL_PORT == 587 ? false : true, // false for 587 (TLS), true for 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendDocument = async (req, res) => {
  try {
    const { pdfBase64, email, clientName, type, subject, messageText } = req.body;

    if (!pdfBase64 || !email) {
      return res.status(400).json({ error: 'PDF data and destination email are required' });
    }

    // PDF data usually comes as 'data:application/pdf;filename=generated.pdf;base64,JVBERi0xLj....'
    // Extract base64 part
    const base64Data = pdfBase64.split(';base64,').pop();
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    const typeStr = type || 'Document';

    const mailOptions = {
      from: process.env.EMAIL_USER || 'billing@vichakratechnologies.com',
      to: email,
      subject: subject || `Vichakra Technologies - Your ${typeStr}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <div style="text-align: center; margin-bottom: 30px;">
             <h2 style="color: #0d9488; margin: 0; font-size: 24px; letter-spacing: -0.5px;">Vichakra Technologies</h2>
             <p style="color: #888; font-size: 13px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Software Consulting & Studio</p>
          </div>
          <h3 style="font-size: 18px; margin-bottom: 20px;">Hello ${clientName || 'Client'},</h3>
          <p style="font-size: 15px; line-height: 1.6; color: #555;">
            ${(messageText || `Please find your requested <strong>${typeStr}</strong> safely attached to this email.`).replace(/\n/g, '<br/>')}
          </p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">If you have any specific requirements, questions, or updates regarding this document, please reply directly to this email or reach our billing department.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <div style="text-align: center; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 5px 0;">Thank you for your business. We look forward to working with you.</p>
            <p style="margin: 0;"><strong>Vichakra Technologies</strong> &copy; ${new Date().getFullYear()}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `${clientName ? clientName.replace(/\\s+/g, '_') : 'client'}_${typeStr.replace(/\\s+/g, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Document sent successfully' });
  } catch (error) {
    console.error('Error sending document email:', error);
    res.status(500).json({ error: 'Failed to send document' });
  }
};
