// Helper script to test SMTP email dispatch
import { sendEmail } from '../api/_services/emailService.js';

async function testSmtp() {
  console.log('--- Testing Kisan Saarthi SMTP Email System ---');

  const testRecipient = process.argv[2] || 'test@gmail.com';

  const result = await sendEmail({
    to: testRecipient,
    subject: '🌾 किसान सारथी - SMTP टेस्ट ई-मेल (Price Alert System Ready)',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #1b5e20; border-radius: 16px; max-width: 500px;">
        <h2 style="color: #1b5e20;">🌾 किसान सारथी (Kisan Saarthi)</h2>
        <p><strong>रामराम!</strong> तुमचा SMTP ई-मेल अलर्ट सिस्टीम यशस्वीरित्या जोडला गेला आहे.</p>
        <p>Your SMTP email dispatch system is connected and working!</p>
      </div>
    `
  });

  console.log('Result:', result);
}

testSmtp();
