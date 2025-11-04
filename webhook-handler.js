// webhook-handler.js - Node.js server for handling Paystack webhooks
const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Paystack webhook secret (set this in your Paystack dashboard)
const PAYSTACK_SECRET = 'your_paystack_webhook_secret_here';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Replace with your email
    pass: 'your-app-password' // Use app password, not regular password
  }
});

// Verify Paystack webhook signature
function verifyWebhook(req) {
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  return hash === req.headers['x-paystack-signature'];
}

app.post('/paystack-webhook', (req, res) => {
  if (!verifyWebhook(req)) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const paymentData = event.data;
    const customerEmail = paymentData.customer.email;
    const amount = paymentData.amount / 100; // Convert from kobo to KES
    const customerName = paymentData.metadata.customer_name;
    const service = paymentData.metadata.service;

    // Send data to Zapier webhook
    fetch('https://hooks.zapier.com/hooks/catch/25228794/us6e7z5/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: customerName,
        customerEmail: customerEmail,
        service: service,
        amount: amount,
        reference: paymentData.reference,
        event: 'booking_payment_success'
      })
    })
    .then(response => {
      if (response.ok) {
        console.log('Data sent to Zapier successfully');
      } else {
        console.log('Failed to send data to Zapier');
      }
    })
    .catch(error => {
      console.log('Error sending to Zapier:', error);
    });

    // Send confirmation email to customer
    const customerMailOptions = {
      from: 'your-email@gmail.com',
      to: customerEmail,
      subject: 'Booking Confirmation - Virtech Group',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00BFFF;">Booking Confirmation</h2>
          <p>Hi ${customerName},</p>
          <p>Thank you for your booking! We've received your payment of Ksh ${amount}.</p>
          <p>We'll get back to you shortly.</p>
          <br>
          <p>– Virtech Group</p>
        </div>
      `
    };

    // Send notification email to you
    const ownerMailOptions = {
      from: 'your-email@gmail.com',
      to: 'ryanlagat752@gmail.com', // Your email
      subject: 'New Booking Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00BFFF;">New Booking Alert</h2>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Amount Paid:</strong> Ksh ${amount}</p>
          <p><strong>Reference:</strong> ${paymentData.reference}</p>
        </div>
      `
    };

    transporter.sendMail(customerMailOptions, (error, info) => {
      if (error) {
        console.log('Error sending customer email:', error);
      } else {
        console.log('Customer confirmation email sent:', info.response);
      }
    });

    transporter.sendMail(ownerMailOptions, (error, info) => {
      if (error) {
        console.log('Error sending owner email:', error);
      } else {
        console.log('Owner notification email sent:', info.response);
      }
    });
  }

  res.status(200).send('Webhook received');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
