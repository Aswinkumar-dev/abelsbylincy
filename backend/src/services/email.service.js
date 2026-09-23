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
    // Read and parse template
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Replace template variables safely using a replacer function to avoid JavaScript $ token corruption
    const varsWithDefaults = {
      currentYear: new Date().getFullYear(),
      ...(variables || {})
    };

    Object.keys(varsWithDefaults).forEach((key) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(placeholder, () => String(varsWithDefaults[key] ?? ''));
    });

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
          html: htmlContent
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

    const response = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html: htmlContent
    });

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

    summaryBreakdownHtml += `
      <tr style="border-bottom: 1px solid #F0F0F0; font-family: 'Poppins', sans-serif !important;">
        <td colspan="2" style="padding: 6px 0 12px 0; font-size: 13px; color: #5A5C56; font-family: 'Poppins', sans-serif !important;">${shippingMethod}</td>
        <td style="text-align: right; padding: 6px 0 12px 0; font-size: 13.5px; font-weight: 600; color: ${shippingFee > 0 ? '#1A1A1A' : '#047857'}; font-family: 'Poppins', sans-serif !important;">${shippingFee > 0 ? `+$${shippingFee.toFixed(2)} AUD` : 'FREE'}</td>
      </tr>
    `;

    const variables = {
      orderNumber: orderNumber || '#ABL-2026-8842',
      customerName: cleanCustomerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone || 'Not Provided',
      streetAddress: streetAddress || '189 Brompton Road',
      suburb: suburb || 'Brisbane City',
      state: state || 'Queensland (QLD)',
      postcode: postcode || '4061',
      estimatedDeliveryDate: estimatedDeliveryDate || 'In 3-5 business days',
      itemsHtml: itemsHtml,
      summaryBreakdownHtml: summaryBreakdownHtml,
      orderTotal: finalTotalStr,
      orderDate: orderDate || new Date().toLocaleDateString('en-GB')
    };

    const subject = `✨ Order Confirmed! ${variables.orderNumber} — Abel's By Lincy`;

    console.log(`✉️ [BACKGROUND EMAIL SERVICE] Dispatching Order Confirmation Email to: ${customerEmail} (Order Ref: ${variables.orderNumber})`);

    try {
      return await sendEmail({
        to: customerEmail,
        subject: subject,
        templateName: 'order_confirmation',
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
