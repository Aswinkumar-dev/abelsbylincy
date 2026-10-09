const fs = require('fs');
const path = require('path');
const resend = require('../config/resend');
const db = require('../config/database');

// Built-in fallback HTML generator for serverless environments where static assets might not be copied
const getFallbackHtml = (templateName, vars) => {
  const year = vars.currentYear || new Date().getFullYear();
  const name = vars.customerName || 'Valued Customer';

  if (templateName === 'reset-password') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Reset Your Password</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>body{font-family:'Poppins',sans-serif;background-color:#FAF9F6;margin:0;padding:20px;color:#22252A;}.container{max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #ECECEC;}.header{background:#1A1A1A;padding:32px 20px;text-align:center;}.header h1{margin:0;color:#D4AF37;font-size:22px;letter-spacing:0.18em;text-transform:uppercase;}.body{padding:32px 28px;}.btn{display:inline-block;background:#D4AF37;color:#1A1A1A;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:6px;margin:24px 0;}.footer{background:#F8F6F2;padding:20px;text-align:center;font-size:12px;color:#6E7068;border-top:1px solid #ECE8E0;}</style></head><body><div class="container"><div class="header"><h1>Abel’s By Lincy</h1><p style="margin:4px 0 0 0;font-size:11px;color:#ECE8E0;letter-spacing:0.2em;text-transform:uppercase;">Fine Jewellery Collection</p></div><div class="body"><h2 style="font-size:18px;margin-top:0;">Password Reset Request</h2><p>Hello <strong>${name}</strong>,</p><p>We received a request to reset your password for your Abel's By Lincy account. Click below to securely choose a new password:</p><div style="text-align:center;"><a href="${vars.resetUrl || '#'}" class="btn" target="_blank">Reset Password</a></div><p style="font-size:12px;color:#787A74;">If the button doesn't work, copy and paste this link:<br><a href="${vars.resetUrl || '#'}" style="color:#B8860B;">${vars.resetUrl || '#'}</a></p><p style="font-size:12px;color:#888888;margin-top:24px;">This link is valid for 1 hour. If you didn't request this, please disregard this email.</p></div><div class="footer"><p style="margin:0;">© ${year} Abel's By Lincy. All rights reserved.</p></div></div></body></html>`;
  }

  if (templateName === 'pickup_order_confirmation' || templateName === 'pickup-order-confirmation') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Pick Up Order Confirmed</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"><style>body{font-family:'Poppins',sans-serif;background:#FAF9F6;margin:0;padding:20px;color:#22252A;}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ECECEC;}.header{background:#1A1A1A;padding:32px 20px;text-align:center;}.header h1{margin:0;color:#D4AF37;font-size:22px;letter-spacing:0.18em;text-transform:uppercase;}.body{padding:32px 28px;}.card{background:#F8F6F2;padding:16px 18px;border-radius:8px;font-size:13px;color:#4A4D45;margin-bottom:14px;border:1px solid #EFECE6;}.footer{background:#F8F6F2;padding:20px;text-align:center;font-size:12px;color:#6E7068;border-top:1px solid #ECE8E0;}</style></head><body><div class="container"><div class="header"><h1>Abel’s By Lincy</h1><p style="margin:4px 0 0 0;font-size:11px;color:#ECE8E0;letter-spacing:0.2em;text-transform:uppercase;">In-Person Collection</p></div><div class="body"><h2 style="font-size:18px;margin-top:0;">Ready for In-Person Pick Up</h2><p>Thank you for your order, <strong>${name}</strong>. Your jewellery will be handed over directly in person. Details will be sent to <strong>${vars.customerEmail || ''}</strong>.</p><p>Order Reference: <strong>${vars.orderNumber || ''}</strong></p><p>Total Due on Collection: <strong>${vars.orderTotal || ''}</strong></p><table style="width:100%;margin-top:20px;border-collapse:collapse;">${vars.itemsHtml || ''}</table><table style="width:100%;margin-top:16px;border-collapse:collapse;">${vars.summaryBreakdownHtml || ''}</table><div class="card" style="margin-top:20px;"><strong style="color:#1A1A1A;display:block;margin-bottom:6px;">Contact Information:</strong><strong>Customer:</strong> ${name}<br><strong>Email:</strong> ${vars.customerEmail || ''}<br><strong>Phone:</strong> ${vars.customerPhone || 'Not Provided'}<br><strong>Method:</strong> In-Person Pick Up (Direct Handover)</div></div><div class="footer"><p style="margin:0;">© ${year} Abel's By Lincy. All rights reserved.</p></div></div></body></html>`;
  }

  if (templateName === 'order_confirmation' || templateName === 'order-confirmation') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Confirmed</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"><style>body{font-family:'Poppins',sans-serif;background:#FAF9F6;margin:0;padding:20px;color:#22252A;}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ECECEC;}.header{background:#1A1A1A;padding:32px 20px;text-align:center;}.header h1{margin:0;color:#D4AF37;font-size:22px;letter-spacing:0.18em;text-transform:uppercase;}.body{padding:32px 28px;}.footer{background:#F8F6F2;padding:20px;text-align:center;font-size:12px;color:#6E7068;border-top:1px solid #ECE8E0;}</style></head><body><div class="container"><div class="header"><h1>Abel’s By Lincy</h1><p style="margin:4px 0 0 0;font-size:11px;color:#ECE8E0;letter-spacing:0.2em;text-transform:uppercase;">Order Confirmation</p></div><div class="body"><h2 style="font-size:18px;margin-top:0;">Thank you for your order, ${name}!</h2><p>Your order <strong>${vars.orderNumber || ''}</strong> has been confirmed.</p><p>Total Amount: <strong>${vars.orderTotal || ''}</strong></p><p>Estimated Delivery: <strong>${vars.estimatedDeliveryDate || '3-5 business days'}</strong></p><table style="width:100%;margin-top:20px;border-collapse:collapse;">${vars.itemsHtml || ''}</table><table style="width:100%;margin-top:16px;border-collapse:collapse;">${vars.summaryBreakdownHtml || ''}</table></div><div class="footer"><p style="margin:0;">© ${year} Abel's By Lincy. All rights reserved.</p></div></div></body></html>`;
  }

  if (templateName === 'order_dispatch' || templateName === 'order-shipped') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Dispatched</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"><style>body{font-family:'Poppins',sans-serif;background:#FAF9F6;margin:0;padding:20px;color:#22252A;}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ECECEC;}.header{background:#1A1A1A;padding:32px 20px;text-align:center;}.header h1{margin:0;color:#D4AF37;font-size:22px;letter-spacing:0.18em;text-transform:uppercase;}.body{padding:32px 28px;}.btn{display:inline-block;background:#D4AF37;color:#1A1A1A;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:6px;margin:20px 0;}.footer{background:#F8F6F2;padding:20px;text-align:center;font-size:12px;color:#6E7068;border-top:1px solid #ECE8E0;}</style></head><body><div class="container"><div class="header"><h1>Abel’s By Lincy</h1><p style="margin:4px 0 0 0;font-size:11px;color:#ECE8E0;letter-spacing:0.2em;text-transform:uppercase;">Shipment Notification</p></div><div class="body"><h2 style="font-size:18px;margin-top:0;">Your order is on the way, ${name}!</h2><p>Your order <strong>${vars.orderId || ''}</strong> has been dispatched via ${vars.shippingMethod || 'Australia Post'}.</p><div style="background:#F4F4F2;padding:20px;border-radius:8px;text-align:center;margin:20px 0;"><p style="font-size:12px;color:#B8860B;font-weight:700;margin:0 0 6px 0;">TRACKING NUMBER</p><p style="font-size:18px;font-weight:700;margin:0 0 12px 0;">${vars.trackingNumber || ''}</p><a href="https://auspost.com.au/mypost/track/#/details/${vars.trackingNumber || ''}" class="btn" target="_blank">Track Shipment</a></div></div><div class="footer"><p style="margin:0;">© ${year} Abel's By Lincy. All rights reserved.</p></div></div></body></html>`;
  }

  if (templateName === 'order_refund' || templateName === 'refund') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Refund Processed</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"><style>body{font-family:'Poppins',sans-serif;background:#FAF9F6;margin:0;padding:20px;color:#22252A;}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ECECEC;}.header{background:#1A1A1A;padding:32px 20px;text-align:center;}.header h1{margin:0;color:#D4AF37;font-size:22px;letter-spacing:0.18em;text-transform:uppercase;}.body{padding:32px 28px;}.footer{background:#F8F6F2;padding:20px;text-align:center;font-size:12px;color:#6E7068;border-top:1px solid #ECE8E0;}</style></head><body><div class="container"><div class="header"><h1>Abel’s By Lincy</h1><p style="margin:4px 0 0 0;font-size:11px;color:#ECE8E0;letter-spacing:0.2em;text-transform:uppercase;">Refund Notice</p></div><div class="body"><h2 style="font-size:18px;margin-top:0;">${vars.refundHeading || 'Your Refund Has Been Processed'}</h2><p>Hello <strong>${name}</strong>,</p><p>${vars.refundMessage || 'Your refund has been processed successfully.'}</p><p>Refund Amount: <strong>${vars.refundAmount || ''}</strong></p><p>Timeline: <strong>${vars.timelineDays || '5 to 10 business days'}</strong></p></div><div class="footer"><p style="margin:0;">© ${year} Abel's By Lincy. All rights reserved.</p></div></div></body></html>`;
  }

  if (templateName === 'newsletter_welcome') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Welcome</title></head><body style="font-family:'Poppins',sans-serif;background:#FAF9F6;padding:20px;"><div style="max-width:600px;margin:0 auto;background:#fff;padding:32px;border-radius:12px;border:1px solid #ECECEC;"><h1 style="color:#D4AF37;text-align:center;">Abel’s By Lincy</h1><h2 style="text-align:center;">Welcome to Our Circle!</h2><p>Thank you for subscribing to Abel's By Lincy. You'll now receive our latest jewelry releases, styling tips, and exclusive offers.</p><p style="text-align:center;color:#989A92;font-size:12px;margin-top:30px;">© ${year} Abel's By Lincy</p></div></body></html>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Abel's By Lincy</title></head><body style="font-family:sans-serif;padding:20px;"><h1 style="color:#D4AF37;">Abel’s By Lincy</h1><p>Notification from Abel's By Lincy.</p><p>© ${year} Abel's By Lincy</p></body></html>`;
};

const getPlainText = (templateName, vars) => {
  const year = vars.currentYear || new Date().getFullYear();
  const name = vars.customerName || 'Valued Customer';
  if (templateName === 'reset-password') {
    return `ABEL'S BY LINCY\nFine Jewellery Collection\n\nHello ${name},\n\nWe received a request to reset your password for your Abel's By Lincy account.\n\nTo reset your password, please open the following link:\n${vars.resetUrl || 'https://abelsbylincy.com'}\n\nThis link is valid for 1 hour.\nIf you did not request this, please disregard this email.\n\n© ${year} Abel's By Lincy. All rights reserved.`;
  }
  if (templateName === 'pickup_order_confirmation' || templateName === 'pickup-order-confirmation') {
    return `ABEL'S BY LINCY\nIn-Person Pick Up Order Confirmation\n\nThank you for your order, ${name}!\nYour jewellery will be handed over directly in person. Details will be sent to ${vars.customerEmail || ''}.\n\nOrder Reference: ${vars.orderNumber || ''}\nTotal Due on Collection: ${vars.orderTotal || ''}\nCustomer: ${name}\nEmail: ${vars.customerEmail || ''}\nPhone: ${vars.customerPhone || 'Not Provided'}\nMethod: In-Person Pick Up (Direct Handover)\n\n© ${year} Abel's By Lincy. All rights reserved.`;
  }
  if (templateName === 'order_confirmation' || templateName === 'order-confirmation') {
    return `ABEL'S BY LINCY\nOrder Confirmation\n\nThank you for your order, ${name}!\nOrder Reference: ${vars.orderNumber || ''}\nTotal: ${vars.orderTotal || ''}\nEstimated Delivery: ${vars.estimatedDeliveryDate || '3-5 business days'}\n\n© ${year} Abel's By Lincy. All rights reserved.`;
  }
  if (templateName === 'order_dispatch' || templateName === 'order-shipped') {
    return `ABEL'S BY LINCY\nShipment Notification\n\nYour order ${vars.orderId || ''} has been dispatched via ${vars.shippingMethod || 'Australia Post'}.\nTracking Number: ${vars.trackingNumber || ''}\n\n© ${year} Abel's By Lincy. All rights reserved.`;
  }
  if (templateName === 'order_refund' || templateName === 'refund') {
    return `ABEL'S BY LINCY\nRefund Notice\n\n${vars.refundHeading || 'Your Refund Has Been Processed'}\nOrder: ${vars.orderNumber || ''}\nRefund Amount: ${vars.refundAmount || ''}\nTimeline: ${vars.timelineDays || '5 to 10 business days'}\n\n© ${year} Abel's By Lincy. All rights reserved.`;
  }
  if (templateName === 'newsletter_welcome') {
    return `ABEL'S BY LINCY\nFine Jewellery Collection\n\nWelcome to the Abel's By Lincy Circle! Thank you for subscribing.\n\n© ${year} Abel's By Lincy. All rights reserved.`;
  }
  return `Abel's By Lincy notification.\n\n© ${year} Abel's By Lincy. All rights reserved.`;
};

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

  let logId = null;
  try {
    const [logResult] = await db.query(
      `INSERT INTO email_logs (user_id, email_to, email_type, subject, status) 
       VALUES (?, ?, ?, ?, 'queued')`,
      [logData.user_id, logData.email_to, logData.email_type, logData.subject]
    );
    logId = logResult?.insertId;
  } catch {
    // DB log error ignored so email sending is uninterrupted
  }

  try {
    const varsWithDefaults = {
      currentYear: new Date().getFullYear(),
      ...(variables || {})
    };

    // Robust template loading with multi-path resolution and fallback
    let htmlContent = null;
    const searchPaths = [
      path.join(__dirname, '../templates/emails', `${templateName}.html`),
      path.join(process.cwd(), 'backend/src/templates/emails', `${templateName}.html`),
      path.join(process.cwd(), 'src/templates/emails', `${templateName}.html`),
      path.join(process.cwd(), 'templates/emails', `${templateName}.html`)
    ];

    for (const testPath of searchPaths) {
      try {
        if (fs.existsSync(testPath)) {
          htmlContent = fs.readFileSync(testPath, 'utf8');
          break;
        }
      } catch (_) {}
    }

    if (!htmlContent) {
      htmlContent = getFallbackHtml(templateName, varsWithDefaults);
    }

    // Replace template variables safely using a replacer function to avoid JavaScript $ token corruption
    Object.keys(varsWithDefaults).forEach((key) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(placeholder, () => String(varsWithDefaults[key] ?? ''));
    });

    const plainText = getPlainText(templateName, varsWithDefaults);

    // 1. Try sending via Nodemailer if SMTP configured
    if (process.env.SMTP_HOST || process.env.SMTP_USER) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: process.env.SMTP_SECURE !== 'false',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        const info = await transporter.sendMail({
          from: process.env.EMAIL_FROM || `"Abel's By Lincy" <${process.env.SMTP_USER}>`,
          to,
          subject,
          html: htmlContent,
          text: plainText
        });

        await db.query(
          `UPDATE email_logs SET status = 'sent', resend_email_id = ?, sent_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [info.messageId, logId]
        );
        console.log(`✅ [EMAIL SENT via SMTP] MessageId: ${info.messageId} to ${to}`);
        return { success: true, id: info.messageId };
      } catch (smtpErr) {
        console.warn('⚠️ SMTP send failed, falling back to Resend:', smtpErr.message);
      }
    }

    // 2. Try sending via Resend API
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey || resendKey.includes('replace_with_your_resend_api_key')) {
      throw new Error('RESEND_API_KEY is not configured in backend/.env. Please add a valid Resend API key starting with re_ from https://resend.com/api-keys');
    }

    const fromAddress = process.env.EMAIL_FROM || "Abel's By Lincy <orders@abelsbylincy.com>";

    let response = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html: htmlContent,
      text: plainText
    });

    if (response.error) {
      // Fallback: If custom domain unverified, try with onboarding@resend.dev
      if (response.error.message && (response.error.message.includes('domain') || response.error.message.includes('from'))) {
        console.warn('⚠️ Custom from address note, retrying with verified sender fallback:', response.error.message);
        response = await resend.emails.send({
          from: "Abel's By Lincy <onboarding@resend.dev>",
          to,
          subject,
          html: htmlContent,
          text: plainText
        });
      }
    }

    if (response.error) {
      throw new Error(response.error.message);
    }

    try {
      if (logId) {
        await db.query(`UPDATE email_logs SET status = 'sent', resend_email_id = ?, sent_at = CURRENT_TIMESTAMP WHERE id = ?`, [response.data.id, logId]);
      }
    } catch {}

    console.log(`✅ [EMAIL SENT via RESEND] EmailId: ${response.data.id} to ${to}`);
    return { success: true, id: response.data.id };
  } catch (error) {
    try {
      if (logId) {
        await db.query(`UPDATE email_logs SET status = 'failed', error_message = ? WHERE id = ?`, [error.message, logId]);
      }
    } catch {}
    console.error(`❌ Email sending failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const {
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      streetAddress,
      suburb,
      state,
      postcode,
      estimatedDeliveryDate,
      purchasedItems,
      orderTotal,
      orderDate
    } = orderData;

    // Sanitize customer name to remove 'Client' word completely
    let cleanCustomerName = (customerName || 'Valued Customer')
      .replace(/\bClient\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleanCustomerName) cleanCustomerName = 'Valued Customer';

    // Normalize items array
    const rawItems = Array.isArray(purchasedItems) ? purchasedItems : (Array.isArray(orderData.items) ? orderData.items : (Array.isArray(orderData.orderItems) ? orderData.orderItems : []));

    // Calculate subtotal
    let subtotal = 0;
    if (orderData.subtotal !== undefined && !isNaN(parseFloat(orderData.subtotal))) {
      subtotal = parseFloat(orderData.subtotal);
    } else if (rawItems.length > 0) {
      subtotal = rawItems.reduce((sum, item) => {
        const p = parseFloat(item.price || item.unit_price || item.unitPrice || item.salePrice || 0);
        const q = parseInt(item.quantity || item.qty || 1, 10);
        return sum + (p * q);
      }, 0);
    }

    const discountAmount = parseFloat(orderData.discountAmount || orderData.discount || 0) || 0;
    const couponCode = (orderData.couponCode || orderData.coupon || '').trim().toUpperCase();
    const shippingFee = parseFloat(orderData.shippingFee || orderData.shippingAmount || (orderData.shippingMethod === 'express' ? 15 : 0)) || 0;
    const shippingMethod = orderData.shippingMethod || (shippingFee > 0 ? 'Express Shipping (Australia Post)' : 'Standard Shipping (Australia Post)');

    // Prioritize authoritative order total
    let totalPaid = 0;
    if (orderData.rawAmount !== undefined && !isNaN(parseFloat(orderData.rawAmount))) {
      totalPaid = parseFloat(orderData.rawAmount);
    } else if (orderData.finalPaidAmount !== undefined && !isNaN(parseFloat(orderData.finalPaidAmount))) {
      totalPaid = parseFloat(orderData.finalPaidAmount);
    } else if (orderTotal) {
      const parsedNum = parseFloat(String(orderTotal).replace(/[^0-9.]/g, ''));
      if (!isNaN(parsedNum) && parsedNum > 0) totalPaid = parsedNum;
    }
    if (totalPaid <= 0) {
      totalPaid = Math.max(0, subtotal - discountAmount + shippingFee);
    }

    const finalTotalStr = `$${totalPaid.toFixed(2)} AUD`;

    // Format purchased items table rows with Poppins font
    let itemsHtml = '';
    if (rawItems.length > 0) {
      itemsHtml = rawItems.map(item => {
        const name = item.name || item.product_name || item.productName || item.title || 'Fine Jewellery Piece';
        const variant = item.variantName || item.variant_name || item.size || item.selectedSize || item.color || 'Fine Gold-Plated Jewellery';
        const qty = parseInt(item.quantity || item.qty || 1, 10);
        const unitPrice = parseFloat(item.price || item.unit_price || item.unitPrice || item.salePrice || 0);
        const lineTotal = unitPrice * qty;

        return `
          <tr style="border-bottom: 1px dashed #ECECEC; font-family: 'Poppins', sans-serif !important;">
            <td style="padding: 14px 0; font-family: 'Poppins', sans-serif !important;">
              <strong style="color: #1A1A1A; font-size: 13.5px; display: block; margin-bottom: 2px;">${name}</strong>
              <span style="font-size: 11.5px; color: #989A92;">Qty: ${qty} · ${variant}</span>
            </td>
            <td style="text-align: center; padding: 14px 0; font-size: 13.5px; color: #5A5C56; font-family: 'Poppins', sans-serif !important;">${qty}</td>
            <td style="text-align: right; font-weight: 600; padding: 14px 0; font-size: 14px; color: #1A1A1A; font-family: 'Poppins', sans-serif !important;">$${lineTotal.toFixed(2)} AUD</td>
          </tr>
        `;
      }).join('');
    } else {
      itemsHtml = `
        <tr style="border-bottom: 1px dashed #ECECEC; font-family: 'Poppins', sans-serif !important;">
          <td style="padding: 14px 0; font-family: 'Poppins', sans-serif !important;"><strong style="color: #1A1A1A; font-size: 13.5px;">Fine Gold-Plated Jewellery Collection</strong></td>
          <td style="text-align: center; padding: 14px 0; font-size: 13.5px; color: #5A5C56; font-family: 'Poppins', sans-serif !important;">1</td>
          <td style="text-align: right; font-weight: 600; padding: 14px 0; font-size: 14px; color: #1A1A1A; font-family: 'Poppins', sans-serif !important;">${finalTotalStr}</td>
        </tr>
      `;
    }

    // Build subtotal, coupon discount, and shipping breakdown rows
    let summaryBreakdownHtml = `
      <tr style="border-bottom: 1px solid #F0F0F0; font-family: 'Poppins', sans-serif !important;">
        <td colspan="2" style="padding: 12px 0 6px 0; font-size: 13px; color: #5A5C56; font-family: 'Poppins', sans-serif !important;">Items Subtotal</td>
        <td style="text-align: right; padding: 12px 0 6px 0; font-size: 13.5px; font-weight: 600; color: #1A1A1A; font-family: 'Poppins', sans-serif !important;">$${subtotal.toFixed(2)} AUD</td>
      </tr>
    `;

    if (discountAmount > 0) {
      summaryBreakdownHtml += `
        <tr style="border-bottom: 1px solid #F0F0F0; font-family: 'Poppins', sans-serif !important;">
          <td colspan="2" style="padding: 6px 0; font-size: 13px; color: #047857; font-family: 'Poppins', sans-serif !important;">
            <strong style="color: #047857;">Coupon Discount ${couponCode ? `(${couponCode})` : ''}</strong>
          </td>
          <td style="text-align: right; padding: 6px 0; font-size: 13.5px; font-weight: 700; color: #047857; font-family: 'Poppins', sans-serif !important;">-$${discountAmount.toFixed(2)} AUD</td>
        </tr>
      `;
    }

    const isPickup = Boolean(
      orderData.isPickup ||
      /pick\s*up/i.test(String(shippingMethod || '')) ||
      String(orderNumber || '').startsWith('ABL-PK-')
    );

    if (!isPickup) {
      summaryBreakdownHtml += `
        <tr style="border-bottom: 1px solid #F0F0F0; font-family: 'Poppins', sans-serif !important;">
          <td colspan="2" style="padding: 6px 0 12px 0; font-size: 13px; color: #5A5C56; font-family: 'Poppins', sans-serif !important;">${shippingMethod}</td>
          <td style="text-align: right; padding: 6px 0 12px 0; font-size: 13.5px; font-weight: 600; color: ${shippingFee > 0 ? '#1A1A1A' : '#047857'}; font-family: 'Poppins', sans-serif !important;">${shippingFee > 0 ? `+$${shippingFee.toFixed(2)} AUD` : 'FREE'}</td>
        </tr>
      `;
    }

    // Estimated Delivery Date Calculation based on shipping choice:
    // Express Shipping = within 2 days; Standard Shipping = within 3-4 days
    const isExpress = /express/i.test(String(shippingMethod || orderData.shippingMethodChoice || '')) || shippingFee >= 15;
    let finalDeliveryEstimate = estimatedDeliveryDate;
    if (!finalDeliveryEstimate || finalDeliveryEstimate.includes('3-5') || finalDeliveryEstimate.includes('business days')) {
      const addDays = isExpress ? 2 : 4;
      const estDate = new Date();
      estDate.setDate(estDate.getDate() + addDays);
      finalDeliveryEstimate = estDate.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    const variables = {
      orderNumber: orderNumber || '#ABL-2026-8842',
      customerName: cleanCustomerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone || 'Not Provided',
      streetAddress: streetAddress || '189 Brompton Road',
      suburb: suburb || 'Brisbane City',
      state: state || 'Queensland (QLD)',
      postcode: postcode || '4061',
      estimatedDeliveryDate: isPickup ? 'In-Person Handover' : finalDeliveryEstimate,
      itemsHtml: itemsHtml,
      summaryBreakdownHtml: summaryBreakdownHtml,
      orderTotal: finalTotalStr,
      orderDate: orderDate || new Date().toLocaleDateString('en-GB')
    };

    const templateName = isPickup ? 'pickup_order_confirmation' : 'order_confirmation';
    const subject = isPickup 
      ? `Order Confirmed for In-Person Pick Up! ${variables.orderNumber} — Abel's By Lincy`
      : `Order Confirmed! ${variables.orderNumber} — Abel's By Lincy`;

    console.log(`✉️ [BACKGROUND EMAIL SERVICE] Dispatching ${isPickup ? 'Pick Up' : 'Standard'} Order Confirmation Email to: ${customerEmail} (Order Ref: ${variables.orderNumber})`);

    try {
      return await sendEmail({
        to: customerEmail,
        subject: subject,
        templateName: templateName,
        variables: variables
      });
    } catch (err) {
      console.log(`ℹ️ [EMAIL LOGGED] Order confirmation recorded for ${customerEmail}`);
      return { success: true, logged: true };
    }
  } catch (error) {
    console.error('Order confirmation email error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendNewsletterWelcomeEmail = async (userEmail) => {
  try {
    if (!userEmail) return { success: false, message: 'No email provided' };

    const subject = `✨ Welcome to the Abel's By Lincy Circle!`;
    console.log(`✉️ [NEWSLETTER EMAIL SERVICE] Dispatching Welcome Email to: ${userEmail}`);

    return await sendEmail({
      to: userEmail,
      subject: subject,
      templateName: 'newsletter_welcome',
      variables: {}
    });
  } catch (error) {
    console.error('Newsletter welcome email error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendOrderDispatchEmail = async (dispatchData) => {
  try {
    const {
      toEmail,
      customerName,
      orderId,
      trackingNumber,
      shippingMethod,
      shippingAddress
    } = dispatchData;

    if (!toEmail) return { success: false, message: 'No customer email provided' };

    const formattedOrderId = orderId ? (String(orderId).startsWith('#') ? String(orderId) : `#${orderId}`) : '#ABL-1001';
    const cleanCustomerName = (customerName || 'Valued Customer').replace(/\bClient\b/gi, '').trim() || 'Valued Customer';
    const cleanTrackingNumber = (trackingNumber || 'AP398201948AU').trim();

    const subject = `Your Abel's By Lincy Order ${formattedOrderId} Has Been Dispatched!`;
    console.log(`✉️ [DISPATCH EMAIL SERVICE] Sending Australia Post Dispatch Email to: ${toEmail} (Order Ref: ${formattedOrderId}, Tracking: ${cleanTrackingNumber})`);

    return await sendEmail({
      to: toEmail,
      subject: subject,
      templateName: 'order_dispatch',
      variables: {
        customerName: cleanCustomerName,
        orderId: formattedOrderId,
        trackingNumber: cleanTrackingNumber,
        shippingMethod: shippingMethod || 'Express Shipping (Australia Post)',
        shippingAddress: shippingAddress || 'Australia'
      }
    });
  } catch (error) {
    console.error('Order dispatch email error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendOrderRefundEmail = async (refundData) => {
  try {
    const {
      toEmail,
      customerName,
      orderId,
      refundAmount,
      isFullRefund,
      originalTotal,
      daysTimeline
    } = refundData;

    if (!toEmail) return { success: false, message: 'No customer email provided' };

    const formattedOrderId = orderId ? (String(orderId).startsWith('#') ? String(orderId) : `#${orderId}`) : '#ABL-1001';
    const cleanCustomerName = (customerName || 'Valued Customer').replace(/\bClient\b/gi, '').trim() || 'Valued Customer';
    
    let formattedRefundAmt = String(refundAmount || '0.00').trim();
    if (!formattedRefundAmt.startsWith('$')) formattedRefundAmt = `$${formattedRefundAmt}`;
    if (!formattedRefundAmt.toUpperCase().includes('AUD')) formattedRefundAmt = `${formattedRefundAmt} AUD`;

    let formattedOriginalTotal = String(originalTotal || formattedRefundAmt).trim();
    if (!formattedOriginalTotal.startsWith('$')) formattedOriginalTotal = `$${formattedOriginalTotal}`;
    if (!formattedOriginalTotal.toUpperCase().includes('AUD')) formattedOriginalTotal = `${formattedOriginalTotal} AUD`;

    const refundType = isFullRefund ? 'Full Refund' : 'Partial Refund';
    const timelineStr = daysTimeline || '5 to 10 business days';

    const subject = `Your Refund of ${formattedRefundAmt} Has Been Processed — Abel's By Lincy (${formattedOrderId})`;
    console.log(`✉️ [REFUND EMAIL SERVICE] Sending Stripe Refund Email to: ${toEmail} (Order Ref: ${formattedOrderId}, Amount: ${formattedRefundAmt})`);

    return await sendEmail({
      to: toEmail,
      subject: subject,
      templateName: 'order_refund',
      variables: {
        customerName: cleanCustomerName,
        orderNumber: formattedOrderId,
        refundHeading: isFullRefund ? 'Your Order Refund Has Been Processed' : 'Your Partial Refund Has Been Processed',
        refundMessage: isFullRefund 
          ? `We are confirming that a full refund of ${formattedRefundAmt} has been issued for your order ${formattedOrderId}.`
          : `We are confirming that a partial refund of ${formattedRefundAmt} has been issued for your order ${formattedOrderId}.`,
        refundAmount: formattedRefundAmt,
        refundType: refundType,
        originalTotal: formattedOriginalTotal,
        timelineDays: timelineStr
      }
    });
  } catch (error) {
    console.error('Order refund email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendNewsletterWelcomeEmail,
  sendOrderDispatchEmail,
  sendOrderRefundEmail
};
