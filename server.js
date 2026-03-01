const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const path = require('path');
require('dotenv').config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage for bookings (can be replaced with database)
let bookings = [];

// Email templates
const sendConfirmationEmail = async (booking) => {
  try {
    const data = await resend.emails.send({
      from: 'Virtech <onboarding@resend.dev>',
      to: booking.email,
      subject: 'Booking Confirmation - Virtech Group',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1E1E2F; color: #EDEDED; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #2A2A3D; border-radius: 12px; padding: 30px; }
            h1 { color: #FF6F3C; }
            .details { background: #272738; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #3A3A50; }
            .detail-label { color: #8888A0; }
            .detail-value { color: #EDEDED; font-weight: 600; }
            .footer { text-align: center; margin-top: 20px; color: #8888A0; font-size: 14px; }
            .highlight { color: #FF6F3C; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Booking Confirmed!</h1>
            <p>Dear <span class="highlight">${booking.name}</span>,</p>
            <p>Thank you for booking with Virtech Group. Your appointment has been confirmed.</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${booking.service}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${booking.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${booking.time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value highlight">KES ${booking.amount || '500'}</span>
              </div>
            </div>
            
            <p>We look forward to working with you!</p>
            
            <div class="footer">
              <p>© 2025 Virtech Group. All rights reserved.</p>
              <p>Built with passion and precision.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    console.log('Confirmation email sent:', data);
    return data;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return null;
  }
};

const sendAdminNotification = async (booking) => {
  try {
    const data = await resend.emails.send({
      from: 'Virtech <onboarding@resend.dev>',
      to: 'ryanlagat752@gmail.com',
      subject: '🔔 New Booking Received - ' + booking.service,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1E1E2F; color: #EDEDED; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #2A2A3D; border-radius: 12px; padding: 30px; }
            h1 { color: #FF6F3C; }
            .alert { background: #FF6F3C; color: #1E1E2F; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-weight: bold; }
            .details { background: #272738; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #3A3A50; }
            .detail-label { color: #8888A0; }
            .detail-value { color: #EDEDED; font-weight: 600; }
            .footer { text-align: center; margin-top: 20px; color: #8888A0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔔 New Booking Notification</h1>
            <div class="alert">A new booking has been received!</div>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Client Name:</span>
                <span class="detail-value">${booking.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${booking.email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${booking.phone}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${booking.service}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${booking.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${booking.time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">KES ${booking.amount || '500'}</span>
              </div>
              ${booking.message ? `
              <div class="detail-row">
                <span class="detail-label">Message:</span>
                <span class="detail-value">${booking.message}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>From: Virtech Booking System</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    console.log('Admin notification sent:', data);
    return data;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return null;
  }
};

// Booking webhook endpoint
app.post('/api/webhook/booking', async (req, res) => {
  try {
    const booking = req.body;
    
    // Validate required fields
    if (!booking.name || !booking.email || !booking.service) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Add timestamp
    booking.createdAt = new Date().toISOString();
    booking.id = 'BK' + Date.now();
    
    // Store booking
    bookings.push(booking);
    
    // Send confirmation email to customer
    await sendConfirmationEmail(booking);
    
    // Send notification to admin
    await sendAdminNotification(booking);
    
    res.status(200).json({ 
      success: true, 
      message: 'Booking processed successfully',
      bookingId: booking.id
    });
  } catch (error) {
    console.error('Error processing booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing booking' 
    });
  }
});

// Payment webhook endpoint
app.post('/api/webhook/payment', async (req, res) => {
  try {
    const payment = req.body;
    
    // Validate required fields
    if (!payment.email || !payment.amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Add timestamp
    payment.createdAt = new Date().toISOString();
    payment.id = 'PAY' + Date.now();
    payment.type = 'payment';
    
    // Store payment
    bookings.push(payment);
    
    // Send confirmation email
    await resend.emails.send({
      from: 'Virtech <onboarding@resend.dev>',
      to: payment.email,
      subject: 'Payment Received - Virtech Group',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1E1E2F; color: #EDEDED; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #2A2A3D; border-radius: 12px; padding: 30px; text-align: center; }
            h1 { color: #FF6F3C; }
            .amount { font-size: 36px; color: #FF6F3C; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Payment Received!</h1>
            <p>Thank you for your payment.</p>
            <div class="amount">KES ${payment.amount}</div>
            <p>Your transaction was successful.</p>
          </div>
        </body>
        </html>
      `
    });
    
    // Send admin notification
    await resend.emails.send({
      from: 'Virtech <onboarding@resend.dev>',
      to: 'ryanlagat752@gmail.com',
      subject: '💰 Payment Received - KES ' + payment.amount,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1E1E2F; color: #EDEDED; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #2A2A3D; border-radius: 12px; padding: 30px; }
            h1 { color: #FF6F3C; }
            .amount { font-size: 36px; color: #FF6F3C; margin: 20px 0; }
            .details { background: #272738; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>💰 Payment Received!</h1>
            <div class="amount">KES ${payment.amount}</div>
            <div class="details">
              <p><strong>Email:</strong> ${payment.email}</p>
              <p><strong>Reference:</strong> ${payment.reference || 'N/A'}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    res.status(200).json({ 
      success: true, 
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing payment' 
    });
  }
});

// Admin endpoint to get all bookings
app.get('/api/admin/bookings', (req, res) => {
  res.status(200).json({
    success: true,
    count: bookings.length,
    bookings: bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  });
});

// Admin endpoint to get single booking
app.get('/api/admin/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ 
      success: false, 
      message: 'Booking not found' 
    });
  }
  res.status(200).json({ success: true, booking });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook endpoints:`);
  console.log(`  - POST /api/webhook/booking`);
  console.log(`  - POST /api/webhook/payment`);
  console.log(`  - GET /api/admin/bookings`);
});

module.exports = app;
