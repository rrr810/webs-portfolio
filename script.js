document.addEventListener('DOMContentLoaded', function() {
    // Animation on scroll functionality
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Add animation classes to elements
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => observer.observe(el));

    // Hamburger menu functionality
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Payment functionality
    const payButton = document.getElementById('payButton');
    const paypalButton = document.getElementById('paypalButton');
    const stripeButton = document.getElementById('stripeButton');

    payButton.addEventListener('click', payWithPaystack);
    paypalButton.addEventListener('click', () => alert('PayPal payment not implemented yet.'));
    stripeButton.addEventListener('click', () => alert('Stripe payment not implemented yet.'));

    function payWithPaystack() {
      const ref = 'TICKET_' + Date.now();

      const handler = PaystackPop.setup({
        key: 'pk_live_ae04fba4c6a70e8260b76ddc7d829f90d8be2b35',
        email: 'customer@example.com',
        amount: 50000,
        currency: 'KES',
        ref: ref,
        label: "Event Ticket Payment",
        callback: function(response) {
          alert(`Payment successful! Reference: ${response.reference}`);
        },
        onClose: function() {
          alert('Payment was not completed. You can try again.');
        }
      });

      handler.openIframe();
    }

    // Booking form functionality
    const bookingForm = document.getElementById('bookingForm');

    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Basic validation
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const service = document.getElementById('service').value;
      const date = document.getElementById('date').value;
      const time = document.getElementById('time').value;

      if (!name || !email || !phone || !service || !date || !time) {
        alert('Please fill in all required fields.');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Phone validation (basic)
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(phone)) {
        alert('Please enter a valid phone number.');
        return;
      }

      // Simulate form submission
      alert('Thank you for your booking request! Redirecting to payment...');

      // Reset form
      bookingForm.reset();

      // Redirect to payment (simulate with Paystack)
      setTimeout(() => {
        payWithPaystack();
      }, 50000);
    });
  });
