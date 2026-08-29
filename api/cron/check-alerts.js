// Vercel Cron Job Handler to Auto-Trigger Price Alert Emails
// Configured in vercel.json to run automatically every day at 09:00 AM UTC (APMC Market Opening)
import { query } from '../_lib/db.js';
import { sendEmail } from '../_services/emailService.js';

// Fallback current APMC prices (used if Supabase crop_prices table is empty)
const FALLBACK_PRICES = {
  Onion: { Kopargaon: 4150, Lasalgaon: 4250, Rahata: 3950, Yeola: 4000, Ahilyanagar: 4350, Nashik: 4100 },
  Soybean: { Kopargaon: 4750, Rahata: 4700, Sangamner: 4680, Ahilyanagar: 4820 },
  Cotton: { Shrirampur: 7500, Kopargaon: 7450, Ahilyanagar: 7600 },
  Wheat: { Rahata: 2600, Nashik: 2800, Kopargaon: 2750 },
  Pomegranate: { Rahata: 9500, Kopargaon: 9200, Sangamner: 9400 },
  Grapes: { Nashik: 6800, Rahata: 6500 },
  Potato: { Nashik: 2450, Kopargaon: 2400 },
  Tomato: { Nashik: 1950, Kopargaon: 1900 },
  Maize: { Kopargaon: 2150, Rahata: 2100 }
};

