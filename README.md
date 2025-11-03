# Virtech Group Portfolio - Booking & Payment System

This portfolio website includes a booking and payment system using Paystack for secure payments and automated email confirmations.

## Features

- Service booking form with validation
- Paystack payment integration
- Automatic email confirmations
- Owner notifications

## Setup Instructions

### 1. Paystack Setup

1. Sign up at [Paystack](https://paystack.com)
2. Get your public key (starts with `pk_live_` or `pk_test_`)
3. Replace the key in `script.js`:
   ```javascript
   key: 'pk_live_ae04fba4c6a70e8260b76ddc7d829f90d8be2b35', // Replace with your key
   ```

### 2. Email Setup (Using Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: [Google App Passwords](https://support.google.com/accounts/answer/185833)
3. Update `webhook-handler.js`:
   ```javascript
   auth: {
     user: 'your-email@gmail.com', // Your Gmail
     pass: 'your-app-password' // App password, not regular password
   }
   ```

### 3. Webhook Setup

1. Deploy `webhook-handler.js` to a server (Heroku, Vercel, etc.)
2. Set the webhook URL in Paystack dashboard: `https://your-domain.com/paystack-webhook`
3. Copy the webhook secret and update `PAYSTACK_SECRET` in `webhook-handler.js`

### 4. No-Code Alternative (Zapier/Make)

If you prefer no-code:

1. **Zapier Setup:**
   - Create a Zap with Paystack trigger
   - Use "New Payment" trigger
   - Add Gmail action for customer email
   - Add another Gmail action for your notification

2. **Make.com Setup:**
   - Create a scenario with Paystack webhook trigger
   - Add email modules for sending confirmations

## HTML Code Snippet

The booking form is already integrated in `index.html`. Here's the key section:

```html
<section id="booking" class="booking animate-on-scroll">
    <div class="container">
        <h2>Book a Service</h2>
        <form id="bookingForm" class="booking-form">
            <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" required>
            </div>
            <div class="form-group">
                <label for="service">Service Type</label>
                <select id="service" name="service" required>
                    <option value="web-development">Full Stack Web Development</option>
                    <option value="mpesa-integration">M-Pesa Integration</option>
                    <option value="ai-chatbot">AI Chatbot Development</option>
                    <option value="ui-ux-design">UI/UX Design</option>
                    <option value="graphic-design">Graphic Design</option>
                    <option value="digital-marketing">Digital Marketing & Branding</option>
                </select>
            </div>
            <div class="form-group">
                <label for="date">Preferred Date</label>
                <input type="date" id="date" name="date" required>
            </div>
            <div class="form-group">
                <label for="time">Preferred Time</label>
                <input type="time" id="time" name="time" required>
            </div>
            <div class="form-group">
                <label for="message">Additional Message</label>
                <textarea id="message" name="message" rows="4"></textarea>
            </div>
            <button type="submit" class="submit-button">Book Appointment</button>
        </form>
    </div>
</section>
```

## JavaScript Integration

Include these scripts in your HTML:

```html
<script src="https://js.paystack.co/v1/inline.js"></script>
<script src="script.js"></script>
```

## Service Pricing

Current pricing in `script.js`:

- Web Development: KES 5,000
- M-Pesa Integration: KES 3,000
- AI Chatbot: KES 4,000
- Other services: KES 1,000

Update the amounts in the `payWithPaystackForBooking` function as needed.

## Testing

1. Fill out the booking form
2. Submit to trigger payment
3. Complete payment with test card details
4. Check for confirmation emails

## Deployment

1. Host the website on GitHub Pages, Netlify, or Vercel
2. Deploy the webhook handler to Heroku or similar
3. Update Paystack webhook URL
4. Test the complete flow

## Support

For issues with Paystack integration, check their [documentation](https://paystack.com/docs/).
For email issues, ensure your Gmail app password is correct.
