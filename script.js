// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800, // Slightly faster
    once: true,
    offset: 80 // Trigger a bit earlier
});

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const darkModeToggleBtn = document.getElementById('darkModeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const contactForm = document.getElementById('contactForm'); // Use ID for form
    const currentYearSpan = document.getElementById('currentYear');

    // Set current year in footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Navbar scroll behavior
    const handleScroll = () => {
        // Add/remove background color based on scroll position
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link based on scroll position
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Adjust for navbar height if it's fixed and opaque, otherwise use a smaller offset
            const offset = navbar.offsetHeight > 0 ? navbar.offsetHeight + 40 : 100; 
            if (scrollY >= sectionTop - offset) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSectionId) {
                link.classList.add('active');
            }
        });

        // Scroll to top button visibility
        if (scrollToTopBtn) {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call to set active link and navbar state

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Calculate scroll position considering navbar height if fixed
                let headerOffset = 0;
                if (navbar && getComputedStyle(navbar).position === 'fixed') {
                     headerOffset = navbar.offsetHeight;
                }
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;


                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
            // Close mobile menu if open
            const navbarCollapse = document.getElementById('navbarNav');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                new bootstrap.Collapse(navbarCollapse).hide();
            }
        });
    });

    // Typing animation for the home section
    const typedTextElement = document.querySelector('.typed-text');
    if (typedTextElement) {
        new Typed('.typed-text', {
            strings: ['an AI/ML Engineer', 'a Data Scientist'],
            typeSpeed: 70, // Adjusted speed
            backSpeed: 40, // Adjusted speed
            backDelay: 1800,
            loop: true,
            smartBackspace: true // Recommended for better backspacing
        });
    }


    // Scroll to top button functionality
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Dark mode toggle
    const setDarkTheme = (isDark) => {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            darkModeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            darkModeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    };

    if (darkModeToggleBtn) {
        // Check for saved dark mode preference or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
            setDarkTheme(true);
        } else {
            setDarkTheme(false); // Explicitly set light if no dark preference
        }

        darkModeToggleBtn.addEventListener('click', () => {
            const isCurrentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
            setDarkTheme(!isCurrentlyDark);
        });

        // Listen for changes in system preference
        prefersDarkScheme.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) { // Only if no user preference is set
                 setDarkTheme(e.matches);
            }
        });
    }


    // Form submission handling with Web3Forms
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalButtonHtml = submitBtn.innerHTML; // Save original button content

            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            const object = {};
            formData.forEach((value, key) => {
                object[key] = value;
            });
            const json = JSON.stringify(object);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });
                
                const result = await response.json();

                if (result.success) {
                    showNotification('Message sent successfully! I will get back to you soon.', 'success');
                    contactForm.reset();
                } else {
                    console.error("Web3Forms Error:", result);
                    showNotification(result.message || 'Failed to send message. Please try again.', 'error');
                }
            } catch (error) {
                console.error("Form Submission Error:", error);
                showNotification('An error occurred. Failed to send message.', 'error');
            } finally {
                // Reset submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalButtonHtml;
            }
        });
    }

    // Notification system
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10); // Faster trigger
        
        // Remove notification after a bit longer
        setTimeout(() => {
            notification.classList.remove('show');
            // Wait for fade out transition to complete before removing
            notification.addEventListener('transitionend', () => notification.remove());
        }, 4000); // Display for 4 seconds
    }

    // Add loading animation for project images
    const projectImages = document.querySelectorAll('.project-image img');
    projectImages.forEach(img => {
        if (img.complete) { // If image is already loaded (e.g. from cache)
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
        }
    });

    // Tooltips (Bootstrap 5 Tooltips)
    // Ensure skill items have data-bs-toggle="tooltip" and data-bs-title="Your tooltip"
    // Example: <div class="skill-item" data-bs-toggle="tooltip" data-bs-title="HTML5">
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger : 'hover' // Show on hover
      });
    });
    
    // If you prefer the custom tooltip from your original script for skill items:
    /*
    const skillItems = document.querySelectorAll('.skill-item[data-tooltip]');
    skillItems.forEach(item => {
        let tooltipEl = null;
        item.addEventListener('mouseenter', (e) => {
            const tooltipText = item.getAttribute('data-tooltip');
            if (!tooltipText) return;

            tooltipEl = document.createElement('div');
            tooltipEl.className = 'custom-tooltip'; // Style .custom-tooltip in CSS
            tooltipEl.textContent = tooltipText;
            document.body.appendChild(tooltipEl);

            const rect = item.getBoundingClientRect();
            tooltipEl.style.left = `${rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2)}px`;
            tooltipEl.style.top = `${rect.top - tooltipEl.offsetHeight - 5}px`; // 5px offset
            
            setTimeout(() => tooltipEl.classList.add('show'), 10);
        });
        
        item.addEventListener('mouseleave', () => {
            if (tooltipEl) {
                tooltipEl.classList.remove('show');
                tooltipEl.addEventListener('transitionend', () => tooltipEl.remove());
            }
        });
    });
    */
    // Add CSS for .custom-tooltip and .custom-tooltip.show if using this.

    // Experience cards mouse move effect (if you had one, re-add here)
    // Your original script had a mousemove effect for .experience-card. If desired:
    const experienceCards = document.querySelectorAll('.experience-card');
    experienceCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            // Add a class to activate gradient effect, style in CSS:
            // .experience-card.mouse-active::before { background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), ...); }
        });
        // card.addEventListener('mouseleave', () => { /* remove active class */ });
    });

}); // End DOMContentLoaded