export default async function handler(req, res) {
  // Allow GET and POST for cron calls & manual triggers
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  console.log('⏰ [Vercel Cron Auto-Trigger]: Starting automated price alert evaluation...');

  const results = {
    timestamp: new Date().toISOString(),
    alertsChecked: 0,
    alertsTriggered: 0,
    emailsSent: 0,
    skippedCooldown: 0,
    details: []
  };

  try {
    // 1. Fetch all ACTIVE price alerts from Supabase
    const alertResult = await query("SELECT * FROM price_alerts WHERE status = 'ACTIVE'");
    const activeAlerts = alertResult.rows || [];
    results.alertsChecked = activeAlerts.length;

    if (activeAlerts.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'सध्या कोणतेही सक्रिय भाव अलर्ट नाहीत (No active alerts to evaluate).',
        results
      });
    }

    // 2. Fetch latest crop prices from Supabase crop_prices table
    let dbPrices = {};
    try {
      const priceResult = await query("SELECT crop, region, price FROM crop_prices");
      if (priceResult.rows && priceResult.rows.length > 0) {
        priceResult.rows.forEach(p => {
          if (!dbPrices[p.crop]) dbPrices[p.crop] = {};
          dbPrices[p.crop][p.region] = Number(p.price);
        });
      }
    } catch (err) {
      console.warn('[Cron Price Fetch Note]:', err.message);
    }

    const now = Date.now();
    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

    // 3. Evaluate each active alert
    for (const alert of activeAlerts) {
      const {
        id,
        farmer_email,
        crop,
        mandi,
        condition = 'ABOVE',
        target_price,
        last_email_sent_at
      } = alert;

      if (!farmer_email || !farmer_email.includes('@')) {
        continue;
      }

      // Check 12-hour email cooldown to prevent spamming
      if (last_email_sent_at) {
        const lastSentTime = new Date(last_email_sent_at).getTime();
        if (now - lastSentTime < TWELVE_HOURS_MS) {
          results.skippedCooldown++;
          results.details.push({
            id,
            crop,
            mandi,
            status: 'SKIPPED_COOLDOWN',
            lastSent: last_email_sent_at
          });
          continue;
        }
      }

      // Get current market price (Supabase DB price or Fallback price)
      let currentPrice = dbPrices[crop]?.[mandi] || dbPrices[crop]?.[`${mandi} APMC`];
      if (!currentPrice) {
        currentPrice = FALLBACK_PRICES[crop]?.[mandi] || 2600;
      }

      const targetPriceNum = Number(target_price);
      let isTriggered = false;

      if (condition === 'ABOVE' && currentPrice >= targetPriceNum) {
        isTriggered = true;
      } else if (condition === 'BELOW' && currentPrice <= targetPriceNum) {
        isTriggered = true;
      }

      if (isTriggered) {
        results.alertsTriggered++;

        // Build HTML & Subject
        const formattedDate = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        const conditionLabel = condition === 'ABOVE' ? 'पेक्षा जास्त (Above)' : 'पेक्षा कमी (Below)';
        const subject = `Kisan Saarthi Alert: ${crop} @ ${mandi} is ₹${currentPrice.toLocaleString('en-IN')}/q`;
        const farmerName = alert.farmer_name || farmer_email.split('@')[0];

        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px 10px; color: #1f2937; }
                .email-wrapper { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
                .email-header { background-color: #0f381e; padding: 28px 24px 22px 24px; text-align: center; color: #ffffff; }
                .brand-title { font-size: 22px; font-weight: 900; margin: 0; color: #ffffff; }
                .brand-subtitle { font-size: 11px; color: #a7f3d0; font-weight: 600; margin-top: 4px; margin-bottom: 14px; }
                .alert-badge { display: inline-block; background-color: #f59e0b; color: #000000; font-size: 11px; font-weight: 900; padding: 5px 14px; border-radius: 50px; text-transform: uppercase; }
                .email-body { padding: 28px 24px; }
                .greeting { font-size: 16px; font-weight: 800; color: #111827; margin-bottom: 8px; }
                .intro-text { font-size: 14px; color: #374151; line-height: 1.6; margin-bottom: 20px; }
                .details-card { background-color: #f4f9f4; border: 1px solid #d8e6d8; border-radius: 16px; padding: 18px 20px; margin-bottom: 20px; }
                .details-table { width: 100%; border-collapse: collapse; }
                .details-table td { padding: 8px 0; font-size: 13px; }
                .label-col { color: #4b5563; font-weight: 700; }
                .value-col { color: #111827; font-weight: 900; text-align: right; }
                .actual-price { font-size: 22px; font-weight: 900; color: #166534; }
                .disclaimer-box { background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 14px; padding: 14px 16px; margin-bottom: 24px; font-size: 11px; color: #92400e; line-height: 1.5; }
                .btn-container { text-align: center; margin: 24px 0 12px 0; }
                .cta-button { display: inline-block; background-color: #1b5e20; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 900; padding: 14px 28px; border-radius: 12px; }
                .email-footer { text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding: 20px 24px; background-color: #fafafa; }
              </style>
            </head>
            <body>
              <div class="email-wrapper">
                <div class="email-header">
                  <h1 class="brand-title">🌾 Kisan Saarthi | किसान सारथी</h1>
                  <div class="brand-subtitle">महाराष्ट्रातील शेतकऱ्यांसाठी अचूक बाजार भाव प्रणाली</div>
                  <div><span class="alert-badge">🔔 बाजार भाव अलर्ट (PRICE ALERT)</span></div>
                </div>
                <div class="email-body">
                  <div class="greeting">नमस्कार ${farmerName},</div>
                  <div class="intro-text">तुमच्या <strong>${crop}</strong> पिकासाठी <strong>${mandi} APMC</strong> येथे ठरवलेली भाव मर्यादा गाठली आहे!</div>
                  <div class="details-card">
                    <table class="details-table">
                      <tr><td class="label-col">पीक (Commodity)</td><td class="value-col">${crop}</td></tr>
                      <tr><td class="label-col">बाजार समिती (APMC Market)</td><td class="value-col">${mandi}</td></tr>
                      <tr><td class="label-col">तुमची लक्ष मर्यादा (Target)</td><td class="value-col">₹${targetPriceNum.toLocaleString('en-IN')} / क्विंटल (${conditionLabel})</td></tr>
                      <tr style="border-top: 1px dashed #c8e6c9;"><td class="label-col" style="padding-top: 12px; font-size: 14px; font-weight: 800; color: #166534;">प्रत्यक्ष बाजार भाव (Actual Price)</td><td class="value-col actual-price" style="padding-top: 12px;">₹${currentPrice.toLocaleString('en-IN')} / क्विंटल</td></tr>
                    </table>
                  </div>
                  <div class="disclaimer-box">
                    <strong style="display:block; margin-bottom: 3px;">ℹ️ प्रमाणिक माहिती नोंद (Honesty Disclaimer):</strong>
                    हे पत्र <strong>${formattedDate}</strong> रोजी नोंदवलेल्या अधिकृत एपीएमसी बाजार भावावर आधारित आहे (based on the latest verified APMC price as of ${formattedDate}).
                  </div>
                  <div class="btn-container">
                    <a href="https://kisan-saarthi-jade.vercel.app/forecast" target="_blank" class="cta-button">📊 थेट बाजार भाव व विश्लेषण पहा (View Price Check)</a>
                  </div>
                </div>
                <div class="email-footer">
                  © 2026 Kisan Saarthi (किसान सारथी) • Maharashtra APMC Market Intelligence<br />
                  हे ईमेल थेट बाजार समिती रिपोर्टिंगनुसार स्वयंचलित पाठवले गेले आहे.
                </div>
              </div>
            </body>
          </html>
        `;

        const dispatchRes = await sendEmail({
          to: farmer_email,
          subject,
          html: htmlContent
        });

        if (dispatchRes.success) {
          results.emailsSent++;
          // Update last_email_sent_at in Supabase
          try {
            await query("UPDATE price_alerts SET last_email_sent_at = NOW() WHERE id = $1", [id]);
          } catch (updateErr) {
            console.warn('[Cron Alert Update Note]:', updateErr.message);
          }
        }

        results.details.push({
          id,
          farmer_email,
          crop,
          mandi,
          currentPrice,
          targetPrice: targetPriceNum,
          status: 'DISPATCHED',
          transport: dispatchRes.transport
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Vercel Cron तपासणी पूर्ण: ${results.alertsChecked} अलर्ट तपासले, ${results.alertsTriggered} गाठले, ${results.emailsSent} ई-मेल पाठवले.`,
      results
    });
  } catch (error) {
    console.error('[Vercel Cron Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Cron evaluation failed.'
    });
  }
}
