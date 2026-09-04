/** Labelled contact launcher. No new vendors, presence claims or auto-open chat. */
(function () {
    'use strict';
    const container = document.querySelector('.fab-container');
    if (!container) return;
    const toggle = container.querySelector('.fab-toggle');
    const toggleLabel = toggle.getAttribute('aria-label');
    const menu = container.querySelector('.fab-menu');
    const bar = document.querySelector('.contact-bar');
    const barToggle = bar?.querySelector('button');
    const hint = container.querySelector('.contact-hint');
    const status = container.querySelector('.contact-status');
    const hero = document.querySelector('main > section, .hero, .service-hero');
    const forms = [...document.querySelectorAll('#hero-form, #final-form')];
    const footer = document.querySelector('footer');
    const mobile = matchMedia('(max-width: 768px)');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let opener = toggle;
    let chatPending = false;
    let chatOpen = false;
    let chatTimer;
    let attentionStarted = false;
    let attentionTimer;
    let updateQueued = false;
    let menuOpen = false;

    const language = (document.documentElement.lang || 'pl').split('-')[0];
    const chatErrors = {
        pl: 'Czat jest chwilowo niedostępny. Wybierz WhatsApp, telefon lub formularz.',
        ru: 'Чат временно недоступен. Выберите WhatsApp, телефон или форму заявки.',
        uk: 'Чат тимчасово недоступний. Виберіть WhatsApp, телефон або форму заявки.',
        en: 'Chat is temporarily unavailable. Please use WhatsApp, phone or the form.'
    };

    function track(event, detail = {}) {
        window.dispatchEvent(new CustomEvent('naserwis:ui-event', { detail: { event, ...detail } }));
    }

    function setOpen(open, source = toggle, restoreFocus = false) {
        menuOpen = open;
        if (open) opener = source;
        container.classList.toggle('open', open);
        menu.inert = !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? toggle.dataset.closeLabel : toggleLabel);
        barToggle?.setAttribute('aria-expanded', String(open));
        if (hint) hint.hidden = true;
        if (open) {
            track('naserwis_contact_open', { placement: source === barToggle ? 'sticky' : 'floating' });
            menu.querySelector('a, button')?.focus({ preventScroll: true });
        } else if (restoreFocus && opener?.offsetParent !== null) opener?.focus({ preventScroll: true });
    }

    toggle.addEventListener('click', () => setOpen(!menuOpen, toggle));
    barToggle?.addEventListener('click', () => setOpen(!menuOpen, barToggle));
    menu.inert = true;
    hint?.querySelector('button').addEventListener('click', () => { hint.hidden = true; });
    document.addEventListener('click', (event) => {
        if (!container.contains(event.target) && !bar?.contains(event.target)) setOpen(false);
        if (event.target.closest('.fab-menu a')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menuOpen) {
            event.preventDefault();
            setOpen(false, opener, true);
        }
    });
    document.addEventListener('focusin', (event) => {
        if (menuOpen && !container.contains(event.target) && !bar?.contains(event.target)) setOpen(false);
        scheduleUpdate();
    });
    document.addEventListener('focusout', scheduleUpdate);

    function inView(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.height > 0 && rect.top < innerHeight && rect.bottom > 0;
    }
    function consentVisible() { return document.getElementById('consent-dialog')?.hidden === false; }

    function attention() {
        if (attentionStarted || container.dataset.suppressed === 'true' || !inView(toggle) || menuOpen || !bar.hidden) return;
        attentionStarted = true;
        try {
            if (sessionStorage.getItem('naserwis-contact-hint-v1')) return;
            sessionStorage.setItem('naserwis-contact-hint-v1', 'shown');
        } catch (_error) { /* Once per page without optional storage. */ }
        attentionTimer = setTimeout(() => {
            if (container.dataset.suppressed === 'true' || menuOpen || !bar.hidden) return;
            if (hint) hint.hidden = false;
            if (!reducedMotion.matches) toggle.classList.add('contact-attention');
            setTimeout(() => toggle.classList.remove('contact-attention'), 2900);
            setTimeout(() => { if (hint && !hint.matches(':hover, :focus-within')) hint.hidden = true; }, 8000);
        }, 1400);
    }
    reducedMotion.addEventListener('change', () => toggle.classList.remove('contact-attention'));

    function update() {
        updateQueued = false;
        const focusedField = document.activeElement?.matches('input, textarea, select');
        const keyboard = focusedField || (window.visualViewport && window.visualViewport.height < innerHeight * 0.75);
        const modal = document.querySelector('.mobile-menu-overlay.active, #review-modal.active');
        const formVisible = forms.some(form => {
            const rect = form.getBoundingClientRect();
            return Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0) >= 160;
        });
        const suppressed = consentVisible() || keyboard || Boolean(modal) || formVisible || inView(footer) || chatOpen;
        const pastHero = hero ? hero.getBoundingClientRect().bottom <= 80 : scrollY > 600;
        const showBar = mobile.matches && pastHero && !suppressed;
        if (bar) bar.hidden = !showBar;
        document.body.classList.toggle('contact-bar-visible', showBar);
        container.dataset.suppressed = String(suppressed);
        if (suppressed) {
            setOpen(false);
            clearTimeout(attentionTimer);
            toggle.classList.remove('contact-attention');
        } else attention();
        observeImpressions();
    }
    function scheduleUpdate() {
        if (!updateQueued) { updateQueued = true; requestAnimationFrame(update); }
    }
    addEventListener('scroll', scheduleUpdate, { passive: true });
    addEventListener('resize', scheduleUpdate);
    window.visualViewport?.addEventListener('resize', scheduleUpdate);
    window.addEventListener('naserwis:consent-ui', () => {
        if (!consentVisible() && !window.NASERWIS_CONSENT?.get()?.support) chatPending = false;
        scheduleUpdate();
    });
    const modalObserver = new MutationObserver(scheduleUpdate);
    document.querySelectorAll('.mobile-menu-overlay, #review-modal').forEach(element => modalObserver.observe(element, { attributes: true, attributeFilter: ['class', 'hidden'] }));

    function failChat() {
        if (!chatPending) return;
        chatPending = false;
        status.textContent = chatErrors[language] || chatErrors.pl;
        setOpen(true, opener);
        track('naserwis_chat_error', { placement: 'floating' });
    }
    function openChat() {
        if (!chatPending || !window.NASERWIS_CONSENT?.get()?.support) return;
        if (window.$chatwoot) {
            try {
                window.$chatwoot.toggle('open');
                chatPending = false;
                clearTimeout(chatTimer);
                setOpen(false);
                // Only count an actual SDK-open call, never the consent request.
                window.dispatchEvent(new CustomEvent('naserwis:chat-opened'));
                chatOpen = true;
                scheduleUpdate();
            } catch (_error) { failChat(); }
        } else {
            clearTimeout(chatTimer);
            chatTimer = setTimeout(failChat, 12000);
        }
    }
    container.querySelector('.fab-chat')?.addEventListener('click', () => {
        status.textContent = '';
        chatPending = true;
        setOpen(false);
        if (window.NASERWIS_CONSENT?.requestSupport()) openChat();
        else if (!window.NASERWIS_CONSENT) failChat();
    });
    window.addEventListener('chatwoot:ready', openChat);
    window.addEventListener('chatwoot:closed', () => { chatOpen = false; scheduleUpdate(); });
    window.addEventListener('naserwis:consent', (event) => {
        if (event.detail.support) openChat();
        else { chatPending = false; chatOpen = false; clearTimeout(chatTimer); window.$chatwoot?.toggle('close'); }
        scheduleUpdate();
    });

    // Exposure is counted only when analytics consent exists and the control is
    // actually visible (not underneath the consent UI). No retroactive events.
    const seen = new WeakSet();
    const ctas = [...document.querySelectorAll('a[href="#contact"], .fab-toggle, .contact-bar a, .contact-bar button')];
    function placement(element) {
        if (element.closest('.contact-bar')) return 'sticky';
        if (element.closest('.fab-container')) return 'floating';
        if (element.closest('.contact-checkpoint')) return 'checkpoint';
        return 'content';
    }
    function observeImpressions() {
        if (!window.NASERWIS_CONSENT?.get()?.analytics || consentVisible()) return;
        ctas.forEach(element => {
            if (seen.has(element) || !inView(element) || getComputedStyle(element).visibility === 'hidden') return;
            if (element.closest('.fab-container') && container.dataset.suppressed === 'true') return;
            if (element.closest('.fab-menu') && !menuOpen) return;
            seen.add(element);
            track('naserwis_cta_view', { placement: placement(element), action: element.matches('.fab-toggle, button') ? 'contact_menu' : element.getAttribute('href')?.startsWith('tel:') ? 'phone' : 'form' });
        });
    }
    document.addEventListener('click', (event) => {
        const target = event.target.closest('a[href="#contact"]');
        if (target) track('naserwis_cta_click', { placement: placement(target), action: 'form' });
    });
    scheduleUpdate();
})();
