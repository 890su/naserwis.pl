/** Original circular contact UI with consent, keyboard and measurement fixes. */
(function () {
    'use strict';
    const container = document.querySelector('.fab-container');
    if (!container) return;
    const toggle = container.querySelector('.fab-toggle');
    const toggleLabel = toggle.getAttribute('aria-label');
    const menu = container.querySelector('.fab-menu');
    const fallback = container.querySelector('.contact-fallback');
    const status = container.querySelector('.contact-status');
    const invitation = container.querySelector('.contact-invitation');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const invitationKey = 'naserwis-contact-invitation-dismissed-v3';
    let invitationDismissed = false;
    try { invitationDismissed = sessionStorage.getItem(invitationKey) === '1'; } catch (_error) { /* In-memory fallback. */ }
    let invitationTimer;
    let repeatTimer;
    let motionTimer;
    let opener = toggle;
    let chatPending = false;
    let chatOpen = false;
    let chatTimer;
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
        if (!open) fallback.hidden = true;
        if (open) {
            dismissInvitation();
            track('naserwis_contact_open', { placement: 'floating' });
            menu.querySelector('a, button')?.focus({ preventScroll: true });
        } else if (restoreFocus && opener?.offsetParent !== null) opener?.focus({ preventScroll: true });
    }

    toggle.addEventListener('click', () => setOpen(!menuOpen, toggle));
    invitation.querySelector('[data-contact-invite]').addEventListener('click', () => setOpen(true));
    invitation.querySelector('[data-contact-dismiss]').addEventListener('click', () => {
        dismissInvitation();
        toggle.focus({ preventScroll: true });
    });
    menu.inert = true;
    document.addEventListener('click', (event) => {
        if (!container.contains(event.target)) setOpen(false);
        if (event.target.closest('.fab-menu a, .contact-form-link')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !invitation.hidden) dismissInvitation();
        if (event.key === 'Escape' && menuOpen) {
            event.preventDefault();
            setOpen(false, opener, true);
        }
    });
    document.addEventListener('focusin', (event) => {
        if (menuOpen && !container.contains(event.target)) setOpen(false);
        scheduleUpdate();
    });
    document.addEventListener('focusout', scheduleUpdate);

    function inView(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.height > 0 && rect.top < innerHeight && rect.bottom > 0;
    }
    function consentVisible() { return document.getElementById('consent-dialog')?.hidden === false; }

    function stopMotion() {
        clearTimeout(motionTimer);
        toggle.classList.remove('contact-attention');
    }
    function pauseInvitation() {
        clearTimeout(invitationTimer);
        invitationTimer = undefined;
        clearTimeout(repeatTimer);
        stopMotion();
        invitation.hidden = true;
    }
    function dismissInvitation() {
        invitationDismissed = true;
        try { sessionStorage.setItem(invitationKey, '1'); } catch (_error) { /* Session preference only. */ }
        pauseInvitation();
    }
    function attentionBurst() {
        if (invitation.hidden || invitationDismissed || document.hidden || menuOpen) return;
        if (!reducedMotion.matches && !container.matches(':hover, :focus-within')) {
            toggle.classList.add('contact-attention');
            motionTimer = setTimeout(stopMotion, 4800);
        }
        // Short bursts separated by quiet time; the invitation's X stops them.
        repeatTimer = setTimeout(attentionBurst, 24000);
    }
    function queueInvitation() {
        if (invitationDismissed || invitationTimer || !invitation.hidden || menuOpen || document.hidden) return;
        invitationTimer = setTimeout(() => {
            invitationTimer = undefined;
            if (container.dataset.suppressed === 'true' || menuOpen || document.hidden) return;
            invitation.hidden = false;
            attentionBurst();
            observeImpressions();
        }, 6000);
    }
    container.addEventListener('pointerenter', stopMotion);
    container.addEventListener('focusin', stopMotion);
    reducedMotion.addEventListener('change', stopMotion);
    document.addEventListener('visibilitychange', scheduleUpdate);

    function update() {
        updateQueued = false;
        const focusedField = document.activeElement?.matches('input, textarea, select');
        const keyboard = focusedField || (window.visualViewport && window.visualViewport.height < innerHeight * 0.75);
        const modal = document.querySelector('.mobile-menu-overlay.active, #review-modal.active');
        const suppressed = consentVisible() || keyboard || Boolean(modal) || chatOpen || document.hidden;
        container.dataset.suppressed = String(suppressed);
        if (suppressed) {
            setOpen(false);
            pauseInvitation();
        } else queueInvitation();
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
        fallback.hidden = false;
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
    const ctas = [...document.querySelectorAll('a[href="#contact"], .fab-toggle, [data-contact-invite]')];
    function placement(element) {
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
