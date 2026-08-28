// Vercel Serverless Function to send Price Alert Emails via reusable SMTP/Provider email service
import { sendEmail } from '../services/emailService.js';
import { applyCors } from '../lib/cors.js';

export default async function handler(req, res) {
  // Set CORS headers
  // Allowlist only: this endpoint sends real email, so another site must not be
  // able to trigger it from a visitor's browser.
  applyCors(req, res, { methods: 'POST,OPTIONS' });

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Please use POST.'
    });
  }

  const {
    toEmail,
    cropName = 'Onion',
    mandiName = 'Kopargaon',
    currentPrice = 3950,
    targetPrice = 4000,
    condition = 'ABOVE',
    farmerName = 'शेतकरी दादा'
  } = req.body || {};

  let targetEmail = (toEmail && typeof toEmail === 'string') ? toEmail.trim() : 'farmer@gmail.com';
  if (!targetEmail || !targetEmail.includes('@')) {
    targetEmail = 'farmer@gmail.com';
  }
  if (targetEmail.includes('example.com')) {
    targetEmail = targetEmail.replace('example.com', 'gmail.com');
  }

  const subject = `Price Alert Triggered: ${cropName} at ${mandiName}`;
  const conditionTextMr = condition === 'ABOVE' ? 'वर गेला आहे' : 'खाली आला आहे';
  const conditionTextEn = condition === 'ABOVE' ? 'reached target above' : 'dropped below target';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7fbf7; margin: 0; padding: 20px; color: #0f291e; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 2px solid #1b5e20; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 2px solid #e8f5e9; padding-bottom: 16px; margin-bottom: 20px; }
          .logo { font-size: 22px; font-weight: 900; color: #1b5e20; }
          .badge { display: inline-block; background-color: #ffb300; color: #0f291e; padding: 6px 14px; border-radius: 20px; font-weight: 800; font-size: 13px; margin-bottom: 12px; }
          .price-card { background-color: #f4f9f4; border: 1px solid #d8e6d8; border-radius: 12px; padding: 16px; text-align: center; margin: 16px 0; }
          .price-val { font-size: 28px; font-weight: 900; color: #1b5e20; }
          .target-val { font-size: 16px; font-weight: 700; color: #d97706; margin-top: 4px; }
          .footer { text-align: center; font-size: 12px; color: #526058; margin-top: 24px; border-top: 1px solid #e8f5e9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌾 किसान सारथी (Kisan Saarthi)</div>
            <div style="font-size: 13px; color: #526058; font-weight: 700;">कोपरगाव कृषी बाजार बुद्धिमत्ता (APMC Intelligence)</div>
          </div>

          <div style="text-align: center;">
            <span class="badge">🔔 भाव अलर्ट संदेश (Price Alert)</span>
          </div>

          <p style="font-size: 15px; font-weight: 700;">रामराम ${farmerName}!</p>
          <p style="font-size: 14px; line-height: 1.6;">
            तुमचा ठरवलेला <strong>${cropName}</strong> पिकाचा भाव <strong>${mandiName}</strong> बाजार समितीत <strong>₹${currentPrice}</strong>/क्विंटल पोहोचला आहे (अट: ₹${targetPrice} च्या ${conditionTextMr}).
          </p>

          <div class="price-card">
            <div style="font-size: 12px; text-transform: uppercase; font-weight: 800; color: #526058;">आजचा चालू बाजार भाव</div>
            <div class="price-val">₹${currentPrice.toLocaleString('en-IN')} / क्विंटल</div>
            <div class="target-val">लक्ष्य भाव: ₹${targetPrice.toLocaleString('en-IN')} / क्विंटल</div>
          </div>

          <hr style="border: none; border-top: 1px solid #e8f5e9; margin: 20px 0;" />

          <p style="font-size: 13px; color: #526058; line-height: 1.5;">
            <strong>English Notification:</strong><br />
            Hello ${farmerName}! The current price of <strong>${cropName}</strong> at <strong>${mandiName}</strong> APMC mandi has ${conditionTextEn} <strong>₹${currentPrice}</strong>/quintal (Target: ₹${targetPrice}).
          </p>

          <div class="footer">
            किसान सारथी • महाराष्ट्रातील बळीराजासाठी समर्पित माहिती सेवेतून स्वयंचलित ई-मेल अलर्ट
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
[किसान सारथी - Price Alert]
रामराम ${farmerName}!
${cropName} पिकाचा भाव ${mandiName} बाजार समितीत ₹${currentPrice}/क्विंटल पोहोचला आहे.
लक्ष्य भाव: ₹${targetPrice}/क्विंटल (${conditionTextMr}).

English:
Price of ${cropName} at ${mandiName} APMC has reached ₹${currentPrice}/quintal (Target: ₹${targetPrice}).
  `.trim();

  try {
    const result = await sendEmail({
      to: targetEmail,
      subject,
      html: htmlContent,
      text: textContent
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to dispatch email.'
      });
    }

    return res.status(200).json({
      success: true,
      transport: result.transport,
      messageId: result.messageId,
      message: result.message || `Email alert sent to ${targetEmail}`
    });
  } catch (err) {
    console.error('[Send Email API Exception]:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Server error while sending email alert.'
    });
  }
}
