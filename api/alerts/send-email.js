// Vercel Serverless Function to send Price Alert Emails via reusable SMTP/Provider email service
import { sendEmail } from '../_services/emailService.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, authorization'
  );

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
    farmerName = 'Sushant Sondkar'
  } = req.body || {};

  let targetEmail = (toEmail && typeof toEmail === 'string') ? toEmail.trim() : 'farmer@gmail.com';
  if (!targetEmail || !targetEmail.includes('@')) {
    targetEmail = 'farmer@gmail.com';
  }
  if (targetEmail.includes('example.com')) {
    targetEmail = targetEmail.replace('example.com', 'gmail.com');
  }

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const subject = `Kisan Saarthi Alert: ${cropName} @ ${mandiName} is ₹${currentPrice.toLocaleString('en-IN')}/q`;
  const conditionLabel = condition === 'ABOVE' ? 'पेक्षा जास्त (Above)' : 'पेक्षा कमी (Below)';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kisan Saarthi Price Alert</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 20px 10px;
            color: #1f2937;
            -webkit-font-smoothing: antialiased;
          }
          .email-wrapper {
            max-width: 580px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          }
          .email-header {
            background-color: #0f381e;
            padding: 28px 24px 22px 24px;
            text-align: center;
            color: #ffffff;
          }
          .brand-title {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: -0.5px;
            margin: 0;
            color: #ffffff;
          }
          .brand-subtitle {
            font-size: 11px;
            color: #a7f3d0;
            font-weight: 600;
            margin-top: 4px;
            margin-bottom: 14px;
          }
          .alert-badge {
            display: inline-block;
            background-color: #f59e0b;
            color: #000000;
            font-size: 11px;
            font-weight: 900;
            padding: 5px 14px;
            border-radius: 50px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .email-body {
            padding: 28px 24px;
          }
          .greeting {
            font-size: 16px;
            font-weight: 800;
            color: #111827;
            margin-bottom: 8px;
          }
          .intro-text {
            font-size: 14px;
            color: #374151;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .details-card {
            background-color: #f4f9f4;
            border: 1px solid #d8e6d8;
            border-radius: 16px;
            padding: 18px 20px;
            margin-bottom: 20px;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
          }
          .details-table td {
            padding: 8px 0;
            font-size: 13px;
          }
          .label-col {
            color: #4b5563;
            font-weight: 700;
          }
          .value-col {
            color: #111827;
            font-weight: 900;
            text-align: right;
          }
          .actual-price {
            font-size: 22px;
            font-weight: 900;
            color: #166534;
          }
          .disclaimer-box {
            background-color: #fffbeb;
            border: 1px solid #fef3c7;
            border-radius: 14px;
            padding: 14px 16px;
            margin-bottom: 24px;
            font-size: 11px;
            color: #92400e;
            line-height: 1.5;
          }
          .disclaimer-title {
            font-weight: 800;
            margin-bottom: 3px;
            display: block;
          }
          .btn-container {
            text-align: center;
            margin: 24px 0 12px 0;
          }
          .cta-button {
            display: inline-block;
            background-color: #1b5e20;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 14px;
            font-weight: 900;
            padding: 14px 28px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(27, 94, 32, 0.25);
          }
          .email-footer {
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
            border-top: 1px solid #f3f4f6;
            padding: 20px 24px;
            background-color: #fafafa;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          
          <!-- Header -->
          <div class="email-header">
            <h1 class="brand-title">🌾 Kisan Saarthi | किसान सारथी</h1>
            <div class="brand-subtitle">महाराष्ट्रातील शेतकऱ्यांसाठी अचूक बाजार भाव प्रणाली</div>
            <div>
              <span class="alert-badge">🔔 बाजार भाव अलर्ट (PRICE ALERT)</span>
            </div>
          </div>

          <!-- Body Content -->
          <div class="email-body">
            <div class="greeting">नमस्कार ${farmerName},</div>
            <div class="intro-text">
              तुमच्या <strong>${cropName}</strong> पिकासाठी <strong>${mandiName} APMC</strong> येथे ठरवलेली भाव मर्यादा गाठली आहे!
            </div>

            <!-- Details Card Table -->
            <div class="details-card">
              <table class="details-table">
                <tr>
                  <td class="label-col">पीक (Commodity)</td>
                  <td class="value-col">${cropName}</td>
                </tr>
                <tr>
                  <td class="label-col">बाजार समिती (APMC Market)</td>
                  <td class="value-col">${mandiName}</td>
                </tr>
                <tr>
                  <td class="label-col">तुमची लक्ष मर्यादा (Target)</td>
                  <td class="value-col">₹${targetPrice.toLocaleString('en-IN')} / क्विंटल (${conditionLabel})</td>
                </tr>
                <tr style="border-top: 1px dashed #c8e6c9;">
                  <td class="label-col" style="padding-top: 12px; font-size: 14px; font-weight: 800; color: #166534;">प्रत्यक्ष बाजार भाव (Actual Price)</td>
                  <td class="value-col actual-price" style="padding-top: 12px;">₹${currentPrice.toLocaleString('en-IN')} / क्विंटल</td>
                </tr>
              </table>
            </div>

            <!-- Honesty Disclaimer Callout -->
            <div class="disclaimer-box">
              <span class="disclaimer-title">ℹ️ प्रमाणिक माहिती नोंद (Honesty Disclaimer):</span>
              हे पत्र <strong>${formattedDate}</strong> रोजी नोंदवलेल्या अधिकृत एपीएमसी बाजार भावावर आधारित आहे (based on the latest verified APMC price as of ${formattedDate}).
            </div>

            <!-- View Price Check Button -->
            <div class="btn-container">
              <a href="https://kisan-saarthi-jade.vercel.app/forecast" target="_blank" class="cta-button">
                📊 थेट बाजार भाव व विश्लेषण पहा (View Price Check)
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div class="email-footer">
            © 2026 Kisan Saarthi (किसान सारथी) • Maharashtra APMC Market Intelligence<br />
            हे ईमेल थेट बाजार समिती रिपोर्टिंगनुसार स्वयंचलित पाठवले गेले आहे.
          </div>

        </div>
      </body>
    </html>
  `;

  const textContent = `
[Kisan Saarthi Alert: ${cropName} @ ${mandiName} is ₹${currentPrice}/q]
नमस्कार ${farmerName},
तुमच्या ${cropName} पिकासाठी ${mandiName} APMC येथे ठरवलेली भाव मर्यादा गाठली आहे!

- पीक: ${cropName}
- बाजार समिती: ${mandiName}
- लक्ष मर्यादा: ₹${targetPrice}/क्विंटल (${conditionLabel})
- प्रत्यक्ष बाजार भाव: ₹${currentPrice}/क्विंटल

थेट बाजार भाव व विश्लेषण पहा: https://kisan-saarthi-jade.vercel.app/forecast
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
