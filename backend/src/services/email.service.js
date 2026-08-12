const fs = require('fs');
const path = require('path');
const resend = require('../config/resend');
const db = require('../config/database');

const sendEmail = async ({ to, subject, templateName, variables, userId = null }) => {
  const logData = {
    user_id: userId,
    email_to: to,
    email_type: templateName,
    subject: subject,
    status: 'queued',
    resend_email_id: null,
    error_message: null
  };

  // Insert initial queued log
  const [logResult] = await db.query(
    `INSERT INTO email_logs (user_id, email_to, email_type, subject, status) 
     VALUES (?, ?, ?, ?, 'queued')`,
    [logData.user_id, logData.email_to, logData.email_type, logData.subject]
  );
  const logId = logResult.insertId;

  try {
    // Read and parse template
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Replace template variables
    Object.keys(variables).forEach((key) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(placeholder, variables[key]);
    });

    // Send email via Resend
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Abel's By Lincy <noreply@abels.com>",
      to,
      subject,
      html: htmlContent
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    // Update log status to sent
    await db.query(
      `UPDATE email_logs 
       SET status = 'sent', resend_email_id = ?, sent_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [response.data.id, logId]
    );

    return { success: true, id: response.data.id };
  } catch (error) {
    // Update log status to failed
    await db.query(
      `UPDATE email_logs 
       SET status = 'failed', error_message = ? 
       WHERE id = ?`,
      [error.message, logId]
    );
    console.error(`❌ Email sending failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail
};
