document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // PARTICLE ANIMATION SYSTEM
    // ============================================
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = document.getElementById('hero').offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle class
        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.color = `rgba(255, 111, 60, ${this.opacity})`; // Deep orange color
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Wrap around edges
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        // Create particles
        const particles = [];
        const particleCount = 80;

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Connect particles with lines
        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 111, 60, ${0.1 * (1 - distance / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            connectParticles();
            requestAnimationFrame(animate);
        }
        
        animate();
    }

    // ============================================
    // SCROLL ANIMATION OBSERVER
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Animate skill progress bars when skill section comes into view
                if (entry.target.classList.contains('skill-card')) {
                    animateSkillProgress(entry.target);
                }
            }
        });
    }, observerOptions);

    // Add animation classes to elements
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => observer.observe(el));

    // ============================================
    // SKILL PROGRESS BAR ANIMATION
    // ============================================
    function animateSkillProgress(skillCard) {
        const percentage = skillCard.getAttribute('data-percentage');
        const progressBar = skillCard.querySelector('.skill-progress-bar');
        
        if (progressBar && percentage) {
            // Add a small delay for each card
            setTimeout(() => {
                progressBar.style.width = percentage + '%';
                skillCard.classList.add('animated');
            }, 200);
        }
    }

    // ============================================
    // HAMBURGER MENU FUNCTIONALITY
    // ============================================
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

    // ============================================
    // SMOOTH SCROLL FOR NAV LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ============================================
    // PAYMENT FUNCTIONALITY (UNCHANGED)
    // ============================================
    const payButton = document.getElementById('payButton');
    const paypalButton = document.getElementById('paypalButton');
    const stripeButton = document.getElementById('stripeButton');

    if (payButton) {
        payButton.addEventListener('click', payWithPaystack);
    }
    if (paypalButton) {
        paypalButton.addEventListener('click', () => alert('PayPal payment not implemented yet.'));
    }
    if (stripeButton) {
        stripeButton.addEventListener('click', () => alert('Stripe payment not implemented yet.'));
    }

    function payWithPaystack() {
        const ref = 'DEMO_' + Date.now();

        const handler = PaystackPop.setup({
            key: 'pk_live_ae04fba4c6a70e8260b76ddc7d829f90d8be2b35',
            email: 'demo@example.com',
            amount: 2000,
            currency: 'KES',
            ref: ref,
            label: "Demo Payment",
            callback: function(response) {
                alert(`Demo payment successful! Reference: ${response.reference}`);
            },
            onClose: function() {
                alert('Demo payment was not completed. You can try again.');
            }
        });

        handler.openIframe();
    }

    // ============================================
    // BOOKING FORM FUNCTIONALITY (UNCHANGED)
    // ============================================
    const bookingForm = document.getElementById('bookingForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Basic validation
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const service = document.getElementById('service').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const message = document.getElementById('message').value.trim();

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

            // Set amount based on service (example amounts)
            let amount = 100; // Default 500 KES
            if (service === 'web-development') amount = 100;
            else if (service === 'mpesa-integration') amount = 100;
            else if (service === 'ai-chatbot') amount = 100;
            else if (service === 'ui-ux-design') amount = 100;
            else if (service === 'graphic-design') amount = 100;
            else if (service === 'digital-marketing') amount = 100;

            // Store booking data in localStorage for webhook access
            const bookingData = {
                name,
                email,
                phone,
                service,
                date,
                time,
                message,
                amount: amount / 100
            };
            localStorage.setItem('bookingData', JSON.stringify(bookingData));

            // Call booking webhook to send confirmation emails
            fetch('/api/webhook/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Booking webhook response:', data);
                if (data.success) {
                    console.log('Booking confirmed and email sent!');
                }
            })
            .catch(error => {
                console.error('Error calling booking webhook:', error);
            });

            // Redirect to payment page
            window.location.href = `payment.html?email=${encodeURIComponent(email)}&amount=${amount}&name=${encodeURIComponent(name)}&service=${encodeURIComponent(service)}`;
        });
    }

    function payWithPaystackForBooking(customerEmail, amount, customerName, service) {
        const ref = 'BOOKING_' + Date.now();

        const handler = PaystackPop.setup({
            key: 'pk_live_ae04fba4c6a70e8260b76ddc7d829f90d8be2b35',
            email: customerEmail,
            amount: amount,
            currency: 'KES',
            ref: ref,
            label: "Consultation Fee",
            metadata: {
                customer_name: customerName,
                service: service
            },
            callback: function(response) {
                alert(`Payment successful! Reference: ${response.reference}. You will receive a confirmation email shortly.`);
                if (bookingForm) {
                    bookingForm.reset();
                }
                localStorage.removeItem('bookingData');
            },
            onClose: function() {
                alert('Payment was not completed. You can try again.');
            }
        });

        handler.openIframe();
    }
});
