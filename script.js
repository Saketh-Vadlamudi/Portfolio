document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('mainNav');
    const navbarCollapse = document.getElementById('navbarNav');
    const navLinks = [...document.querySelectorAll('.nav-link[href^="#"]')];
    const themeToggle = document.getElementById('darkModeToggle');
    const scrollToTopButton = document.getElementById('scrollToTopBtn');
    const scrollProgress = document.getElementById('scrollProgress');
    const year = document.getElementById('currentYear');
    const colorPreference = window.matchMedia('(prefers-color-scheme: dark)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    const updateThemeButton = () => {
        if (!themeToggle) return;

        const isDark = document.documentElement.dataset.theme === 'dark';
        themeToggle.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}" aria-hidden="true"></i>`;
        themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
    };

    updateThemeButton();

    themeToggle?.addEventListener('click', () => {
        const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem('theme', nextTheme);
        updateThemeButton();
    });

    colorPreference.addEventListener('change', (event) => {
        if (localStorage.getItem('theme')) return;

        document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
        updateThemeButton();
    });

    const updateNavigation = () => {
        const hasScrolled = window.scrollY > 24;
        navbar?.classList.toggle('scrolled', hasScrolled);
        scrollToTopButton?.classList.toggle('visible', window.scrollY > 500);

        if (scrollProgress) {
            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;
            scrollProgress.style.transform = `scaleX(${progress})`;
        }

        const marker = window.scrollY + window.innerHeight * 0.35;
        let currentSection = '';

        document.querySelectorAll('main section[id]').forEach((section) => {
            if (section.offsetTop <= marker) {
                currentSection = section.id;
            }
        });

        navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${currentSection}`;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    window.addEventListener('scroll', updateNavigation, { passive: true });
    window.addEventListener('resize', updateNavigation);
    updateNavigation();

    navbarCollapse?.addEventListener('show.bs.collapse', () => navbar?.classList.add('menu-open'));
    navbarCollapse?.addEventListener('hidden.bs.collapse', () => navbar?.classList.remove('menu-open'));

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (!navbarCollapse?.classList.contains('show') || !window.bootstrap) return;

            window.bootstrap.Collapse.getOrCreateInstance(navbarCollapse).hide();
        });
    });

    scrollToTopButton?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const revealTargets = document.querySelectorAll([
        '.section-heading',
        '.about-visual',
        '.education-row > div',
        '.expertise-card',
        '.timeline-item',
        '.enterprise-card',
        '.subsection-heading',
        '.project-card',
        '.credential-layout > div'
    ].join(','));

    if ('IntersectionObserver' in window && !reducedMotion.matches) {
        revealTargets.forEach((element) => element.classList.add('reveal-item'));
        document.body.classList.add('reveal-enabled');

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

        revealTargets.forEach((element) => revealObserver.observe(element));
    }

    document.querySelectorAll('.enterprise-card').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
            const bounds = card.getBoundingClientRect();
            const pointerX = ((event.clientX - bounds.left) / bounds.width) * 100;
            const pointerY = ((event.clientY - bounds.top) / bounds.height) * 100;
            card.style.setProperty('--pointer-x', `${pointerX}%`);
            card.style.setProperty('--pointer-y', `${pointerY}%`);
        });
    });
});
