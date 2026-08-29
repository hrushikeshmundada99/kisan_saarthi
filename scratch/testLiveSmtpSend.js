import { sendEmail } from '../api/_services/emailService.js';

async function runTest() {
  console.log('--- Testing SMTP Dispatch Service ---');

  const res = await sendEmail({
    to: 'khushalchaudhari190506@gmail.com',
    subject: '🌾 किसान सारथी (Kisan Saarthi) - Live Price Alert Test',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #1b5e20; border-radius: 16px;">
        <h2 style="color: #1b5e20;">🌾 किसान सारथी (Kisan Saarthi)</h2>
        <p><strong>रामराम!</strong> तुमचा ई-मेल अलर्ट यशस्वीरित्या सेट झाला आहे.</p>
        <p>Your live SMTP email alert service is working!</p>
      </div>
    `
  });

  console.log('Result:', res);
}

runTest();
