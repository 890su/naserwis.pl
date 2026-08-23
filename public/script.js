/**
 * NaSerwis.pl - Main JavaScript
 * Language switching, form handling, smooth scrolling
 */

(function () {
    'use strict';

    // ===================================
    // Language Switcher with Auto-Detection
    // ===================================
    const LANG_CONFIG = {
        pl: { code: 'PL', name: 'Polski', url: '/' },
        ru: { code: 'RU', name: 'Русский', url: '/ru/' },
        uk: { code: 'UA', name: 'Українська', url: '/uk/' },
        en: { code: 'EN', name: 'English', url: '/en/' },
    };

    const DEFAULT_LANG = 'pl';
    const SUPPORTED_LANGS = Object.keys(LANG_CONFIG);

    /**
     * Detect browser language
     */
    function detectBrowserLanguage() {
        // Get browser language (e.g., 'ru-RU', 'pl-PL', 'en-US')
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();

        // Return supported language or default
        return SUPPORTED_LANGS.includes(langCode) ? langCode : DEFAULT_LANG;
    }

    /**
     * Get current language from URL
     */
    function getCurrentLanguage() {
        const path = window.location.pathname;

        // Check for Russian first (more specific path)
        if (path === '/ru/' || path.startsWith('/ru/') || path === '/ru') {
            return 'ru';
        }

        // Check other languages (excluding default)
        for (const lang of SUPPORTED_LANGS) {
            if (lang === DEFAULT_LANG) continue;
            const langUrl = LANG_CONFIG[lang].url;
            if (path === langUrl || (langUrl !== '/' && path.startsWith(langUrl))) {
                return lang;
            }
        }

        // Default to Polish
        return DEFAULT_LANG;
    }

    /**
     * Get the equivalent URL for a different language (preserves current page)
     */
    function getPageUrlForLang(targetLang) {
        const path = window.location.pathname;
        const currentLang = getCurrentLanguage();

        // Extract page name from path — remove any language prefix
        let pageName = '';
        if (currentLang !== DEFAULT_LANG) {
            const prefix = LANG_CONFIG[currentLang].url;
            pageName = path.replace(new RegExp('^' + prefix.replace('/', '\\/')), '');
        } else {
            pageName = path.replace(/^\//, '');
        }
        // Remove trailing slash
        pageName = pageName.replace(/\/$/, '');

        if (targetLang === DEFAULT_LANG) {
            return pageName ? '/' + pageName : '/';
        } else {
            const targetUrl = LANG_CONFIG[targetLang].url;
            return pageName ? targetUrl + pageName : targetUrl;
        }
    }

    /**
     * Show non-intrusive language suggestion banner (instead of auto-redirect)
     */
    function showLanguageSuggestion() {
        const currentLang = getCurrentLanguage();
        const isFirstVisit = !localStorage.getItem('hasVisited');
        const dismissed = localStorage.getItem('langBannerDismissed');

        localStorage.setItem('hasVisited', 'true');

        if (!isFirstVisit || dismissed) return;

        const detectedLang = detectBrowserLanguage();
        if (detectedLang === currentLang || detectedLang === DEFAULT_LANG) return;

        const config = LANG_CONFIG[detectedLang];
        if (!config) return;

        const targetUrl = getPageUrlForLang(detectedLang);

        const bannerTexts = {
            pl: { question: 'Mówisz po polsku?', switchLabel: 'Przejdź na polski', close: 'Zamknij' },
            ru: { question: 'Вы говорите по-русски?', switchLabel: 'Переключить на русский', close: 'Закрыть' },
            uk: { question: 'Ви розмовляєте українською?', switchLabel: 'Перейти на українську', close: 'Закрити' },
            en: { question: 'Do you speak English?', switchLabel: 'Switch to English', close: 'Close' },
        };
        const bt = bannerTexts[detectedLang] || bannerTexts[DEFAULT_LANG];
        const closeLabel = (bannerTexts[currentLang] || bannerTexts[DEFAULT_LANG]).close;

        const banner = document.createElement('div');
        banner.id = 'lang-suggestion';
        banner.setAttribute('role', 'alert');
        banner.innerHTML =
            '<span>' + bt.question + '</span>' +
            '<a href="' + targetUrl + '" class="lang-banner-btn">' + bt.switchLabel + '</a>' +
            '<button class="lang-banner-close" aria-label="' + closeLabel + '">&times;</button>';

        document.body.prepend(banner);

        banner.querySelector('.lang-banner-close').addEventListener('click', function () {
            banner.remove();
            localStorage.setItem('langBannerDismissed', 'true');
        });

        banner.querySelector('.lang-banner-btn').addEventListener('click', function () {
            localStorage.setItem('preferredLanguage', detectedLang);
        });
    }

    /**
     * Initialize Dropdowns (Language & Services)
     */
    function initDropdowns() {
        // Select all dropdown containers
        const dropdowns = document.querySelectorAll('.lang-dropdown');

        dropdowns.forEach(dropdown => {
            const btn = dropdown.querySelector('.lang-current');
            const menu = dropdown.querySelector('.lang-menu');
            const options = dropdown.querySelectorAll('.lang-option');

            if (!btn || !menu) return;

            // Toggle function
            function toggleMenu() {
                const isOpen = menu.getAttribute('aria-hidden') === 'false';

                // Close all other open dropdowns first
                document.querySelectorAll('.lang-menu').forEach(m => {
                    if (m !== menu) {
                        m.setAttribute('aria-hidden', 'true');
                        m.previousElementSibling?.setAttribute('aria-expanded', 'false');
                    }
                });

                menu.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
                btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
            }

            function closeMenu() {
                menu.setAttribute('aria-hidden', 'true');
                btn.setAttribute('aria-expanded', 'false');
            }

            // Click on button
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMenu();
            });

            // Click handling for options
            options.forEach((option, index) => {
                // Language switcher <a> tags: save preference on click
                if (option.dataset.lang && option.tagName === 'A') {
                    option.addEventListener('click', () => {
                        localStorage.setItem('preferredLanguage', option.dataset.lang);
                    });
                }

                // Keyboard nav
                option.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        options[index + 1]?.focus();
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        if (index === 0) {
                            btn.focus();
                            closeMenu();
                        } else {
                            options[index - 1]?.focus();
                        }
                    } else if (e.key === 'Enter' || e.key === ' ') {
                        // Allow default action for links
                        if (!option.getAttribute('onclick')) {
                            e.preventDefault();
                            option.click();
                        }
                    }
                });
            });

            // Updates for Language Switcher specifics (Current Layout)
            // Only runs if this specific dropdown is the language one
            if (btn.id === 'lang-current') {
                const currentLang = getCurrentLanguage();
                const config = LANG_CONFIG[currentLang];
                const nameEl = btn.querySelector('.lang-name');
                if (nameEl) nameEl.textContent = config.code;

                options.forEach(opt => {
                    if (opt.dataset.lang) {
                        opt.classList.toggle('active', opt.dataset.lang === currentLang);
                    }
                });

                // Keyboard nav for language button
                btn.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowDown' || e.key === 'Enter') {
                        e.preventDefault();
                        toggleMenu();
                        if (menu.getAttribute('aria-hidden') === 'false') {
                            options[0]?.focus();
                        }
                    }
                });
            }
        });

        // Global close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.lang-dropdown')) {
                document.querySelectorAll('.lang-dropdown').forEach(d => {
                    d.querySelector('.lang-menu').setAttribute('aria-hidden', 'true');
                    d.querySelector('.lang-current').setAttribute('aria-expanded', 'false');
                });
            }
        });

        // Global Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.lang-dropdown').forEach(d => {
                    d.querySelector('.lang-menu').setAttribute('aria-hidden', 'true');
                    d.querySelector('.lang-current').setAttribute('aria-expanded', 'false');
                });
            }
        });
    }

    // ===================================
    // Smooth Scroll
    // ===================================
    function initSmoothScroll() {
        /**
         * Get dynamic header offset based on actual header height
         * Mobile First: smaller offset on mobile devices
         */
        function getHeaderOffset() {
            const header = document.getElementById('header');
            if (!header) return 80; // fallback

            const headerHeight = header.offsetHeight;
            // Mobile First: smaller offset on mobile (typically smaller header)
            const isMobile = window.innerWidth < 768;
            return isMobile ? headerHeight + 10 : headerHeight + 20;
        }

        /**
         * Close mobile menu if open
         */
        function closeMobileMenuIfOpen() {
            const toggle = document.getElementById('mobile-menu-toggle');
            const overlay = document.getElementById('mobile-menu-overlay');
            const headerEl = document.getElementById('header');

            if (toggle && overlay && overlay.classList.contains('active')) {
                toggle.classList.remove('active');
                overlay.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                if (headerEl) headerEl.style.zIndex = '';
            }
        }

        /**
         * Smooth scroll to target element
         */
        function scrollToTarget(href) {
            const target = document.querySelector(href);
            if (!target) return false;

            const headerOffset = getHeaderOffset();
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: Math.max(0, offsetPosition), // Ensure non-negative
                behavior: 'smooth'
            });

            return true;
        }

        // Event delegation for better performance and dynamic content support
        document.addEventListener('click', function (e) {
            const anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;

            const href = anchor.getAttribute('href');

            // Skip if href is just "#" or empty
            if (href === '#' || !href) {
                e.preventDefault();
                return;
            }

            // Check if target element exists
            const target = document.querySelector(href);
            if (!target) return; // Let browser handle invalid anchors

            e.preventDefault();

            // Close mobile menu if open
            closeMobileMenuIfOpen();

            // Small delay to ensure menu is closed before scrolling
            setTimeout(() => {
                scrollToTarget(href);
            }, 100);
        });
    }

    // ===================================
    // Header Scroll Effect
    // ===================================
    function initHeaderScroll() {
        const header = document.getElementById('header');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // ===================================
    // Form Submission Handler
    // ===================================
    function handleFormSubmit(formId, messageId) {
        const form = document.getElementById(formId);
        const messageDiv = document.getElementById(messageId);

        if (!form || !messageDiv) return;

        // Set custom validation messages based on page language
        const currentLang = document.documentElement.lang || 'pl';
        const validationMessages = {
            pl: {
                required: 'Proszę wypełnić to pole.',
                phone: 'Proszę wpisać numer telefonu.',
                name: 'Proszę wpisać imię.',
                message: 'Proszę opisać problem.'
            },
            ru: {
                required: 'Пожалуйста, заполните это поле.',
                phone: 'Пожалуйста, введите номер телефона.',
                name: 'Пожалуйста, введите имя.',
                message: 'Пожалуйста, опишите проблему.'
            },
            uk: {
                required: 'Будь ласка, заповніть це поле.',
                phone: 'Будь ласка, введіть номер телефону.',
                name: 'Будь ласка, введіть ім\'я.',
                message: 'Будь ласка, опишіть проблему.'
            },
            en: {
                required: 'Please fill in this field.',
                phone: 'Please enter your phone number.',
                name: 'Please enter your name.',
                message: 'Please describe the issue.'
            }
        };

        const msgs = validationMessages[currentLang] || validationMessages['pl'];

        // Apply custom validation messages to inputs
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('invalid', function (e) {
                e.preventDefault();
                if (this.validity.valueMissing) {
                    if (this.name === 'name') {
                        this.setCustomValidity(msgs.name);
                    } else if (this.name === 'phone') {
                        this.setCustomValidity(msgs.phone);
                    } else if (this.name === 'message') {
                        this.setCustomValidity(msgs.message);
                    } else {
                        this.setCustomValidity(msgs.required);
                    }
                }
            });

            // Clear custom message on input
            input.addEventListener('input', function () {
                this.setCustomValidity('');
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const submitButton = form.querySelector('button[type="submit"]');
            const currentLang = document.documentElement.lang || 'pl';

            // Prepare data for sending
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                message: formData.get('message'),
                website: formData.get('website'),
                turnstileToken: formData.get('cf-turnstile-response'),
                formType: formId,
                lang: currentLang  // Add current language
            };

            // Disable submit button and show loading state
            if (submitButton) {
                submitButton.disabled = true;
                const sendingText = { pl: 'Wysyłanie...', ru: 'Отправка...', uk: 'Надсилання...', en: 'Sending...' };
                submitButton.textContent = sendingText[currentLang] || sendingText.pl;
            }

            try {
                // Absolute path — works from any page/language
                const emailHandlerPath = '/api/contact';

                // Send data to PHP backend
                const response = await fetch(emailHandlerPath, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    // Show success message
                    messageDiv.className = 'success-message';
                    messageDiv.textContent = result.message;

                    pushMeasurementEvent('naserwis_lead_submit', {
                        form_id: formId,
                        form_type: formId,
                        language: currentLang,
                        service: getPageService(),
                        page_path: window.location.pathname
                    });
                    pushMeasurementEvent('generate_lead', {
                        form_id: formId,
                        language: currentLang,
                        service: getPageService()
                    });

                    // Reset form
                    form.reset();

                    // Clear message after delay
                    setTimeout(() => {
                        messageDiv.textContent = '';
                        messageDiv.className = '';
                    }, 5000);
                } else {
                    // Show error message
                    messageDiv.className = 'error-message';
                    messageDiv.textContent = result.message;
                }
            } catch (error) {
                // Network or other error
                console.error('Form submission error:', error);
                messageDiv.className = 'error-message';
                const errorText = { pl: 'Wystąpił błąd. Proszę zadzwonić: +48 453 327 678', ru: 'Произошла ошибка. Пожалуйста, позвоните: +48 453 327 678', uk: 'Виникла помилка. Будь ласка, зателефонуйте: +48 453 327 678', en: 'An error occurred. Please call: +48 453 327 678' };
                messageDiv.textContent = errorText[currentLang] || errorText.pl;
            } finally {
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    const submitText = { pl: 'Wyślij zapytanie', ru: 'Отправить запрос', uk: 'Надіслати запит', en: 'Send request' };
                    submitButton.textContent = submitText[currentLang] || submitText.pl;
                }
            }
        });
    }

    // ===================================
    // Scroll Animations
    // ===================================
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                    // Unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe animated elements
        document.querySelectorAll('.problem-card, .step, .package-card, .benefit').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    // ===================================
    // Page Load Performance
    // ===================================
    function logPerformance() {
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const timing = window.performance.timing;
                    const loadTime = timing.loadEventEnd - timing.navigationStart;
                    console.log(`Page load time: ${loadTime}ms`);
                }, 0);
            });
        }
    }

    // ===================================
    // Reviews Slider
    // ===================================
    function initReviewsSlider() {
        const track = document.querySelector('.reviews-track');
        const prevBtn = document.querySelector('.slider-btn.prev');
        const nextBtn = document.querySelector('.slider-btn.next');

        if (!track || !prevBtn || !nextBtn) return;

        let currentIndex = 0;
        const cards = track.querySelectorAll('.review-card');
        const totalCards = cards.length;

        function updateSlider() {
            const cardWidth = cards[0].offsetWidth;
            const gap = 30;
            track.scrollTo({
                left: currentIndex * (cardWidth + gap),
                behavior: 'smooth'
            });
        }

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            updateSlider();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalCards;
            updateSlider();
        });

        // Auto-play slider
        setInterval(() => {
            currentIndex = (currentIndex + 1) % totalCards;
            updateSlider();
        }, 5000);
    }

    // ===================================
    // Interactive Star Rating
    // ===================================
    function initInteractiveStars() {
        const starButtons = document.querySelectorAll('.star-btn');
        const modal = document.getElementById('review-modal');

        if (!starButtons.length || !modal) return;

        // URLs
        const googleReviewUrl = 'https://g.page/r/CQRLc1zoW4ZaEBM/review';

        // Hover effect - highlight stars on the left
        starButtons.forEach((button, index) => {
            button.addEventListener('mouseenter', () => {
                // Highlight this star and all stars to the left
                starButtons.forEach((btn, btnIndex) => {
                    if (btnIndex <= index) {
                        btn.classList.add('hovered');
                    } else {
                        btn.classList.remove('hovered');
                    }
                });
            });
        });

        // Remove hover effect when mouse leaves the stars container
        const starsContainer = document.querySelector('.interactive-stars');
        if (starsContainer) {
            starsContainer.addEventListener('mouseleave', () => {
                starButtons.forEach(btn => btn.classList.remove('hovered'));
            });
        }

        // Click handler
        starButtons.forEach(button => {
            button.addEventListener('click', () => {
                const rating = parseInt(button.dataset.rating);

                if (rating <= 3) {
                    // Low rating (1-3 stars) - open modal for private feedback
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';

                    // Pre-fill the rating in the modal
                    const modalStars = modal.querySelectorAll('.modal-star');
                    const ratingInput = document.getElementById('modal-rating');

                    if (ratingInput) {
                        ratingInput.value = rating;
                    }

                    // Update visual stars
                    modalStars.forEach((star, index) => {
                        if (index < rating) {
                            star.classList.add('filled');
                        } else {
                            star.classList.remove('filled');
                        }
                    });
                } else {
                    // High rating (4-5 stars) - redirect to Google Reviews
                    window.open(googleReviewUrl, '_blank');
                }
            });
        });
    }

    // ===================================
    // Review Modal
    // ===================================
    function initReviewModal() {
        const modal = document.getElementById('review-modal');
        const cancelBtn = document.querySelector('.btn-cancel');
        const overlay = document.querySelector('.modal-overlay');
        const form = document.getElementById('review-form');
        const textarea = document.getElementById('review-text');
        const submitBtn = document.querySelector('.btn-post');
        const messageDiv = document.getElementById('review-form-message');
        const photoInput = document.getElementById('review-photos');
        const photoPreview = document.getElementById('photo-preview');

        if (!modal) return;

        // Enable/disable Post button based on textarea content
        if (textarea && submitBtn) {
            textarea.addEventListener('input', () => {
                if (textarea.value.trim().length > 0) {
                    submitBtn.disabled = false;
                } else {
                    submitBtn.disabled = true;
                }
            });
        }

        // Close modal function
        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            if (form) form.reset();
            if (photoPreview) photoPreview.innerHTML = '';
            if (messageDiv) {
                messageDiv.textContent = '';
                messageDiv.className = '';
            }
            if (submitBtn) submitBtn.disabled = true;
        }

        // Close button handlers
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Interactive Modal Stars
        const modalStars = modal.querySelectorAll('.modal-star');
        const ratingInput = document.getElementById('modal-rating');

        if (modalStars.length > 0) {
            // Hover effect
            modalStars.forEach((star, index) => {
                star.addEventListener('mouseenter', () => {
                    // Fill this star and all previous stars
                    modalStars.forEach((s, i) => {
                        if (i <= index) {
                            s.classList.add('filled');
                        } else {
                            s.classList.remove('filled');
                        }
                    });
                });

                // Click to lock rating
                star.addEventListener('click', () => {
                    const newRating = index + 1;
                    if (ratingInput) {
                        ratingInput.value = newRating;
                    }

                    // Update visual stars
                    modalStars.forEach((s, i) => {
                        if (i <= index) {
                            s.classList.add('filled');
                        } else {
                            s.classList.remove('filled');
                        }
                    });
                });
            });

            // Reset to current rating when mouse leaves stars container
            const starsContainer = modal.querySelector('.modal-stars');
            if (starsContainer) {
                starsContainer.addEventListener('mouseleave', () => {
                    const currentRating = parseInt(ratingInput?.value || 1);
                    modalStars.forEach((s, i) => {
                        if (i < currentRating) {
                            s.classList.add('filled');
                        } else {
                            s.classList.remove('filled');
                        }
                    });
                });
            }
        }

        // Photo preview
        if (photoInput && photoPreview) {
            photoInput.addEventListener('change', (e) => {
                photoPreview.innerHTML = '';
                const files = Array.from(e.target.files);

                files.forEach(file => {
                    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            if (file.type.startsWith('image/')) {
                                const img = document.createElement('img');
                                img.src = e.target.result;
                                photoPreview.appendChild(img);
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                });
            });
        }

        // Form submission
        if (form && messageDiv) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(form);
                const rating = formData.get('rating') || '1';
                const review = formData.get('review');
                const currentLang = document.documentElement.lang || 'pl';
                const successText = messageDiv?.dataset?.successText;
                const okText = messageDiv?.dataset?.okText;

                // Prepare data for sending
                const clientNames = { pl: 'Klient', ru: 'Клиент', uk: 'Клієнт', en: 'Client' };
                const phoneNa = { pl: 'Nie podano', ru: 'Не указан', uk: 'Не вказано', en: 'Not provided' };
                const data = {
                    name: clientNames[currentLang] || clientNames.pl,
                    phone: phoneNa[currentLang] || phoneNa.pl,
                    message: review,
                    formType: 'review',
                    website: formData.get('website'),
                    turnstileToken: formData.get('cf-turnstile-response'),
                    rating: rating,
                    lang: currentLang  // Add current language
                };

                // Disable submit button
                if (submitBtn) {
                    submitBtn.disabled = true;
                    const sendingText = { pl: 'Wysyłanie...', ru: 'Отправка...', uk: 'Надсилання...', en: 'Sending...' };
                    submitBtn.textContent = sendingText[currentLang] || sendingText.pl;
                }

                try {
                    // Absolute path — works from any page/language
                    const emailHandlerPath = '/api/contact';

                    // Send data to PHP backend
                    const response = await fetch(emailHandlerPath, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();

                    if (result.success) {
                        // Show success message with OK button
                        messageDiv.className = 'success-message';
                        const defaultSuccessTexts = { pl: 'Twoja opinia została wysłana do moderacji.', ru: 'Ваш отзыв отправлен на модерацию.', uk: 'Ваш відгук надіслано на модерацію.', en: 'Your review has been sent for moderation.' };
                        const successMsg = successText || (defaultSuccessTexts[currentLang] || defaultSuccessTexts.pl);
                        const okLabel = okText || 'OK';
                        messageDiv.innerHTML = '<span class=\"success-text\">' + successMsg + '</span>' +
                            '<button type=\"button\" class=\"review-ok-btn\">' + okLabel + '</button>';

                        pushMeasurementEvent('naserwis_review_submit', {
                            language: currentLang,
                            page_path: window.location.pathname
                        });

                        const okBtn = messageDiv.querySelector('.review-ok-btn');
                        if (okBtn) okBtn.addEventListener('click', closeModal);
                    } else {
                        // Show error message
                        messageDiv.className = 'error-message';
                        messageDiv.textContent = result.message;

                        // Re-enable button
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            const publishText = { pl: 'Opublikuj', ru: 'Опубликовать', uk: 'Опублікувати', en: 'Publish' };
                            submitBtn.textContent = publishText[currentLang] || publishText.pl;
                        }
                    }
                } catch (error) {
                    // Network or other error
                    console.error('Review submission error:', error);
                    messageDiv.className = 'error-message';
                    const reviewErrorText = { pl: 'Wystąpił błąd podczas wysyłania opinii', ru: 'Произошла ошибка при отправке отзыва', uk: 'Виникла помилка під час надсилання відгуку', en: 'An error occurred while sending the review' };
                    messageDiv.textContent = reviewErrorText[currentLang] || reviewErrorText.pl;

                    // Re-enable button
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        const publishText = { pl: 'Opublikuj', ru: 'Опубликовать', uk: 'Опублікувати', en: 'Publish' };
                        submitBtn.textContent = publishText[currentLang] || publishText.pl;
                    }
                }
            });
        }
    }

    // ===================================
    // Mobile Menu (Burger)
    // ===================================
    function initMobileMenu() {
        var toggle = document.getElementById('mobile-menu-toggle');
        var overlay = document.getElementById('mobile-menu-overlay');
        var headerEl = document.getElementById('header');

        if (!toggle || !overlay) return;

        function openMenu() {
            toggle.classList.add('active');
            overlay.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            document.body.classList.add('menu-open');
            // Raise header z-index so burger button stays above overlay
            if (headerEl) headerEl.style.zIndex = '2100';
        }

        function closeMenu() {
            toggle.classList.remove('active');
            overlay.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            document.body.classList.remove('menu-open');
            if (headerEl) headerEl.style.zIndex = '';
        }

        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (toggle.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu when clicking a nav link
        var navLinks = overlay.querySelectorAll('.mobile-nav-link, .mobile-lang-btn, .mobile-call-btn');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                closeMenu();
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeMenu();
            }
        });

        // Close on background click
        document.addEventListener('click', function (e) {
            if (overlay.classList.contains('active') && !overlay.contains(e.target) && !toggle.contains(e.target)) {
                closeMenu();
            }
        });
    }

    // ===================================
    // Initialize Everything
    // ===================================
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAll);
        } else {
            initAll();
        }
    }

    // ========================
    // FAB Toggle Menu
    // ========================
    function initFabToggle() {
        const fabContainer = document.querySelector('.fab-container');
        const fabToggle = fabContainer?.querySelector('.fab-toggle');
        const fabChat = fabContainer?.querySelector('.fab-chat');
        if (!fabToggle) return;

        fabToggle.addEventListener('click', function () {
            fabContainer.classList.toggle('open');
            fabToggle.setAttribute('aria-expanded', fabContainer.classList.contains('open'));
        });

        // Chat button triggers Chatwoot
        if (fabChat) {
            fabChat.addEventListener('click', function () {
                if (window.$chatwoot) {
                    window.$chatwoot.toggle('open');
                } else if (window.NASERWIS_CONSENT) {
                    window.NASERWIS_CONSENT.requestSupport();
                } else {
                    // SDK not yet loaded — open when ready
                    window.addEventListener('chatwoot:ready', function () {
                        window.$chatwoot.toggle('open');
                    }, { once: true });
                }
                fabContainer.classList.remove('open');
                fabToggle.setAttribute('aria-expanded', 'false');
            });
        }

        // Close menu on outside click
        document.addEventListener('click', function (e) {
            if (!fabContainer.contains(e.target)) {
                fabContainer.classList.remove('open');
                fabToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }


    // Cloudflare Pages has no PHP sessions. This replaces the legacy CSRF
    // field with a honeypot and an optional, server-validated Turnstile token.
    function initBotProtection(form) {
        if (form.dataset.botProtectionReady) return;
        form.dataset.botProtectionReady = 'true';
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        honeypot.setAttribute('aria-hidden', 'true');
        honeypot.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
        form.appendChild(honeypot);

        const siteKey = window.NASERWIS_CONFIG?.turnstileSiteKey;
        if (!siteKey || !window.turnstile) return;
        const container = document.createElement('div');
        container.className = 'turnstile-container';
        const submit = form.querySelector('button[type="submit"]');
        form.insertBefore(container, submit);
        const widgetId = window.turnstile.render(container, { sitekey: siteKey, action: 'contact' });
        form.dataset.turnstileWidget = String(widgetId);
    }

    function initAllBotProtection() {
        const forms = document.querySelectorAll('form');
        const siteKey = window.NASERWIS_CONFIG?.turnstileSiteKey;
        if (!siteKey) {
            forms.forEach(initBotProtection);
            return;
        }
        if (window.turnstile) {
            forms.forEach(initBotProtection);
            return;
        }
        if (document.querySelector('script[data-turnstile-loader]')) return;
        const loader = document.createElement('script');
        loader.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        loader.async = true;
        loader.defer = true;
        loader.dataset.turnstileLoader = 'true';
        loader.onload = () => forms.forEach(initBotProtection);
        document.head.appendChild(loader);
    }

    function getPageService() {
        const path = window.location.pathname;
        if (path.includes('naprawa-wifi')) return 'wifi_repair';
        if (path.includes('montaz-sieci')) return 'lan_install';
        if (path.includes('naprawa-sieci')) return 'lan_cctv_repair';
        return 'it_general';
    }

    function pushMeasurementEvent(eventName, parameters) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(Object.assign({ event: eventName }, parameters || {}));
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, parameters || {});
        }
    }

    function initContactTracking() {
        document.addEventListener('click', function (event) {
            const link = event.target.closest('a[href]');
            if (!link) return;
            const href = link.getAttribute('href') || '';
            let method = '';
            if (href.startsWith('tel:')) method = 'phone';
            else if (href.includes('wa.me/')) method = 'whatsapp';
            else if (href.includes('t.me/')) method = 'telegram';
            if (!method) return;

            pushMeasurementEvent('naserwis_contact_click', {
                contact_method: method,
                language: document.documentElement.lang || 'pl',
                service: getPageService(),
                page_path: window.location.pathname
            });
        });
    }

    function initPrivacyNotices() {
        const language = document.documentElement.lang || 'pl';
        const prefix = language === 'pl' ? '' : '/' + language;
        const privacyUrl = prefix + '/privacy';
        const notices = {
            pl: 'Dane służą do odpowiedzi na zapytanie. Administrator: Ihar Shestsiuk. <a href="' + privacyUrl + '">Prywatność</a>.',
            ru: 'Данные нужны для ответа на запрос. Администратор: Ihar Shestsiuk. <a href="' + privacyUrl + '">Конфиденциальность</a>.',
            uk: 'Дані потрібні для відповіді на запит. Адміністратор: Ihar Shestsiuk. <a href="' + privacyUrl + '">Конфіденційність</a>.',
            en: 'We use the data to answer your enquiry. Controller: Ihar Shestsiuk. <a href="' + privacyUrl + '">Privacy</a>.'
        };
        const reviewConsent = {
            pl: 'Wyrażam zgodę na moderację i publikację treści opinii w serwisie NaSerwis.pl. Zgodę mogę wycofać, kontaktując się z administratorem.',
            ru: 'Я соглашаюсь на модерацию и публикацию текста отзыва на NaSerwis.pl. Согласие можно отозвать, связавшись с администратором.',
            uk: 'Я погоджуюся на модерацію та публікацію тексту відгуку на NaSerwis.pl. Згоду можна відкликати, звернувшись до адміністратора.',
            en: 'I consent to moderation and publication of my review on NaSerwis.pl. I can withdraw consent by contacting the controller.'
        };

        document.querySelectorAll('form:not(#review-form)').forEach(function (form) {
            if (!form.querySelector('[name="phone"]') || form.querySelector('.form-privacy-notice')) return;
            const notice = document.createElement('p');
            notice.className = 'form-privacy-notice';
            notice.innerHTML = notices[language] || notices.pl;
            const message = form.querySelector('[role="alert"]');
            form.insertBefore(notice, message || null);
        });

        const reviewForm = document.getElementById('review-form');
        if (reviewForm && !reviewForm.querySelector('[name="reviewConsent"]')) {
            const fileGroup = reviewForm.querySelector('#review-photos')?.closest('.form-group');
            if (fileGroup) fileGroup.remove();
            const label = document.createElement('label');
            label.className = 'review-consent';
            label.innerHTML = '<input type="checkbox" name="reviewConsent" required> <span>' +
                (reviewConsent[language] || reviewConsent.pl) + ' <a href="' + privacyUrl + '">' +
                ({ pl: 'Szczegóły', ru: 'Подробнее', uk: 'Докладніше', en: 'Details' }[language] || 'Szczegóły') + '</a>.</span>';
            const actions = reviewForm.querySelector('.modal-actions');
            reviewForm.insertBefore(label, actions || null);
        }

        const footerBottom = document.querySelector('.footer-bottom');
        if (footerBottom && !footerBottom.querySelector('.footer-legal-links')) {
            const labels = {
                pl: ['Polityka prywatności', 'Polityka cookies', 'Ustawienia prywatności'],
                ru: ['Политика конфиденциальности', 'Политика cookies', 'Настройки конфиденциальности'],
                uk: ['Політика конфіденційності', 'Політика cookies', 'Налаштування конфіденційності'],
                en: ['Privacy policy', 'Cookie policy', 'Privacy settings']
            }[language] || ['Polityka prywatności', 'Polityka cookies', 'Ustawienia prywatności'];
            const links = document.createElement('div');
            links.className = 'footer-legal-links';
            links.innerHTML = '<a href="' + privacyUrl + '">' + labels[0] + '</a>' +
                '<a href="' + prefix + '/cookies">' + labels[1] + '</a>' +
                '<button type="button" data-consent-settings>' + labels[2] + '</button>';
            footerBottom.appendChild(links);
            if (window.NASERWIS_CONSENT) {
                links.querySelector('[data-consent-settings]').addEventListener('click', function () {
                    window.NASERWIS_CONSENT.open();
                });
            }
        }
    }

    function initAll() {
        initDropdowns();
        initMobileMenu();

        // Show language suggestion banner (non-intrusive, no redirect)
        showLanguageSuggestion();
        initSmoothScroll();
        initHeaderScroll();
        initScrollAnimations();
        initReviewsSlider();
        initInteractiveStars();
        initReviewModal();
        initFabToggle();
        initAllBotProtection();
        initContactTracking();
        initPrivacyNotices();

        // Initialize form handlers
        handleFormSubmit('hero-form', 'hero-form-message');
        handleFormSubmit('final-form', 'final-form-message');

        // Log performance in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            logPerformance();
        }
    }

    // Start initialization
    init();
})();
